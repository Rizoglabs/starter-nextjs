import {
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./user";

// F-013: pengaturan PKBON (satu baris per user).
export const pkbonSettings = pgTable("pkbon_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  namaDefault: varchar("nama_default", { length: 160 }),
  kotaDefault: varchar("kota_default", { length: 120 }),
  bankNama: varchar("bank_nama", { length: 60 }),
  bankRekening: varchar("bank_rekening", { length: 60 }),
  bankPemilik: varchar("bank_pemilik", { length: 160 }),
  pejabat1Nama: varchar("pejabat1_nama", { length: 160 }),
  pejabat1Jabatan: varchar("pejabat1_jabatan", { length: 160 }),
  pejabat2Nama: varchar("pejabat2_nama", { length: 160 }),
  pejabat2Jabatan: varchar("pejabat2_jabatan", { length: 160 }),
  // Awalan nomor, cth "MINK" -> MINK.002/PROJECT/X/2026
  prefixNomor: varchar("prefix_nomor", { length: 20 }).default("MINK"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Counter urutan nomor per user per tahun (atomic via upsert).
export const pkbonCounters = pgTable(
  "pkbon_counters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    tahun: integer("tahun").notNull(),
    seq: integer("seq").default(0).notNull(),
  },
  (table) => [unique("pkbon_counters_user_tahun_uniq").on(table.userId, table.tahun)],
);

// F-011: form pengajuan kasbon.
export const pkbonForms = pgTable("pkbon_forms", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  nomor: varchar("nomor", { length: 80 }).notNull(),
  nama: varchar("nama", { length: 160 }).notNull(),
  kota: varchar("kota", { length: 120 }),
  bankNama: varchar("bank_nama", { length: 60 }),
  bankRekening: varchar("bank_rekening", { length: 60 }),
  tanggal: timestamp("tanggal", { withTimezone: true }).notNull(),
  total: integer("total").default(0).notNull(),
  // draft | diajukan | disetujui | ditolak
  status: varchar("status", { length: 20 }).default("diajukan").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Baris uraian tugas per form.
export const pkbonItems = pgTable("pkbon_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  formId: uuid("form_id")
    .notNull()
    .references(() => pkbonForms.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  uraian: varchar("uraian", { length: 300 }).notNull(),
  jumlah: integer("jumlah").notNull(),
  urutan: integer("urutan").default(0).notNull(),
});
