"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { statusLabels, tipeLabels } from "@/validators/bast";

type Bast = {
  id: string;
  tipe: string;
  status: string;
  nomorBast: string | null;
  checklist: { total: number; selesai: number };
};

export function SiteBastTab({ siteId }: { siteId: string }) {
  const [items, setItems] = useState<Bast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/bast?siteId=${siteId}&limit=100`)
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (!cancelled && body) setItems(body.data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [siteId]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild size="sm">
          <Link href={`/bast/new?siteId=${siteId}`}>
            <Plus aria-hidden="true" /> Buat BAST
          </Link>
        </Button>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Memuat…</p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-medium">Belum ada BAST untuk site ini</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Buat BAST CME, SITAC, atau IMB agar serah terima terdokumentasi.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {items.map((b) => (
            <li key={b.id}>
              <Link
                href={`/bast/${b.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <span>
                  <span className="font-medium">
                    BAST {tipeLabels[b.tipe as keyof typeof tipeLabels]}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {b.nomorBast || "Tanpa nomor"} · Checklist{" "}
                    {b.checklist.selesai}/{b.checklist.total}
                  </span>
                </span>
                <Badge variant={b.status === "signed" ? "default" : "secondary"}>
                  {statusLabels[b.status as keyof typeof statusLabels]}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
