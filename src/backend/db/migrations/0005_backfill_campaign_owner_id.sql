-- Backfill campaign ownership for databases created before campaigns.owner_id existed.
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "owner_id" text;
--> statement-breakpoint
UPDATE "campaigns" AS c
SET "owner_id" = w."owner_id"
FROM "workspaces" AS w
WHERE c."workspace_id" = w."workspace_id"
  AND c."owner_id" IS NULL;
--> statement-breakpoint
UPDATE "campaigns" AS c
SET "owner_id" = owner_membership."user_id"
FROM (
  SELECT DISTINCT ON (cm."campaign_id")
    cm."campaign_id",
    cm."user_id"
  FROM "campaign_memberships" AS cm
  INNER JOIN "users" AS u ON u."user_id" = cm."user_id"
  WHERE cm."revoked_at" IS NULL
    AND cm."role" IN ('owner', 'dm', 'co_dm')
  ORDER BY cm."campaign_id",
    CASE cm."role"
      WHEN 'owner' THEN 0
      WHEN 'dm' THEN 1
      ELSE 2
    END,
    cm."created_at" ASC
) AS owner_membership
WHERE c."campaign_id" = owner_membership."campaign_id"
  AND c."owner_id" IS NULL;
--> statement-breakpoint
UPDATE "campaigns" AS c
SET "owner_id" = first_membership."user_id"
FROM (
  SELECT DISTINCT ON (cm."campaign_id")
    cm."campaign_id",
    cm."user_id"
  FROM "campaign_memberships" AS cm
  INNER JOIN "users" AS u ON u."user_id" = cm."user_id"
  WHERE cm."revoked_at" IS NULL
  ORDER BY cm."campaign_id", cm."created_at" ASC
) AS first_membership
WHERE c."campaign_id" = first_membership."campaign_id"
  AND c."owner_id" IS NULL;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'campaigns_owner_id_users_user_id_fk'
      AND conrelid = 'campaigns'::regclass
  ) THEN
    ALTER TABLE "campaigns"
      ADD CONSTRAINT "campaigns_owner_id_users_user_id_fk"
      FOREIGN KEY ("owner_id") REFERENCES "users"("user_id")
      ON DELETE cascade
      NOT VALID;
  END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ix_campaigns_owner_id" ON "campaigns" ("owner_id");
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "campaigns" WHERE "owner_id" IS NULL) THEN
    ALTER TABLE "campaigns" ALTER COLUMN "owner_id" SET NOT NULL;
  ELSE
    RAISE NOTICE 'campaigns.owner_id remains nullable because some existing campaigns could not be mapped to a user';
  END IF;
END $$;
