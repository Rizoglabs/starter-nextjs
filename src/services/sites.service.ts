import "server-only";
import { and, desc, eq } from "drizzle-orm";
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
  { limit, offset }: ListSitesInput,
) {
  const rows = await db
    .select(fields)
    .from(sites)
    .where(eq(sites.userId, userId))
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
