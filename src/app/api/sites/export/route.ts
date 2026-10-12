import { withApiSession } from "@/lib/api";
import { listSites } from "@/services/sites.service";
import { listSitesSchema } from "@/validators/sites";

export const runtime = "nodejs";

// F-003: ekspor daftar site ke CSV (mengikuti filter yang sama).
const COLUMNS = [
  "nama_site",
  "project_id",
  "site_id",
  "site_id_client",
  "task_id",
  "client",
  "tenant",
  "regional",
  "provinsi",
  "alamat",
  "koordinat",
  "pic",
  "pic_kontak",
  "sow",
  "tinggi_tower",
  "kontrak_pks",
  "no_spmk",
  "tanggal_spmk",
  "tanggal_target",
  "tanggal_mulai_rfi",
  "timeline",
  "tanggal_selesai",
  "target_bast",
  "status_project",
  "progres",
  "tanggal_progres",
] as const;

const FIELD_MAP: Record<(typeof COLUMNS)[number], string> = {
  nama_site: "namaSite",
  project_id: "projectId",
  site_id: "siteId",
  site_id_client: "siteIdClient",
  task_id: "taskId",
  client: "client",
  tenant: "tenant",
  regional: "regional",
  provinsi: "provinsi",
  alamat: "alamat",
  koordinat: "koordinat",
  pic: "pic",
  pic_kontak: "picKontak",
  sow: "sow",
  tinggi_tower: "tinggiTower",
  kontrak_pks: "kontrakPks",
  no_spmk: "noSpmk",
  tanggal_spmk: "tanggalSpmk",
  tanggal_target: "tanggalTarget",
  tanggal_mulai_rfi: "tanggalMulaiRfi",
  timeline: "timeline",
  tanggal_selesai: "tanggalSelesai",
  target_bast: "targetBast",
  status_project: "statusProject",
  progres: "progres",
  tanggal_progres: "tanggalProgres",
};

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text =
    value instanceof Date ? value.toISOString().slice(0, 10) : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function GET(request: Request) {
  return withApiSession(request, async (session) => {
    const query = listSitesSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    // Ambil semua data (per halaman) untuk ekspor.
    const all: Awaited<ReturnType<typeof listSites>>["data"] = [];
    let offset = 0;
    for (;;) {
      const { data, meta } = await listSites(session.user.id, {
        ...query,
        limit: 100,
        offset,
      });
      all.push(...data);
      if (!meta.hasMore || all.length >= 5000) break;
      offset += 100;
    }
    const header = COLUMNS.join(",");
    const lines = all.map((site) =>
      COLUMNS.map((col) =>
        csvCell((site as Record<string, unknown>)[FIELD_MAP[col]]),
      ).join(","),
    );
    const csv = "\uFEFF" + [header, ...lines].join("\n");
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="sites.csv"',
        "Cache-Control": "private, no-store",
      },
    });
  });
}
