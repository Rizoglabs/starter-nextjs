"use client";

import { useEffect, useState, type FormEvent } from "react";
import { BadgeCheck, LoaderCircle, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Sig = {
  id: string;
  pihak: string;
  nama: string | null;
  jabatan: string | null;
  sudahTtd: boolean;
  tanggalTtd: string | null;
};

function formatTanggal(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function SignatureCard({
  bastId,
  sig,
  title,
  onChanged,
}: {
  bastId: string;
  sig: Sig;
  title: string;
  onChanged: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const data = new FormData(e.currentTarget);
    setPending(true);
    setError("");
    try {
      const res = await fetch(`/api/bast/${bastId}/signatures/${sig.pihak}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: String(data.get("nama") || "").trim() || null,
          jabatan: String(data.get("jabatan") || "").trim() || null,
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan.");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setPending(false);
    }
  }

  async function toggleTtd() {
    setPending(true);
    setError("");
    try {
      const res = await fetch(`/api/bast/${bastId}/signatures/${sig.pihak}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sudahTtd: !sig.sudahTtd }),
      });
      if (!res.ok) throw new Error("Gagal memperbarui status.");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          {title}
          {sig.sudahTtd ? (
            <Badge className="bg-green-600">
              <BadgeCheck className="size-3.5" aria-hidden="true" /> Sudah TTD
            </Badge>
          ) : (
            <Badge variant="secondary">Belum TTD</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onSubmit} className="space-y-3">
          <fieldset disabled={pending} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor={`nama-${sig.pihak}`}>Nama</Label>
              <Input
                id={`nama-${sig.pihak}`}
                name="nama"
                defaultValue={sig.nama ?? ""}
                maxLength={160}
                placeholder="Nama penandatangan"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`jabatan-${sig.pihak}`}>Jabatan</Label>
              <Input
                id={`jabatan-${sig.pihak}`}
                name="jabatan"
                defaultValue={sig.jabatan ?? ""}
                maxLength={160}
                placeholder="cth: Site Manager"
              />
            </div>
          </fieldset>
          <p className="text-sm text-muted-foreground">
            Tanggal TTD: {formatTanggal(sig.tanggalTtd)}
          </p>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" variant="outline" disabled={pending}>
              {pending && (
                <LoaderCircle
                  className="animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              )}
              Simpan Data
            </Button>
            <Button
              type="button"
              size="sm"
              variant={sig.sudahTtd ? "outline" : "default"}
              disabled={pending}
              onClick={toggleTtd}
            >
              <PenLine aria-hidden="true" />
              {sig.sudahTtd ? "Batalkan TTD" : "Tandai Sudah TTD"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function BastSignatures({ bastId }: { bastId: string }) {
  const [sigs, setSigs] = useState<Sig[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/bast/${bastId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (!cancelled && body) setSigs(body.data.signatures);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bastId, refreshKey]);

  if (loading) return <p className="text-sm text-muted-foreground">Memuat…</p>;

  const s1 = sigs.find((s) => s.pihak === "1");
  const s2 = sigs.find((s) => s.pihak === "2");

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {s1 && (
        <SignatureCard
          bastId={bastId}
          sig={s1}
          title="Pihak 1"
          onChanged={() => setRefreshKey((k) => k + 1)}
        />
      )}
      {s2 && (
        <SignatureCard
          bastId={bastId}
          sig={s2}
          title="Pihak 2"
          onChanged={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  );
}
