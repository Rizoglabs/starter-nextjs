import { z } from "zod";
import { isDriveUrl } from "@/lib/drive";

export const attachmentCategorySchema = z.enum(["dokumen", "foto"]);

const judul = z.string().trim().min(1).max(200);
const driveUrl = z
  .string()
  .trim()
  .url("Tautan tidak valid.")
  .max(2000)
  .refine(isDriveUrl, "Tautan harus tautan Google Drive.");

export const createAttachmentSchema = z
  .object({ kategori: attachmentCategorySchema, judul, driveUrl })
  .strict();

export const updateAttachmentSchema = z
  .object({
    kategori: attachmentCategorySchema.optional(),
    judul: judul.optional(),
    driveUrl: driveUrl.optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, {
    message: "Berikan minimal satu field untuk diubah.",
  });

export const attachmentIdSchema = z.string().uuid();

export const listAttachmentsSchema = z
  .object({
    kategori: attachmentCategorySchema.optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).max(1_000_000).default(0),
  })
  .strict();

export type CreateAttachmentInput = z.infer<typeof createAttachmentSchema>;
export type UpdateAttachmentInput = z.infer<typeof updateAttachmentSchema>;
export type ListAttachmentsInput = z.infer<typeof listAttachmentsSchema>;
