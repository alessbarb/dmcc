-- Product read models for command center, player portal and secure search.
CREATE TABLE IF NOT EXISTS "campaign_objectives" (
  "campaign_id" text NOT NULL,
  "objective_id" text NOT NULL,
  "player_id" text,
  "title" text NOT NULL,
  "description" text,
  "kind" text NOT NULL DEFAULT 'session',
  "status" text NOT NULL DEFAULT 'open',
  "visibility_scope" text NOT NULL DEFAULT 'all_players',
  "linked_entity_ids" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "source_type" text NOT NULL DEFAULT 'dm',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "campaign_objectives_campaign_id_objective_id_pk" PRIMARY KEY("campaign_id", "objective_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "campaign_clues" (
  "campaign_id" text NOT NULL,
  "clue_id" text NOT NULL,
  "entity_id" text,
  "title" text NOT NULL,
  "public_summary" text,
  "dm_summary" text,
  "status" text NOT NULL DEFAULT 'hidden',
  "visibility_scope" text NOT NULL DEFAULT 'dm_only',
  "revealed_in_session_id" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "campaign_clues_campaign_id_clue_id_pk" PRIMARY KEY("campaign_id", "clue_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "characters" (
  "campaign_id" text NOT NULL,
  "character_id" text NOT NULL,
  "player_profile_id" text,
  "entity_id" text,
  "name" text NOT NULL,
  "status" text NOT NULL DEFAULT 'active',
  "public_summary" text,
  "dm_summary" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "characters_campaign_id_character_id_pk" PRIMARY KEY("campaign_id", "character_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ix_campaign_objectives_campaign_status"
ON "campaign_objectives" ("campaign_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ix_campaign_objectives_player_status"
ON "campaign_objectives" ("campaign_id", "player_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ix_campaign_clues_campaign_status"
ON "campaign_clues" ("campaign_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ix_campaign_clues_public_search"
ON "campaign_clues" USING gin(to_tsvector('simple', coalesce("title", '') || ' ' || coalesce("public_summary", '')));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ix_campaign_clues_dm_search"
ON "campaign_clues" USING gin(to_tsvector('simple', coalesce("title", '') || ' ' || coalesce("public_summary", '') || ' ' || coalesce("dm_summary", '')));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ix_campaign_facts_public_search"
ON "campaign_facts" USING gin(to_tsvector('simple', coalesce("content_public", '')));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ix_campaign_facts_dm_search"
ON "campaign_facts" USING gin(to_tsvector('simple', coalesce("content_public", '') || ' ' || coalesce("content_dm", '')));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ix_activity_feed_campaign_time"
ON "activity_feed" ("campaign_id", "occurred_at" DESC);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ux_campaign_invitation_acceptances_invitation_user"
ON "campaign_invitation_acceptances" ("invitation_id", "user_id");
--> statement-breakpoint
ALTER TABLE "live_tables" ADD COLUMN IF NOT EXISTS "status" text NOT NULL DEFAULT 'active';
--> statement-breakpoint
ALTER TABLE "live_tables" ADD COLUMN IF NOT EXISTS "closed_at" timestamp;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ix_live_tables_campaign_active"
ON "live_tables" ("campaign_id", "status", "expires_at");
