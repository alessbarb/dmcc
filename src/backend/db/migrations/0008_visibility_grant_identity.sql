DELETE FROM "visibility_grants";
--> statement-breakpoint
ALTER TABLE "visibility_grants"
DROP CONSTRAINT IF EXISTS "visibility_grants_campaign_id_target_type_target_id_scope_pk";
--> statement-breakpoint
ALTER TABLE "visibility_grants"
ADD CONSTRAINT "chk_visibility_grants_target_type"
CHECK ("target_type" IN ('entity', 'fact', 'relation', 'clue', 'objective'));
--> statement-breakpoint
ALTER TABLE "visibility_grants"
ADD CONSTRAINT "chk_visibility_grants_scope"
CHECK ("scope" IN ('public', 'all_players', 'specific_player', 'specific_user'));
--> statement-breakpoint
ALTER TABLE "visibility_grants"
ADD CONSTRAINT "chk_visibility_grants_principal"
CHECK (
  ("scope" = 'specific_player' AND "player_id" IS NOT NULL AND "user_id" IS NULL)
  OR ("scope" = 'specific_user' AND "user_id" IS NOT NULL AND "player_id" IS NULL)
  OR ("scope" IN ('public', 'all_players') AND "user_id" IS NULL AND "player_id" IS NULL)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "uq_visibility_grants_common"
ON "visibility_grants" ("campaign_id", "target_type", "target_id", "scope")
WHERE "scope" IN ('public', 'all_players');
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
