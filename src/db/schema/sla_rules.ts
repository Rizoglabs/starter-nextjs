import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./user";

// F-016: aturan SLA per Regional x SOW (durasi dalam hari).
export const slaRules = pgTable(
  "sla_rules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    regional: varchar("regional", { length: 120 }).notNull(),
    sow: varchar("sow", { length: 80 }).notNull(),
    durasiHari: integer("durasi_hari").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("sla_rules_user_regional_sow_uniq").on(
      table.userId,
      table.regional,
      table.sow,
    ),
    index("sla_rules_user_idx").on(table.userId),
  ],
);
