import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireSession } from "@/lib/session";
import { listBasts } from "@/services/bast.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { statusLabels, tipeLabels } from "@/validators/bast";

export const runtime = "nodejs";
export const metadata: Metadata = { title: "BAST" };

type SearchParams = Promise<{ tipe?: string; status?: string }>;

export default async function BastListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { user } = await requireSession();
  const sp = await searchParams;
  const tipe = (sp.tipe ?? "") as "cme" | "sitac" | "imb" | "";
  const status = (sp.status ?? "") as "draft" | "ready" | "signed" | "";
  const { data: daftar } = await listBasts(user.id, {
    limit: 100,
    offset: 0,
    tipe: tipe || undefined,
    status: status || undefined,
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">BAST</h1>
          <p className="mt-2 text-muted-foreground">
            Berita Acara Serah Terima per site.
          </p>
        </div>
        <Button asChild>
          <Link href="/bast/new">
            <Plus aria-hidden="true" /> Buat BAST
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground self-center">Tipe:</span>
        {["", "cme", "sitac", "imb"].map((t) => {
          const p = new URLSearchParams();
          if (t) p.set("tipe", t);
          if (status) p.set("status", status);
          const aktif = (!tipe && !t) || tipe === t;
          return (
            <Link
              key={t || "semua"}
              href={`/bast${p.toString() ? `?${p.toString()}` : ""}`}
              aria-current={aktif ? "true" : undefined}
              className={`rounded-full border px-3 py-1 text-sm ${aktif ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}
            >
              {t ? tipeLabels[t as keyof typeof tipeLabels] : "Semua"}
            </Link>
          );
        })}
        <span className="text-sm text-muted-foreground self-center ml-2">Status:</span>
        {["", "draft", "ready", "signed"].map((s) => {
          const p = new URLSearchParams();
          if (tipe) p.set("tipe", tipe);
          if (s) p.set("status", s);
          const aktif = (!status && !s) || status === s;
          return (
            <Link
              key={s || "semua"}
              href={`/bast${p.toString() ? `?${p.toString()}` : ""}`}
              aria-current={aktif ? "true" : undefined}
              className={`rounded-full border px-3 py-1 text-sm ${aktif ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}
            >
              {s ? statusLabels[s as keyof typeof statusLabels] : "Semua"}
            </Link>
          );
        })}
      </div>

      {daftar.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
          <p className="text-lg font-medium">Belum ada BAST</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Buat BAST untuk site agar serah terima terdokumentasi dengan rapi.
          </p>
          <Button asChild className="mt-6">
            <Link href="/bast/new">
              <Plus aria-hidden="true" /> Buat BAST Pertama
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {daftar.map((b) => (
            <li key={b.id}>
              <Link
                href={`/bast/${b.id}`}
                className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-ring"
              >
                <Card className="h-full transition-colors hover:border-primary/40">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg leading-7">
                        {b.namaSite}
                      </CardTitle>
                      <Badge
                        variant={b.status === "signed" ? "default" : "secondary"}
                      >
                        {statusLabels[b.status as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                    <CardDescription>
                      {tipeLabels[b.tipe as keyof typeof tipeLabels]} ·{" "}
                      {b.projectId}
                      {b.nomorBast ? ` · ${b.nomorBast}` : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Checklist</span>
                      <span className="font-medium">
                        {b.checklist.selesai}/{b.checklist.total}
                      </span>
                    </div>
                    <div
                      className="h-2 overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      aria-valuenow={b.checklist.total ? Math.round((b.checklist.selesai / b.checklist.total) * 100) : 0}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${b.checklist.total ? (b.checklist.selesai / b.checklist.total) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
