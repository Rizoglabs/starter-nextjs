import { withApiSession } from "@/lib/api";
import { getReport } from "@/services/report.service";

export const runtime = "nodejs";

// F-014: ekspor laporan ke CSV.
function cell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const t = String(v);
  return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
}

export function GET(request: Request) {
  return withApiSession(request, async (session) => {
    const r = await getReport(session.user.id);
    const lines: string[] = [];
    lines.push("RINGKASAN");
    lines.push("metrik,nilai");
    lines.push(`Total Site,${r.kpi.totalSite}`);
    lines.push(`Selesai,${r.kpi.selesai}`);
    lines.push(`Rata-rata Progres (%),${r.kpi.avgProgres}`);
    lines.push(`Tepat Waktu,${r.kpi.tepatWaktu}`);
    lines.push(`Terlambat,${r.kpi.terlambat}`);
    lines.push(`Total PKBON (Rp),${r.kpi.totalPkbon}`);
    lines.push(`PKBON Disetujui (Rp),${r.kpi.pkbonDisetujui}`);
    lines.push("");
    lines.push("PER SOW");
    lines.push("sow,jumlah,selesai,rata_rata_progres");
    for (const s of r.perSow)
      lines.push([s.nama, s.jumlah, s.selesai, s.avgProgres].map(cell).join(","));
    lines.push("");
    lines.push("PER REGIONAL");
    lines.push("regional,jumlah,selesai,rata_rata_progres");
    for (const s of r.perRegional)
      lines.push([s.nama, s.jumlah, s.selesai, s.avgProgres].map(cell).join(","));
    lines.push("");
    lines.push("DAFTAR RISIKO");
    lines.push("nama_site,project_id,sow,regional,status_sla,sisa_hari");
    for (const s of r.risiko)
      lines.push(
        [s.namaSite, s.projectId, s.sow, s.regional, s.statusSla, s.sisaHari]
          .map(cell)
          .join(","),
      );
    const csv = "\uFEFF" + lines.join("\n");
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="laporan.csv"',
        "Cache-Control": "private, no-store",
      },
    });
  });
}
