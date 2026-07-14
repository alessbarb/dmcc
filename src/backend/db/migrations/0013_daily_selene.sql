-- Argon2 precondition check
DO $$
DECLARE
  has_non_argon2_accounts boolean := false;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'password_algorithm'
  ) THEN
    EXECUTE 'SELECT EXISTS (
      SELECT 1
      FROM users
      WHERE password_algorithm IS DISTINCT FROM ''argon2id''
    )'
    INTO has_non_argon2_accounts;

    IF has_non_argon2_accounts THEN
      RAISE EXCEPTION 'Non-Argon2 accounts remain. Reset or recreate them before applying this migration.';
    END IF;
  END IF;
END $$;
--> statement-breakpoint

-- Email uniqueness precondition check
DO $$
BEGIN
  IF EXISTS (
    SELECT email_normalized
    FROM users
    GROUP BY email_normalized
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate normalized emails exist across workspace partitions.';
  END IF;

  IF EXISTS (
    SELECT email_hash
    FROM users
    GROUP BY email_hash
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate email hashes exist across workspace partitions.';
  END IF;
END $$;
--> statement-breakpoint

CREATE TABLE "campaign_purge_jobs" (
	"job_id" text PRIMARY KEY NOT NULL,
	"campaign_id" text NOT NULL,
	"actor_user_id" text,
	"actor_type" text NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"resource_manifest" jsonb NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"worker_id" text,
	"lease_token" text,
	"lease_expires_at" timestamp,
	"last_error_code" text,
	"last_error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"first_started_at" timestamp,
	"last_attempt_at" timestamp,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chk_purge_jobs_actor_type" CHECK ("campaign_purge_jobs"."actor_type" IN ('user', 'system')),
	CONSTRAINT "chk_purge_jobs_reason" CHECK ("campaign_purge_jobs"."reason" IN ('manual', 'retention_expired', 'incomplete_import')),
	CONSTRAINT "chk_purge_jobs_status" CHECK ("campaign_purge_jobs"."status" IN ('pending', 'running', 'failed', 'completed', 'cancelled')),
	CONSTRAINT "chk_purge_jobs_coherence" CHECK (
    (status = 'running' AND worker_id IS NOT NULL AND lease_token IS NOT NULL AND lease_expires_at IS NOT NULL)
    OR
    (status <> 'running' AND worker_id IS NULL AND lease_token IS NULL AND lease_expires_at IS NULL)
  ),
	CONSTRAINT "chk_purge_jobs_completed" CHECK (
    (status = 'completed' AND completed_at IS NOT NULL)
    OR
    (status <> 'completed' AND completed_at IS NULL)
  ),
	CONSTRAINT "chk_purge_jobs_actor_system_coherence" CHECK (
    (actor_type <> 'system' OR actor_user_id IS NULL)
  ),
	CONSTRAINT "chk_purge_jobs_attempt_count" CHECK (attempt_count >= 0)
);
--> statement-breakpoint
CREATE TABLE "operations_audit_log" (
	"audit_id" text PRIMARY KEY NOT NULL,
	"actor_user_id" text,
	"actor_type" text NOT NULL,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"command_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chk_audit_actor_type" CHECK ("operations_audit_log"."actor_type" IN ('user', 'system')),
	CONSTRAINT "chk_audit_actor_system_coherence" CHECK (
    (actor_type <> 'system' OR actor_user_id IS NULL)
  )
);
--> statement-breakpoint
CREATE TABLE "system_announcements" (
	"announcement_id" text PRIMARY KEY NOT NULL,
	"content" jsonb NOT NULL,
	"kind" text DEFAULT 'info' NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"show_on_landing" boolean DEFAULT true NOT NULL,
	"show_on_dashboard" boolean DEFAULT true NOT NULL,
	"is_dismissible" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"starts_at" timestamp,
	"expires_at" timestamp,
	"archived_at" timestamp,
	"created_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chk_announcement_kind" CHECK ("system_announcements"."kind" IN ('info', 'warning', 'maintenance'))
);
--> statement-breakpoint
CREATE TABLE "campaign_template_settings" (
	"template_id" text PRIMARY KEY NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"updated_by_user_id" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_system_settings" (
	"system_id" text PRIMARY KEY NOT NULL,
	"is_enabled_for_new_campaigns" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_by_user_id" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Normalize the platform administrator column across deployed schema states.
DO $$
DECLARE
  platform_admin_type text;
BEGIN
  SELECT data_type
  INTO platform_admin_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name = 'is_platform_admin';

  IF platform_admin_type IS NULL THEN
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'app_role'
    ) THEN
      ALTER TABLE "users"
        RENAME COLUMN "app_role" TO "is_platform_admin";

      platform_admin_type := 'text';
    ELSE
      ALTER TABLE "users"
        ADD COLUMN "is_platform_admin" boolean DEFAULT false;

      platform_admin_type := 'boolean';
    END IF;
  END IF;

  IF platform_admin_type <> 'boolean' THEN
    ALTER TABLE "users"
      ALTER COLUMN "is_platform_admin" DROP DEFAULT;

    ALTER TABLE "users"
      ALTER COLUMN "is_platform_admin"
      TYPE boolean
      USING ("is_platform_admin" = 'admin');
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'app_role'
  ) THEN
    EXECUTE 'UPDATE "users"
      SET "is_platform_admin" = true
      WHERE "app_role" = ''admin''';

    ALTER TABLE "users" DROP COLUMN "app_role";
  END IF;

  UPDATE "users"
  SET "is_platform_admin" = false
  WHERE "is_platform_admin" IS NULL;

  ALTER TABLE "users"
    ALTER COLUMN "is_platform_admin" SET DEFAULT false;

  ALTER TABLE "users"
    ALTER COLUMN "is_platform_admin" SET NOT NULL;
END $$;--> statement-breakpoint
DROP INDEX IF EXISTS "uq_user_email_workspace_partition";--> statement-breakpoint
DROP INDEX IF EXISTS "uq_user_email_hash_workspace_partition";--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "trashed_at" timestamp;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "trashed_by_user_id" text;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "purge_eligible_at" timestamp;--> statement-breakpoint
ALTER TABLE "live_tables" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "live_tables" ADD COLUMN IF NOT EXISTS "closed_at" timestamp;--> statement-breakpoint
ALTER TABLE "campaign_purge_jobs" ADD CONSTRAINT "campaign_purge_jobs_actor_user_id_users_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operations_audit_log" ADD CONSTRAINT "operations_audit_log_actor_user_id_users_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_announcements" ADD CONSTRAINT "system_announcements_created_by_user_id_users_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_template_settings" ADD CONSTRAINT "campaign_template_settings_updated_by_user_id_users_user_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_system_settings" ADD CONSTRAINT "game_system_settings_updated_by_user_id_users_user_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_active_campaign_purge_job" ON "campaign_purge_jobs" USING btree ("campaign_id") WHERE "campaign_purge_jobs"."status" IN ('pending', 'running', 'failed');--> statement-breakpoint
CREATE INDEX "idx_purge_jobs_status_lease" ON "campaign_purge_jobs" USING btree ("status","lease_expires_at","created_at");--> statement-breakpoint
CREATE INDEX "idx_operations_audit_created_at" ON "operations_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_operations_audit_target" ON "operations_audit_log" USING btree ("target_type","target_id","created_at");--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_trashed_by_user_id_users_user_id_fk" FOREIGN KEY ("trashed_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" DROP COLUMN IF EXISTS "workspace_partition_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "workspace_partition_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "password_salt";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "password_algorithm";--> statement-breakpoint
ALTER TABLE "workspaces" DROP COLUMN IF EXISTS "workspace_partition_id";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_normalized_unique" UNIQUE("email_normalized");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_hash_unique" UNIQUE("email_hash");--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "chk_campaign_status" CHECK ("campaigns"."status" IN ('importing', 'active', 'trashed'));--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "chk_campaign_trash_coherence" CHECK (
    (status = 'trashed' AND trashed_at IS NOT NULL AND purge_eligible_at IS NOT NULL)
    OR
    (status IN ('active', 'importing') AND trashed_at IS NULL AND trashed_by_user_id IS NULL AND purge_eligible_at IS NULL)
  );