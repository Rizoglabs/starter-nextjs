import "server-only";
import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { sites } from "@/db/schema";
import type {
  CreateSiteInput,
  ListSitesInput,
  UpdateSiteInput,
} from "@/validators/sites";

// Field publik dipilih eksplisit; kepemilikan dari sesi terverifikasi.
const fields = {
  id: sites.id,
  namaSite: sites.namaSite,
  projectId: sites.projectId,
  siteId: sites.siteId,
  siteIdClient: sites.siteIdClient,
  taskId: sites.taskId,
  client: sites.client,
  tenant: sites.tenant,
  regional: sites.regional,
  provinsi: sites.provinsi,
  alamat: sites.alamat,
  koordinat: sites.koordinat,
  pic: sites.pic,
  picKontak: sites.picKontak,
  sow: sites.sow,
  tinggiTower: sites.tinggiTower,
  kontrakPks: sites.kontrakPks,
  noSpmk: sites.noSpmk,
  tanggalSpmk: sites.tanggalSpmk,
  tanggalTarget: sites.tanggalTarget,
  tanggalMulaiRfi: sites.tanggalMulaiRfi,
  timeline: sites.timeline,
  tanggalSelesai: sites.tanggalSelesai,
  targetBast: sites.targetBast,
  statusProject: sites.statusProject,
  progres: sites.progres,
  tanggalProgres: sites.tanggalProgres,
  createdAt: sites.createdAt,
  updatedAt: sites.updatedAt,
};

export async function listSites(
  userId: string,
  { limit, offset, q, sow, regional, status }: ListSitesInput,
) {
  const conditions: SQL[] = [eq(sites.userId, userId)];
  if (q) {
    const pattern = `%${q.replace(/[%_]/g, "")}%`;
    conditions.push(
      or(
        ilike(sites.namaSite, pattern),
        ilike(sites.projectId, pattern),
        ilike(sites.siteId, pattern),
      )!,
    );
  }
  if (sow) conditions.push(eq(sites.sow, sow));
  if (regional) conditions.push(eq(sites.regional, regional));
  if (status) conditions.push(eq(sites.statusProject, status));
  const rows = await db
    .select(fields)
    .from(sites)
    .where(and(...conditions))
    .orderBy(desc(sites.createdAt), desc(sites.id))
    .limit(limit + 1)
    .offset(offset);
  return {
    data: rows.slice(0, limit),
    meta: { limit, offset, hasMore: rows.length > limit },
  };
}

export async function getSite(userId: string, id: string) {
  const [site] = await db
    .select(fields)
    .from(sites)
    .where(and(eq(sites.id, id), eq(sites.userId, userId)))
    .limit(1);
  return site;
}

export async function createSite(userId: string, input: CreateSiteInput) {
  const [site] = await db
    .insert(sites)
    .values({ ...input, userId })
    .returning(fields);
  return site;
}

export async function updateSite(
  userId: string,
  id: string,
  input: UpdateSiteInput,
) {
  const [site] = await db
    .update(sites)
    .set(input)
    .where(and(eq(sites.id, id), eq(sites.userId, userId)))
    .returning(fields);
  return site;
}

export async function deleteSite(userId: string, id: string) {
  const [deleted] = await db
    .delete(sites)
    .where(and(eq(sites.id, id), eq(sites.userId, userId)))
    .returning({ id: sites.id });
  return Boolean(deleted);
}

// F-003: nilai unik untuk opsi filter SOW & Regional.
export async function getSiteFacets(userId: string) {
  const [sowRows, regionalRows] = await Promise.all([
    db
      .selectDistinct({ value: sites.sow })
      .from(sites)
      .where(and(eq(sites.userId, userId))),
    db
      .selectDistinct({ value: sites.regional })
      .from(sites)
      .where(and(eq(sites.userId, userId))),
  ]);
  const clean = (rows: { value: string | null }[]) =>
    rows
      .map((r) => r.value?.trim())
      .filter((v): v is string => Boolean(v))
      .sort((a, b) => a.localeCompare(b, "id"));
  return { sow: clean(sowRows), regional: clean(regionalRows) };
}
