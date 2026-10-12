"use client";

import { useEffect, useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FIELDS: { id: string; label: string; placeholder?: string }[] = [
  { id: "namaDefault", label: "Nama default", placeholder: "cth: Rizog" },
  { id: "kotaDefault", label: "Kota default", placeholder: "cth: Cikarang" },
  { id: "bankNama", label: "Bank", placeholder: "cth: BCA" },
  { id: "bankRekening", label: "No. rekening", placeholder: "cth: 88xxxxxx21" },
  { id: "bankPemilik", label: "Pemilik rekening" },
  { id: "pejabat1Nama", label: "Pejabat 1 — nama" },
  { id: "pejabat1Jabatan", label: "Pejabat 1 — jabatan" },
  { id: "pejabat2Nama", label: "Pejabat 2 — nama" },
  { id: "pejabat2Jabatan", label: "Pejabat 2 — jabatan" },
  { id: "prefixNomor", label: "Awalan nomor", placeholder: "MINK" },
];

export function PkbonSettings() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/pkbon/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (body?.data) {
          const v: Record<string, string> = {};
          for (const f of FIELDS) v[f.id] = body.data[f.id] ?? "";
          setValues(v);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    setSaved(false);
    try {
      const payload: Record<string, string | null> = {};
      for (const f of FIELDS) {
        const v = (values[f.id] ?? "").trim();
        payload[f.id] = v === "" ? null : v;
      }
      const res = await fetch("/api/pkbon/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Gagal menyimpan pengaturan.");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setPending(false);
    }
  }

  if (loading)
    return <p className="text-sm text-muted-foreground">Memuat pengaturan…</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengaturan PKBON</CardTitle>
        <CardDescription>
          Nilai bawaan yang otomatis terisi di form pengajuan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <fieldset
            disabled={pending}
            className="grid gap-4 sm:grid-cols-2"
          >
            {FIELDS.map((f) => (
              <div key={f.id} className="space-y-2">
                <Label htmlFor={f.id}>{f.label}</Label>
                <Input
                  id={f.id}
                  value={values[f.id] ?? ""}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [f.id]: e.target.value }))
                  }
                  placeholder={f.placeholder}
                  maxLength={160}
                />
              </div>
            ))}
          </fieldset>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {saved && (
            <p role="status" className="text-sm text-green-700 dark:text-green-400">
              Pengaturan tersimpan.
            </p>
          )}
          <Button type="submit" disabled={pending}>
            {pending && (
              <LoaderCircle
                className="animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            )}
            {pending ? "Menyimpan…" : "Simpan Pengaturan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
