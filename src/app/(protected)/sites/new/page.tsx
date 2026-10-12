"use client";

import { useRouter } from "next/navigation";
import { SiteForm } from "@/components/site-form";

export default function NewSitePage() {
  const router = useRouter();

  async function handleSubmit(values: Record<string, unknown>) {
    const res = await fetch("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error ?? "Gagal menyimpan site.");
    }
    const { data } = await res.json();
    router.replace(`/sites/${data.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">
        Tambah Site
      </h1>
      <p className="mb-8 text-muted-foreground">
        Isi data site proyek tower. Field bertanda * wajib diisi.
      </p>
      <SiteForm submitLabel="Simpan Site" onSubmit={handleSubmit} />
    </div>
  );
}
