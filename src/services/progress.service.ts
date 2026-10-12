import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { siteProgressLog, sites } from "@/db/schema";
import type {
  ListProgressInput,
  LogProgressInput,
} from "@/validators/progress";

const fields = {
  id: siteProgressLog.id,
  progres: siteProgressLog.progres,
  tanggal: siteProgressLog.tanggal,
  catatan: siteProgressLog.catatan,
  createdAt: siteProgressLog.createdAt,
};

async function ownSite(userId: string, siteId: string) {
  const [site] = await db
    .select({ id: sites.id })
    .from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.userId, userId)))
    .limit(1);
  return Boolean(site);
}

export async function listProgress(
  userId: string,
  siteId: string,
  { limit, offset }: ListProgressInput,
) {
  if (!(await ownSite(userId, siteId))) return null;
  const rows = await db
    .select(fields)
    .from(siteProgressLog)
    .where(
      and(
        eq(siteProgressLog.siteId, siteId),
        eq(siteProgressLog.userId, userId),
      ),
    )
    .orderBy(
      desc(siteProgressLog.tanggal),
      desc(siteProgressLog.createdAt),
      desc(siteProgressLog.id),
    )
    .limit(limit + 1)
    .offset(offset);
  return {
    data: rows.slice(0, limit),
    meta: { limit, offset, hasMore: rows.length > limit },
  };
}

// Mencatat progres sekaligus memperbarui ringkasan di sites.
export async function logProgress(
  userId: string,
  siteId: string,
  input: LogProgressInput,
) {
  if (!(await ownSite(userId, siteId))) return null;
  const [row] = await db
    .insert(siteProgressLog)
    .values({
      siteId,
      userId,
      progres: input.progres,
      tanggal: input.tanggal,
      catatan: input.catatan ?? null,
    })
    .returning(fields);
  await db
    .update(sites)
    .set({ progres: input.progres, tanggalProgres: input.tanggal })
    .where(and(eq(sites.id, siteId), eq(sites.userId, userId)));
  return row;
}
