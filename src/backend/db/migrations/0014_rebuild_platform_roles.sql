CREATE TABLE "user_roles" (
  "user_id" text NOT NULL,
  "role" text NOT NULL,
  "source" text NOT NULL,
  "assigned_at" timestamp DEFAULT now() NOT NULL,
  "assigned_by_user_id" text,
  CONSTRAINT "user_roles_user_id_role_pk" PRIMARY KEY ("user_id", "role"),
  CONSTRAINT "user_roles_role_check" CHECK ("role" IN ('dm', 'player', 'admin')),
  CONSTRAINT "user_roles_source_check" CHECK ("source" IN ('registration', 'invitation', 'administration', 'system')),
  CONSTRAINT "user_roles_user_id_users_user_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE,
  CONSTRAINT "user_roles_assigned_by_user_id_users_user_id_fk"
    FOREIGN KEY ("assigned_by_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL
);

CREATE INDEX "idx_user_roles_role" ON "user_roles" ("role");

INSERT INTO "user_roles" ("user_id", "role", "source")
SELECT "user_id", 'dm', 'system'
FROM "users"
ON CONFLICT ("user_id", "role") DO NOTHING;

INSERT INTO "user_roles" ("user_id", "role", "source")
SELECT "user_id", 'admin', 'system'
FROM "users"
WHERE "is_platform_admin" = true
ON CONFLICT ("user_id", "role") DO NOTHING;

INSERT INTO "user_roles" ("user_id", "role", "source")
SELECT DISTINCT "user_id", 'player', 'system'
FROM "campaign_memberships"
WHERE "role" = 'player' AND "revoked_at" IS NULL
ON CONFLICT ("user_id", "role") DO NOTHING;

INSERT INTO "campaign_memberships" (
  "campaign_id",
  "user_id",
  "role",
  "player_id",
  "created_at",
  "revoked_at"
)
SELECT
  "campaign_id",
  "owner_id",
  'dm',
  NULL,
  "created_at",
  NULL
FROM "campaigns"
ON CONFLICT ("campaign_id", "user_id") DO NOTHING;

ALTER TABLE "campaign_memberships"
  ADD CONSTRAINT "campaign_memberships_role_check"
  CHECK ("role" IN ('dm', 'co_dm', 'player'));

ALTER TABLE "campaign_memberships"
  ADD CONSTRAINT "campaign_memberships_player_coherence_check"
  CHECK (
    ("role" = 'player' AND "player_id" IS NOT NULL)
    OR
    ("role" IN ('dm', 'co_dm') AND "player_id" IS NULL)
  );