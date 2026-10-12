import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireSession } from "@/lib/session";
import { getBast } from "@/services/bast.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BastChecklist } from "@/components/bast-checklist";
import { BastSignatures } from "@/components/bast-signatures";
import { BastStatusChanger, BastDeleter } from "@/components/bast-actions";
import { statusLabels, tipeLabels } from "@/validators/bast";

export const runtime = "nodejs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { user } = await requireSession();
  const { id } = await params;
  const bast = await getBast(user.id, id);
  return {
    title: bast ? `BAST ${tipeLabels[bast.tipe as keyof typeof tipeLabels]} - ${bast.namaSite}` : "BAST",
  };
}

function formatTanggal(value: Date | string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BastDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireSession();
  const { id } = await params;
  const bast = await getBast(user.id, id);
  if (!bast) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/bast">
            <ArrowLeft aria-hidden="true" /> Kembali
          </Link>
        </Button>
        <BastDeleter bastId={bast.id} />
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            BAST {tipeLabels[bast.tipe as keyof typeof tipeLabels]}
          </h1>
          <Badge variant={bast.status === "signed" ? "default" : "secondary"}>
            {statusLabels[bast.status as keyof typeof statusLabels]}
          </Badge>
        </div>
        <p className="mt-2 text-muted-foreground">
          <Link href={`/sites/${bast.siteId}`} className="hover:underline">
            {bast.namaSite}
          </Link>
          {bast.projectId ? ` · ${bast.projectId}` : ""}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi BAST</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-3 gap-4 py-1 text-sm">
            <dt className="text-muted-foreground">Nomor BAST</dt>
            <dd className="col-span-2 font-medium">{bast.nomorBast || "—"}</dd>
            <dt className="text-muted-foreground">Tanggal BAST</dt>
            <dd className="col-span-2 font-medium">
              {formatTanggal(bast.tanggalBast)}
            </dd>
            <dt className="text-muted-foreground">Catatan</dt>
            <dd className="col-span-2 font-medium">{bast.catatan || "—"}</dd>
          </dl>
          <div className="mt-4 border-t pt-4">
            <BastStatusChanger
              bastId={bast.id}
              current={bast.status as "draft" | "ready" | "signed"}
            />
          </div>
        </CardContent>
      </Card>

      <BastChecklist bastId={bast.id} />

      <div>
        <h2 className="mb-3 text-lg font-semibold">Tanda Tangan</h2>
        <BastSignatures bastId={bast.id} />
        <p className="mt-2 text-xs text-muted-foreground">
          Status Signed hanya bisa dipilih bila kedua pihak sudah tanda tangan.
        </p>
      </div>
    </div>
  );
}
