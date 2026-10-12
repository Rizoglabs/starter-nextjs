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

// F-004: arsip tautan Google Drive per site. File tetap di Drive;
// aplikasi hanya menyimpan tautan + menampilkan preview (ISS-L011).
export const siteAttachments = pgTable(
  "site_attachments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    // dokumen | foto
    kategori: varchar("kategori", { length: 20 }).notNull(),
    judul: varchar("judul", { length: 200 }).notNull(),
    driveUrl: text("drive_url").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("site_attachments_site_idx").on(
      table.siteId,
      table.kategori,
      table.createdAt.desc(),
    ),
  ],
);
