UPDATE "dm_profiles"
SET "public_handle" = lower(regexp_replace("public_handle", '^@+', ''))
WHERE "public_handle" IS NOT NULL;

UPDATE "player_profiles"
SET "public_handle" = lower(regexp_replace("public_handle", '^@+', ''))
WHERE "public_handle" IS NOT NULL;

UPDATE "dm_profiles"
SET "public_handle" = NULL
WHERE "public_handle" IS NOT NULL
  AND "public_handle" !~ '^[a-z0-9][a-z0-9_-]{2,31}$';

UPDATE "player_profiles"
SET "public_handle" = NULL
WHERE "public_handle" IS NOT NULL
  AND "public_handle" !~ '^[a-z0-9][a-z0-9_-]{2,31}$';

WITH ranked_dm_handles AS (
  SELECT "user_id", row_number() OVER (PARTITION BY "public_handle" ORDER BY "updated_at" DESC, "user_id") AS handle_rank
  FROM "dm_profiles"
  WHERE "public_handle" IS NOT NULL
)
UPDATE "dm_profiles" dm
SET "public_handle" = NULL
FROM ranked_dm_handles ranked
WHERE dm."user_id" = ranked."user_id"
  AND ranked.handle_rank > 1;

WITH ranked_player_handles AS (
  SELECT "profile_id", row_number() OVER (PARTITION BY "public_handle" ORDER BY "updated_at" DESC, "profile_id") AS handle_rank
  FROM "player_profiles"
  WHERE "public_handle" IS NOT NULL
)
UPDATE "player_profiles" player
SET "public_handle" = NULL
FROM ranked_player_handles ranked
WHERE player."profile_id" = ranked."profile_id"
  AND ranked.handle_rank > 1;

UPDATE "player_profiles" player
SET "public_handle" = NULL
WHERE player."public_handle" IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM "dm_profiles" dm
    WHERE dm."public_handle" = player."public_handle"
  );

CREATE UNIQUE INDEX IF NOT EXISTS "uq_dm_profiles_public_handle"
  ON "dm_profiles" ("public_handle")
  WHERE "public_handle" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "uq_player_profiles_public_handle"
  ON "player_profiles" ("public_handle")
  WHERE "public_handle" IS NOT NULL;
