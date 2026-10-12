import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { sites, slaRules } from "@/db/schema";

// F-006: dashboard + F-016: perhitungan SLA per Regional x SOW.

export type SlaStatus = "aman" | "mendekati" | "lewat" | "tanpa-aturan";

export type SlaInfo = {
  status: SlaStatus;
  deadline: Date | null;
  sisaHari: number | null;
};

type SlaRule = { regional: string; sow: string; durasiHari: number };
type SiteRingkas = {
  id: string;
  namaSite: string;
  projectId: string;
  regional: string | null;
  sow: string | null;
  statusProject: string;
  progres: number;
  tanggalSpmk: Date | null;
  tanggalSelesai: Date | null;
  createdAt: Date;
};

const HARI_MS = 86_400_000;
const AMBANG_PERINGATAN_HARI = 7;

export function hitungSla(
  site: Pick<
    SiteRingkas,
    "regional" | "sow" | "statusProject" | "tanggalSpmk" | "createdAt"
  >,
  rules: SlaRule[],
  sekarang = new Date(),
): SlaInfo {
  if (site.statusProject === "selesai")
    return { status: "tanpa-aturan", deadline: null, sisaHari: null };
  const rule = rules.find(
    (r) => r.regional === site.regional && r.sow === site.sow,
  );
  if (!rule || !site.regional || !site.sow)
    return { status: "tanpa-aturan", deadline: null, sisaHari: null };
  const awal = site.tanggalSpmk ?? site.createdAt;
  const deadline = new Date(awal.getTime() + rule.durasiHari * HARI_MS);
  const sisaHari = Math.ceil((deadline.getTime() - sekarang.getTime()) / HARI_MS);
  if (sisaHari < 0) return { status: "lewat", deadline, sisaHari };
  if (sisaHari <= AMBANG_PERINGATAN_HARI)
    return { status: "mendekati", deadline, sisaHari };
  return { status: "aman", deadline, sisaHari };
}

const ringkasFields = {
  id: sites.id,
  namaSite: sites.namaSite,
  projectId: sites.projectId,
  regional: sites.regional,
  sow: sites.sow,
  statusProject: sites.statusProject,
  progres: sites.progres,
  tanggalSpmk: sites.tanggalSpmk,
  tanggalSelesai: sites.tanggalSelesai,
  createdAt: sites.createdAt,
};

export async function getDashboard(userId: string) {
  const [daftarSite, rules] = await Promise.all([
    db
      .select(ringkasFields)
      .from(sites)
      .where(eq(sites.userId, userId))
      .orderBy(desc(sites.createdAt)),
    db
      .select({
        regional: slaRules.regional,
        sow: slaRules.sow,
        durasiHari: slaRules.durasiHari,
      })
      .from(slaRules)
      .where(eq(slaRules.userId, userId)),
  ]);

  const sekarang = new Date();
  const denganSla = daftarSite.map((s) => ({
    ...s,
    sla: hitungSla(s, rules, sekarang),
  }));

  const total = daftarSite.length;
  const selesai = daftarSite.filter((s) => s.statusProject === "selesai").length;
  const berjalan = daftarSite.filter(
    (s) => s.statusProject === "berjalan",
  ).length;
  const perhatian = denganSla
    .filter((s) => s.sla.status === "lewat" || s.sla.status === "mendekati")
    .sort((a, b) => (a.sla.sisaHari ?? 0) - (b.sla.sisaHari ?? 0));

  // Tren 6 bulan terakhir: jumlah site selesai per bulan (berdasar tanggalSelesai).
  const tren: { label: string; jumlah: number }[] = [];
  const bulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(sekarang.getFullYear(), sekarang.getMonth() - i, 1);
    const label = `${bulan[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
    const jumlah = daftarSite.filter((s) => {
      if (!s.tanggalSelesai) return false;
      const t = new Date(s.tanggalSelesai);
      return (
        t.getFullYear() === d.getFullYear() && t.getMonth() === d.getMonth()
      );
    }).length;
    tren.push({ label, jumlah });
  }

  return {
    stats: {
      total,
      selesai,
      berjalan,
      perhatian: perhatian.length,
    },
    tren,
    terbaru: daftarSite.slice(0, 5),
    perhatian: perhatian.slice(0, 10).map((s) => ({
      id: s.id,
      namaSite: s.namaSite,
      projectId: s.projectId,
      sow: s.sow,
      sla: s.sla,
    })),
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboard>>;
