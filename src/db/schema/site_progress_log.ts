import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sites } from "./sites";
import { user } from "./user";

// F-005: riwayat pembaruan progres per site. Nilai terakhir juga
// tercermin di sites.progres + sites.tanggalProgres.
export const siteProgressLog = pgTable(
  "site_progress_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    progres: integer("progres").notNull(),
    tanggal: timestamp("tanggal", { withTimezone: true }).notNull(),
    catatan: varchar("catatan", { length: 500 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("site_progress_log_site_idx").on(
      table.siteId,
      table.tanggal.desc(),
      table.id.desc(),
    ),
  ],
);
