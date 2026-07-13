ALTER TABLE "visibility_grants"
DROP CONSTRAINT IF EXISTS "visibility_grants_campaign_id_target_type_target_id_scope_pk";
--> statement-breakpoint
UPDATE "visibility_grants"
SET
  "player_id" = COALESCE(
    "player_id",
    NULLIF(split_part("scope", ':', 2), '')
  ),
  "scope" = 'specific_player'
WHERE "scope" LIKE 'specific_player:%';
--> statement-breakpoint
UPDATE "visibility_grants"
SET
  "user_id" = COALESCE(
    "user_id",
    NULLIF(split_part("scope", ':', 2), '')
  ),
  "scope" = 'specific_user'
WHERE "scope" LIKE 'specific_user:%';
--> statement-breakpoint
DELETE FROM "visibility_grants" AS duplicate
USING "visibility_grants" AS keeper
WHERE duplicate.ctid > keeper.ctid
  AND duplicate."campaign_id" = keeper."campaign_id"
  AND duplicate."target_type" = keeper."target_type"
  AND duplicate."target_id" = keeper."target_id"
  AND duplicate."scope" = keeper."scope"
  AND duplicate."user_id" IS NOT DISTINCT FROM keeper."user_id"
  AND duplicate."player_id" IS NOT DISTINCT FROM keeper."player_id";
--> statement-breakpoint
ALTER TABLE "visibility_grants"
ADD CONSTRAINT "chk_visibility_grants_principal"
CHECK (
  ("scope" = 'specific_player' AND "player_id" IS NOT NULL AND "user_id" IS NULL)
  OR ("scope" = 'specific_user' AND "user_id" IS NOT NULL AND "player_id" IS NULL)
  OR ("scope" NOT IN ('specific_player', 'specific_user') AND "user_id" IS NULL AND "player_id" IS NULL)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "uq_visibility_grants_common"
ON "visibility_grants" ("campaign_id", "target_type", "target_id", "scope")
WHERE "scope" NOT IN ('specific_player', 'specific_user');
--> statement-breakpoint
CREATE UNIQUE INDEX "uq_visibility_grants_specific_player"
ON "visibility_grants" ("campaign_id", "target_type", "target_id", "scope", "player_id")
WHERE "scope" = 'specific_player';
--> statement-breakpoint
CREATE UNIQUE INDEX "uq_visibility_grants_specific_user"
ON "visibility_grants" ("campaign_id", "target_type", "target_id", "scope", "user_id")
WHERE "scope" = 'specific_user';
--> statement-breakpoint
CREATE INDEX "idx_visibility_grants_campaign_target"
ON "visibility_grants" ("campaign_id", "target_type", "target_id");
