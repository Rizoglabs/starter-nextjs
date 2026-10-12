"use client";

import { useEffect, useState, type FormEvent } from "react";
import { LoaderCircle, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Rule = {
  id: string;
  regional: string;
  sow: string;
  durasiHari: number;
};

export function SlaManager() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [editing, setEditing] = useState<Rule | null>(null);
  const [editDays, setEditDays] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/sla-rules")
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (!cancelled && body) setRules(body.data);
      })
      .catch(() => {
        if (!cancelled) setError("Gagal memuat aturan SLA.");
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
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/sla-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regional: String(data.get("regional") || "").trim(),
          sow: String(data.get("sow") || "").trim(),
          durasiHari: Number(data.get("durasiHari")),
        }),
      });
      if (res.status === 409)
        throw new Error("Aturan untuk Regional x SOW tersebut sudah ada.");
      if (!res.ok) throw new Error("Gagal menambah aturan.");
      (e.target as HTMLFormElement).reset();
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setPending(false);
    }
  }

  async function onSaveEdit() {
    if (!editing) return;
    const durasi = Number(editDays);
    if (!Number.isInteger(durasi) || durasi < 1) {
      setError("Durasi harus bilangan bulat minimal 1 hari.");
      return;
    }
    try {
      const res = await fetch(`/api/sla-rules/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durasiHari: durasi }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan perubahan.");
      setEditing(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    }
  }

  async function onDelete(id: string, label: string) {
    if (!window.confirm(`Hapus aturan "${label}"?`)) return;
    try {
      const res = await fetch(`/api/sla-rules/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus.");
      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aturan SLA Regional x SOW</CardTitle>
        <CardDescription>
          Target durasi pengerjaan (hari) per kombinasi Regional dan SOW.
          Dihitung mulai tanggal SPMK (atau tanggal site dibuat bila SPMK kosong).
          Site yang tersisa ≤ 7 hari atau sudah lewat akan muncul di dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          onSubmit={onSubmit}
          className="grid gap-3 sm:grid-cols-4"
          aria-label="Tambah aturan SLA"
        >
          <fieldset
            disabled={pending}
            className="grid gap-3 sm:col-span-4 sm:grid-cols-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="sla-regional">Regional</Label>
              <Input
                id="sla-regional"
                name="regional"
                required
                maxLength={120}
                placeholder="cth: Jawa Barat"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sla-sow">SOW</Label>
              <Input
                id="sla-sow"
                name="sow"
                required
                maxLength={80}
                placeholder="cth: CME"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sla-hari">Durasi (hari)</Label>
              <Input
                id="sla-hari"
                name="durasiHari"
                type="number"
                min={1}
                max={3650}
                required
                placeholder="cth: 90"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={pending} className="w-full">
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
            </div>
          </fieldset>
        </form>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {loading ? (
          <p className="text-sm text-muted-foreground">Memuat…</p>
        ) : rules.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada aturan SLA. Tambahkan di atas agar dashboard bisa
            menandai site yang perlu perhatian.
          </p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {rules.map((r) => (
              <li key={r.id} className="px-4 py-3">
                {editing?.id === r.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">
                      {r.regional} x {r.sow}
                    </span>
                    <Input
                      value={editDays}
                      onChange={(e) => setEditDays(e.target.value)}
                      type="number"
                      min={1}
                      max={3650}
                      className="w-28"
                      aria-label="Durasi hari"
                    />
                    <span className="text-sm text-muted-foreground">hari</span>
                    <Button size="sm" onClick={onSaveEdit}>
                      Simpan
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditing(null)}
                      aria-label="Batal"
                    >
                      <X aria-hidden="true" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span>
                      <span className="font-medium">
                        {r.regional} x {r.sow}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        Target: {r.durasiHari} hari
                      </span>
                    </span>
                    <span className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditing(r);
                          setEditDays(String(r.durasiHari));
                          setError("");
                        }}
                        aria-label={`Ubah ${r.regional} x ${r.sow}`}
                      >
                        <Pencil aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(r.id, `${r.regional} x ${r.sow}`)}
                        aria-label={`Hapus ${r.regional} x ${r.sow}`}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
