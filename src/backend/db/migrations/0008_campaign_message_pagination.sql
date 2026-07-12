CREATE INDEX IF NOT EXISTS "idx_campaign_messages_campaign_created_message"
ON "campaign_messages" ("campaign_id", "created_at" DESC, "message_id" DESC);
