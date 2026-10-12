import "server-only";
import { and, asc, desc, eq, inArray, type SQL } from "drizzle-orm";
import { db } from "@/db";
import {
  bastChecklist,
  bastSignatures,
  basts,
  sites,
} from "@/db/schema";
import type {
  CreateBastInput,
  ListBastsInput,
  UpdateBastInput,
  UpdateSignatureInput,
} from "@/validators/bast";

// Checklist bawaan per tipe BAST (dapat ditambah/dihapus manual).
const CHECKLIST_BAWAAN: Record<string, string[]> = {
  cme: [
    "Berita acara ditandatangani mandor",
    "Foto site terlampir",
    "Dokumen material terpasang",
    "Laporan harian kerja",
    "Serah terima kunci/gembok site",
  ],
  sitac: [
    "Izin pemilik lahan",
    "Dokumen sewa lahan",
    "Foto patok batas",
    "Berita acara pengukuran",
    "Identitas pemilik lahan terlampir",
  ],
  imb: [
    "Dokumen IMB/PBG terbit",
    "Gambar teknik terlampir",
    "Foto site terlampir",
    "Berita acara serah terima",
  ],
};

const bastFields = {
  id: basts.id,
  siteId: basts.siteId,
  tipe: basts.tipe,
  status: basts.status,
  nomorBast: basts.nomorBast,
  tanggalBast: basts.tanggalBast,
  catatan: basts.catatan,
  createdAt: basts.createdAt,
  updatedAt: basts.updatedAt,
};

async function ownSite(userId: string, siteId: string) {
  const [site] = await db
    .select({ id: sites.id })
    .from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.userId, userId)))
    .limit(1);
  return site;
}

async function ownBast(userId: string, bastId: string) {
  const [bast] = await db
    .select({ ...bastFields })
    .from(basts)
    .where(and(eq(basts.id, bastId), eq(basts.userId, userId)))
    .limit(1);
  return bast;
}

export async function listBasts(
  userId: string,
  { tipe, status, siteId, limit, offset }: ListBastsInput,
) {
  const conditions: SQL[] = [eq(basts.userId, userId)];
  if (tipe) conditions.push(eq(basts.tipe, tipe));
  if (status) conditions.push(eq(basts.status, status));
  if (siteId) conditions.push(eq(basts.siteId, siteId));
  const rows = await db
    .select({
      ...bastFields,
      namaSite: sites.namaSite,
      projectId: sites.projectId,
    })
    .from(basts)
    .innerJoin(sites, eq(sites.id, basts.siteId))
    .where(and(...conditions))
    .orderBy(desc(basts.createdAt), desc(basts.id))
    .limit(limit + 1)
    .offset(offset);
  const data = rows.slice(0, limit);
  // Hitung kelengkapan checklist per BAST yang tampil.
  const hitung = new Map<string, { total: number; selesai: number }>();
  const ids = data.map((d) => d.id);
  if (ids.length > 0) {
    const ringkasan = await db
      .select({
        bastId: bastChecklist.bastId,
        selesai: bastChecklist.selesai,
      })
      .from(bastChecklist)
      .where(
        and(
          eq(bastChecklist.userId, userId),
          inArray(bastChecklist.bastId, ids),
        ),
      );
    for (const r of ringkasan) {
      const e = hitung.get(r.bastId) ?? { total: 0, selesai: 0 };
      e.total += 1;
      if (r.selesai) e.selesai += 1;
      hitung.set(r.bastId, e);
    }
  }
  return {
    data: data.map((d) => ({
      ...d,
      checklist: hitung.get(d.id) ?? { total: 0, selesai: 0 },
    })),
    meta: { limit, offset, hasMore: rows.length > limit },
  };
}

export async function getBast(userId: string, id: string) {
  const bast = await ownBast(userId, id);
  if (!bast) return null;
  const [site] = await db
    .select({ namaSite: sites.namaSite, projectId: sites.projectId })
    .from(sites)
    .where(and(eq(sites.id, bast.siteId), eq(sites.userId, userId)))
    .limit(1);
  const checklist = await db
    .select({
      id: bastChecklist.id,
      label: bastChecklist.label,
      selesai: bastChecklist.selesai,
      urutan: bastChecklist.urutan,
    })
    .from(bastChecklist)
    .where(
      and(
        eq(bastChecklist.bastId, id),
        eq(bastChecklist.userId, userId),
      ),
    )
    .orderBy(asc(bastChecklist.urutan), asc(bastChecklist.id));
  const signatures = await db
    .select({
      id: bastSignatures.id,
      pihak: bastSignatures.pihak,
      nama: bastSignatures.nama,
      jabatan: bastSignatures.jabatan,
      sudahTtd: bastSignatures.sudahTtd,
      tanggalTtd: bastSignatures.tanggalTtd,
    })
    .from(bastSignatures)
    .where(
      and(eq(bastSignatures.bastId, id), eq(bastSignatures.userId, userId)),
    )
    .orderBy(asc(bastSignatures.pihak));
  return {
    ...bast,
    namaSite: site?.namaSite ?? null,
    projectId: site?.projectId ?? null,
    checklist,
    signatures,
  };
}

