"use client";

import { useRef, useState } from "react";
import { Download, LoaderCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function BackupManager() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function onRestoreFile(file: File) {
    setPending(true);
    setError("");
    setInfo("");
    try {
      const text = await file.text();
      const res = await fetch("/api/backup/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: text,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Gagal memulihkan backup.");
      }
      const { data } = await res.json();
      const total = Object.values(data as Record<string, number>).reduce(
        (a: number, b: number) => a + b,
        0,
      );
      setInfo(`Backup dipulihkan: ${total} baris data.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memulihkan.");
    } finally {
      setPending(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup & Restore</CardTitle>
        <CardDescription>
          Unduh seluruh data sebagai satu file JSON, atau pulihkan dari file
          backup sebelumnya.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a href="/api/backup" download>
              <Download aria-hidden="true" /> Unduh Backup
            </a>
          </Button>
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => fileRef.current?.click()}
          >
            {pending ? (
              <LoaderCircle
                className="animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : (
              <Upload aria-hidden="true" />
            )}
            {pending ? "Memulihkan…" : "Pulihkan dari File"}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            aria-label="Pilih file backup JSON"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (
                !window.confirm(
                  "Pulihkan backup? SELURUH data saat ini akan diganti dengan isi file backup.",
                )
              ) {
                e.target.value = "";
                return;
              }
              onRestoreFile(f);
            }}
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {info && (
          <p role="status" className="text-sm text-green-700 dark:text-green-400">
            {info}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Restore menimpa seluruh data Anda saat ini. Unduh backup dulu sebelum
          memulihkan, untuk jaga-jaga.
        </p>
      </CardContent>
    </Card>
  );
}
