import { z } from "zod";

export const logProgressSchema = z
  .object({
    progres: z.number().int().min(0).max(100),
    tanggal: z.coerce.date().default(() => new Date()),
    catatan: z.string().trim().max(500).nullish(),
  })
  .strict();

export const listProgressSchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(200).default(50),
    offset: z.coerce.number().int().min(0).max(1_000_000).default(0),
  })
  .strict();

export type LogProgressInput = z.infer<typeof logProgressSchema>;
export type ListProgressInput = z.infer<typeof listProgressSchema>;
