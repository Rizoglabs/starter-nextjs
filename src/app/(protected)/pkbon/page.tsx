import type { Metadata } from "next";
import Link from "next/link";
import { PkbonForm } from "@/components/pkbon-form";
import { PkbonHistory } from "@/components/pkbon-history";
import { PkbonSettings } from "@/components/pkbon-settings";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "PKBON" };

const TABS = [
  { id: "form", label: "Form" },
  { id: "riwayat", label: "Riwayat" },
  { id: "pengaturan", label: "Pengaturan" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default async function PkbonPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const active: TabId = TABS.some((t) => t.id === tab) ? (tab as TabId) : "form";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">PKBON</h1>
        <p className="mt-2 text-muted-foreground">
          Pengajuan kasbon dengan nomor otomatis.
        </p>
      </div>
      <nav
        aria-label="Tab PKBON"
        className="mb-6 flex gap-1 overflow-x-auto border-b"
      >
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/pkbon?tab=${t.id}`}
            aria-current={active === t.id ? "page" : undefined}
            className={cn(
              "shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              active === t.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {active === "form" && <PkbonForm />}
      {active === "riwayat" && <PkbonHistory />}
      {active === "pengaturan" && <PkbonSettings />}
    </div>
  );
}
