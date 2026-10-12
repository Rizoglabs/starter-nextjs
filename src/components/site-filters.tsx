"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Download, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { statusLabels } from "@/components/site-card";

function Select({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SiteFilters({
  initial,
}: {
  initial: { q: string; sow: string; regional: string; status: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initial.q);
  const [sow, setSow] = useState(initial.sow);
  const [regional, setRegional] = useState(initial.regional);
  const [status, setStatus] = useState(initial.status);
  const [facets, setFacets] = useState<{ sow: string[]; regional: string[] }>({
    sow: [],
    regional: [],
  });

  useEffect(() => {
    fetch("/api/sites/facets")
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (body?.data) setFacets(body.data);
      })
      .catch(() => {});
  }, []);

  function apply(next: { q: string; sow: string; regional: string; status: string }) {
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.sow) params.set("sow", next.sow);
    if (next.regional) params.set("regional", next.regional);
    if (next.status) params.set("status", next.status);
    router.replace(`${pathname}?${params.toString()}`);
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    apply({ q, sow, regional, status });
  }

  const hasFilter = q || sow || regional || status;
  const exportHref = `/api/sites/export?${searchParams.toString()}`;

  return (
    <div className="mb-6 space-y-4 rounded-2xl border bg-card p-4">
      <form onSubmit={onSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama site, project ID, site ID…"
            aria-label="Cari site"
            className="pl-9"
          />
        </div>
        <Button type="submit">Cari</Button>
      </form>
      <div className="grid gap-3 sm:grid-cols-3">
        <Select
          id="f-sow"
          label="SOW"
          value={sow}
          onChange={(v) => {
            setSow(v);
            apply({ q, sow: v, regional, status });
          }}
          options={facets.sow.map((v) => ({ value: v, label: v }))}
          placeholder="Semua SOW"
        />
        <Select
          id="f-regional"
          label="Regional"
          value={regional}
          onChange={(v) => {
            setRegional(v);
            apply({ q, sow, regional: v, status });
          }}
          options={facets.regional.map((v) => ({ value: v, label: v }))}
          placeholder="Semua Regional"
        />
        <Select
          id="f-status"
          label="Status"
          value={status}
          onChange={(v) => {
            setStatus(v);
            apply({ q, sow, regional, status: v });
          }}
          options={Object.entries(statusLabels).map(([value, label]) => ({
            value,
            label,
          }))}
          placeholder="Semua Status"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <a href={exportHref} download>
            <Download aria-hidden="true" /> Ekspor CSV
          </a>
        </Button>
        {hasFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQ("");
              setSow("");
              setRegional("");
              setStatus("");
              router.replace(pathname);
            }}
          >
            <RotateCcw aria-hidden="true" /> Reset filter
          </Button>
        )}
      </div>
    </div>
  );
}
