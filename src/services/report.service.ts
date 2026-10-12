import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pkbonForms, sites, slaRules } from "@/db/schema";
import { hitungSla } from "./dashboard.service";

// F-014: reporting — KPI, breakdown SOW/Regional, ketepatan waktu, daftar risiko.

type SiteRow = {
  id: string;
  namaSite: string;
  projectId: string;
  sow: string | null;
  regional: string | null;
  statusProject: string;
  progres: number;
  tanggalSpmk: Date | null;
  tanggalSelesai: Date | null;
  createdAt: Date;
};

export async function getReport(userId: string) {
  const [daftarSite, rules, daftarPkbon] = await Promise.all([
    db
      .select({
        id: sites.id,
        namaSite: sites.namaSite,
        projectId: sites.projectId,
        sow: sites.sow,
        regional: sites.regional,
        statusProject: sites.statusProject,
        progres: sites.progres,
        tanggalSpmk: sites.tanggalSpmk,
        tanggalSelesai: sites.tanggalSelesai,
        createdAt: sites.createdAt,
      })
      .from(sites)
      .where(eq(sites.userId, userId)),
    db
      .select({
        regional: slaRules.regional,
        sow: slaRules.sow,
        durasiHari: slaRules.durasiHari,
      })
      .from(slaRules)
      .where(eq(slaRules.userId, userId)),
    db
      .select({ total: pkbonForms.total, status: pkbonForms.status })
      .from(pkbonForms)
      .where(eq(pkbonForms.userId, userId)),
  ]);

  const totalSite = daftarSite.length;
  const selesai = daftarSite.filter((s) => s.statusProject === "selesai");
  const avgProgres = totalSite
    ? Math.round(
        daftarSite.reduce((a, s) => a + s.progres, 0) / totalSite,
      )
    : 0;

  // Breakdown per SOW & Regional.
  const agregat = (
    key: (s: SiteRow) => string | null,
    labelKosong: string,
  ) => {
    const map = new Map<string, { jumlah: number; selesai: number; progres: number }>();
    for (const s of daftarSite) {
      const k = key(s) || labelKosong;
      const e = map.get(k) ?? { jumlah: 0, selesai: 0, progres: 0 };
      e.jumlah += 1;
      if (s.statusProject === "selesai") e.selesai += 1;
      e.progres += s.progres;
      map.set(k, e);
    }
    return [...map.entries()]
      .map(([nama, e]) => ({
        nama,
        jumlah: e.jumlah,
        selesai: e.selesai,
        avgProgres: Math.round(e.progres / e.jumlah),
      }))
      .sort((a, b) => b.jumlah - a.jumlah);
  };
  const perSow = agregat((s) => s.sow, "(tanpa SOW)");
  const perRegional = agregat((s) => s.regional, "(tanpa Regional)");

  // Ketepatan waktu: site selesai yang punya aturan SLA.
  let tepatWaktu = 0;
  let terlambat = 0;
  for (const s of selesai) {
    const r = rules.find(
      (rr) => rr.regional === s.regional && rr.sow === s.sow,
    );
    if (!r || !s.tanggalSelesai) continue;
    const awal = s.tanggalSpmk ?? s.createdAt;
    const deadline = new Date(awal.getTime() + r.durasiHari * 86_400_000);
    if (new Date(s.tanggalSelesai) <= deadline) tepatWaktu += 1;
    else terlambat += 1;
  }

  // Daftar risiko: site belum selesai yang lewat/mendekati SLA.
  const sekarang = new Date();
  const risiko = daftarSite
    .map((s) => ({ ...s, sla: hitungSla(s, rules, sekarang) }))
    .filter((s) => s.sla.status === "lewat" || s.sla.status === "mendekati")
    .sort((a, b) => (a.sla.sisaHari ?? 0) - (b.sla.sisaHari ?? 0))
    .map((s) => ({
      id: s.id,
      namaSite: s.namaSite,
      projectId: s.projectId,
      sow: s.sow,
      regional: s.regional,
      statusSla: s.sla.status,
      sisaHari: s.sla.sisaHari,
      deadline: s.sla.deadline,
    }));

  const totalPkbon = daftarPkbon.reduce((a, p) => a + p.total, 0);
  const pkbonDisetujui = daftarPkbon
    .filter((p) => p.status === "disetujui")
    .reduce((a, p) => a + p.total, 0);

  return {
    kpi: {
      totalSite,
      selesai: selesai.length,
      avgProgres,
      tepatWaktu,
      terlambat,
      totalPkbon,
      pkbonDisetujui,
      jumlahPkbon: daftarPkbon.length,
    },
    perSow,
    perRegional,
    risiko,
  };
}

export type ReportData = Awaited<ReturnType<typeof getReport>>;
