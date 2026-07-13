-- Tie event-sourcing and core read-model rows to an existing campaign.
-- Orphan counts must be verified as zero before this runs against any
-- database with real user data (see Task 2, Step 1 of the implementation plan).
DELETE FROM "domain_events" de
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = de."campaign_id");
--> statement-breakpoint
DELETE FROM "command_index" ci
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = ci."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_snapshots" cs
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = cs."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_entities" ce
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = ce."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_facts" cf
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = cf."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_relations" cr
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = cr."campaign_id");
--> statement-breakpoint

ALTER TABLE "domain_events"
ADD CONSTRAINT "fk_domain_events_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "command_index"
ADD CONSTRAINT "fk_command_index_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_snapshots"
ADD CONSTRAINT "fk_campaign_snapshots_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_entities"
ADD CONSTRAINT "fk_campaign_entities_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_facts"
ADD CONSTRAINT "fk_campaign_facts_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_relations"
ADD CONSTRAINT "fk_campaign_relations_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
