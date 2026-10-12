import { z } from "zod";

// FR-006 / ISS-008: field wajib = namaSite + projectId.
const namaSite = z.string().trim().min(1).max(200);
const projectId = z.string().trim().min(1).max(100);

const optionalText = (max: number) =>
  z.string().trim().max(max).nullish();
const optionalDate = z.coerce.date().nullish();

export const statusProjectSchema = z.enum([
  "persiapan",
  "berjalan",
  "selesai",
  "tertunda",
]);

const siteFields = {
  namaSite,
  projectId,
  siteId: optionalText(100),
  siteIdClient: optionalText(100),
  taskId: optionalText(100),
  client: optionalText(120),
  tenant: optionalText(120),
  regional: optionalText(120),
  provinsi: optionalText(120),
  alamat: z.string().trim().max(2000).nullish(),
  koordinat: optionalText(100),
  pic: optionalText(160),
  picKontak: optionalText(160),
  sow: optionalText(80),
  tinggiTower: optionalText(40),
  kontrakPks: optionalText(160),
  noSpmk: optionalText(160),
  tanggalSpmk: optionalDate,
  tanggalTarget: optionalDate,
  tanggalMulaiRfi: optionalDate,
  timeline: z.string().trim().max(2000).nullish(),
  tanggalSelesai: optionalDate,
  targetBast: optionalDate,
  statusProject: statusProjectSchema,
  progres: z.number().int().min(0).max(100),
  tanggalProgres: optionalDate,
};

export const createSiteSchema = z
  .object({
    ...siteFields,
    statusProject: statusProjectSchema.default("persiapan"),
    progres: z.number().int().min(0).max(100).default(0),
  })
  .strict();

export const updateSiteSchema = z
  .object({
    namaSite: namaSite.optional(),
    projectId: projectId.optional(),
    siteId: optionalText(100),
    siteIdClient: optionalText(100),
    taskId: optionalText(100),
    client: optionalText(120),
    tenant: optionalText(120),
    regional: optionalText(120),
    provinsi: optionalText(120),
    alamat: z.string().trim().max(2000).nullish(),
    koordinat: optionalText(100),
    pic: optionalText(160),
    picKontak: optionalText(160),
    sow: optionalText(80),
    tinggiTower: optionalText(40),
    kontrakPks: optionalText(160),
    noSpmk: optionalText(160),
    tanggalSpmk: optionalDate,
    tanggalTarget: optionalDate,
    tanggalMulaiRfi: optionalDate,
    timeline: z.string().trim().max(2000).nullish(),
    tanggalSelesai: optionalDate,
    targetBast: optionalDate,
    statusProject: statusProjectSchema.optional(),
    progres: z.number().int().min(0).max(100).optional(),
    tanggalProgres: optionalDate,
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Berikan minimal satu field untuk diubah.",
  });

export const siteIdSchema = z.string().uuid();

export const listSitesSchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).max(1_000_000).default(0),
    // F-003: filter daftar site.
    q: z.string().trim().max(200).optional(),
    sow: z.string().trim().max(80).optional(),
    regional: z.string().trim().max(120).optional(),
    status: statusProjectSchema.optional(),
  })
  .strict();

export type CreateSiteInput = z.infer<typeof createSiteSchema>;
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>;
export type ListSitesInput = z.infer<typeof listSitesSchema>;
