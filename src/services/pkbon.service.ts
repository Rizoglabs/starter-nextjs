import "server-only";
import { and, desc, eq, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import {
  pkbonCounters,
  pkbonForms,
  pkbonItems,
  pkbonSettings,
} from "@/db/schema";
import type {
  CreatePkbonFormInput,
  ListPkbonFormsInput,
  UpdatePkbonSettingsInput,
} from "@/validators/pkbon";

const ROMAWI = [
  "I", "II", "III", "IV", "V", "VI",
  "VII", "VIII", "IX", "X", "XI", "XII",
];

// F-011: nomor otomatis {PREFIX}.{SEQ}/PROJECT/{BULAN_ROMAWI}/{TAHUN},
// cth MINK.002/PROJECT/X/2026. Counter atomic per user per tahun.
async function nomorBerikutnya(
  userId: string,
  prefix: string,
  sekarang = new Date(),
): Promise<string> {
  const tahun = sekarang.getFullYear();
  const [row] = await db
    .insert(pkbonCounters)
    .values({ userId, tahun, seq: 1 })
    .onConflictDoUpdate({
      target: [pkbonCounters.userId, pkbonCounters.tahun],
      set: { seq: sql`${pkbonCounters.seq} + 1` },
    })
    .returning({ seq: pkbonCounters.seq });
  const seq = String(row.seq).padStart(3, "0");
  return `${prefix}.${seq}/PROJECT/${ROMAWI[sekarang.getMonth()]}/${tahun}`;
}

// --- F-013: Pengaturan -------------------------------------------------------

const settingsFields = {
  namaDefault: pkbonSettings.namaDefault,
  kotaDefault: pkbonSettings.kotaDefault,
  bankNama: pkbonSettings.bankNama,
  bankRekening: pkbonSettings.bankRekening,
  bankPemilik: pkbonSettings.bankPemilik,
  pejabat1Nama: pkbonSettings.pejabat1Nama,
  pejabat1Jabatan: pkbonSettings.pejabat1Jabatan,
  pejabat2Nama: pkbonSettings.pejabat2Nama,
  pejabat2Jabatan: pkbonSettings.pejabat2Jabatan,
  prefixNomor: pkbonSettings.prefixNomor,
};

export async function getPkbonSettings(userId: string) {
  const [row] = await db
    .select(settingsFields)
    .from(pkbonSettings)
    .where(eq(pkbonSettings.userId, userId))
    .limit(1);
  return row ?? null;
}

export async function upsertPkbonSettings(
  userId: string,
  input: UpdatePkbonSettingsInput,
) {
  const [row] = await db
    .insert(pkbonSettings)
    .values({ userId, ...input })
    .onConflictDoUpdate({
      target: pkbonSettings.userId,
      set: input,
    })
    .returning(settingsFields);
  return row;
}

// --- F-011: Form -------------------------------------------------------------

const formFields = {
  id: pkbonForms.id,
  nomor: pkbonForms.nomor,
  nama: pkbonForms.nama,
  kota: pkbonForms.kota,
  bankNama: pkbonForms.bankNama,
  bankRekening: pkbonForms.bankRekening,
  tanggal: pkbonForms.tanggal,
  total: pkbonForms.total,
  status: pkbonForms.status,
  createdAt: pkbonForms.createdAt,
};

export async function createPkbonForm(
  userId: string,
  input: CreatePkbonFormInput,
) {
  const settings = await getPkbonSettings(userId);
  const nomor = await nomorBerikutnya(
    userId,
    settings?.prefixNomor ?? "MINK",
  );
  const total = input.items.reduce((s, i) => s + i.jumlah, 0);
  const [form] = await db
    .insert(pkbonForms)
    .values({
      userId,
      nomor,
      nama: input.nama,
      kota: input.kota ?? null,
      bankNama: input.bankNama ?? null,
      bankRekening: input.bankRekening ?? null,
      tanggal: input.tanggal,
      total,
      status: input.status,
    })
    .returning(formFields);
  await db.insert(pkbonItems).values(
    input.items.map((item, i) => ({
      formId: form.id,
      userId,
      uraian: item.uraian,
      jumlah: item.jumlah,
      urutan: i,
    })),
  );
  return form;
}

export async function listPkbonForms(
  userId: string,
  { status, limit, offset }: ListPkbonFormsInput,
) {
  const conditions: SQL[] = [eq(pkbonForms.userId, userId)];
  if (status) conditions.push(eq(pkbonForms.status, status));
  const rows = await db
    .select(formFields)
    .from(pkbonForms)
    .where(and(...conditions))
    .orderBy(desc(pkbonForms.createdAt), desc(pkbonForms.id))
    .limit(limit + 1)
    .offset(offset);
  return {
    data: rows.slice(0, limit),
    meta: { limit, offset, hasMore: rows.length > limit },
  };
}

export async function getPkbonForm(userId: string, id: string) {
  const [form] = await db
    .select(formFields)
    .from(pkbonForms)
    .where(and(eq(pkbonForms.id, id), eq(pkbonForms.userId, userId)))
    .limit(1);
  if (!form) return null;
  const items = await db
    .select({
      id: pkbonItems.id,
      uraian: pkbonItems.uraian,
      jumlah: pkbonItems.jumlah,
      urutan: pkbonItems.urutan,
    })
    .from(pkbonItems)
    .where(
      and(eq(pkbonItems.formId, id), eq(pkbonItems.userId, userId)),
    )
    .orderBy(pkbonItems.urutan);
  return { ...form, items };
}

export async function updatePkbonStatus(
  userId: string,
  id: string,
  status: string,
) {
  const [form] = await db
    .update(pkbonForms)
    .set({ status })
    .where(and(eq(pkbonForms.id, id), eq(pkbonForms.userId, userId)))
    .returning(formFields);
  return form;
}

export async function deletePkbonForm(userId: string, id: string) {
  const [deleted] = await db
    .delete(pkbonForms)
    .where(and(eq(pkbonForms.id, id), eq(pkbonForms.userId, userId)))
    .returning({ id: pkbonForms.id });
  return Boolean(deleted);
}
