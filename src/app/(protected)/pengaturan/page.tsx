import type { Metadata } from "next";
import { ClientManager } from "@/components/client-manager";
import { SlaManager } from "@/components/sla-manager";
import { BackupManager } from "@/components/backup-manager";

export const metadata: Metadata = { title: "Pengaturan" };

export default function PengaturanPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Pengaturan</h1>
        <p className="mt-2 text-muted-foreground">
          Data master, aturan, dan keamanan data aplikasi.
        </p>
      </div>
      <ClientManager />
      <SlaManager />
      <BackupManager />
    </div>
  );
}
