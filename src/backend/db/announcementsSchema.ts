import { boolean, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./schema.js";

export type AnnouncementContent = {
  title: string;
  body: string;
};

export const systemAnnouncements = pgTable("system_announcements", {
  announcementId: text("announcement_id").primaryKey(),
  content: jsonb("content").$type<AnnouncementContent>().notNull(),
  kind: text("kind").$type<"info" | "warning" | "maintenance">().default("info").notNull(),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  showOnLanding: boolean("show_on_landing").default(true).notNull(),
  showOnDashboard: boolean("show_on_dashboard").default(true).notNull(),
  isDismissible: boolean("is_dismissible").default(true).notNull(),
  priority: integer("priority").default(0).notNull(),
  startsAt: timestamp("starts_at"),
  expiresAt: timestamp("expires_at"),
  archivedAt: timestamp("archived_at"),
  createdByUserId: text("created_by_user_id")
    .references(() => users.userId, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
