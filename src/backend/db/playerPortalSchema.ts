import { foreignKey, index, jsonb, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { campaigns, playerProfiles } from "./schema.js";

export const playerPortalStates = pgTable("player_portal_states", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  playerId: text("player_id").notNull(),
  status: jsonb("status").$type<Record<string, unknown>>().notNull().default({}),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.campaignId, table.playerId] }),
  playerFk: foreignKey({
    name: "fk_player_portal_states_player",
    columns: [table.campaignId, table.playerId],
    foreignColumns: [playerProfiles.campaignId, playerProfiles.profileId],
  }).onDelete("cascade"),
}));

export const playerPortalResources = pgTable("player_portal_resources", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  resourceId: text("resource_id").notNull(),
  playerId: text("player_id").notNull(),
  data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.campaignId, table.resourceId] }),
  playerIdx: index("idx_player_portal_resources_player").on(table.campaignId, table.playerId),
  playerFk: foreignKey({
    name: "fk_player_portal_resources_player",
    columns: [table.campaignId, table.playerId],
    foreignColumns: [playerProfiles.campaignId, playerProfiles.profileId],
  }).onDelete("cascade"),
}));
