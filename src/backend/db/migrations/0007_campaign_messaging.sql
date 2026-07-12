CREATE TABLE IF NOT EXISTS "campaign_messages" (
  "message_id" text PRIMARY KEY NOT NULL,
  "campaign_id" text NOT NULL,
  "sender_user_id" text NOT NULL,
  "sender_player_id" text,
  "audience" text DEFAULT 'party' NOT NULL,
  "recipient_player_id" text,
  "content" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_campaign_messages_campaign_created" ON "campaign_messages" ("campaign_id", "created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_campaign_messages_recipient" ON "campaign_messages" ("campaign_id", "recipient_player_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "campaign_message_reads" (
  "message_id" text NOT NULL,
  "user_id" text NOT NULL,
  "read_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "campaign_message_reads_message_id_user_id_pk" PRIMARY KEY("message_id", "user_id")
);
