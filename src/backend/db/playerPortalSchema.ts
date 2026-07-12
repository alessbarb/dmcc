import { jsonb, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

export const playerPortalStates = pgTable("player_portal_states", {
  campaignId: text("campaign_id").notNull(),
  playerId: text("player_id").notNull(),
  status: jsonb("status").notNull().default({}),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.campaignId, table.playerId] }),
}));

export const playerPortalResources = pgTable("player_portal_resources", {
  campaignId: text("campaign_id").notNull(),
  resourceId: text("resource_id").notNull(),
  playerId: text("player_id").notNull(),
  data: jsonb("data").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.campaignId, table.resourceId] }),
}));
