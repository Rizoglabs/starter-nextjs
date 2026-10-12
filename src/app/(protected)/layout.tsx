import Link from "next/link";
import { Brand } from "@/components/brand";
import { SignOutButton } from "@/components/sign-out-button";
import { requireSession } from "@/lib/session";

export const runtime = "nodejs";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/sites", label: "Sites" },
  { href: "/bast", label: "BAST" },
  { href: "/pengaturan", label: "Pengaturan" },
  // Modul lain (PKBON, Reporting) menyusul di M5–M6.
];

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession();
  return (
    <>
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5 sm:px-10">
          <div className="flex items-center gap-8">
            <Brand />
            <nav aria-label="Navigasi utama" className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <SignOutButton />
        </div>
      </header>
      <main
        id="main-content"
        className="mx-auto max-w-6xl px-6 py-12 sm:px-10 sm:py-16"
      >
        {children}
      </main>
    </>
  );
}
