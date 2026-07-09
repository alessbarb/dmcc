ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "owner_id" text;
--> statement-breakpoint
UPDATE "campaigns"
SET "owner_id" = COALESCE(
  "owner_id",
  (
    SELECT "campaign_memberships"."user_id"
    FROM "campaign_memberships"
    WHERE "campaign_memberships"."campaign_id" = "campaigns"."campaign_id"
      AND "campaign_memberships"."role" = 'dm'
      AND "campaign_memberships"."revoked_at" IS NULL
    ORDER BY "campaign_memberships"."created_at" ASC
    LIMIT 1
  )
);
--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "owner_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_owner_id_users_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;
