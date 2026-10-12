"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tipeLabels } from "@/validators/bast";

type SiteOption = { id: string; namaSite: string; projectId: string };

export function BastCreateForm({ sites }: { sites: SiteOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const presetSite = searchParams.get("siteId") ?? "";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const data = new FormData(e.currentTarget);
    setPending(true);
    setError("");
    try {
      const tanggal = String(data.get("tanggalBast") || "").trim();
      const res = await fetch("/api/bast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: String(data.get("siteId")),
          tipe: String(data.get("tipe")),
          nomorBast: String(data.get("nomorBast") || "").trim() || null,
          tanggalBast: tanggal || null,
          catatan: String(data.get("catatan") || "").trim() || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Gagal membuat BAST.");
      }
      const { data: bast } = await res.json();
      router.replace(`/bast/${bast.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" aria-busy={pending}>
      <fieldset disabled={pending} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="siteId">
            Site <span className="text-destructive">*</span>
          </Label>
          <select
            id="siteId"
            name="siteId"
            required
            defaultValue={presetSite}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-2 focus-visible:outline-ring"
          >
            <option value="">— Pilih site —</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.namaSite} ({s.projectId})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tipe">
            Tipe BAST <span className="text-destructive">*</span>
          </Label>
          <select
            id="tipe"
            name="tipe"
            required
            defaultValue="cme"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-2 focus-visible:outline-ring"
          >
            {Object.entries(tipeLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Checklist bawaan akan dibuat otomatis sesuai tipe.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nomorBast">Nomor BAST</Label>
            <Input id="nomorBast" name="nomorBast" maxLength={160} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tanggalBast">Tanggal BAST</Label>
            <Input id="tanggalBast" name="tanggalBast" type="date" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="catatan">Catatan</Label>
          <Input id="catatan" name="catatan" maxLength={2000} />
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending && (
            <LoaderCircle
              className="animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          )}
          {pending ? "Menyimpan…" : "Buat BAST"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => router.back()}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
