import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { basts } from "./basts";
import { user } from "./user";

// F-009: tanda tangan dua pihak. MVP: nama + jabatan + tanggal + status.
// (Gambar tanda tangan & PDF formal menyusul pasca-MVP.)
export const bastSignatures = pgTable(
  "bast_signatures",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    bastId: uuid("bast_id")
      .notNull()
      .references(() => basts.id, { onDelete: "cascade" }),
    // 1 | 2
    pihak: varchar("pihak", { length: 10 }).notNull(),
    nama: varchar("nama", { length: 160 }),
    jabatan: varchar("jabatan", { length: 160 }),
    sudahTtd: boolean("sudah_ttd").default(false).notNull(),
    tanggalTtd: timestamp("tanggal_ttd", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("bast_signatures_bast_idx").on(table.bastId, table.pihak),
  ],
);
