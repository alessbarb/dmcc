CREATE TABLE IF NOT EXISTS "auth_throttle_states" (
  "key" text PRIMARY KEY NOT NULL,
  "purpose" text NOT NULL,
  "count" integer DEFAULT 0 NOT NULL,
  "window_reset_at" timestamp NOT NULL,
  "locked_until" timestamp,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "chk_auth_throttle_states_purpose" CHECK ("purpose" IN ('login_rate', 'register_rate', 'login_lockout')),
  CONSTRAINT "chk_auth_throttle_states_count" CHECK ("count" >= 0)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_auth_throttle_states_purpose" ON "auth_throttle_states" USING btree ("purpose");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_auth_throttle_states_updated_at" ON "auth_throttle_states" USING btree ("updated_at");