export async function createBast(userId: string, input: CreateBastInput) {
  const site = await ownSite(userId, input.siteId);
  if (!site) return null;
  const [bast] = await db
    .insert(basts)
    .values({
      siteId: input.siteId,
      tipe: input.tipe,
      nomorBast: input.nomorBast ?? null,
      tanggalBast: input.tanggalBast ?? null,
      catatan: input.catatan ?? null,
      userId,
    })
    .returning(bastFields);
  const bawaan = CHECKLIST_BAWAAN[input.tipe] ?? [];
  if (bawaan.length > 0) {
    await db.insert(bastChecklist).values(
      bawaan.map((label, i) => ({
        bastId: bast.id,
        userId,
        label,
        urutan: i,
      })),
    );
  }
  await db.insert(bastSignatures).values([
    { bastId: bast.id, userId, pihak: "1" },
    { bastId: bast.id, userId, pihak: "2" },
  ]);
  return bast;
}

export async function updateBast(
  userId: string,
  id: string,
  input: UpdateBastInput,
) {
  const bast = await ownBast(userId, id);
  if (!bast) return { error: "TIDAK_ADA" as const };
  // Guard: status "signed" hanya bila kedua pihak sudah tanda tangan.
  if (input.status === "signed") {
    const signatures = await db
      .select({ sudahTtd: bastSignatures.sudahTtd })
      .from(bastSignatures)
      .where(
        and(eq(bastSignatures.bastId, id), eq(bastSignatures.userId, userId)),
      );
    if (signatures.length < 2 || signatures.some((s) => !s.sudahTtd)) {
      return { error: "BELUM_TTD" as const };
    }
  }
  const [row] = await db
    .update(basts)
    .set(input)
    .where(and(eq(basts.id, id), eq(basts.userId, userId)))
    .returning(bastFields);
  return { data: row };
}

export async function deleteBast(userId: string, id: string) {
  const [deleted] = await db
    .delete(basts)
    .where(and(eq(basts.id, id), eq(basts.userId, userId)))
    .returning({ id: basts.id });
  return Boolean(deleted);
}

// --- Checklist ---------------------------------------------------------------

export async function addChecklistItem(
  userId: string,
  bastId: string,
  label: string,
) {
  const bast = await ownBast(userId, bastId);
  if (!bast) return null;
  const [row] = await db
    .insert(bastChecklist)
    .values({ bastId, userId, label, urutan: 999 })
    .returning({
      id: bastChecklist.id,
      label: bastChecklist.label,
      selesai: bastChecklist.selesai,
    });
  return row;
}

export async function toggleChecklistItem(
  userId: string,
  bastId: string,
  itemId: string,
  selesai: boolean,
) {
  const bast = await ownBast(userId, bastId);
  if (!bast) return null;
  const [row] = await db
    .update(bastChecklist)
    .set({ selesai })
    .where(
      and(
        eq(bastChecklist.id, itemId),
        eq(bastChecklist.bastId, bastId),
        eq(bastChecklist.userId, userId),
      ),
    )
    .returning({
      id: bastChecklist.id,
      label: bastChecklist.label,
      selesai: bastChecklist.selesai,
    });
  return row;
}

export async function deleteChecklistItem(
  userId: string,
  bastId: string,
  itemId: string,
) {
  const bast = await ownBast(userId, bastId);
  if (!bast) return null;
  const [deleted] = await db
    .delete(bastChecklist)
    .where(
      and(
        eq(bastChecklist.id, itemId),
        eq(bastChecklist.bastId, bastId),
        eq(bastChecklist.userId, userId),
      ),
    )
    .returning({ id: bastChecklist.id });
  return Boolean(deleted);
}

// --- Tanda tangan ------------------------------------------------------------

export async function updateSignature(
  userId: string,
  bastId: string,
  pihak: "1" | "2",
  input: UpdateSignatureInput,
) {
  const bast = await ownBast(userId, bastId);
  if (!bast) return null;
  const patch: Record<string, unknown> = { ...input };
  // Bila ditandai sudah TTD tanpa tanggal, isi tanggal hari ini.
  if (input.sudahTtd === true && !input.tanggalTtd) {
    patch.tanggalTtd = new Date();
  }
  if (input.sudahTtd === false) {
    patch.tanggalTtd = null;
  }
  const [row] = await db
    .update(bastSignatures)
    .set(patch)
    .where(
      and(
        eq(bastSignatures.bastId, bastId),
        eq(bastSignatures.pihak, pihak),
        eq(bastSignatures.userId, userId),
      ),
    )
    .returning({
      id: bastSignatures.id,
      pihak: bastSignatures.pihak,
      nama: bastSignatures.nama,
      jabatan: bastSignatures.jabatan,
      sudahTtd: bastSignatures.sudahTtd,
      tanggalTtd: bastSignatures.tanggalTtd,
    });
  return row;
}
