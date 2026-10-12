import "server-only";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  bastChecklist,
  bastSignatures,
  basts,
  clients,
  pkbonCounters,
  pkbonForms,
  pkbonItems,
  pkbonSettings,
  siteAttachments,
  siteProgressLog,
  sites,
  slaRules,
} from "@/db/schema";

// F-017: backup & restore seluruh data milik user dalam satu file JSON.

const BACKUP_VERSION = 1;

// --- Export ------------------------------------------------------------------

export async function exportBackup(userId: string) {
  const [daftarSite, arsip, logProgres, daftarBast, checklist, signatures, daftarClient, rules, settings, forms, items] =
    await Promise.all([
      db.select().from(sites).where(eq(sites.userId, userId)),
      db.select().from(siteAttachments).where(eq(siteAttachments.userId, userId)),
      db.select().from(siteProgressLog).where(eq(siteProgressLog.userId, userId)),
      db.select().from(basts).where(eq(basts.userId, userId)),
      db.select().from(bastChecklist).where(eq(bastChecklist.userId, userId)),
      db.select().from(bastSignatures).where(eq(bastSignatures.userId, userId)),
      db.select().from(clients).where(eq(clients.userId, userId)),
      db.select().from(slaRules).where(eq(slaRules.userId, userId)),
      db.select().from(pkbonSettings).where(eq(pkbonSettings.userId, userId)),
      db.select().from(pkbonForms).where(eq(pkbonForms.userId, userId)),
      db.select().from(pkbonItems).where(eq(pkbonItems.userId, userId)),
    ]);
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      sites: daftarSite,
      site_attachments: arsip,
      site_progress_log: logProgres,
      basts: daftarBast,
      bast_checklist: checklist,
      bast_signatures: signatures,
      clients: daftarClient,
      sla_rules: rules,
      pkbon_settings: settings,
      pkbon_forms: forms,
      pkbon_items: items,
    },
  };
}

// --- Import ------------------------------------------------------------------

const backupSchema = z.object({
  version: z.literal(BACKUP_VERSION),
  exportedAt: z.string(),
  data: z.object({
    sites: z.array(z.record(z.string(), z.unknown())).default([]),
    site_attachments: z.array(z.record(z.string(), z.unknown())).default([]),
    site_progress_log: z.array(z.record(z.string(), z.unknown())).default([]),
    basts: z.array(z.record(z.string(), z.unknown())).default([]),
    bast_checklist: z.array(z.record(z.string(), z.unknown())).default([]),
    bast_signatures: z.array(z.record(z.string(), z.unknown())).default([]),
    clients: z.array(z.record(z.string(), z.unknown())).default([]),
    sla_rules: z.array(z.record(z.string(), z.unknown())).default([]),
    pkbon_settings: z.array(z.record(z.string(), z.unknown())).default([]),
    pkbon_forms: z.array(z.record(z.string(), z.unknown())).default([]),
    pkbon_items: z.array(z.record(z.string(), z.unknown())).default([]),
  }),
});

type Parsed = z.infer<typeof backupSchema>;

function toDate(v: unknown): Date | null {
  if (v === null || v === undefined) return null;
  const d = new Date(v as string);
  return Number.isNaN(d.getTime()) ? null : d;
}

