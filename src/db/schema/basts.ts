import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sites } from "./sites";
import { user } from "./user";

// F-008: Berita Acara Serah Terima per site.
export const basts = pgTable(
  "basts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    // cme | sitac | imb
    tipe: varchar("tipe", { length: 20 }).notNull(),
    // draft | ready | signed
    status: varchar("status", { length: 20 }).default("draft").notNull(),
    nomorBast: varchar("nomor_bast", { length: 160 }),
    tanggalBast: timestamp("tanggal_bast", { withTimezone: true }),
    catatan: text("catatan"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("basts_user_site_idx").on(table.userId, table.siteId),
    index("basts_user_status_idx").on(table.userId, table.status),
  ],
);
