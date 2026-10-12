"use client";

import { useEffect, useState, type FormEvent } from "react";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Client = { id: string; nama: string };

export function ClientManager() {
  const [items, setItems] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/clients")
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (!cancelled && body) setItems(body.data);
      })
      .catch(() => {
        if (!cancelled) setError("Gagal memuat daftar client.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const data = new FormData(e.currentTarget);
    const nama = String(data.get("nama") || "").trim();
    if (!nama) return;
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama }),
      });
      if (res.status === 409) throw new Error("Client tersebut sudah ada.");
      if (!res.ok) throw new Error("Gagal menambah client.");
      (e.target as HTMLFormElement).reset();
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setPending(false);
    }
  }

  async function onDelete(id: string, nama: string) {
    if (!window.confirm(`Hapus client "${nama}"?`)) return;
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus.");
      setItems((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client / Tenant</CardTitle>
        <CardDescription>
          Daftar master client untuk referensi pengisian site.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onSubmit} className="flex gap-2">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="nama-client" className="sr-only">
              Nama client
            </Label>
            <Input
              id="nama-client"
              name="nama"
              placeholder="cth: MITRATEL"
              maxLength={120}
              disabled={pending}
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? (
              <LoaderCircle
                className="animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : (
              <Plus aria-hidden="true" />
            )}
            Tambah
          </Button>
        </form>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {loading ? (
          <p className="text-sm text-muted-foreground">Memuat…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada client. Tambahkan di atas.
          </p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {items.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between px-4 py-2.5"
              >
                <span className="font-medium">{c.nama}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(c.id, c.nama)}
                  aria-label={`Hapus ${c.nama}`}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
