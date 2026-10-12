import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireSession } from "@/lib/session";
import { getPkbonForm } from "@/services/pkbon.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { statusLabels } from "@/validators/pkbon";

export const runtime = "nodejs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { user } = await requireSession();
  const { id } = await params;
  const form = await getPkbonForm(user.id, id);
  return { title: form ? form.nomor : "PKBON" };
}

function formatRupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}

function formatTanggal(value: Date | string): string {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function PkbonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireSession();
  const { id } = await params;
  const form = await getPkbonForm(user.id, id);
  if (!form) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/pkbon?tab=riwayat">
          <ArrowLeft aria-hidden="true" /> Kembali ke riwayat
        </Link>
      </Button>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{form.nomor}</h1>
        <Badge variant={form.status === "ditolak" ? "destructive" : "secondary"}>
          {statusLabels[form.status as keyof typeof statusLabels]}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Pengajuan</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-3 gap-y-2.5 text-sm">
            <dt className="text-muted-foreground">Nama</dt>
            <dd className="col-span-2 font-medium">{form.nama}</dd>
            <dt className="text-muted-foreground">Kota</dt>
            <dd className="col-span-2 font-medium">{form.kota || "—"}</dd>
            <dt className="text-muted-foreground">Tanggal</dt>
            <dd className="col-span-2 font-medium">
              {formatTanggal(form.tanggal)}
            </dd>
            <dt className="text-muted-foreground">Bank</dt>
            <dd className="col-span-2 font-medium">
              {form.bankNama ? `${form.bankNama}${form.bankRekening ? ` · ${form.bankRekening}` : ""}` : "—"}
            </dd>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uraian Tugas</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 font-medium">Uraian</th>
                <th className="py-2 text-right font-medium">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {form.items.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="py-2.5">{item.uraian}</td>
                  <td className="py-2.5 text-right tabular-nums">
                    {formatRupiah(item.jumlah)}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="py-2.5 font-semibold">Total</td>
                <td className="py-2.5 text-right font-semibold tabular-nums">
                  {formatRupiah(form.total)}
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
