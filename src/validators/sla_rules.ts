import { z } from "zod";

export const createSlaRuleSchema = z
  .object({
    regional: z.string().trim().min(1).max(120),
    sow: z.string().trim().min(1).max(80),
    durasiHari: z.number().int().min(1).max(3650),
  })
  .strict();

export const updateSlaRuleSchema = z
  .object({ durasiHari: z.number().int().min(1).max(3650) })
  .strict();

export const slaRuleIdSchema = z.string().uuid();

export type CreateSlaRuleInput = z.infer<typeof createSlaRuleSchema>;
export type UpdateSlaRuleInput = z.infer<typeof updateSlaRuleSchema>;
