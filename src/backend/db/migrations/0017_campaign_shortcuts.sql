CREATE TABLE "campaign_shortcuts" (
	"shortcut_id" text PRIMARY KEY NOT NULL,
	"campaign_id" text NOT NULL,
	"user_id" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chk_campaign_shortcuts_target_type" CHECK ("campaign_shortcuts"."target_type" IN ('entity', 'session', 'canvas')),
	CONSTRAINT "chk_campaign_shortcuts_sort_order" CHECK ("campaign_shortcuts"."sort_order" >= 0)
);
--> statement-breakpoint
ALTER TABLE "campaign_shortcuts" ADD CONSTRAINT "fk_campaign_shortcuts_membership" FOREIGN KEY ("campaign_id", "user_id") REFERENCES "public"."campaign_memberships"("campaign_id", "user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_campaign_shortcuts_target" ON "campaign_shortcuts" USING btree ("campaign_id","user_id","target_type","target_id");
