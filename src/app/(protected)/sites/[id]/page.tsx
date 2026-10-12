import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { requireSession } from "@/lib/session";
import { getSite } from "@/services/sites.service";
import { Button } from "@/components/ui/button";
import { SiteDetail } from "@/components/site-detail";
import { SiteProgressTab } from "@/components/site-progress-tab";
import { SiteAttachmentsTab } from "@/components/site-attachments-tab";
import { cn } from "@/lib/utils";

export const runtime = "nodejs";

const TABS = [
  { id: "detail", label: "Detail" },
  { id: "progress", label: "Progress" },
  { id: "dokumen", label: "Dokumen" },
  { id: "foto", label: "Foto" },
  // Menyusul di milestone berikutnya:
  // Pembayaran (M6), Notes (pasca-MVP), BAST (M4).
] as const;

type TabId = (typeof TABS)[number]["id"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { user } = await requireSession();
  const { id } = await params;
  const site = await getSite(user.id, id);
  return { title: site ? site.namaSite : "Site" };
}

export default async function SiteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { user } = await requireSession();
  const { id } = await params;
  const { tab } = await searchParams;
  const site = await getSite(user.id, id);
  if (!site) notFound();

  const activeTab: TabId = TABS.some((t) => t.id === tab)
    ? (tab as TabId)
    : "detail";

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/sites">
            <ArrowLeft aria-hidden="true" /> Kembali
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/sites/${site.id}/edit`}>
            <Pencil aria-hidden="true" /> Ubah
          </Link>
        </Button>
      </div>

      <nav
        aria-label="Tab detail site"
        className="mb-6 flex gap-1 overflow-x-auto border-b"
      >
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/sites/${site.id}?tab=${t.id}`}
            aria-current={activeTab === t.id ? "page" : undefined}
            className={cn(
              "shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === t.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {activeTab === "detail" && <SiteDetail site={site} />}
      {activeTab === "progress" && (
        <SiteProgressTab siteId={site.id} currentProgres={site.progres} />
      )}
      {activeTab === "dokumen" && (
        <SiteAttachmentsTab siteId={site.id} kategori="dokumen" />
      )}
      {activeTab === "foto" && (
        <SiteAttachmentsTab siteId={site.id} kategori="foto" />
      )}
    </div>
  );
}
