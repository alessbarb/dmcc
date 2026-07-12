import { sql } from "drizzle-orm";
import { check, index, pgTable, primaryKey, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import * as schema from "./schema.js";

export const campaignMessages = pgTable("campaign_messages", {
  messageId: text("message_id").primaryKey(),
  campaignId: text("campaign_id").notNull().references(() => schema.campaigns.campaignId, { onDelete: "cascade" }),
  senderUserId: text("sender_user_id").notNull().references(() => schema.users.userId, { onDelete: "cascade" }),
  senderPlayerId: text("sender_player_id").references(() => schema.playerProfiles.profileId, { onDelete: "set null" }),
  senderDisplayName: text("sender_display_name").notNull(),
  clientMessageId: text("client_message_id"),
  audience: text("audience").notNull().default("party"),
  recipientPlayerId: text("recipient_player_id").references(() => schema.playerProfiles.profileId, { onDelete: "restrict" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  campaignTimelineIdx: index("idx_campaign_messages_campaign_created_message")
    .on(table.campaignId, table.createdAt.desc(), table.messageId.desc()),
  clientRequestUq: uniqueIndex("uq_campaign_messages_client_request")
    .on(table.campaignId, table.senderUserId, table.clientMessageId),
  audienceCheck: check("chk_campaign_messages_audience", sql`${table.audience} in ('party', 'dm', 'player')`),
  recipientCheck: check(
    "chk_campaign_messages_recipient",
    sql`(${table.audience} = 'player' and ${table.recipientPlayerId} is not null) or (${table.audience} <> 'player' and ${table.recipientPlayerId} is null)`,
  ),
  contentCheck: check("chk_campaign_messages_content", sql`char_length(${table.content}) between 1 and 4000`),
}));

export const campaignMessageReads = pgTable("campaign_message_reads", {
  messageId: text("message_id").notNull().references(() => campaignMessages.messageId, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => schema.users.userId, { onDelete: "cascade" }),
  readAt: timestamp("read_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.messageId, table.userId] }),
}));
