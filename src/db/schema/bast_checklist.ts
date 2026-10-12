import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { basts } from "./basts";
import { user } from "./user";

// F-009: item checklist kelengkapan dokumen BAST.
export const bastChecklist = pgTable(
  "bast_checklist",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    bastId: uuid("bast_id")
      .notNull()
      .references(() => basts.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 200 }).notNull(),
    selesai: boolean("selesai").default(false).notNull(),
    urutan: integer("urutan").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("bast_checklist_bast_idx").on(table.bastId, table.urutan),
  ],
);
