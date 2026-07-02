-- Product web/app hardening: idempotency, player uniqueness, safe search and invitation lookup.
CREATE UNIQUE INDEX IF NOT EXISTS "ux_player_profiles_one_active_user_campaign"
ON "player_profiles" ("campaign_id", "user_id")
WHERE "user_id" IS NOT NULL AND "status" = 'active';
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ux_campaign_invitations_token_hash"
ON "campaign_invitations" ("token_hash");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ix_campaign_memberships_user_active"
ON "campaign_memberships" ("user_id", "campaign_id")
WHERE "revoked_at" IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ix_domain_events_event_id"
ON "domain_events" ("event_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ix_domain_events_campaign_command"
ON "domain_events" ("campaign_id", "command_id")
WHERE "command_id" IS NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ix_campaign_entities_public_search"
ON "campaign_entities" USING gin(to_tsvector('simple', coalesce("name", '') || ' ' || coalesce("public_summary", '')));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ix_campaign_entities_dm_search"
ON "campaign_entities" USING gin(to_tsvector('simple', coalesce("name", '') || ' ' || coalesce("public_summary", '') || ' ' || coalesce("dm_summary", '')));
