import { check, index, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./schema.js";

export const userRoles = pgTable("user_roles", {
  userId: text("user_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
  role: text("role").notNull(),
  source: text("source").notNull(),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  assignedByUserId: text("assigned_by_user_id").references(() => users.userId, { onDelete: "set null" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.role] }),
  roleIndex: index("idx_user_roles_role").on(table.role),
  roleCheck: check("user_roles_role_check", sql`${table.role} IN ('dm', 'player', 'admin')`),
  sourceCheck: check("user_roles_source_check", sql`${table.source} IN ('registration', 'invitation', 'administration', 'system')`),
}));
