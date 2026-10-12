import { z } from "zod";

export const bastTipeSchema = z.enum(["cme", "sitac", "imb"]);
export const bastStatusSchema = z.enum(["draft", "ready", "signed"]);

export const tipeLabels: Record<z.infer<typeof bastTipeSchema>, string> = {
  cme: "CME",
  sitac: "SITAC",
  imb: "IMB",
};

export const statusLabels: Record<z.infer<typeof bastStatusSchema>, string> = {
  draft: "Draft",
  ready: "Ready",
  signed: "Signed",
};

const optionalText = (max: number) => z.string().trim().max(max).nullish();

export const createBastSchema = z
  .object({
    siteId: z.string().uuid(),
    tipe: bastTipeSchema,
    nomorBast: optionalText(160),
    tanggalBast: z.coerce.date().nullish(),
    catatan: z.string().trim().max(2000).nullish(),
  })
  .strict();

export const updateBastSchema = z
  .object({
    tipe: bastTipeSchema.optional(),
    status: bastStatusSchema.optional(),
    nomorBast: optionalText(160),
    tanggalBast: z.coerce.date().nullish(),
    catatan: z.string().trim().max(2000).nullish(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, {
    message: "Berikan minimal satu field untuk diubah.",
  });

export const bastIdSchema = z.string().uuid();

export const listBastsSchema = z
  .object({
    tipe: bastTipeSchema.optional(),
    status: bastStatusSchema.optional(),
    siteId: z.string().uuid().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).max(1_000_000).default(0),
  })
  .strict();

// F-009: checklist
export const checklistItemIdSchema = z.string().uuid();
export const createChecklistItemSchema = z
  .object({ label: z.string().trim().min(1).max(200) })
  .strict();
export const toggleChecklistSchema = z
  .object({ selesai: z.boolean() })
  .strict();

// F-009: tanda tangan
export const signaturePihakSchema = z.enum(["1", "2"]);
export const updateSignatureSchema = z
  .object({
    nama: optionalText(160),
    jabatan: optionalText(160),
    sudahTtd: z.boolean().optional(),
    tanggalTtd: z.coerce.date().nullish(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, {
    message: "Berikan minimal satu field untuk diubah.",
  });

export type CreateBastInput = z.infer<typeof createBastSchema>;
export type UpdateBastInput = z.infer<typeof updateBastSchema>;
export type ListBastsInput = z.infer<typeof listBastsSchema>;
export type UpdateSignatureInput = z.infer<typeof updateSignatureSchema>;
