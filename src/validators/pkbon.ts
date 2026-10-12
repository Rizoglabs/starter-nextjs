import { z } from "zod";

export const pkbonStatusSchema = z.enum([
  "draft",
  "diajukan",
  "disetujui",
  "ditolak",
]);

export const statusLabels: Record<z.infer<typeof pkbonStatusSchema>, string> = {
  draft: "Draft",
  diajukan: "Diajukan",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
};

const optionalText = (max: number) => z.string().trim().max(max).nullish();

// F-013
export const updatePkbonSettingsSchema = z
  .object({
    namaDefault: optionalText(160),
    kotaDefault: optionalText(120),
    bankNama: optionalText(60),
    bankRekening: optionalText(60),
    bankPemilik: optionalText(160),
    pejabat1Nama: optionalText(160),
    pejabat1Jabatan: optionalText(160),
    pejabat2Nama: optionalText(160),
    pejabat2Jabatan: optionalText(160),
    prefixNomor: z.string().trim().min(1).max(20).optional(),
  })
  .strict();

// F-011
const itemSchema = z.object({
  uraian: z.string().trim().min(1).max(300),
  jumlah: z.number().int().min(0).max(999_999_999_999),
});

export const createPkbonFormSchema = z
  .object({
    nama: z.string().trim().min(1).max(160),
    kota: optionalText(120),
    bankNama: optionalText(60),
    bankRekening: optionalText(60),
    tanggal: z.coerce.date().default(() => new Date()),
    status: pkbonStatusSchema.default("diajukan"),
    items: z.array(itemSchema).min(1).max(50),
  })
  .strict();

export const updatePkbonStatusSchema = z
  .object({ status: pkbonStatusSchema })
  .strict();

export const pkbonFormIdSchema = z.string().uuid();

export const listPkbonFormsSchema = z
  .object({
    status: pkbonStatusSchema.optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).max(1_000_000).default(0),
  })
  .strict();

export type UpdatePkbonSettingsInput = z.infer<typeof updatePkbonSettingsSchema>;
export type CreatePkbonFormInput = z.infer<typeof createPkbonFormSchema>;
export type ListPkbonFormsInput = z.infer<typeof listPkbonFormsSchema>;
