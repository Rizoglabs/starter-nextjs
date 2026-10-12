"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ExternalLink, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { drivePreviewUrl } from "@/lib/drive";

type Item = {
  id: string;
  judul: string;
  driveUrl: string;
  createdAt: string;
};

const TITLES: Record<string, { title: string; formTitle: string; empty: string }> = {
  dokumen: {
    title: "Dokumen",
    formTitle: "Tambah Dokumen",
    empty: "Belum ada dokumen. Tempel tautan Google Drive dokumen site di sini.",
  },
  foto: {
    title: "Foto",
    formTitle: "Tambah Foto",
    empty: "Belum ada foto. Tempel tautan Google Drive foto site di sini.",
  },
};

export function SiteAttachmentsTab({
  siteId,
  kategori,
}: {
  siteId: string;
  kategori: "dokumen" | "foto";
}) {
  const copy = TITLES[kategori];
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function loadItems() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/sites/${siteId}/attachments?kategori=${kategori}`,
        );
        if (!res.ok) throw new Error("Gagal memuat arsip.");
        const body = await res.json();
        if (!cancelled) setItems(body.data);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Gagal memuat data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadItems();
    return () => {
      cancelled = true;
    };
  }, [siteId, kategori, refreshKey]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const data = new FormData(e.currentTarget);
    setPending(true);
    setError("");
    try {
      const res = await fetch(`/api/sites/${siteId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kategori,
          judul: String(data.get("judul") || "").trim(),
          driveUrl: String(data.get("driveUrl") || "").trim(),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const detail = body?.error?.details?.[0]?.message;
        throw new Error(detail ?? body?.error?.message ?? "Gagal menyimpan.");
      }
      (e.target as HTMLFormElement).reset();
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setPending(false);
    }
  }

  async function onDelete(id: string, judul: string) {
    if (!window.confirm(`Hapus "${judul}" dari arsip?`)) return;
    try {
      const res = await fetch(`/api/sites/${siteId}/attachments/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus.");
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus.");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{copy.formTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <fieldset disabled={pending} className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`judul-${kategori}`}>Judul</Label>
                <Input
                  id={`judul-${kategori}`}
                  name="judul"
                  required
                  maxLength={200}
                  placeholder="cth: Foto pondasi tahap 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`driveUrl-${kategori}`}>Tautan Google Drive</Label>
                <Input
                  id={`driveUrl-${kategori}`}
                  name="driveUrl"
                  type="url"
                  required
                  maxLength={2000}
                  placeholder="https://drive.google.com/…"
                />
              </div>
            </fieldset>
            {error && (
              <p role="alert" className="text-sm text-destructive sm:col-span-2">
                {error}
              </p>
            )}
            <div className="sm:col-span-2">
              <Button type="submit" disabled={pending}>
                {pending ? (
                  <LoaderCircle
                    className="animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                ) : (
                  <Plus aria-hidden="true" />
                )}
                {pending ? "Menyimpan…" : "Tambah ke Arsip"}
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                File tetap tersimpan di Google Drive. Pastikan tautan dibagikan
                agar preview bisa tampil.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Memuat…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">{copy.empty}</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => {
                const preview = drivePreviewUrl(item.driveUrl);
                return (
                  <li
                    key={item.id}
                    className="rounded-xl border p-4"
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{item.judul}</p>
                        <a
                          href={item.driveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-sm text-primary underline underline-offset-4"
                        >
                          Buka di Drive <ExternalLink className="size-3.5" aria-hidden="true" />
                        </a>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(item.id, item.judul)}
                        aria-label={`Hapus ${item.judul}`}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                    {preview ? (
                      <iframe
                        src={preview}
                        title={`Preview ${item.judul}`}
                        className="aspect-video w-full rounded-lg border"
                        loading="lazy"
                        allow="autoplay"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Tautan folder Drive — buka langsung di Drive untuk melihat isinya.
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
