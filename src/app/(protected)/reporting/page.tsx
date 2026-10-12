import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { requireSession } from "@/lib/session";
import { getReport } from "@/services/report.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const runtime = "nodejs";
export const metadata: Metadata = { title: "Reporting" };

function formatRupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}

export default async function ReportingPage() {
  const { user } = await requireSession();
  const r = await getReport(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Reporting</h1>
          <p className="mt-2 text-muted-foreground">
            Kinerja proyek, breakdown, dan daftar risiko.
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href="/api/report/export" download>
            <Download aria-hidden="true" /> Ekspor CSV
          </a>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Site</CardDescription>
            <CardTitle className="text-3xl">{r.kpi.totalSite}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Selesai</CardDescription>
            <CardTitle className="text-3xl">{r.kpi.selesai}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rata-rata Progres</CardDescription>
            <CardTitle className="text-3xl">{r.kpi.avgProgres}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ketepatan Waktu</CardDescription>
            <CardTitle className="text-3xl">
              {r.kpi.tepatWaktu}
              <span className="text-lg text-muted-foreground">
                {" "}
                / {r.kpi.tepatWaktu + r.kpi.terlambat}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="-mt-2">
            <p className="text-xs text-muted-foreground">
              Tepat waktu vs terlambat (site selesai ber-SLA)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Breakdown per SOW</CardTitle>
          </CardHeader>
          <CardContent>
            {r.perSow.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada data.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 font-medium">SOW</th>
                    <th className="py-2 text-right font-medium">Site</th>
                    <th className="py-2 text-right font-medium">Selesai</th>
                    <th className="py-2 text-right font-medium">Progres</th>
                  </tr>
                </thead>
                <tbody>
                  {r.perSow.map((s) => (
                    <tr key={s.nama} className="border-b last:border-0">
                      <td className="py-2.5 font-medium">{s.nama}</td>
                      <td className="py-2.5 text-right tabular-nums">{s.jumlah}</td>
                      <td className="py-2.5 text-right tabular-nums">{s.selesai}</td>
                      <td className="py-2.5 text-right tabular-nums">{s.avgProgres}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Breakdown per Regional</CardTitle>
          </CardHeader>
          <CardContent>
            {r.perRegional.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada data.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 font-medium">Regional</th>
                    <th className="py-2 text-right font-medium">Site</th>
                    <th className="py-2 text-right font-medium">Selesai</th>
                    <th className="py-2 text-right font-medium">Progres</th>
                  </tr>
                </thead>
                <tbody>
                  {r.perRegional.map((s) => (
                    <tr key={s.nama} className="border-b last:border-0">
                      <td className="py-2.5 font-medium">{s.nama}</td>
                      <td className="py-2.5 text-right tabular-nums">{s.jumlah}</td>
                      <td className="py-2.5 text-right tabular-nums">{s.selesai}</td>
                      <td className="py-2.5 text-right tabular-nums">{s.avgProgres}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>PKBON</CardTitle>
            <CardDescription>Rekap pengajuan kasbon</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jumlah pengajuan</span>
              <span className="font-medium tabular-nums">{r.kpi.jumlahPkbon}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total diajukan</span>
              <span className="font-medium tabular-nums">{formatRupiah(r.kpi.totalPkbon)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total disetujui</span>
              <span className="font-medium tabular-nums">{formatRupiah(r.kpi.pkbonDisetujui)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Daftar Risiko</CardTitle>
            <CardDescription>Site yang lewat/mendekati batas SLA</CardDescription>
          </CardHeader>
          <CardContent>
            {r.risiko.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Tidak ada site berisiko saat ini.
              </p>
            ) : (
              <ul className="divide-y">
                {r.risiko.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2 py-2.5">
                    <Link href={`/sites/${s.id}`} className="hover:underline">
                      <span className="font-medium">{s.namaSite}</span>
                      <span className="block text-xs text-muted-foreground">
                        {s.projectId}
                        {s.sow ? ` · ${s.sow}` : ""}
                        {s.regional ? ` · ${s.regional}` : ""}
                      </span>
                    </Link>
                    <Badge
                      variant={s.statusSla === "lewat" ? "destructive" : "secondary"}
                      className={
                        s.statusSla === "mendekati"
                          ? "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          : undefined
                      }
                    >
                      {s.statusSla === "lewat"
                        ? `Lewat ${Math.abs(s.sisaHari ?? 0)} hari`
                        : `${s.sisaHari ?? 0} hari tersisa`}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
