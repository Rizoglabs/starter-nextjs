import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireSession } from "@/lib/session";
import { listSites } from "@/services/sites.service";
import { Button } from "@/components/ui/button";
import { SiteCard } from "@/components/site-card";
import { SiteFilters } from "@/components/site-filters";

export const runtime = "nodejs";
export const metadata: Metadata = { title: "Sites" };

type SearchParams = Promise<{
  q?: string;
  sow?: string;
  regional?: string;
  status?: "persiapan" | "berjalan" | "selesai" | "tertunda";
}>;

export default async function SitesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { user } = await requireSession();
  const sp = await searchParams;
  const filters = {
    q: sp.q ?? "",
    sow: sp.sow ?? "",
    regional: sp.regional ?? "",
    status: sp.status ?? "",
  };
  const { data: sites } = await listSites(user.id, {
    limit: 100,
    offset: 0,
    q: filters.q || undefined,
    sow: filters.sow || undefined,
    regional: filters.regional || undefined,
    status: (filters.status || undefined) as
      | "persiapan"
      | "berjalan"
      | "selesai"
      | "tertunda"
      | undefined,
  });
  const hasFilter = Boolean(filters.q || filters.sow || filters.regional || filters.status);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Sites</h1>
          <p className="mt-2 text-muted-foreground">
            {sites.length === 0
              ? hasFilter
                ? "Tidak ada site yang cocok dengan filter."
                : "Belum ada site. Tambahkan site pertama Anda."
              : `${sites.length} site ditemukan.`}
          </p>
        </div>
        <Button asChild>
          <Link href="/sites/new">
            <Plus aria-hidden="true" /> Tambah Site
          </Link>
        </Button>
      </div>

      <SiteFilters initial={filters} />

      {sites.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
          <p className="text-lg font-medium">
            {hasFilter ? "Tidak ada hasil" : "Belum ada data site"}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {hasFilter
              ? "Coba ubah kata kunci atau reset filter di atas."
              : "Tambahkan site proyek tower untuk mulai memantau progres, dokumen BAST, dan pengajuan kasbon."}
          </p>
          {!hasFilter && (
            <Button asChild className="mt-6">
              <Link href="/sites/new">
                <Plus aria-hidden="true" /> Tambah Site Pertama
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <li key={site.id}>
              <SiteCard site={site} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
