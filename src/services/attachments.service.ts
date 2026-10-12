import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { siteAttachments, sites } from "@/db/schema";
import type {
  CreateAttachmentInput,
  ListAttachmentsInput,
  UpdateAttachmentInput,
} from "@/validators/attachments";

const fields = {
  id: siteAttachments.id,
  siteId: siteAttachments.siteId,
  kategori: siteAttachments.kategori,
  judul: siteAttachments.judul,
  driveUrl: siteAttachments.driveUrl,
  createdAt: siteAttachments.createdAt,
};

// Memastikan site milik user sebelum operasi arsip.
async function ownSite(userId: string, siteId: string) {
  const [site] = await db
    .select({ id: sites.id })
    .from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.userId, userId)))
    .limit(1);
  return Boolean(site);
}

export async function listAttachments(
  userId: string,
  siteId: string,
  { kategori, limit, offset }: ListAttachmentsInput,
) {
  if (!(await ownSite(userId, siteId))) return null;
  const conditions = [
    eq(siteAttachments.siteId, siteId),
    eq(siteAttachments.userId, userId),
    ...(kategori ? [eq(siteAttachments.kategori, kategori)] : []),
  ];
  const rows = await db
    .select(fields)
    .from(siteAttachments)
    .where(and(...conditions))
    .orderBy(desc(siteAttachments.createdAt), desc(siteAttachments.id))
    .limit(limit + 1)
    .offset(offset);
  return {
    data: rows.slice(0, limit),
    meta: { limit, offset, hasMore: rows.length > limit },
  };
}

export async function createAttachment(
  userId: string,
  siteId: string,
  input: CreateAttachmentInput,
) {
  if (!(await ownSite(userId, siteId))) return null;
  const [row] = await db
    .insert(siteAttachments)
    .values({ ...input, siteId, userId })
    .returning(fields);
  return row;
}

export async function updateAttachment(
  userId: string,
  siteId: string,
  id: string,
  input: UpdateAttachmentInput,
) {
  if (!(await ownSite(userId, siteId))) return null;
  const [row] = await db
    .update(siteAttachments)
    .set(input)
    .where(
      and(
        eq(siteAttachments.id, id),
        eq(siteAttachments.siteId, siteId),
        eq(siteAttachments.userId, userId),
      ),
    )
    .returning(fields);
  return row;
}

export async function deleteAttachment(
  userId: string,
  siteId: string,
  id: string,
) {
  if (!(await ownSite(userId, siteId))) return null;
  const [deleted] = await db
    .delete(siteAttachments)
    .where(
      and(
        eq(siteAttachments.id, id),
        eq(siteAttachments.siteId, siteId),
        eq(siteAttachments.userId, userId),
      ),
    )
    .returning({ id: siteAttachments.id });
  return Boolean(deleted);
}
