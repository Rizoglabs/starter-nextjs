"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Item = { id: string; label: string; selesai: boolean };

export function BastChecklist({ bastId }: { bastId: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/bast/${bastId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (!cancelled && body) setItems(body.data.checklist);
      })
      .catch(() => {
        if (!cancelled) setError("Gagal memuat checklist.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bastId, refreshKey]);

  const selesai = items.filter((i) => i.selesai).length;

  async function toggle(item: Item) {
    try {
      const res = await fetch(`/api/bast/${bastId}/checklist/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selesai: !item.selesai }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, selesai: !p.selesai } : p)),
      );
    } catch {
      setError("Gagal memperbarui checklist.");
    }
  }

  async function onAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const data = new FormData(e.currentTarget);
    const label = String(data.get("label") || "").trim();
    if (!label) return;
    setPending(true);
    setError("");
    try {
      const res = await fetch(`/api/bast/${bastId}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      if (!res.ok) throw new Error("Gagal menambah item.");
      (e.target as HTMLFormElement).reset();
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setPending(false);
    }
  }

  async function onDelete(item: Item) {
    try {
      const res = await fetch(`/api/bast/${bastId}/checklist/${item.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((p) => p.id !== item.id));
    } catch {
      setError("Gagal menghapus item.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checklist Kelengkapan</CardTitle>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {selesai}/{items.length} selesai
          </span>
          <div
            className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={items.length ? Math.round((selesai / items.length) * 100) : 0}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${items.length ? (selesai / items.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {loading ? (
          <p className="text-sm text-muted-foreground">Memuat…</p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={item.selesai}
                  aria-label={item.label}
                  onClick={() => toggle(item)}
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded border transition-colors",
                    item.selesai
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:border-primary",
                  )}
                >
                  {item.selesai && <Check className="size-3.5" aria-hidden="true" />}
                </button>
                <span
                  className={cn(
                    "flex-1 text-sm",
                    item.selesai && "text-muted-foreground line-through",
                  )}
                >
                  {item.label}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(item)}
                  aria-label={`Hapus ${item.label}`}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={onAdd} className="flex gap-2">
          <Input
            name="label"
            placeholder="Tambah item checklist…"
            maxLength={200}
            disabled={pending}
            aria-label="Item checklist baru"
          />
          <Button type="submit" disabled={pending} size="sm">
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
      </CardContent>
    </Card>
  );
}
