ALTER TABLE "campaign_shortcuts" DROP CONSTRAINT "chk_campaign_shortcuts_target_type";
--> statement-breakpoint
ALTER TABLE "campaign_shortcuts" ADD CONSTRAINT "chk_campaign_shortcuts_target_type" CHECK ("campaign_shortcuts"."target_type" IN ('entity', 'session', 'canvas', 'notebook', 'story_thread', 'story_step'));
--> statement-breakpoint
CREATE TABLE "campaign_notebooks" (
	"campaign_id" text NOT NULL,
	"notebook_id" text NOT NULL,
	"parent_notebook_id" text,
	"title" text NOT NULL,
	"description" text,
	"icon" text,
	"sort_order" integer NOT NULL,
	"archived_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_notebooks_campaign_id_notebook_id_pk" PRIMARY KEY("campaign_id","notebook_id"),
	CONSTRAINT "chk_campaign_notebooks_self_reference" CHECK ("campaign_notebooks"."parent_notebook_id" IS NULL OR "campaign_notebooks"."parent_notebook_id" <> "campaign_notebooks"."notebook_id"),
	CONSTRAINT "chk_campaign_notebooks_sort_order" CHECK ("campaign_notebooks"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "campaign_notebook_items" (
	"campaign_id" text NOT NULL,
	"notebook_item_id" text NOT NULL,
	"notebook_id" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_notebook_items_campaign_id_notebook_item_id_pk" PRIMARY KEY("campaign_id","notebook_item_id"),
	CONSTRAINT "chk_campaign_notebook_items_target_type" CHECK ("campaign_notebook_items"."target_type" IN ('entity', 'fact', 'relation', 'session', 'session_event', 'canvas', 'attachment')),
	CONSTRAINT "chk_campaign_notebook_items_sort_order" CHECK ("campaign_notebook_items"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "campaign_story_threads" (
	"campaign_id" text NOT NULL,
	"thread_id" text NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"status" text NOT NULL,
	"sort_order" integer NOT NULL,
	"archived_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_story_threads_campaign_id_thread_id_pk" PRIMARY KEY("campaign_id","thread_id"),
	CONSTRAINT "chk_campaign_story_threads_status" CHECK ("campaign_story_threads"."status" IN ('planned', 'active', 'resolved', 'discarded')),
	CONSTRAINT "chk_campaign_story_threads_sort_order" CHECK ("campaign_story_threads"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "campaign_story_steps" (
	"campaign_id" text NOT NULL,
	"step_id" text NOT NULL,
	"thread_id" text NOT NULL,
	"title" text NOT NULL,
	"intent" text,
	"expected_outcome" text,
	"actual_outcome" text,
	"status" text NOT NULL,
	"resolution_kind" text,
	"scene_entity_id" text,
	"planned_session_id" text,
	"planned_session_order" integer,
	"resolved_session_id" text,
	"sort_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_story_steps_campaign_id_step_id_pk" PRIMARY KEY("campaign_id","step_id"),
	CONSTRAINT "chk_campaign_story_steps_status" CHECK ("campaign_story_steps"."status" IN ('planned', 'ready', 'active', 'resolved', 'discarded')),
	CONSTRAINT "chk_campaign_story_steps_resolution_kind" CHECK ("campaign_story_steps"."resolution_kind" IN ('as_planned', 'changed', 'discarded') OR "campaign_story_steps"."resolution_kind" IS NULL),
	CONSTRAINT "chk_campaign_story_steps_status_resolution_coherence" CHECK (("campaign_story_steps"."status" IN ('planned', 'ready', 'active') AND "campaign_story_steps"."resolution_kind" IS NULL) OR ("campaign_story_steps"."status" = 'resolved' AND "campaign_story_steps"."resolution_kind" IN ('as_planned', 'changed')) OR ("campaign_story_steps"."status" = 'discarded' AND "campaign_story_steps"."resolution_kind" = 'discarded')),
	CONSTRAINT "chk_campaign_story_steps_actual_outcome" CHECK ("campaign_story_steps"."resolution_kind" <> 'changed' OR (NULLIF(TRIM("campaign_story_steps"."actual_outcome"), '') IS NOT NULL)),
	CONSTRAINT "chk_campaign_story_steps_planned_session_coherence" CHECK (("campaign_story_steps"."planned_session_id" IS NULL AND "campaign_story_steps"."planned_session_order" IS NULL) OR ("campaign_story_steps"."planned_session_id" IS NOT NULL AND "campaign_story_steps"."planned_session_order" IS NOT NULL AND "campaign_story_steps"."planned_session_order" >= 0)),
	CONSTRAINT "chk_campaign_story_steps_sort_order" CHECK ("campaign_story_steps"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "campaign_story_thread_entities" (
	"campaign_id" text NOT NULL,
	"thread_id" text NOT NULL,
	"entity_id" text NOT NULL,
	CONSTRAINT "campaign_story_thread_entities_campaign_id_thread_id_entity_id_pk" PRIMARY KEY("campaign_id","thread_id","entity_id")
);
--> statement-breakpoint
CREATE TABLE "campaign_story_step_entities" (
	"campaign_id" text NOT NULL,
	"step_id" text NOT NULL,
	"entity_id" text NOT NULL,
	CONSTRAINT "campaign_story_step_entities_campaign_id_step_id_entity_id_pk" PRIMARY KEY("campaign_id","step_id","entity_id")
);
--> statement-breakpoint
ALTER TABLE "campaign_notebooks" ADD CONSTRAINT "campaign_notebooks_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "campaign_notebooks" ADD CONSTRAINT "fk_campaign_notebooks_parent" FOREIGN KEY ("campaign_id", "parent_notebook_id") REFERENCES "public"."campaign_notebooks"("campaign_id", "notebook_id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "campaign_notebook_items" ADD CONSTRAINT "fk_campaign_notebook_items_notebook" FOREIGN KEY ("campaign_id", "notebook_id") REFERENCES "public"."campaign_notebooks"("campaign_id", "notebook_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "idx_campaign_notebooks_parent_sort" ON "campaign_notebooks" USING btree ("campaign_id","parent_notebook_id","sort_order");
--> statement-breakpoint
CREATE INDEX "idx_campaign_notebooks_archived" ON "campaign_notebooks" USING btree ("campaign_id","archived_at");
--> statement-breakpoint
CREATE UNIQUE INDEX "uq_campaign_notebook_items_target" ON "campaign_notebook_items" USING btree ("campaign_id","notebook_id","target_type","target_id");
--> statement-breakpoint
ALTER TABLE "campaign_story_threads" ADD CONSTRAINT "campaign_story_threads_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "campaign_story_steps" ADD CONSTRAINT "fk_campaign_story_steps_thread" FOREIGN KEY ("campaign_id", "thread_id") REFERENCES "public"."campaign_story_threads"("campaign_id", "thread_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "campaign_story_steps" ADD CONSTRAINT "fk_campaign_story_steps_scene" FOREIGN KEY ("campaign_id", "scene_entity_id") REFERENCES "public"."campaign_entities"("campaign_id", "entity_id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "campaign_story_steps" ADD CONSTRAINT "fk_campaign_story_steps_planned_session" FOREIGN KEY ("campaign_id", "planned_session_id") REFERENCES "public"."campaign_sessions"("campaign_id", "session_id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "campaign_story_steps" ADD CONSTRAINT "fk_campaign_story_steps_resolved_session" FOREIGN KEY ("campaign_id", "resolved_session_id") REFERENCES "public"."campaign_sessions"("campaign_id", "session_id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "campaign_story_thread_entities" ADD CONSTRAINT "fk_campaign_story_thread_entities_thread" FOREIGN KEY ("campaign_id", "thread_id") REFERENCES "public"."campaign_story_threads"("campaign_id", "thread_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "campaign_story_thread_entities" ADD CONSTRAINT "fk_campaign_story_thread_entities_entity" FOREIGN KEY ("campaign_id", "entity_id") REFERENCES "public"."campaign_entities"("campaign_id", "entity_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "campaign_story_step_entities" ADD CONSTRAINT "fk_campaign_story_step_entities_step" FOREIGN KEY ("campaign_id", "step_id") REFERENCES "public"."campaign_story_steps"("campaign_id", "step_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "campaign_story_step_entities" ADD CONSTRAINT "fk_campaign_story_step_entities_entity" FOREIGN KEY ("campaign_id", "entity_id") REFERENCES "public"."campaign_entities"("campaign_id", "entity_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "campaign_notebook_items" ADD CONSTRAINT "campaign_notebook_items_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "campaign_story_steps" ADD CONSTRAINT "campaign_story_steps_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "campaign_story_thread_entities" ADD CONSTRAINT "campaign_story_thread_entities_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "campaign_story_step_entities" ADD CONSTRAINT "campaign_story_step_entities_campaign_id_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("campaign_id") ON DELETE cascade ON UPDATE no action;

