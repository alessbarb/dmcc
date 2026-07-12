CREATE TABLE "campaign_messages" (
  "message_id" text PRIMARY KEY NOT NULL,
  "campaign_id" text NOT NULL,
  "sender_user_id" text NOT NULL,
  "sender_player_id" text,
  "sender_display_name" text NOT NULL,
  "client_message_id" text,
  "audience" text DEFAULT 'party' NOT NULL,
  "recipient_player_id" text,
  "content" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "chk_campaign_messages_audience"
    CHECK ("audience" IN ('party', 'dm', 'player')),
  CONSTRAINT "chk_campaign_messages_recipient"
    CHECK (("audience" = 'player' AND "recipient_player_id" IS NOT NULL)
      OR ("audience" <> 'player' AND "recipient_player_id" IS NULL)),
  CONSTRAINT "chk_campaign_messages_content"
    CHECK (char_length("content") BETWEEN 1 AND 4000),
  CONSTRAINT "fk_campaign_messages_campaign"
    FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE,
  CONSTRAINT "fk_campaign_messages_sender_user"
    FOREIGN KEY ("sender_user_id") REFERENCES "users"("user_id") ON DELETE CASCADE,
  CONSTRAINT "fk_campaign_messages_sender_player"
    FOREIGN KEY ("sender_player_id") REFERENCES "player_profiles"("profile_id") ON DELETE SET NULL,
  CONSTRAINT "fk_campaign_messages_recipient_player"
    FOREIGN KEY ("recipient_player_id") REFERENCES "player_profiles"("profile_id") ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE UNIQUE INDEX "uq_campaign_messages_client_request"
ON "campaign_messages" ("campaign_id", "sender_user_id", "client_message_id");
--> statement-breakpoint
CREATE INDEX "idx_campaign_messages_campaign_created_message"
ON "campaign_messages" ("campaign_id", "created_at" DESC, "message_id" DESC);
--> statement-breakpoint
CREATE TABLE "campaign_message_reads" (
  "message_id" text NOT NULL,
  "user_id" text NOT NULL,
  "read_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "campaign_message_reads_message_id_user_id_pk"
    PRIMARY KEY ("message_id", "user_id"),
  CONSTRAINT "fk_campaign_message_reads_message"
    FOREIGN KEY ("message_id") REFERENCES "campaign_messages"("message_id") ON DELETE CASCADE,
  CONSTRAINT "fk_campaign_message_reads_user"
    FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE
);
