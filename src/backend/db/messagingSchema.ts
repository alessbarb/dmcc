import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

export const campaignMessages = pgTable("campaign_messages", {
  messageId: text("message_id").primaryKey(),
  campaignId: text("campaign_id").notNull(),
  senderUserId: text("sender_user_id").notNull(),
  senderPlayerId: text("sender_player_id"),
  audience: text("audience").notNull().default("party"),
  recipientPlayerId: text("recipient_player_id"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const campaignMessageReads = pgTable("campaign_message_reads", {
  messageId: text("message_id").notNull(),
  userId: text("user_id").notNull(),
  readAt: timestamp("read_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.messageId, table.userId] }),
}));
