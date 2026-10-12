"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { statusLabels } from "@/components/site-card";

export type SiteFormValues = {
  namaSite: string;
  projectId: string;
  siteId?: string | null;
  siteIdClient?: string | null;
  taskId?: string | null;
  client?: string | null;
  tenant?: string | null;
  regional?: string | null;
  provinsi?: string | null;
  alamat?: string | null;
  koordinat?: string | null;
  pic?: string | null;
  picKontak?: string | null;
  sow?: string | null;
  tinggiTower?: string | null;
  kontrakPks?: string | null;
  noSpmk?: string | null;
  tanggalSpmk?: string | null;
  tanggalTarget?: string | null;
  tanggalMulaiRfi?: string | null;
  timeline?: string | null;
  tanggalSelesai?: string | null;
  targetBast?: string | null;
  statusProject: string;
};

function toDateInput(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function Field({
  id,
  label,
  children,
  required,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

const textFields: {
  id: keyof SiteFormValues;
  label: string;
  required?: boolean;
}[] = [
  { id: "namaSite", label: "Nama Site", required: true },
  { id: "projectId", label: "Project ID", required: true },
  { id: "siteId", label: "Site ID" },
  { id: "siteIdClient", label: "Site ID Client" },
  { id: "taskId", label: "Task ID" },
  { id: "client", label: "Client" },
  { id: "tenant", label: "Tenant" },
  { id: "regional", label: "Regional" },
  { id: "provinsi", label: "Provinsi" },
  { id: "koordinat", label: "Koordinat" },
  { id: "pic", label: "PIC" },
  { id: "picKontak", label: "Kontak PIC" },
  { id: "sow", label: "SOW" },
  { id: "tinggiTower", label: "Tinggi Tower" },
  { id: "kontrakPks", label: "Kontrak / PKS" },
  { id: "noSpmk", label: "No. SPMK" },
];

const dateFields: { id: keyof SiteFormValues; label: string }[] = [
  { id: "tanggalSpmk", label: "Tanggal SPMK" },
  { id: "tanggalTarget", label: "Tanggal Target" },
  { id: "tanggalMulaiRfi", label: "Tanggal Mulai / RFI" },
  { id: "tanggalSelesai", label: "Tanggal Selesai" },
  { id: "targetBast", label: "Target BAST" },
];

export function SiteForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<SiteFormValues>;
  submitLabel: string;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const values: Record<string, unknown> = {};
      for (const { id } of textFields) {
        const v = String(data.get(id) ?? "").trim();
        values[id] = v === "" ? null : v;
      }
      for (const { id } of dateFields) {
        const v = String(data.get(id) ?? "").trim();
        values[id] = v === "" ? null : v;
      }
      const alamat = String(data.get("alamat") ?? "").trim();
      const timeline = String(data.get("timeline") ?? "").trim();
      values.alamat = alamat === "" ? null : alamat;
      values.timeline = timeline === "" ? null : timeline;
      values.statusProject = String(data.get("statusProject") ?? "persiapan");
      await onSubmit(values);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan. Coba lagi.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" aria-busy={pending}>
      <fieldset disabled={pending} className="space-y-8">
        <section aria-labelledby="identitas">
          <h2 id="identitas" className="mb-4 text-lg font-semibold">
            Identitas
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {textFields.slice(0, 5).map((f) => (
              <Field key={f.id} id={f.id} label={f.label} required={f.required}>
                <Input
                  id={f.id}
                  name={f.id}
                  defaultValue={initial?.[f.id] ?? ""}
                  required={f.required}
                  maxLength={200}
                />
              </Field>
            ))}
          </div>
        </section>

        <section aria-labelledby="lokasi">
          <h2 id="lokasi" className="mb-4 text-lg font-semibold">
            Lokasi & Klien
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {textFields.slice(5, 10).map((f) => (
              <Field key={f.id} id={f.id} label={f.label}>
                <Input
                  id={f.id}
                  name={f.id}
                  defaultValue={initial?.[f.id] ?? ""}
                  maxLength={200}
                />
              </Field>
            ))}
            <Field id="alamat" label="Alamat">
              <Input
                id="alamat"
                name="alamat"
                defaultValue={initial?.alamat ?? ""}
                maxLength={2000}
              />
            </Field>
          </div>
        </section>

        <section aria-labelledby="teknis">
          <h2 id="teknis" className="mb-4 text-lg font-semibold">
            Kontak & Teknis
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {textFields.slice(10, 14).map((f) => (
              <Field key={f.id} id={f.id} label={f.label}>
                <Input
                  id={f.id}
                  name={f.id}
                  defaultValue={initial?.[f.id] ?? ""}
                  maxLength={200}
                />
              </Field>
            ))}
          </div>
        </section>

        <section aria-labelledby="kontrak">
          <h2 id="kontrak" className="mb-4 text-lg font-semibold">
            Kontrak & Jadwal
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {textFields.slice(14, 16).map((f) => (
              <Field key={f.id} id={f.id} label={f.label}>
                <Input
                  id={f.id}
                  name={f.id}
                  defaultValue={initial?.[f.id] ?? ""}
                  maxLength={200}
                />
              </Field>
            ))}
            {dateFields.map((f) => (
              <Field key={f.id} id={f.id} label={f.label}>
                <Input
                  id={f.id}
                  name={f.id}
                  type="date"
                  defaultValue={toDateInput(initial?.[f.id])}
                />
              </Field>
            ))}
            <Field id="timeline" label="Timeline">
              <Input
                id="timeline"
                name="timeline"
                defaultValue={initial?.timeline ?? ""}
                maxLength={2000}
              />
            </Field>
          </div>
        </section>

        <section aria-labelledby="status">
          <h2 id="status" className="mb-4 text-lg font-semibold">
            Status
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="statusProject" label="Status Project">
              <select
                id="statusProject"
                name="statusProject"
                defaultValue={initial?.statusProject ?? "persiapan"}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring"
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </section>
      </fieldset>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm leading-6 text-destructive"
        >
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending && (
            <LoaderCircle
              className="animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          )}
          {pending ? "Menyimpan…" : submitLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => router.back()}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
