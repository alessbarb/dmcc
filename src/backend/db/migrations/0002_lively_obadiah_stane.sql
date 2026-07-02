ALTER TABLE "activity_feed" DROP CONSTRAINT "activity_feed_campaign_id_campaigns_campaign_id_fk";
--> statement-breakpoint
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_campaign_id_campaigns_campaign_id_fk";
--> statement-breakpoint
ALTER TABLE "campaign_entities" DROP CONSTRAINT "campaign_entities_campaign_id_campaigns_campaign_id_fk";
--> statement-breakpoint
ALTER TABLE "campaign_facts" DROP CONSTRAINT "campaign_facts_campaign_id_campaigns_campaign_id_fk";
--> statement-breakpoint
ALTER TABLE "campaign_invitations" DROP CONSTRAINT "campaign_invitations_campaign_id_campaigns_campaign_id_fk";
--> statement-breakpoint
ALTER TABLE "campaign_memberships" DROP CONSTRAINT "campaign_memberships_campaign_id_campaigns_campaign_id_fk";
--> statement-breakpoint
ALTER TABLE "campaign_notes" DROP CONSTRAINT "campaign_notes_campaign_id_campaigns_campaign_id_fk";
--> statement-breakpoint
ALTER TABLE "campaign_relations" DROP CONSTRAINT "campaign_relations_campaign_id_campaigns_campaign_id_fk";
--> statement-breakpoint
ALTER TABLE "campaign_scenes" DROP CONSTRAINT "campaign_scenes_campaign_id_campaigns_campaign_id_fk";
--> statement-breakpoint
ALTER TABLE "campaign_sessions" DROP CONSTRAINT "campaign_sessions_campaign_id_campaigns_campaign_id_fk";
--> statement-breakpoint
ALTER TABLE "campaign_snapshots" DROP CONSTRAINT "campaign_snapshots_campaign_id_campaigns_campaign_id_fk";
--> statement-breakpoint
ALTER TABLE "command_index" DROP CONSTRAINT "command_index_campaign_id_campaigns_campaign_id_fk";
--> statement-breakpoint
ALTER TABLE "domain_events" DROP CONSTRAINT "domain_events_campaign_id_campaigns_campaign_id_fk";
--> statement-breakpoint
ALTER TABLE "live_tables" DROP CONSTRAINT "live_tables_campaign_id_campaigns_campaign_id_fk";
--> statement-breakpoint
ALTER TABLE "player_profiles" DROP CONSTRAINT "player_profiles_campaign_id_campaigns_campaign_id_fk";
--> statement-breakpoint
ALTER TABLE "player_proposals" DROP CONSTRAINT "player_proposals_campaign_id_campaigns_campaign_id_fk";
--> statement-breakpoint
ALTER TABLE "visibility_grants" DROP CONSTRAINT "visibility_grants_campaign_id_campaigns_campaign_id_fk";
