import { z } from "zod";

export const createClientSchema = z
  .object({ nama: z.string().trim().min(1).max(120) })
  .strict();

export const clientIdSchema = z.string().uuid();

export type CreateClientInput = z.infer<typeof createClientSchema>;
