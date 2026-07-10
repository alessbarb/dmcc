CREATE TABLE "activity_feed" (
	"campaign_id" text NOT NULL,
	"activity_id" text NOT NULL,
	"type" text NOT NULL,
	"content" jsonb NOT NULL,
	"actor_user_id" text,
	"occurred_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "activity_feed_campaign_id_activity_id_pk" PRIMARY KEY("campaign_id","activity_id")
);
--> statement-breakpoint
CREATE TABLE "attachments" (
	"campaign_id" text NOT NULL,
	"attachment_id" text NOT NULL,
	"name" text NOT NULL,
	"path" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"visibility_scope" text DEFAULT 'dm_only' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "attachments_campaign_id_attachment_id_pk" PRIMARY KEY("campaign_id","attachment_id")
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"session_id_hash" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "campaign_entities" (
	"campaign_id" text NOT NULL,
	"entity_id" text NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"public_summary" text,
	"dm_summary" text,
	"status" text DEFAULT 'active' NOT NULL,
	"importance" text DEFAULT 'normal' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_entities_campaign_id_entity_id_pk" PRIMARY KEY("campaign_id","entity_id")
);
--> statement-breakpoint
CREATE TABLE "campaign_facts" (
	"campaign_id" text NOT NULL,
	"fact_id" text NOT NULL,
	"subject_entity_id" text NOT NULL,
	"kind" text NOT NULL,
	"content_public" text,
	"content_dm" text,
	"confidence" text DEFAULT 'confirmed' NOT NULL,
	"source" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_facts_campaign_id_fact_id_pk" PRIMARY KEY("campaign_id","fact_id")
);
--> statement-breakpoint
CREATE TABLE "campaign_invitation_acceptances" (
	"acceptance_id" text PRIMARY KEY NOT NULL,
	"invitation_id" text NOT NULL,
	"user_id" text NOT NULL,
	"accepted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaign_invitations" (
	"invitation_id" text PRIMARY KEY NOT NULL,
	"campaign_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"short_code_hash" text,
	"role" text DEFAULT 'player' NOT NULL,
	"max_uses" integer DEFAULT 1 NOT NULL,
	"uses_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaign_memberships" (
	"campaign_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"player_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp,
	CONSTRAINT "campaign_memberships_campaign_id_user_id_pk" PRIMARY KEY("campaign_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "campaign_notes" (
	"campaign_id" text NOT NULL,
	"note_id" text NOT NULL,
	"author_user_id" text NOT NULL,
	"author_player_id" text,
	"content" text NOT NULL,
	"visibility_scope" text DEFAULT 'dm_only' NOT NULL,
	"target_entity_id" text,
	"target_session_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_notes_campaign_id_note_id_pk" PRIMARY KEY("campaign_id","note_id")
);
--> statement-breakpoint
CREATE TABLE "campaign_relations" (
	"campaign_id" text NOT NULL,
	"relation_id" text NOT NULL,
	"source_entity_id" text NOT NULL,
	"target_entity_id" text NOT NULL,
	"type" text NOT NULL,
	"public_summary" text,
	"dm_summary" text,
	"visibility" text DEFAULT 'dm_only' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_relations_campaign_id_relation_id_pk" PRIMARY KEY("campaign_id","relation_id")
);
--> statement-breakpoint
CREATE TABLE "campaign_scenes" (
	"campaign_id" text NOT NULL,
	"scene_id" text NOT NULL,
	"session_id" text NOT NULL,
	"title" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_scenes_campaign_id_scene_id_pk" PRIMARY KEY("campaign_id","scene_id")
);
--> statement-breakpoint
CREATE TABLE "campaign_sessions" (
	"campaign_id" text NOT NULL,
	"session_id" text NOT NULL,
	"number" integer NOT NULL,
	"title" text NOT NULL,
	"recap_dm" text,
	"recap_public" text,
	"status" text DEFAULT 'planned' NOT NULL,
	"planned_date" text,
	"played_date" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_sessions_campaign_id_session_id_pk" PRIMARY KEY("campaign_id","session_id")
);
--> statement-breakpoint
CREATE TABLE "campaign_snapshots" (
	"campaign_id" text PRIMARY KEY NOT NULL,
	"sequence" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"campaign_id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"workspace_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "command_index" (
	"campaign_id" text NOT NULL,
	"command_id" text NOT NULL,
	"command_hash" text NOT NULL,
	"first_sequence" integer NOT NULL,
	"last_sequence" integer NOT NULL,
	"result_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "command_index_campaign_id_command_id_pk" PRIMARY KEY("campaign_id","command_id")
);
--> statement-breakpoint
CREATE TABLE "dm_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"avatar_url" text,
	"pronouns" text,
	"time_zone" text,
	"biography" text,
	"contact" text,
	"public_handle" text,
	"publication_state" text DEFAULT 'private' NOT NULL,
	"visibility" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domain_events" (
	"campaign_id" text NOT NULL,
	"sequence" integer NOT NULL,
	"event_id" text NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"occurred_at" text NOT NULL,
	"actor_user_id" text,
	"actor_id" text NOT NULL,
	"command_id" text,
	"command_hash" text,
	"previous_hash" text,
	"hash" text NOT NULL,
	"schema_version" integer NOT NULL,
	CONSTRAINT "domain_events_campaign_id_sequence_pk" PRIMARY KEY("campaign_id","sequence")
);
--> statement-breakpoint
CREATE TABLE "live_tables" (
	"live_table_id" text PRIMARY KEY NOT NULL,
	"campaign_id" text NOT NULL,
	"active_session_id" text,
	"short_code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"notification_id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"content" jsonb NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"user_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	CONSTRAINT "password_reset_tokens_user_id_token_hash_pk" PRIMARY KEY("user_id","token_hash")
);
--> statement-breakpoint
CREATE TABLE "player_profiles" (
	"profile_id" text PRIMARY KEY NOT NULL,
	"campaign_id" text NOT NULL,
	"user_id" text,
	"display_name" text NOT NULL,
	"pronouns" text,
	"biography" text,
	"contact" text,
	"status" text DEFAULT 'active' NOT NULL,
	"linked_character_id" text,
	"public_handle" text,
	"publication_state" text DEFAULT 'private' NOT NULL,
	"visibility" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_proposals" (
	"campaign_id" text NOT NULL,
	"proposal_id" text NOT NULL,
	"user_id" text NOT NULL,
	"player_id" text NOT NULL,
	"type" text NOT NULL,
	"content" jsonb NOT NULL,
	"status" text DEFAULT 'submitted' NOT NULL,
	"processed_by" text,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "player_proposals_campaign_id_proposal_id_pk" PRIMARY KEY("campaign_id","proposal_id")
);
--> statement-breakpoint
CREATE TABLE "recovery_codes" (
	"user_id" text NOT NULL,
	"code_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"used_at" timestamp,
	CONSTRAINT "recovery_codes_user_id_code_hash_pk" PRIMARY KEY("user_id","code_hash")
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"user_id" text PRIMARY KEY NOT NULL,
	"preferences" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" text PRIMARY KEY NOT NULL,
	"email_normalized" text NOT NULL,
	"email_hash" text NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"password_hash" text NOT NULL,
	"password_salt" text NOT NULL,
	"password_algorithm" text DEFAULT 'scrypt' NOT NULL,
	"app_role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_login_at" timestamp,
	"disabled_at" timestamp,
	CONSTRAINT "users_email_normalized_unique" UNIQUE("email_normalized"),
	CONSTRAINT "users_email_hash_unique" UNIQUE("email_hash")
);
--> statement-breakpoint
CREATE TABLE "visibility_grants" (
	"campaign_id" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"scope" text NOT NULL,
	"user_id" text,
	"player_id" text,
	"granted_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "visibility_grants_campaign_id_target_type_target_id_scope_pk" PRIMARY KEY("campaign_id","target_type","target_id","scope")
);
--> statement-breakpoint
CREATE TABLE "workspace_memberships" (
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "workspace_memberships_workspace_id_user_id_pk" PRIMARY KEY("workspace_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"workspace_id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"owner_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_feed" ADD CONSTRAINT "activity_feed_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_feed" ADD CONSTRAINT "activity_feed_actor_user_id_users_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_entities" ADD CONSTRAINT "campaign_entities_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_facts" ADD CONSTRAINT "campaign_facts_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_invitation_acceptances" ADD CONSTRAINT "campaign_invitation_acceptances_invitation_id_campaign_invitations_invitation_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."campaign_invitations"("invitation_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_invitation_acceptances" ADD CONSTRAINT "campaign_invitation_acceptances_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_invitations" ADD CONSTRAINT "campaign_invitations_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_invitations" ADD CONSTRAINT "campaign_invitations_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_memberships" ADD CONSTRAINT "campaign_memberships_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_memberships" ADD CONSTRAINT "campaign_memberships_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_notes" ADD CONSTRAINT "campaign_notes_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_notes" ADD CONSTRAINT "campaign_notes_author_user_id_users_user_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_relations" ADD CONSTRAINT "campaign_relations_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_scenes" ADD CONSTRAINT "campaign_scenes_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_sessions" ADD CONSTRAINT "campaign_sessions_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_snapshots" ADD CONSTRAINT "campaign_snapshots_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_workspace_id_workspaces_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("workspace_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "command_index" ADD CONSTRAINT "command_index_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dm_profiles" ADD CONSTRAINT "dm_profiles_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain_events" ADD CONSTRAINT "domain_events_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain_events" ADD CONSTRAINT "domain_events_actor_user_id_users_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_tables" ADD CONSTRAINT "live_tables_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_profiles" ADD CONSTRAINT "player_profiles_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_profiles" ADD CONSTRAINT "player_profiles_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_proposals" ADD CONSTRAINT "player_proposals_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_proposals" ADD CONSTRAINT "player_proposals_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_proposals" ADD CONSTRAINT "player_proposals_processed_by_users_user_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recovery_codes" ADD CONSTRAINT "recovery_codes_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visibility_grants" ADD CONSTRAINT "visibility_grants_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_memberships" ADD CONSTRAINT "workspace_memberships_workspace_id_workspaces_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("workspace_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_memberships" ADD CONSTRAINT "workspace_memberships_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_owner_id_users_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;