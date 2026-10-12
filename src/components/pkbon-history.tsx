"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { statusLabels } from "@/validators/pkbon";
import { cn } from "@/lib/utils";

type Form = {
  id: string;
  nomor: string;
  nama: string;
  kota: string | null;
  tanggal: string;
  total: number;
  status: keyof typeof statusLabels;
};

function formatRupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}

function formatTanggal(value: string): string {
  const d = new Date(value);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const badgeClass: Record<string, string | undefined> = {
  disetujui: "bg-green-600",
  ditolak: undefined,
  diajukan: undefined,
  draft: undefined,
};

export function PkbonHistory() {
  const searchParams = useSearchParams();
  const highlight = searchParams.get("highlight");
  const [items, setItems] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/pkbon/forms?limit=100")
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (!cancelled && body) setItems(body.data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onDelete(id: string, nomor: string) {
    if (!window.confirm(`Hapus pengajuan ${nomor}?`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/pkbon/forms/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((f) => f.id !== id));
    } catch {
      alert("Gagal menghapus.");
    } finally {
      setDeleting(null);
    }
  }

  async function onStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/pkbon/forms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, status: status as Form["status"] } : f,
        ),
      );
    } catch {
      alert("Gagal mengubah status.");
    }
  }

  if (loading)
    return <p className="text-sm text-muted-foreground">Memuat riwayat…</p>;

  if (items.length === 0)
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="font-medium">Belum ada pengajuan</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Buat pengajuan kasbon pertama lewat tab Form.
          </p>
        </CardContent>
      </Card>
    );

  return (
    <ul className="space-y-3">
      {items.map((f) => (
        <li key={f.id}>
          <Card
            className={cn(
              highlight === f.id && "border-primary ring-1 ring-primary",
            )}
          >
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <Link
                  href={`/pkbon/${f.id}`}
                  className="font-medium hover:underline"
                >
                  {f.nomor}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {f.nama}
                  {f.kota ? ` · ${f.kota}` : ""} · {formatTanggal(f.tanggal)}
                </p>
                <p className="mt-1 font-semibold">{formatRupiah(f.total)}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={f.status}
                  onChange={(e) => onStatus(f.id, e.target.value)}
                  aria-label={`Status ${f.nomor}`}
                  className="flex h-8 rounded-md border border-input bg-transparent px-2 text-sm"
                >
                  {Object.entries(statusLabels).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
                <Badge
                  variant={f.status === "ditolak" ? "destructive" : "secondary"}
                  className={badgeClass[f.status]}
                >
                  {statusLabels[f.status]}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={deleting === f.id}
                  onClick={() => onDelete(f.id, f.nomor)}
                  aria-label={`Hapus ${f.nomor}`}
                >
                  {deleting === f.id ? (
                    <LoaderCircle
                      className="animate-spin motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                  ) : (
                    <Trash2 aria-hidden="true" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