function str(v: unknown): string | null {
  return typeof v === "string" && v !== "" ? v : null;
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

// Restore menimpa seluruh data user dalam satu transaksi.
export async function importBackup(
  userId: string,
  raw: unknown,
): Promise<{ ok: true; counts: Record<string, number> } | { ok: false; error: string }> {
  const parsed = backupSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Format file backup tidak valid." };
  const d: Parsed["data"] = parsed.data.data;

  try {
    await db.transaction(async (tx) => {
      // Hapus data lama (urutan FK: anak dulu).
      await tx.delete(pkbonItems).where(eq(pkbonItems.userId, userId));
      await tx.delete(pkbonForms).where(eq(pkbonForms.userId, userId));
      await tx.delete(pkbonSettings).where(eq(pkbonSettings.userId, userId));
      await tx.delete(bastSignatures).where(eq(bastSignatures.userId, userId));
      await tx.delete(bastChecklist).where(eq(bastChecklist.userId, userId));
      await tx.delete(basts).where(eq(basts.userId, userId));
      await tx.delete(siteProgressLog).where(eq(siteProgressLog.userId, userId));
      await tx.delete(siteAttachments).where(eq(siteAttachments.userId, userId));
      await tx.delete(sites).where(eq(sites.userId, userId));
      await tx.delete(clients).where(eq(clients.userId, userId));
      await tx.delete(slaRules).where(eq(slaRules.userId, userId));

      // Masukkan data baru (ID asli dipertahankan agar relasi utuh).
      if (d.sites.length)
        await tx.insert(sites).values(
          d.sites.map((s) => ({
            id: String(s.id),
            userId,
            namaSite: String(s.namaSite ?? ""),
            projectId: String(s.projectId ?? ""),
            siteId: str(s.siteId),
            siteIdClient: str(s.siteIdClient),
            taskId: str(s.taskId),
            client: str(s.client),
            tenant: str(s.tenant),
            regional: str(s.regional),
            provinsi: str(s.provinsi),
            alamat: str(s.alamat),
            koordinat: str(s.koordinat),
            pic: str(s.pic),
            picKontak: str(s.picKontak),
            sow: str(s.sow),
            tinggiTower: str(s.tinggiTower),
            kontrakPks: str(s.kontrakPks),
            noSpmk: str(s.noSpmk),
            tanggalSpmk: toDate(s.tanggalSpmk),
            tanggalTarget: toDate(s.tanggalTarget),
            tanggalMulaiRfi: toDate(s.tanggalMulaiRfi),
            timeline: str(s.timeline),
            tanggalSelesai: toDate(s.tanggalSelesai),
            targetBast: toDate(s.targetBast),
            statusProject: String(s.statusProject ?? "persiapan"),
            progres: num(s.progres) ?? 0,
            tanggalProgres: toDate(s.tanggalProgres),
            createdAt: toDate(s.createdAt) ?? new Date(),
            updatedAt: toDate(s.updatedAt) ?? new Date(),
          })),
        );
      if (d.site_attachments.length)
        await tx.insert(siteAttachments).values(
          d.site_attachments.map((a) => ({
            id: String(a.id),
            userId,
            siteId: String(a.siteId),
            kategori: String(a.kategori ?? "dokumen"),
            judul: String(a.judul ?? ""),
            driveUrl: String(a.driveUrl ?? ""),
            createdAt: toDate(a.createdAt) ?? new Date(),
          })),
        );
      if (d.site_progress_log.length)
        await tx.insert(siteProgressLog).values(
          d.site_progress_log.map((p) => ({
            id: String(p.id),
            userId,
            siteId: String(p.siteId),
            progres: num(p.progres) ?? 0,
            tanggal: toDate(p.tanggal) ?? new Date(),
            catatan: str(p.catatan),
            createdAt: toDate(p.createdAt) ?? new Date(),
          })),
        );
      if (d.basts.length)
        await tx.insert(basts).values(
          d.basts.map((b) => ({
            id: String(b.id),
            userId,
            siteId: String(b.siteId),
            tipe: String(b.tipe ?? "cme"),
            status: String(b.status ?? "draft"),
            nomorBast: str(b.nomorBast),
            tanggalBast: toDate(b.tanggalBast),
            catatan: str(b.catatan),
            createdAt: toDate(b.createdAt) ?? new Date(),
            updatedAt: toDate(b.updatedAt) ?? new Date(),
          })),
        );
      if (d.bast_checklist.length)
        await tx.insert(bastChecklist).values(
          d.bast_checklist.map((c) => ({
            id: String(c.id),
            userId,
            bastId: String(c.bastId),
            label: String(c.label ?? ""),
            selesai: Boolean(c.selesai),
            urutan: num(c.urutan) ?? 0,
            createdAt: toDate(c.createdAt) ?? new Date(),
          })),
        );
      if (d.bast_signatures.length)
        await tx.insert(bastSignatures).values(
          d.bast_signatures.map((s) => ({
            id: String(s.id),
            userId,
            bastId: String(s.bastId),
            pihak: String(s.pihak ?? "1"),
            nama: str(s.nama),
            jabatan: str(s.jabatan),
            sudahTtd: Boolean(s.sudahTtd),
            tanggalTtd: toDate(s.tanggalTtd),
            createdAt: toDate(s.createdAt) ?? new Date(),
            updatedAt: toDate(s.updatedAt) ?? new Date(),
          })),
        );
      if (d.clients.length)
        await tx.insert(clients).values(
          d.clients.map((c) => ({
            id: String(c.id),
            userId,
            nama: String(c.nama ?? ""),
            createdAt: toDate(c.createdAt) ?? new Date(),
          })),
        );
      if (d.sla_rules.length)
        await tx.insert(slaRules).values(
          d.sla_rules.map((r) => ({
            id: String(r.id),
            userId,
            regional: String(r.regional ?? ""),
            sow: String(r.sow ?? ""),
            durasiHari: num(r.durasiHari) ?? 30,
            createdAt: toDate(r.createdAt) ?? new Date(),
            updatedAt: toDate(r.updatedAt) ?? new Date(),
          })),
        );
      if (d.pkbon_settings.length)
        await tx.insert(pkbonSettings).values(
          d.pkbon_settings.map((s) => ({
            id: String(s.id),
            userId,
            namaDefault: str(s.namaDefault),
            kotaDefault: str(s.kotaDefault),
            bankNama: str(s.bankNama),
            bankRekening: str(s.bankRekening),
            bankPemilik: str(s.bankPemilik),
            pejabat1Nama: str(s.pejabat1Nama),
            pejabat1Jabatan: str(s.pejabat1Jabatan),
            pejabat2Nama: str(s.pejabat2Nama),
            pejabat2Jabatan: str(s.pejabat2Jabatan),
            prefixNomor: str(s.prefixNomor) ?? "MINK",
            updatedAt: toDate(s.updatedAt) ?? new Date(),
          })),
        );
      if (d.pkbon_forms.length)
        await tx.insert(pkbonForms).values(
          d.pkbon_forms.map((f) => ({
            id: String(f.id),
            userId,
            nomor: String(f.nomor ?? ""),
            nama: String(f.nama ?? ""),
            kota: str(f.kota),
            bankNama: str(f.bankNama),
            bankRekening: str(f.bankRekening),
            tanggal: toDate(f.tanggal) ?? new Date(),
            total: num(f.total) ?? 0,
            status: String(f.status ?? "diajukan"),
            createdAt: toDate(f.createdAt) ?? new Date(),
          })),
        );
      if (d.pkbon_items.length)
        await tx.insert(pkbonItems).values(
          d.pkbon_items.map((i) => ({
            id: String(i.id),
            formId: String(i.formId),
            userId,
            uraian: String(i.uraian ?? ""),
            jumlah: num(i.jumlah) ?? 0,
            urutan: num(i.urutan) ?? 0,
          })),
        );
    });

    const counts: Record<string, number> = {};
    for (const [k, v] of Object.entries(d)) counts[k] = (v as unknown[]).length;
    return { ok: true, counts };
  } catch (e) {
    console.error("Restore backup gagal:", e instanceof Error ? e.name : "UnknownError");
    return { ok: false, error: "Gagal memulihkan backup. Data tidak berubah." };
  }
}

export async function deleteAllUserData(userId: string) {
  await db.transaction(async (tx) => {
    await tx.delete(pkbonItems).where(eq(pkbonItems.userId, userId));
    await tx.delete(pkbonForms).where(eq(pkbonForms.userId, userId));
    await tx.delete(pkbonSettings).where(eq(pkbonSettings.userId, userId));
    await tx.delete(pkbonCounters).where(eq(pkbonCounters.userId, userId));
    await tx.delete(bastSignatures).where(eq(bastSignatures.userId, userId));
    await tx.delete(bastChecklist).where(eq(bastChecklist.userId, userId));
    await tx.delete(basts).where(eq(basts.userId, userId));
    await tx.delete(siteProgressLog).where(eq(siteProgressLog.userId, userId));
    await tx.delete(siteAttachments).where(eq(siteAttachments.userId, userId));
    await tx.delete(sites).where(eq(sites.userId, userId));
    await tx.delete(clients).where(eq(clients.userId, userId));
    await tx.delete(slaRules).where(eq(slaRules.userId, userId));
  });
}
