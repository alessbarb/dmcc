CREATE TABLE "campaign_activity" (
	"activity_id" text PRIMARY KEY NOT NULL,
	"campaign_id" text NOT NULL,
	"source_kind" text NOT NULL,
	"source_id" text NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"data" jsonb NOT NULL,
	"actor_user_id" text,
	"session_id" text,
	"target_type" text,
	"target_id" text,
	"occurred_at" timestamp NOT NULL,
	CONSTRAINT "campaign_activity_source_kind_check" CHECK ("campaign_activity"."source_kind" IN ('domain_event', 'operation')),
	CONSTRAINT "campaign_activity_category_check" CHECK ("campaign_activity"."category" IN ('session', 'content', 'knowledge', 'story', 'people', 'collaboration', 'operation')),
	CONSTRAINT "campaign_activity_target_coherence_check" CHECK (("campaign_activity"."target_type" IS NULL AND "campaign_activity"."target_id" IS NULL) OR ("campaign_activity"."target_type" IS NOT NULL AND "campaign_activity"."target_id" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "campaign_activity" ADD CONSTRAINT "campaign_activity_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_activity" ADD CONSTRAINT "campaign_activity_actor_user_id_users_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "campaign_activity_campaign_id_source_kind_source_id_key" ON "campaign_activity" USING btree ("campaign_id","source_kind","source_id");--> statement-breakpoint
CREATE INDEX "campaign_activity_campaign_id_occurred_at_idx" ON "campaign_activity" USING btree ("campaign_id","occurred_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "campaign_activity_campaign_id_category_occurred_at_idx" ON "campaign_activity" USING btree ("campaign_id","category","occurred_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "campaign_activity_campaign_id_target_type_target_id_occurred_at_idx" ON "campaign_activity" USING btree ("campaign_id","target_type","target_id","occurred_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "campaign_activity_campaign_id_session_id_occurred_at_idx" ON "campaign_activity" USING btree ("campaign_id","session_id","occurred_at" DESC NULLS LAST);--> statement-breakpoint
DROP TABLE IF EXISTS "activity_feed" CASCADE;
