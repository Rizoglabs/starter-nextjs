"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteForm, type SiteFormValues } from "@/components/site-form";

export default function EditSitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [site, setSite] = useState<SiteFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/sites/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Site tidak ditemukan.");
        const { data } = await res.json();
        setSite(data);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Gagal memuat data."),
      )
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(values: Record<string, unknown>) {
    const res = await fetch(`/api/sites/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error ?? "Gagal menyimpan perubahan.");
    }
    router.replace(`/sites/${id}`);
  }

  async function handleDelete() {
    if (
      !window.confirm(
        "Hapus site ini? Data yang sudah dihapus tidak bisa dikembalikan.",
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/sites/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus site.");
      router.replace("/sites");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus site.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">Memuat data site…</p>;
  }

  if (error && !site) {
    return (
      <p role="alert" className="text-destructive">
        {error}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">Ubah Site</h1>
      <p className="mb-8 text-muted-foreground">
        Perbarui data site. Field bertanda * wajib diisi.
      </p>
      {site && (
        <SiteForm initial={site} submitLabel="Simpan Perubahan" onSubmit={handleSubmit} />
      )}
      <div className="mt-10 border-t pt-6">
        <h2 className="text-lg font-semibold text-destructive">Zona Berbahaya</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Menghapus site akan menghilangkan seluruh datanya secara permanen.
        </p>
        {error && site && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button
          variant="destructive"
          className="mt-4"
          disabled={deleting}
          onClick={handleDelete}
        >
          {deleting ? (
            <LoaderCircle
              className="animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <Trash2 aria-hidden="true" />
          )}
          {deleting ? "Menghapus…" : "Hapus Site Ini"}
        </Button>
      </div>
    </div>
  );
}
