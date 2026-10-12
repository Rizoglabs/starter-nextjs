import Link from "next/link";
import { Layers2 } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Brand() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 rounded-sm font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      aria-label={`${siteConfig.name} home`}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Layers2 className="size-4" aria-hidden="true" />
      </span>
      <span>{siteConfig.name}</span>
    </Link>
  );
}
