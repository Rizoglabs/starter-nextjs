"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Row = { uraian: string; jumlah: string };

function formatRupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}

export function PkbonForm() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([{ uraian: "", jumlah: "" }]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [defaults, setDefaults] = useState({
    namaDefault: "",
    kotaDefault: "",
    bankNama: "",
    bankRekening: "",
  });

  useEffect(() => {
    fetch("/api/pkbon/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (body?.data) setDefaults(body.data);
      })
      .catch(() => {});
  }, []);

  const total = rows.reduce(
    (s, r) => s + (Number.parseInt(r.jumlah.replace(/\D/g, ""), 10) || 0),
    0,
  );

  function setRow(i: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const data = new FormData(e.currentTarget);
    const items = rows
      .map((r) => ({
        uraian: r.uraian.trim(),
        jumlah: Number.parseInt(r.jumlah.replace(/\D/g, ""), 10) || 0,
      }))
      .filter((r) => r.uraian);
    if (items.length === 0) {
      setError("Tambahkan minimal satu uraian tugas.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const tanggal = String(data.get("tanggal") || "").trim();
      const res = await fetch("/api/pkbon/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: String(data.get("nama") || "").trim(),
          kota: String(data.get("kota") || "").trim() || null,
          bankNama: String(data.get("bankNama") || "").trim() || null,
          bankRekening: String(data.get("bankRekening") || "").trim() || null,
          tanggal: tanggal || new Date().toISOString().slice(0, 10),
          items,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Gagal menyimpan pengajuan.");
      }
      const { data: form } = await res.json();
      router.replace(`/pkbon?tab=riwayat&highlight=${form.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" aria-busy={pending}>
      <Card>
        <CardHeader>
          <CardTitle>Data Pengajuan</CardTitle>
        </CardHeader>
        <CardContent>
          <fieldset disabled={pending} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nama">
                Nama <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nama"
                name="nama"
                required
                maxLength={160}
                defaultValue={defaults.namaDefault}
                key={defaults.namaDefault}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kota">Kota</Label>
              <Input
                id="kota"
                name="kota"
                maxLength={120}
                defaultValue={defaults.kotaDefault}
                key={defaults.kotaDefault}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankNama">Bank</Label>
                <Input
                  id="bankNama"
                  name="bankNama"
                  maxLength={60}
                  defaultValue={defaults.bankNama}
                  key={defaults.bankNama}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankRekening">No. Rekening</Label>
                <Input
                  id="bankRekening"
                  name="bankRekening"
                  maxLength={60}
                  defaultValue={defaults.bankRekening}
                  key={defaults.bankRekening}
                />
              </div>
            </div>
          </fieldset>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uraian Tugas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <fieldset disabled={pending} className="space-y-3">
            {rows.map((row, i) => (
              <div key={i} className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor={`uraian-${i}`} className="sr-only">
                    Uraian {i + 1}
                  </Label>
                  <Input
                    id={`uraian-${i}`}
                    value={row.uraian}
                    onChange={(e) => setRow(i, { uraian: e.target.value })}
                    placeholder={`Uraian ${i + 1}`}
                    maxLength={300}
                  />
                </div>
                <div className="w-40">
                  <Label htmlFor={`jumlah-${i}`} className="sr-only">
                    Jumlah {i + 1}
                  </Label>
                  <Input
                    id={`jumlah-${i}`}
                    value={row.jumlah}
                    onChange={(e) => setRow(i, { jumlah: e.target.value })}
                    placeholder="Rp 0"
                    inputMode="numeric"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={rows.length <= 1}
                  onClick={() =>
                    setRows((prev) => prev.filter((_, j) => j !== i))
                  }
                  aria-label={`Hapus baris ${i + 1}`}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            ))}
          </fieldset>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => setRows((prev) => [...prev, { uraian: "", jumlah: "" }])}
          >
            <Plus aria-hidden="true" /> Tambah Baris
          </Button>
          <div className="flex justify-end border-t pt-3">
            <p className="text-lg font-semibold">
              Total: {formatRupiah(total)}
            </p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending && (
          <LoaderCircle
            className="animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
        )}
        {pending ? "Menyimpan…" : "Simpan Pengajuan"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Nomor form dibuat otomatis (cth MINK.002/PROJECT/X/2026).
      </p>
    </form>
  );
}
