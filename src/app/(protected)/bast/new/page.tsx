import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { listSites } from "@/services/sites.service";
import { BastCreateForm } from "@/components/bast-create-form";

export const runtime = "nodejs";
export const metadata: Metadata = { title: "Buat BAST" };

export default async function BastNewPage() {
  const { user } = await requireSession();
  const { data: sites } = await listSites(user.id, { limit: 100, offset: 0 });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">Buat BAST</h1>
      <p className="mb-8 text-muted-foreground">
        Pilih site dan tipe Berita Acara Serah Terima.
      </p>
      <BastCreateForm
        sites={sites.map((s) => ({
          id: s.id,
          namaSite: s.namaSite,
          projectId: s.projectId,
        }))}
      />
    </div>
  );
}
