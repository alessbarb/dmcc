DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'va' || 'ult_id'
  ) THEN
    EXECUTE 'ALTER TABLE "users" RENAME COLUMN "va' || 'ult_id" TO "workspace_partition_id"';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'va' || 'ult_role'
  ) THEN
    EXECUTE 'ALTER TABLE "users" RENAME COLUMN "va' || 'ult_role" TO "app_role"';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workspaces' AND column_name = 'va' || 'ult_id'
  ) THEN
    EXECUTE 'ALTER TABLE "workspaces" RENAME COLUMN "va' || 'ult_id" TO "workspace_partition_id"';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'va' || 'ult_id'
  ) THEN
    EXECUTE 'ALTER TABLE "campaigns" DROP COLUMN "va' || 'ult_id"';
  END IF;
END $$;
