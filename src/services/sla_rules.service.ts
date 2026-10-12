import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { slaRules } from "@/db/schema";
import type {
  CreateSlaRuleInput,
  UpdateSlaRuleInput,
} from "@/validators/sla_rules";

const fields = {
  id: slaRules.id,
  regional: slaRules.regional,
  sow: slaRules.sow,
  durasiHari: slaRules.durasiHari,
};

export async function listSlaRules(userId: string) {
  return db
    .select(fields)
    .from(slaRules)
    .where(eq(slaRules.userId, userId))
    .orderBy(asc(slaRules.regional), asc(slaRules.sow));
}

export async function createSlaRule(userId: string, input: CreateSlaRuleInput) {
  try {
    const [row] = await db
      .insert(slaRules)
      .values({ ...input, userId })
      .returning(fields);
    return { data: row };
  } catch {
    // Pelanggaran unique(userId, regional, sow).
    return { error: "DUPLIKAT" as const };
  }
}

export async function updateSlaRule(
  userId: string,
  id: string,
  input: UpdateSlaRuleInput,
) {
  const [row] = await db
    .update(slaRules)
    .set(input)
    .where(and(eq(slaRules.id, id), eq(slaRules.userId, userId)))
    .returning(fields);
  return row;
}

export async function deleteSlaRule(userId: string, id: string) {
  const [deleted] = await db
    .delete(slaRules)
    .where(and(eq(slaRules.id, id), eq(slaRules.userId, userId)))
    .returning({ id: slaRules.id });
  return Boolean(deleted);
}
