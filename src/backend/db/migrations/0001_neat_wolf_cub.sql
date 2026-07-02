ALTER TABLE "users" DROP CONSTRAINT "users_email_normalized_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_email_hash_unique";--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "vault_id" text DEFAULT 'default' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "vault_id" text DEFAULT 'default' NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "vault_id" text DEFAULT 'default' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_email_vault" ON "users" USING btree ("email_normalized","vault_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_email_hash_vault" ON "users" USING btree ("email_hash","vault_id");