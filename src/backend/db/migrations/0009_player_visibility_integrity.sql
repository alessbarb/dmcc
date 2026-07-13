-- Keep player and visibility records tied to an existing campaign.
DELETE FROM "campaign_memberships" membership
WHERE NOT EXISTS (
  SELECT 1 FROM "campaigns" campaign
  WHERE campaign."campaign_id" = membership."campaign_id"
);
--> statement-breakpoint
DELETE FROM "player_profiles" profile
WHERE NOT EXISTS (
  SELECT 1 FROM "campaigns" campaign
  WHERE campaign."campaign_id" = profile."campaign_id"
);
--> statement-breakpoint
DELETE FROM "player_proposals" proposal
WHERE NOT EXISTS (
  SELECT 1 FROM "campaigns" campaign
  WHERE campaign."campaign_id" = proposal."campaign_id"
);
--> statement-breakpoint
DELETE FROM "visibility_grants" grant_record
WHERE NOT EXISTS (
  SELECT 1 FROM "campaigns" campaign
  WHERE campaign."campaign_id" = grant_record."campaign_id"
);
--> statement-breakpoint
DELETE FROM "player_portal_states" portal_state
WHERE NOT EXISTS (
  SELECT 1 FROM "campaigns" campaign
  WHERE campaign."campaign_id" = portal_state."campaign_id"
);
--> statement-breakpoint
DELETE FROM "player_portal_resources" portal_resource
WHERE NOT EXISTS (
  SELECT 1 FROM "campaigns" campaign
  WHERE campaign."campaign_id" = portal_resource."campaign_id"
);
--> statement-breakpoint

-- Remove invalid player-owned rows before adding same-campaign foreign keys.
DELETE FROM "campaign_memberships" membership
WHERE membership."player_id" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "player_profiles" profile
    WHERE profile."campaign_id" = membership."campaign_id"
      AND profile."profile_id" = membership."player_id"
  );
--> statement-breakpoint
DELETE FROM "player_proposals" proposal
WHERE NOT EXISTS (
  SELECT 1 FROM "player_profiles" profile
  WHERE profile."campaign_id" = proposal."campaign_id"
    AND profile."profile_id" = proposal."player_id"
);
--> statement-breakpoint
DELETE FROM "player_portal_states" portal_state
WHERE NOT EXISTS (
  SELECT 1 FROM "player_profiles" profile
  WHERE profile."campaign_id" = portal_state."campaign_id"
    AND profile."profile_id" = portal_state."player_id"
);
--> statement-breakpoint
DELETE FROM "player_portal_resources" portal_resource
WHERE NOT EXISTS (
  SELECT 1 FROM "player_profiles" profile
  WHERE profile."campaign_id" = portal_resource."campaign_id"
    AND profile."profile_id" = portal_resource."player_id"
);
--> statement-breakpoint
DELETE FROM "visibility_grants" grant_record
WHERE grant_record."scope" = 'specific_player'
  AND NOT EXISTS (
    SELECT 1 FROM "player_profiles" profile
    WHERE profile."campaign_id" = grant_record."campaign_id"
      AND profile."profile_id" = grant_record."player_id"
  );
--> statement-breakpoint
DELETE FROM "visibility_grants" grant_record
WHERE grant_record."scope" = 'specific_user'
  AND NOT EXISTS (
    SELECT 1 FROM "users" user_account
    WHERE user_account."user_id" = grant_record."user_id"
  );
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "uq_player_profiles_campaign_profile"
ON "player_profiles" ("campaign_id", "profile_id");
--> statement-breakpoint

ALTER TABLE "campaign_memberships"
ADD CONSTRAINT "fk_campaign_memberships_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "player_profiles"
ADD CONSTRAINT "fk_player_profiles_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "player_proposals"
ADD CONSTRAINT "fk_player_proposals_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "visibility_grants"
ADD CONSTRAINT "fk_visibility_grants_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "player_portal_states"
ADD CONSTRAINT "fk_player_portal_states_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "player_portal_resources"
ADD CONSTRAINT "fk_player_portal_resources_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint

ALTER TABLE "campaign_memberships"
ADD CONSTRAINT "fk_campaign_memberships_player"
FOREIGN KEY ("campaign_id", "player_id")
REFERENCES "player_profiles"("campaign_id", "profile_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "player_proposals"
ADD CONSTRAINT "fk_player_proposals_player"
FOREIGN KEY ("campaign_id", "player_id")
REFERENCES "player_profiles"("campaign_id", "profile_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "visibility_grants"
ADD CONSTRAINT "fk_visibility_grants_player"
FOREIGN KEY ("campaign_id", "player_id")
REFERENCES "player_profiles"("campaign_id", "profile_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "visibility_grants"
ADD CONSTRAINT "fk_visibility_grants_user"
FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "player_portal_states"
ADD CONSTRAINT "fk_player_portal_states_player"
FOREIGN KEY ("campaign_id", "player_id")
REFERENCES "player_profiles"("campaign_id", "profile_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "player_portal_resources"
ADD CONSTRAINT "fk_player_portal_resources_player"
FOREIGN KEY ("campaign_id", "player_id")
REFERENCES "player_profiles"("campaign_id", "profile_id") ON DELETE CASCADE;
