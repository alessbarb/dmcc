ALTER TABLE "users" DROP CONSTRAINT "users_email_normalized_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_email_hash_unique";--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "workspace_partition_id" text DEFAULT 'default' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "workspace_partition_id" text DEFAULT 'default' NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "workspace_partition_id" text DEFAULT 'default' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_email_workspace_partition" ON "users" USING btree ("email_normalized","workspace_partition_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_email_hash_workspace_partition" ON "users" USING btree ("email_hash","workspace_partition_id");