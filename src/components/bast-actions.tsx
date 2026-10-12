"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { statusLabels } from "@/validators/bast";

export function BastStatusChanger({
  bastId,
  current,
}: {
  bastId: string;
  current: "draft" | "ready" | "signed";
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onChange(status: string) {
    if (status === current || pending) return;
    setPending(true);
    setError("");
    try {
      const res = await fetch(`/api/bast/${bastId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Gagal mengubah status.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="bast-status">Status BAST</Label>
      <div className="flex flex-wrap items-center gap-2">
        <select
          id="bast-status"
          value={current}
          disabled={pending}
          onChange={(e) => onChange(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-2 focus-visible:outline-ring"
        >
          {Object.entries(statusLabels).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        {pending && (
          <LoaderCircle
            className="animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function BastDeleter({ bastId }: { bastId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onDelete() {
    if (
      !window.confirm(
        "Hapus BAST ini beserta checklist dan tanda tangannya? Tindakan ini tidak bisa dibatalkan.",
      )
    ) {
      return;
    }
    setPending(true);
    try {
      const res = await fetch(`/api/bast/${bastId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.replace("/bast");
      router.refresh();
    } catch {
      alert("Gagal menghapus BAST.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button variant="outline" size="sm" disabled={pending} onClick={onDelete}>
      {pending ? (
        <LoaderCircle
          className="animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
      ) : (
        <Trash2 aria-hidden="true" />
      )}
      Hapus
    </Button>
  );
}
