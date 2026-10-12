import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { requireSession } from "@/lib/session";
import { getDashboard } from "@/services/dashboard.service";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const runtime = "nodejs";
export const metadata: Metadata = { title: "Dashboard" };

function formatTanggal(value: Date | null): string {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const { user } = await requireSession();
  const data = await getDashboard(user.id);
  const { stats, tren, terbaru, perhatian } = data;
  const maksTren = Math.max(1, ...tren.map((t) => t.jumlah));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Ringkasan proyek konstruksi tower Anda.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Site</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Selesai</CardDescription>
            <CardTitle className="text-3xl">{stats.selesai}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Dalam Progres</CardDescription>
            <CardTitle className="text-3xl">{stats.berjalan}</CardTitle>
          </CardHeader>
        </Card>
        <Card className={stats.perhatian > 0 ? "border-amber-500/50" : undefined}>
          <CardHeader className="pb-2">
            <CardDescription>Perlu Perhatian</CardDescription>
            <CardTitle
              className={`text-3xl ${stats.perhatian > 0 ? "text-amber-600 dark:text-amber-500" : ""}`}
            >
              {stats.perhatian}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Site Selesai per Bulan</CardTitle>
            <CardDescription>6 bulan terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            {tren.every((t) => t.jumlah === 0) ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Belum ada site yang selesai dalam 6 bulan terakhir.
              </p>
            ) : (
              <div
                className="flex h-40 items-end gap-2"
                role="img"
                aria-label="Grafik site selesai per bulan"
              >
                {tren.map((t) => (
                  <div
                    key={t.label}
                    className="flex flex-1 flex-col items-center gap-1.5"
                  >
                    <span className="text-xs font-medium">{t.jumlah}</span>
                    <div
                      className="w-full rounded-t-md bg-primary/85"
                      style={{
                        height: `${Math.max(4, (t.jumlah / maksTren) * 100)}%`,
                      }}
                    />
                    <span className="text-[11px] text-muted-foreground">
                      {t.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-600" aria-hidden="true" />
              Perlu Perhatian
            </CardTitle>
            <CardDescription>
              Mendekati atau melewati batas waktu SLA
            </CardDescription>
          </CardHeader>
          <CardContent>
            {perhatian.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Semua site dalam batas waktu yang aman.
              </p>
            ) : (
              <ul className="divide-y">
                {perhatian.map((p) => (
                  <li key={p.id} className="py-2.5">
                    <Link
                      href={`/sites/${p.id}`}
                      className="flex items-center justify-between gap-2 rounded-md hover:underline"
                    >
                      <span>
                        <span className="font-medium">{p.namaSite}</span>
                        <span className="block text-xs text-muted-foreground">
                          {p.projectId}
                          {p.sow ? ` · ${p.sow}` : ""}
                        </span>
                      </span>
                      <Badge
                        variant={
                          p.sla.status === "lewat" ? "destructive" : "secondary"
                        }
                        className={
                          p.sla.status === "mendekati"
                            ? "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                            : undefined
                        }
                      >
                        {p.sla.status === "lewat"
                          ? `Lewat ${Math.abs(p.sla.sisaHari ?? 0)} hari`
                          : `${p.sla.sisaHari ?? 0} hari tersisa`}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Proyek Terbaru</CardTitle>
            <CardDescription>5 site yang terakhir ditambahkan</CardDescription>
          </div>
          <Link
            href="/sites"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Lihat semua <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </CardHeader>
        <CardContent>
          {terbaru.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Belum ada site.{" "}
              <Link href="/sites/new" className="text-primary hover:underline">
                Tambahkan site pertama
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y">
              {terbaru.map((s) => (
                <li key={s.id} className="py-2.5">
                  <Link
                    href={`/sites/${s.id}`}
                    className="flex items-center justify-between gap-2 rounded-md"
                  >
                    <span>
                      <span className="font-medium hover:underline">
                        {s.namaSite}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {s.projectId}
                        {s.sow ? ` · ${s.sow}` : ""}
                        {s.regional ? ` · ${s.regional}` : ""}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-medium">{s.progres}%</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTanggal(s.createdAt)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
