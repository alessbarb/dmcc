import { sql } from "drizzle-orm";
import { check, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./schema.js";

export type CampaignPurgeManifestV1 = {
  schemaVersion: 1;
  resources: Array<
    | { kind: "attachment"; attachmentId: string; storageKey: string }
    | { kind: "export_directory"; storageKey: string }
  >;
};

// Vocabularios Operacionales Tipados
export const OPERATION_ACTOR_TYPES = ["user", "system"] as const;
export type OperationActorType = typeof OPERATION_ACTOR_TYPES[number];

export const CAMPAIGN_PURGE_STATUSES = ["pending", "running", "failed", "completed", "cancelled"] as const;
export type CampaignPurgeStatus = typeof CAMPAIGN_PURGE_STATUSES[number];

export const CAMPAIGN_PURGE_REASONS = ["manual", "retention_expired", "incomplete_import"] as const;
export type CampaignPurgeReason = typeof CAMPAIGN_PURGE_REASONS[number];

export const OPERATION_ACTIONS = [
  "campaign.trashed",
  "campaign.restored",
  "campaign.purge_requested",
  "campaign.purge_started",
  "campaign.purge_failed",
  "campaign.purge_retried",
  "campaign.purge_cancelled",
  "campaign.purged",
  "campaign.incomplete_import_purge_requested",
  "campaign.incomplete_import_purged",
  "user.disabled",
  "user.enabled",
  "user.sessions_revoked",
  "user.platform_admin_granted",
  "user.platform_admin_revoked",
  "invitation.revoked",
  "announcement.created",
  "announcement.updated",
  "announcement.enabled",
  "announcement.disabled",
  "announcement.archived",
] as const;
export type OperationAction = typeof OPERATION_ACTIONS[number];

export type OperationTargetType =
  | "campaign"
  | "campaign_purge_job"
  | "user"
  | "invitation"
  | "announcement"
  | "campaign_template"
  | "game_system";

// Table for idempotent purging of external resources and database
export const campaignPurgeJobs = pgTable("campaign_purge_jobs", {
  jobId: text("job_id").primaryKey(),
  campaignId: text("campaign_id").notNull(),
  actorUserId: text("actor_user_id")
    .references(() => users.userId, { onDelete: "set null" }),
  actorType: text("actor_type").notNull(),                 // 'user' | 'system'
  reason: text("reason").notNull(),                        // 'manual' | 'retention_expired' | 'incomplete_import'
  status: text("status").notNull().default("pending"),     // 'pending' | 'running' | 'failed' | 'completed' | 'cancelled'
  resourceManifest: jsonb("resource_manifest")
    .$type<CampaignPurgeManifestV1>()
    .notNull(),
  attemptCount: integer("attempt_count").notNull().default(0),
  workerId: text("worker_id"),                             // Lease owner
  leaseToken: text("lease_token"),                         // Unique fencing token
  leaseExpiresAt: timestamp("lease_expires_at"),
  lastErrorCode: text("last_error_code"),
  lastErrorMessage: text("last_error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  firstStartedAt: timestamp("first_started_at"),
  lastAttemptAt: timestamp("last_attempt_at"),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  activeCampaignUq: uniqueIndex("uq_active_campaign_purge_job")
    .on(table.campaignId)
    .where(sql`${table.status} IN ('pending', 'running', 'failed')`),
  statusLeaseIdx: index("idx_purge_jobs_status_lease").on(table.status, table.leaseExpiresAt, table.createdAt),
  actorTypeCheck: check("chk_purge_jobs_actor_type", sql`${table.actorType} IN ('user', 'system')`),
  reasonCheck: check("chk_purge_jobs_reason", sql`${table.reason} IN ('manual', 'retention_expired', 'incomplete_import')`),
  statusCheck: check("chk_purge_jobs_status", sql`${table.status} IN ('pending', 'running', 'failed', 'completed', 'cancelled')`),
  coherenceCheck: check("chk_purge_jobs_coherence", sql`
    (status = 'running' AND worker_id IS NOT NULL AND lease_token IS NOT NULL AND lease_expires_at IS NOT NULL)
    OR
    (status <> 'running' AND worker_id IS NULL AND lease_token IS NULL AND lease_expires_at IS NULL)
  `),
  completedCheck: check("chk_purge_jobs_completed", sql`
    (status = 'completed' AND completed_at IS NOT NULL)
    OR
    (status <> 'completed' AND completed_at IS NULL)
  `),
  actorSystemCheck: check("chk_purge_jobs_actor_system_coherence", sql`
    (actor_type <> 'system' OR actor_user_id IS NULL)
  `),
  attemptCountCheck: check("chk_purge_jobs_attempt_count", sql`attempt_count >= 0`),
}));

// Operational audit log table
export const operationsAuditLog = pgTable("operations_audit_log", {
  auditId: text("audit_id").primaryKey(),
  actorUserId: text("actor_user_id")
    .references(() => users.userId, { onDelete: "set null" }),
  actorType: text("actor_type").notNull(),                 // 'user' | 'system'
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id"),
  details: jsonb("details").notNull().default({}),
  commandId: text("command_id"),                           // Identificador de correlación
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  createdIdx: index("idx_operations_audit_created_at").on(table.createdAt),
  targetIdx: index("idx_operations_audit_target").on(table.targetType, table.targetId, table.createdAt),
  actorTypeCheck: check("chk_audit_actor_type", sql`${table.actorType} IN ('user', 'system')`),
  actorSystemCheck: check("chk_audit_actor_system_coherence", sql`
    (actor_type <> 'system' OR actor_user_id IS NULL)
  `),
}));
