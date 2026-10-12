"use client";

import { useEffect, useState, type FormEvent } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Entry = {
  id: string;
  progres: number;
  tanggal: string;
  catatan: string | null;
};

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function SiteProgressTab({
  siteId,
  currentProgres,
}: {
  siteId: string;
  currentProgres: number;
}) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function loadEntries() {
      setLoading(true);
      try {
        const res = await fetch(`/api/sites/${siteId}/progress`);
        if (!res.ok) throw new Error("Gagal memuat riwayat progres.");
        const body = await res.json();
        if (!cancelled) setEntries(body.data);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Gagal memuat data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadEntries();
    return () => {
      cancelled = true;
    };
  }, [siteId, refreshKey]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const data = new FormData(e.currentTarget);
    setPending(true);
    setError("");
    try {
      const res = await fetch(`/api/sites/${siteId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progres: Number(data.get("progres")),
          tanggal: String(data.get("tanggal") || new Date().toISOString().slice(0, 10)),
          catatan: String(data.get("catatan") || "").trim() || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Gagal menyimpan progres.");
      }
      (e.target as HTMLFormElement).reset();
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Catat Progres Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-3">
            <fieldset
              disabled={pending}
              className="grid gap-4 sm:col-span-3 sm:grid-cols-3"
            >
              <div className="space-y-2">
                <Label htmlFor="progres">Progres (%)</Label>
                <Input
                  id="progres"
                  name="progres"
                  type="number"
                  min={0}
                  max={100}
                  required
                  defaultValue={currentProgres}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggal">Tanggal</Label>
                <Input
                  id="tanggal"
                  name="tanggal"
                  type="date"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="catatan">Catatan</Label>
                <Input
                  id="catatan"
                  name="catatan"
                  maxLength={500}
                  placeholder="cth: pondasi selesai"
                />
              </div>
            </fieldset>
            {error && (
              <p role="alert" className="text-sm text-destructive sm:col-span-3">
                {error}
              </p>
            )}
            <div className="sm:col-span-3">
              <Button type="submit" disabled={pending}>
                {pending ? (
                  <LoaderCircle
                    className="animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                ) : (
                  <Plus aria-hidden="true" />
                )}
                {pending ? "Menyimpan…" : "Catat Progres"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Progres</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Memuat…</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada catatan progres. Catat progres pertama di atas.
            </p>
          ) : (
            <ul className="divide-y">
              {entries.map((entry) => (
                <li key={entry.id} className="py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{entry.progres}%</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(entry.tanggal)}
                    </span>
                  </div>
                  <div
                    className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-valuenow={entry.progres}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${entry.progres}%` }}
                    />
                  </div>
                  {entry.catatan && (
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {entry.catatan}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
