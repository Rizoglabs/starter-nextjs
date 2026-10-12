import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { clients } from "@/db/schema";
import type { CreateClientInput } from "@/validators/clients";

export async function listClients(userId: string) {
  return db
    .select({ id: clients.id, nama: clients.nama })
    .from(clients)
    .where(eq(clients.userId, userId))
    .orderBy(asc(clients.nama));
}

export async function createClient(userId: string, input: CreateClientInput) {
  // Hindari duplikat nama (case-insensitive).
  const duplikat = (
    await db
      .select({ nama: clients.nama })
      .from(clients)
      .where(eq(clients.userId, userId))
  ).some((r) => r.nama.toLowerCase() === input.nama.toLowerCase());
  if (duplikat) return { error: "DUPLIKAT" as const };
  const [row] = await db
    .insert(clients)
    .values({ nama: input.nama, userId })
    .returning({ id: clients.id, nama: clients.nama });
  return { data: row };
}

export async function deleteClient(userId: string, id: string) {
  const [deleted] = await db
    .delete(clients)
    .where(and(eq(clients.id, id), eq(clients.userId, userId)))
    .returning({ id: clients.id });
  return Boolean(deleted);
}
