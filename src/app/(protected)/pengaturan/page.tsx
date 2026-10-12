import type { Metadata } from "next";
import { ClientManager } from "@/components/client-manager";
import { SlaManager } from "@/components/sla-manager";

export const metadata: Metadata = { title: "Pengaturan" };

export default function PengaturanPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Pengaturan</h1>
        <p className="mt-2 text-muted-foreground">
          Data master dan aturan yang dipakai aplikasi.
        </p>
      </div>
      <ClientManager />
      <SlaManager />
    </div>
  );
}
