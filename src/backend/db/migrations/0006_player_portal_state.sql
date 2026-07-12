CREATE TABLE IF NOT EXISTS "player_portal_states" (
  "campaign_id" text NOT NULL,
  "player_id" text NOT NULL,
  "status" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "player_portal_states_campaign_id_player_id_pk" PRIMARY KEY("campaign_id", "player_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "player_portal_resources" (
  "campaign_id" text NOT NULL,
  "resource_id" text NOT NULL,
  "player_id" text NOT NULL,
  "data" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "player_portal_resources_campaign_id_resource_id_pk" PRIMARY KEY("campaign_id", "resource_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_player_portal_resources_player" ON "player_portal_resources" ("campaign_id", "player_id");
