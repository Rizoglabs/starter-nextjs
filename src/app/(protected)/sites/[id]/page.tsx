import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { requireSession } from "@/lib/session";
import { getSite } from "@/services/sites.service";
import { Button } from "@/components/ui/button";
import { SiteDetail } from "@/components/site-detail";

export const runtime = "nodejs";

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
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireSession();
  const { id } = await params;
  const site = await getSite(user.id, id);
  if (!site) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
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
      <SiteDetail site={site} />
    </div>
  );
}
