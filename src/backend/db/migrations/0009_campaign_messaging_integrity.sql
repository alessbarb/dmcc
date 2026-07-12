ALTER TABLE "campaign_messages"
  ADD COLUMN IF NOT EXISTS "sender_display_name" text,
  ADD COLUMN IF NOT EXISTS "client_message_id" text;

UPDATE "campaign_messages" AS message
SET "sender_display_name" = COALESCE(
  player."display_name",
  app_user."display_name",
  app_user."email_normalized",
  'Unknown sender'
)
FROM "users" AS app_user
LEFT JOIN "player_profiles" AS player
  ON player."profile_id" = message."sender_player_id"
WHERE app_user."user_id" = message."sender_user_id"
  AND message."sender_display_name" IS NULL;

UPDATE "campaign_messages"
SET "sender_display_name" = 'Unknown sender'
WHERE "sender_display_name" IS NULL;

ALTER TABLE "campaign_messages"
  ALTER COLUMN "sender_display_name" SET NOT NULL,
  ALTER COLUMN "created_at" TYPE timestamptz USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "campaign_message_reads"
  ALTER COLUMN "read_at" TYPE timestamptz USING "read_at" AT TIME ZONE 'UTC';

CREATE UNIQUE INDEX IF NOT EXISTS "uq_campaign_messages_client_request"
ON "campaign_messages" ("campaign_id", "sender_user_id", "client_message_id");

ALTER TABLE "campaign_messages"
  ADD CONSTRAINT "chk_campaign_messages_audience"
    CHECK ("audience" IN ('party', 'dm', 'player')),
  ADD CONSTRAINT "chk_campaign_messages_recipient"
    CHECK (("audience" = 'player' AND "recipient_player_id" IS NOT NULL)
      OR ("audience" <> 'player' AND "recipient_player_id" IS NULL)),
  ADD CONSTRAINT "chk_campaign_messages_content"
    CHECK (char_length("content") BETWEEN 1 AND 4000),
  ADD CONSTRAINT "fk_campaign_messages_campaign"
    FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE,
  ADD CONSTRAINT "fk_campaign_messages_sender_user"
    FOREIGN KEY ("sender_user_id") REFERENCES "users"("user_id") ON DELETE CASCADE,
  ADD CONSTRAINT "fk_campaign_messages_sender_player"
    FOREIGN KEY ("sender_player_id") REFERENCES "player_profiles"("profile_id") ON DELETE SET NULL,
  ADD CONSTRAINT "fk_campaign_messages_recipient_player"
    FOREIGN KEY ("recipient_player_id") REFERENCES "player_profiles"("profile_id") ON DELETE SET NULL;

ALTER TABLE "campaign_message_reads"
  ADD CONSTRAINT "fk_campaign_message_reads_message"
    FOREIGN KEY ("message_id") REFERENCES "campaign_messages"("message_id") ON DELETE CASCADE,
  ADD CONSTRAINT "fk_campaign_message_reads_user"
    FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE;
