-- Remove orphaned campaign-scoped rows before enabling cascading foreign keys.
DELETE FROM "activity_feed" child WHERE NOT EXISTS (SELECT 1 FROM "campaigns" parent WHERE parent."campaign_id" = child."campaign_id");
--> statement-breakpoint
DELETE FROM "attachments" child WHERE NOT EXISTS (SELECT 1 FROM "campaigns" parent WHERE parent."campaign_id" = child."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_entities" child WHERE NOT EXISTS (SELECT 1 FROM "campaigns" parent WHERE parent."campaign_id" = child."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_facts" child WHERE NOT EXISTS (SELECT 1 FROM "campaigns" parent WHERE parent."campaign_id" = child."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_invitations" child WHERE NOT EXISTS (SELECT 1 FROM "campaigns" parent WHERE parent."campaign_id" = child."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_memberships" child WHERE NOT EXISTS (SELECT 1 FROM "campaigns" parent WHERE parent."campaign_id" = child."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_notes" child WHERE NOT EXISTS (SELECT 1 FROM "campaigns" parent WHERE parent."campaign_id" = child."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_relations" child WHERE NOT EXISTS (SELECT 1 FROM "campaigns" parent WHERE parent."campaign_id" = child."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_scenes" child WHERE NOT EXISTS (SELECT 1 FROM "campaigns" parent WHERE parent."campaign_id" = child."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_sessions" child WHERE NOT EXISTS (SELECT 1 FROM "campaigns" parent WHERE parent."campaign_id" = child."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_snapshots" child WHERE NOT EXISTS (SELECT 1 FROM "campaigns" parent WHERE parent."campaign_id" = child."campaign_id");
--> statement-breakpoint
DELETE FROM "command_index" child WHERE NOT EXISTS (SELECT 1 FROM "campaigns" parent WHERE parent."campaign_id" = child."campaign_id");
--> statement-breakpoint
DELETE FROM "domain_events" child WHERE NOT EXISTS (SELECT 1 FROM "campaigns" parent WHERE parent."campaign_id" = child."campaign_id");
--> statement-breakpoint
DELETE FROM "live_tables" child WHERE NOT EXISTS (SELECT 1 FROM "campaigns" parent WHERE parent."campaign_id" = child."campaign_id");
--> statement-breakpoint
DELETE FROM "player_profiles" child WHERE NOT EXISTS (SELECT 1 FROM "campaigns" parent WHERE parent."campaign_id" = child."campaign_id");
--> statement-breakpoint
DELETE FROM "player_proposals" child WHERE NOT EXISTS (SELECT 1 FROM "campaigns" parent WHERE parent."campaign_id" = child."campaign_id");
--> statement-breakpoint
DELETE FROM "visibility_grants" child WHERE NOT EXISTS (SELECT 1 FROM "campaigns" parent WHERE parent."campaign_id" = child."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_objectives" child WHERE NOT EXISTS (SELECT 1 FROM "campaigns" parent WHERE parent."campaign_id" = child."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_clues" child WHERE NOT EXISTS (SELECT 1 FROM "campaigns" parent WHERE parent."campaign_id" = child."campaign_id");
--> statement-breakpoint
DELETE FROM "characters" child WHERE NOT EXISTS (SELECT 1 FROM "campaigns" parent WHERE parent."campaign_id" = child."campaign_id");
--> statement-breakpoint
DELETE FROM "player_portal_states" child WHERE NOT EXISTS (SELECT 1 FROM "campaigns" parent WHERE parent."campaign_id" = child."campaign_id");
--> statement-breakpoint
DELETE FROM "player_portal_resources" child WHERE NOT EXISTS (SELECT 1 FROM "campaigns" parent WHERE parent."campaign_id" = child."campaign_id");
--> statement-breakpoint

-- Repair or remove invalid intra-campaign references.
DELETE FROM "campaign_facts" fact
WHERE NOT EXISTS (
  SELECT 1 FROM "campaign_entities" entity
  WHERE entity."campaign_id" = fact."campaign_id" AND entity."entity_id" = fact."subject_entity_id"
);
--> statement-breakpoint
DELETE FROM "campaign_relations" relation
WHERE NOT EXISTS (
  SELECT 1 FROM "campaign_entities" entity
  WHERE entity."campaign_id" = relation."campaign_id" AND entity."entity_id" = relation."source_entity_id"
) OR NOT EXISTS (
  SELECT 1 FROM "campaign_entities" entity
  WHERE entity."campaign_id" = relation."campaign_id" AND entity."entity_id" = relation."target_entity_id"
);
--> statement-breakpoint
DELETE FROM "campaign_scenes" scene
WHERE NOT EXISTS (
  SELECT 1 FROM "campaign_sessions" session
  WHERE session."campaign_id" = scene."campaign_id" AND session."session_id" = scene."session_id"
);
--> statement-breakpoint
UPDATE "campaign_notes" note SET "target_entity_id" = NULL
WHERE "target_entity_id" IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM "campaign_entities" entity
  WHERE entity."campaign_id" = note."campaign_id" AND entity."entity_id" = note."target_entity_id"
);
--> statement-breakpoint
UPDATE "campaign_notes" note SET "target_session_id" = NULL
WHERE "target_session_id" IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM "campaign_sessions" session
  WHERE session."campaign_id" = note."campaign_id" AND session."session_id" = note."target_session_id"
);
--> statement-breakpoint
UPDATE "campaign_clues" clue SET "entity_id" = NULL
WHERE "entity_id" IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM "campaign_entities" entity
  WHERE entity."campaign_id" = clue."campaign_id" AND entity."entity_id" = clue."entity_id"
);
--> statement-breakpoint
UPDATE "campaign_clues" clue SET "revealed_in_session_id" = NULL
WHERE "revealed_in_session_id" IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM "campaign_sessions" session
  WHERE session."campaign_id" = clue."campaign_id" AND session."session_id" = clue."revealed_in_session_id"
);
--> statement-breakpoint
UPDATE "live_tables" table_row SET "active_session_id" = NULL
WHERE "active_session_id" IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM "campaign_sessions" session
  WHERE session."campaign_id" = table_row."campaign_id" AND session."session_id" = table_row."active_session_id"
);
--> statement-breakpoint
UPDATE "characters" character SET "entity_id" = NULL
WHERE "entity_id" IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM "campaign_entities" entity
  WHERE entity."campaign_id" = character."campaign_id" AND entity."entity_id" = character."entity_id"
);
--> statement-breakpoint
UPDATE "characters" character SET "player_profile_id" = NULL
WHERE "player_profile_id" IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM "player_profiles" player
  WHERE player."profile_id" = character."player_profile_id"
);
--> statement-breakpoint
UPDATE "campaign_memberships" membership SET "player_id" = NULL
WHERE "player_id" IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM "player_profiles" player
  WHERE player."campaign_id" = membership."campaign_id" AND player."profile_id" = membership."player_id"
);
--> statement-breakpoint
UPDATE "campaign_objectives" objective SET "player_id" = NULL
WHERE "player_id" IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM "player_profiles" player
  WHERE player."campaign_id" = objective."campaign_id" AND player."profile_id" = objective."player_id"
);
--> statement-breakpoint
UPDATE "campaign_notes" note SET "author_player_id" = NULL
WHERE "author_player_id" IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM "player_profiles" player
  WHERE player."campaign_id" = note."campaign_id" AND player."profile_id" = note."author_player_id"
);
--> statement-breakpoint
DELETE FROM "player_proposals" proposal
WHERE NOT EXISTS (
  SELECT 1 FROM "player_profiles" player
  WHERE player."campaign_id" = proposal."campaign_id" AND player."profile_id" = proposal."player_id"
);
--> statement-breakpoint
DELETE FROM "player_portal_states" state
WHERE NOT EXISTS (
  SELECT 1 FROM "player_profiles" player
  WHERE player."campaign_id" = state."campaign_id" AND player."profile_id" = state."player_id"
);
--> statement-breakpoint
DELETE FROM "player_portal_resources" resource
WHERE NOT EXISTS (
  SELECT 1 FROM "player_profiles" player
  WHERE player."campaign_id" = resource."campaign_id" AND player."profile_id" = resource."player_id"
);
--> statement-breakpoint
DELETE FROM "visibility_grants" grant_row
WHERE grant_row."scope" = 'specific_player' AND NOT EXISTS (
  SELECT 1 FROM "player_profiles" player
  WHERE player."campaign_id" = grant_row."campaign_id" AND player."profile_id" = grant_row."player_id"
);
--> statement-breakpoint

CREATE UNIQUE INDEX "uq_player_profiles_campaign_profile"
ON "player_profiles" ("campaign_id", "profile_id");
--> statement-breakpoint

-- Campaign ownership: all dependent rows disappear with their campaign.
ALTER TABLE "activity_feed" ADD CONSTRAINT "fk_activity_feed_campaign" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "fk_attachments_campaign" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_entities" ADD CONSTRAINT "fk_campaign_entities_campaign" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_facts" ADD CONSTRAINT "fk_campaign_facts_campaign" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_invitations" ADD CONSTRAINT "fk_campaign_invitations_campaign" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_memberships" ADD CONSTRAINT "fk_campaign_memberships_campaign" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_notes" ADD CONSTRAINT "fk_campaign_notes_campaign" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_relations" ADD CONSTRAINT "fk_campaign_relations_campaign" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_scenes" ADD CONSTRAINT "fk_campaign_scenes_campaign" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_sessions" ADD CONSTRAINT "fk_campaign_sessions_campaign" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_snapshots" ADD CONSTRAINT "fk_campaign_snapshots_campaign" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "command_index" ADD CONSTRAINT "fk_command_index_campaign" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "domain_events" ADD CONSTRAINT "fk_domain_events_campaign" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "live_tables" ADD CONSTRAINT "fk_live_tables_campaign" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "player_profiles" ADD CONSTRAINT "fk_player_profiles_campaign" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "player_proposals" ADD CONSTRAINT "fk_player_proposals_campaign" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "visibility_grants" ADD CONSTRAINT "fk_visibility_grants_campaign" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_objectives" ADD CONSTRAINT "fk_campaign_objectives_campaign" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_clues" ADD CONSTRAINT "fk_campaign_clues_campaign" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "fk_characters_campaign" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "player_portal_states" ADD CONSTRAINT "fk_player_portal_states_campaign" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "player_portal_resources" ADD CONSTRAINT "fk_player_portal_resources_campaign" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint

-- Same-campaign entity and session relationships.
ALTER TABLE "campaign_facts" ADD CONSTRAINT "fk_campaign_facts_subject_entity" FOREIGN KEY ("campaign_id", "subject_entity_id") REFERENCES "campaign_entities"("campaign_id", "entity_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_relations" ADD CONSTRAINT "fk_campaign_relations_source_entity" FOREIGN KEY ("campaign_id", "source_entity_id") REFERENCES "campaign_entities"("campaign_id", "entity_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_relations" ADD CONSTRAINT "fk_campaign_relations_target_entity" FOREIGN KEY ("campaign_id", "target_entity_id") REFERENCES "campaign_entities"("campaign_id", "entity_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_scenes" ADD CONSTRAINT "fk_campaign_scenes_session" FOREIGN KEY ("campaign_id", "session_id") REFERENCES "campaign_sessions"("campaign_id", "session_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_notes" ADD CONSTRAINT "fk_campaign_notes_target_entity" FOREIGN KEY ("campaign_id", "target_entity_id") REFERENCES "campaign_entities"("campaign_id", "entity_id") ON DELETE SET NULL ("target_entity_id");
--> statement-breakpoint
ALTER TABLE "campaign_notes" ADD CONSTRAINT "fk_campaign_notes_target_session" FOREIGN KEY ("campaign_id", "target_session_id") REFERENCES "campaign_sessions"("campaign_id", "session_id") ON DELETE SET NULL ("target_session_id");
--> statement-breakpoint
ALTER TABLE "campaign_clues" ADD CONSTRAINT "fk_campaign_clues_entity" FOREIGN KEY ("campaign_id", "entity_id") REFERENCES "campaign_entities"("campaign_id", "entity_id") ON DELETE SET NULL ("entity_id");
--> statement-breakpoint
ALTER TABLE "campaign_clues" ADD CONSTRAINT "fk_campaign_clues_revealed_session" FOREIGN KEY ("campaign_id", "revealed_in_session_id") REFERENCES "campaign_sessions"("campaign_id", "session_id") ON DELETE SET NULL ("revealed_in_session_id");
--> statement-breakpoint
ALTER TABLE "live_tables" ADD CONSTRAINT "fk_live_tables_active_session" FOREIGN KEY ("campaign_id", "active_session_id") REFERENCES "campaign_sessions"("campaign_id", "session_id") ON DELETE SET NULL ("active_session_id");
--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "fk_characters_entity" FOREIGN KEY ("campaign_id", "entity_id") REFERENCES "campaign_entities"("campaign_id", "entity_id") ON DELETE SET NULL ("entity_id");
--> statement-breakpoint

-- Player-owned records remain isolated to the same campaign.
ALTER TABLE "player_proposals" ADD CONSTRAINT "fk_player_proposals_player" FOREIGN KEY ("campaign_id", "player_id") REFERENCES "player_profiles"("campaign_id", "profile_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "player_portal_states" ADD CONSTRAINT "fk_player_portal_states_player" FOREIGN KEY ("campaign_id", "player_id") REFERENCES "player_profiles"("campaign_id", "profile_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "player_portal_resources" ADD CONSTRAINT "fk_player_portal_resources_player" FOREIGN KEY ("campaign_id", "player_id") REFERENCES "player_profiles"("campaign_id", "profile_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "visibility_grants" ADD CONSTRAINT "fk_visibility_grants_player" FOREIGN KEY ("campaign_id", "player_id") REFERENCES "player_profiles"("campaign_id", "profile_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_memberships" ADD CONSTRAINT "fk_campaign_memberships_player" FOREIGN KEY ("player_id") REFERENCES "player_profiles"("profile_id") ON DELETE SET NULL;
--> statement-breakpoint
ALTER TABLE "campaign_objectives" ADD CONSTRAINT "fk_campaign_objectives_player" FOREIGN KEY ("player_id") REFERENCES "player_profiles"("profile_id") ON DELETE SET NULL;
--> statement-breakpoint
ALTER TABLE "campaign_notes" ADD CONSTRAINT "fk_campaign_notes_author_player" FOREIGN KEY ("author_player_id") REFERENCES "player_profiles"("profile_id") ON DELETE SET NULL;
--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "fk_characters_player_profile" FOREIGN KEY ("player_profile_id") REFERENCES "player_profiles"("profile_id") ON DELETE SET NULL;
