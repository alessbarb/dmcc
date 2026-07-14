import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./schema.js";

// Configuración de visualización de plantillas
export const campaignTemplateSettings = pgTable("campaign_template_settings", {
  templateId: text("template_id").primaryKey(),
  isVisible: boolean("is_visible").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  isFeatured: boolean("is_featured").notNull().default(false),
  updatedByUserId: text("updated_by_user_id")
    .references(() => users.userId, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Configuración de sistemas de juego
export const gameSystemSettings = pgTable("game_system_settings", {
  systemId: text("system_id").primaryKey(),
  isEnabledForNewCampaigns: boolean("is_enabled_for_new_campaigns")
    .notNull()
    .default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  updatedByUserId: text("updated_by_user_id")
    .references(() => users.userId, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
