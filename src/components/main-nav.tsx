"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/sites", label: "Sites" },
  { href: "/bast", label: "BAST" },
  { href: "/pkbon", label: "PKBON" },
  { href: "/reporting", label: "Reporting" },
  { href: "/pengaturan", label: "Pengaturan" },
];

export function MainNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigasi utama" className="flex items-center gap-1">
      {navItems.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
