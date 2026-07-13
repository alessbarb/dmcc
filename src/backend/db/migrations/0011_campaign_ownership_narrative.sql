-- Tie narrative content rows to an existing campaign.
-- Orphan counts must be verified as zero before this runs against any
-- database with real user data (see Task 3, Step 1 of the implementation plan).
DELETE FROM "campaign_sessions" cs
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = cs."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_scenes" csc
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = csc."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_objectives" co
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = co."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_clues" ccl
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = ccl."campaign_id");
--> statement-breakpoint
DELETE FROM "characters" ch
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = ch."campaign_id");
--> statement-breakpoint

ALTER TABLE "campaign_sessions"
ADD CONSTRAINT "fk_campaign_sessions_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_scenes"
ADD CONSTRAINT "fk_campaign_scenes_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_objectives"
ADD CONSTRAINT "fk_campaign_objectives_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_clues"
ADD CONSTRAINT "fk_campaign_clues_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "characters"
ADD CONSTRAINT "fk_characters_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
