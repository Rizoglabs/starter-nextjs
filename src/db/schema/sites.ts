import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./user";

// FR-006: data site proyek konstruksi tower. Field wajib (ISS-008):
// namaSite + projectId.
export const sites = pgTable(
  "sites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    namaSite: varchar("nama_site", { length: 200 }).notNull(),
    projectId: varchar("project_id", { length: 100 }).notNull(),
    siteId: varchar("site_id", { length: 100 }),
    siteIdClient: varchar("site_id_client", { length: 100 }),
    taskId: varchar("task_id", { length: 100 }),
    client: varchar("client", { length: 120 }),
    tenant: varchar("tenant", { length: 120 }),
    regional: varchar("regional", { length: 120 }),
    provinsi: varchar("provinsi", { length: 120 }),
    alamat: text("alamat"),
    koordinat: varchar("koordinat", { length: 100 }),
    pic: varchar("pic", { length: 160 }),
    picKontak: varchar("pic_kontak", { length: 160 }),
    sow: varchar("sow", { length: 80 }),
    tinggiTower: varchar("tinggi_tower", { length: 40 }),
    kontrakPks: varchar("kontrak_pks", { length: 160 }),
    noSpmk: varchar("no_spmk", { length: 160 }),
    tanggalSpmk: timestamp("tanggal_spmk", { withTimezone: true }),
    tanggalTarget: timestamp("tanggal_target", { withTimezone: true }),
    tanggalMulaiRfi: timestamp("tanggal_mulai_rfi", { withTimezone: true }),
    timeline: text("timeline"),
    tanggalSelesai: timestamp("tanggal_selesai", { withTimezone: true }),
    targetBast: timestamp("target_bast", { withTimezone: true }),
    statusProject: varchar("status_project", { length: 40 })
      .default("persiapan")
      .notNull(),
    // F-005: progres 0-100 beserta tanggal pembaruan (diisi via tab Progress).
    progres: integer("progres").default(0).notNull(),
    tanggalProgres: timestamp("tanggal_progres", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("sites_user_created_id_idx").on(
      table.userId,
      table.createdAt.desc(),
      table.id.desc(),
    ),
    index("sites_user_status_idx").on(table.userId, table.statusProject),
  ],
);
