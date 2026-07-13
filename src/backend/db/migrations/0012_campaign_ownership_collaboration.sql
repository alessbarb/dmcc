-- Tie collaboration and infra rows to an existing campaign.
-- player_proposals is intentionally absent here: it already has
-- fk_player_proposals_campaign from 0009_player_visibility_integrity.sql.
-- Orphan counts must be verified as zero before this runs against any
-- database with real user data (see Task 4, Step 1 of the implementation plan).
DELETE FROM "live_tables" lt
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = lt."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_invitations" cinv
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = cinv."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_notes" cn
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = cn."campaign_id");
--> statement-breakpoint
DELETE FROM "activity_feed" af
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = af."campaign_id");
--> statement-breakpoint
DELETE FROM "attachments" att
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = att."campaign_id");
--> statement-breakpoint

ALTER TABLE "live_tables"
ADD CONSTRAINT "fk_live_tables_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_invitations"
ADD CONSTRAINT "fk_campaign_invitations_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_notes"
ADD CONSTRAINT "fk_campaign_notes_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "activity_feed"
ADD CONSTRAINT "fk_activity_feed_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "attachments"
ADD CONSTRAINT "fk_attachments_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
