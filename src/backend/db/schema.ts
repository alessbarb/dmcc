import { sql } from "drizzle-orm";
import { check, foreignKey, index, integer, jsonb, pgTable, primaryKey, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import type { UserPreferences, SocialVisibility } from "../server/account/accountTypes.js";

// Mirrors accountWebRoutes.ts's defaultVisibility(); duplicated here (rather than imported)
// to keep schema.ts free of dependencies on the route layer.
const defaultSocialVisibility: SocialVisibility = {
  displayName: "table",
  avatarUrl: "table",
  pronouns: "table",
  timeZone: "private",
  biography: "dm",
  contact: "private",
};

export const users = pgTable("users", {
  userId: text("user_id").primaryKey(),
  emailNormalized: text("email_normalized").notNull().unique(),
  emailHash: text("email_hash").notNull().unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
  disabledAt: timestamp("disabled_at"),
});

export const authSessions = pgTable("auth_sessions", {
  sessionIdHash: text("session_id_hash").primaryKey(),
  userId: text("user_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
});

export const userPreferences = pgTable("user_preferences", {
  userId: text("user_id").primaryKey().references(() => users.userId, { onDelete: "cascade" }),
  preferences: jsonb("preferences").$type<UserPreferences>().notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const workspaces = pgTable("workspaces", {
  workspaceId: text("workspace_id").primaryKey(),
  name: text("name").notNull(),
  ownerId: text("owner_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const workspaceMemberships = pgTable("workspace_memberships", {
  workspaceId: text("workspace_id").notNull().references(() => workspaces.workspaceId, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.workspaceId, table.userId] }),
}));

export const campaigns = pgTable("campaigns", {
  campaignId: text("campaign_id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary"),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.workspaceId, { onDelete: "cascade" }),
  ownerId: text("owner_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
  status: text("status").notNull().default("active"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  trashedAt: timestamp("trashed_at"),
  trashedByUserId: text("trashed_by_user_id").references(() => users.userId, { onDelete: "set null" }),
  purgeEligibleAt: timestamp("purge_eligible_at"),
}, (table) => ({
  statusCheck: check("chk_campaign_status", sql`${table.status} IN ('importing', 'active', 'trashed')`),
  trashCoherenceCheck: check("chk_campaign_trash_coherence", sql`
    (status = 'trashed' AND trashed_at IS NOT NULL AND purge_eligible_at IS NOT NULL)
    OR
    (status IN ('active', 'importing') AND trashed_at IS NULL AND trashed_by_user_id IS NULL AND purge_eligible_at IS NULL)
  `),
}));

export const playerProfiles = pgTable("player_profiles", {
  profileId: text("profile_id").primaryKey(),
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.userId, { onDelete: "set null" }),
  displayName: text("display_name").notNull(),
  pronouns: text("pronouns"),
  biography: text("biography"),
  contact: text("contact"),
  status: text("status").notNull().default("active"),
  linkedCharacterId: text("linked_character_id"),
  publicHandle: text("public_handle"),
  publicationState: text("publication_state").notNull().default("private"),
  visibility: jsonb("visibility").$type<SocialVisibility>().notNull().default(defaultSocialVisibility),
  version: integer("version").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  campaignProfileUq: uniqueIndex("uq_player_profiles_campaign_profile").on(table.campaignId, table.profileId),
}));

export const campaignMemberships = pgTable("campaign_memberships", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
  role: text("role").notNull(),
  playerId: text("player_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  revokedAt: timestamp("revoked_at"),
}, (table) => ({
  pk: primaryKey({ columns: [table.campaignId, table.userId] }),
  playerFk: foreignKey({
    name: "fk_campaign_memberships_player",
    columns: [table.campaignId, table.playerId],
    foreignColumns: [playerProfiles.campaignId, playerProfiles.profileId],
  }).onDelete("cascade"),
}));

export const campaignShortcuts = pgTable("campaign_shortcuts", {
  shortcutId: text("shortcut_id").primaryKey(),
  campaignId: text("campaign_id").notNull(),
  userId: text("user_id").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  sortOrder: integer("sort_order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  membershipFk: foreignKey({
    name: "fk_campaign_shortcuts_membership",
    columns: [table.campaignId, table.userId],
    foreignColumns: [campaignMemberships.campaignId, campaignMemberships.userId],
  }).onDelete("cascade"),
  uniqueTarget: uniqueIndex("uq_campaign_shortcuts_target").on(table.campaignId, table.userId, table.targetType, table.targetId),
  targetTypeCheck: check("chk_campaign_shortcuts_target_type", sql`${table.targetType} IN ('entity', 'session', 'canvas', 'notebook', 'story_thread', 'story_step')`),
  sortOrderCheck: check("chk_campaign_shortcuts_sort_order", sql`${table.sortOrder} >= 0`),
}));

export const dmProfiles = pgTable("dm_profiles", {
  userId: text("user_id").primaryKey().references(() => users.userId, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  pronouns: text("pronouns"),
  timeZone: text("time_zone"),
  biography: text("biography"),
  contact: text("contact"),
  publicHandle: text("public_handle"),
  publicationState: text("publication_state").notNull().default("private"),
  visibility: jsonb("visibility").$type<SocialVisibility>().notNull().default(defaultSocialVisibility),
  version: integer("version").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const recoveryCodes = pgTable("recovery_codes", {
  userId: text("user_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
  codeHash: text("code_hash").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  usedAt: timestamp("used_at"),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.codeHash] }),
}));

export const passwordResetTokens = pgTable("password_reset_tokens", {
  userId: text("user_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.tokenHash] }),
}));

export const domainEvents = pgTable("domain_events", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  sequence: integer("sequence").notNull(),
  eventId: text("event_id").notNull(),
  type: text("type").notNull(),
  payload: jsonb("payload").$type<unknown>().notNull(),
  occurredAt: text("occurred_at").notNull(),
  actorUserId: text("actor_user_id").references(() => users.userId, { onDelete: "set null" }),
  actorId: text("actor_id").notNull(),
  commandId: text("command_id"),
  commandHash: text("command_hash"),
  previousHash: text("previous_hash"),
  hash: text("hash").notNull(),
  schemaVersion: integer("schema_version").notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.campaignId, table.sequence] }),
}));

export const commandIndex = pgTable("command_index", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  commandId: text("command_id").notNull(),
  commandHash: text("command_hash").notNull(),
  firstSequence: integer("first_sequence").notNull(),
  lastSequence: integer("last_sequence").notNull(),
  resultJson: jsonb("result_json").$type<{ eventCount: number; lastSequence: number }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.campaignId, table.commandId] }),
}));

export const campaignSnapshots = pgTable("campaign_snapshots", {
  campaignId: text("campaign_id").primaryKey().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  sequence: integer("sequence").notNull(),
  snapshot: jsonb("snapshot").$type<unknown>().notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const campaignEntities = pgTable("campaign_entities", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  entityId: text("entity_id").notNull(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  publicSummary: text("public_summary"),
  dmSummary: text("dm_summary"),
  status: text("status").notNull().default("active"),
  importance: text("importance").notNull().default("normal"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.campaignId, table.entityId] }),
}));

export const campaignFacts = pgTable("campaign_facts", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  factId: text("fact_id").notNull(),
  subjectEntityId: text("subject_entity_id").notNull(),
  kind: text("kind").notNull(),
  contentPublic: text("content_public"),
  contentDm: text("content_dm"),
  confidence: text("confidence").notNull().default("confirmed"),
  source: text("source"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.campaignId, table.factId] }),
}));

export const campaignRelations = pgTable("campaign_relations", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  relationId: text("relation_id").notNull(),
  sourceEntityId: text("source_entity_id").notNull(),
  targetEntityId: text("target_entity_id").notNull(),
  type: text("type").notNull(),
  publicSummary: text("public_summary"),
  dmSummary: text("dm_summary"),
  visibility: text("visibility").notNull().default("dm_only"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.campaignId, table.relationId] }),
}));

export const visibilityGrants = pgTable("visibility_grants", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  scope: text("scope").notNull(),
  userId: text("user_id").references(() => users.userId, { onDelete: "cascade" }),
  playerId: text("player_id"),
  grantedAt: timestamp("granted_at").notNull().defaultNow(),
}, (table) => ({
  commonGrantUq: uniqueIndex("uq_visibility_grants_common")
    .on(table.campaignId, table.targetType, table.targetId, table.scope)
    .where(sql`${table.scope} in ('public', 'all_players')`),
  playerGrantUq: uniqueIndex("uq_visibility_grants_specific_player")
    .on(table.campaignId, table.targetType, table.targetId, table.scope, table.playerId)
    .where(sql`${table.scope} = 'specific_player'`),
  userGrantUq: uniqueIndex("uq_visibility_grants_specific_user")
    .on(table.campaignId, table.targetType, table.targetId, table.scope, table.userId)
    .where(sql`${table.scope} = 'specific_user'`),
  campaignTargetIdx: index("idx_visibility_grants_campaign_target").on(table.campaignId, table.targetType, table.targetId),
  principalCheck: check("chk_visibility_grants_principal", sql`
    (${table.scope} = 'specific_player' and ${table.playerId} is not null and ${table.userId} is null)
    or (${table.scope} = 'specific_user' and ${table.userId} is not null and ${table.playerId} is null)
    or (${table.scope} not in ('specific_player', 'specific_user') and ${table.userId} is null and ${table.playerId} is null)
  `),
  playerFk: foreignKey({
    name: "fk_visibility_grants_player",
    columns: [table.campaignId, table.playerId],
    foreignColumns: [playerProfiles.campaignId, playerProfiles.profileId],
  }).onDelete("cascade"),
}));

export const campaignSessions = pgTable("campaign_sessions", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  sessionId: text("session_id").notNull(),
  number: integer("number").notNull(),
  title: text("title").notNull(),
  recapDm: text("recap_dm"),
  recapPublic: text("recap_public"),
  status: text("status").notNull().default("planned"),
  plannedDate: text("planned_date"),
  playedDate: text("played_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.campaignId, table.sessionId] }),
}));


export const campaignObjectives = pgTable("campaign_objectives", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  objectiveId: text("objective_id").notNull(),
  playerId: text("player_id"),
  title: text("title").notNull(),
  description: text("description"),
  kind: text("kind").notNull().default("session"),
  status: text("status").notNull().default("open"),
  visibilityScope: text("visibility_scope").notNull().default("all_players"),
  linkedEntityIds: jsonb("linked_entity_ids").$type<string[]>().notNull().default([]),
  sourceType: text("source_type").notNull().default("dm"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.campaignId, table.objectiveId] }),
}));

export const campaignClues = pgTable("campaign_clues", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  clueId: text("clue_id").notNull(),
  entityId: text("entity_id"),
  title: text("title").notNull(),
  publicSummary: text("public_summary"),
  dmSummary: text("dm_summary"),
  status: text("status").notNull().default("hidden"),
  visibilityScope: text("visibility_scope").notNull().default("dm_only"),
  revealedInSessionId: text("revealed_in_session_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.campaignId, table.clueId] }),
}));

export const characters = pgTable("characters", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  characterId: text("character_id").notNull(),
  playerProfileId: text("player_profile_id"),
  entityId: text("entity_id"),
  name: text("name").notNull(),
  status: text("status").notNull().default("active"),
  publicSummary: text("public_summary"),
  dmSummary: text("dm_summary"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.campaignId, table.characterId] }),
}));

export const liveTables = pgTable("live_tables", {
  liveTableId: text("live_table_id").primaryKey(),
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  activeSessionId: text("active_session_id"),
  shortCode: text("short_code").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  closedAt: timestamp("closed_at"),
});

export const campaignInvitations = pgTable("campaign_invitations", {
  invitationId: text("invitation_id").primaryKey(),
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  shortCodeHash: text("short_code_hash"),
  role: text("role").notNull().default("player"),
  maxUses: integer("max_uses").notNull().default(1),
  usesCount: integer("uses_count").notNull().default(0),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
  createdBy: text("created_by").notNull().references(() => users.userId, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const campaignInvitationAcceptances = pgTable("campaign_invitation_acceptances", {
  acceptanceId: text("acceptance_id").primaryKey(),
  invitationId: text("invitation_id").notNull().references(() => campaignInvitations.invitationId, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
  acceptedAt: timestamp("accepted_at").notNull().defaultNow(),
});

export const campaignNotes = pgTable("campaign_notes", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  noteId: text("note_id").notNull(),
  authorUserId: text("author_user_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
  authorPlayerId: text("author_player_id"),
  content: text("content").notNull(),
  visibilityScope: text("visibility_scope").notNull().default("dm_only"),
  targetEntityId: text("target_entity_id"),
  targetSessionId: text("target_session_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.campaignId, table.noteId] }),
}));

export const playerProposals = pgTable("player_proposals", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  proposalId: text("proposal_id").notNull(),
  userId: text("user_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
  playerId: text("player_id").notNull(),
  type: text("type").notNull(),
  content: jsonb("content").$type<Record<string, unknown>>().notNull(),
  status: text("status").notNull().default("submitted"),
  processedBy: text("processed_by").references(() => users.userId, { onDelete: "set null" }),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.campaignId, table.proposalId] }),
  playerFk: foreignKey({
    name: "fk_player_proposals_player",
    columns: [table.campaignId, table.playerId],
    foreignColumns: [playerProfiles.campaignId, playerProfiles.profileId],
  }).onDelete("cascade"),
}));

export const campaignActivity = pgTable("campaign_activity", {
  activityId: text("activity_id").primaryKey(),
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  sourceKind: text("source_kind").notNull(),
  sourceId: text("source_id").notNull(),
  type: text("type").notNull(),
  category: text("category").notNull(),
  data: jsonb("data").$type<Record<string, unknown>>().notNull(),
  actorUserId: text("actor_user_id").references(() => users.userId, { onDelete: "set null" }),
  sessionId: text("session_id"),
  targetType: text("target_type"),
  targetId: text("target_id"),
  occurredAt: timestamp("occurred_at").notNull(),
}, (table) => ({
  uniqueSource: uniqueIndex("campaign_activity_campaign_id_source_kind_source_id_key").on(table.campaignId, table.sourceKind, table.sourceId),
  sourceKindCheck: check("campaign_activity_source_kind_check", sql`${table.sourceKind} IN ('domain_event', 'operation')`),
  categoryCheck: check("campaign_activity_category_check", sql`${table.category} IN ('session', 'content', 'knowledge', 'story', 'people', 'collaboration', 'operation')`),
  targetCoherenceCheck: check("campaign_activity_target_coherence_check", sql`(${table.targetType} IS NULL AND ${table.targetId} IS NULL) OR (${table.targetType} IS NOT NULL AND ${table.targetId} IS NOT NULL)`),
  occurredAtIdx: index("campaign_activity_campaign_id_occurred_at_idx").on(table.campaignId, table.occurredAt.desc()),
  categoryIdx: index("campaign_activity_campaign_id_category_occurred_at_idx").on(table.campaignId, table.category, table.occurredAt.desc()),
  targetIdx: index("campaign_activity_campaign_id_target_type_target_id_occurred_at_idx").on(table.campaignId, table.targetType, table.targetId, table.occurredAt.desc()),
  sessionIdx: index("campaign_activity_campaign_id_session_id_occurred_at_idx").on(table.campaignId, table.sessionId, table.occurredAt.desc()),
}));

export const notifications = pgTable("notifications", {
  notificationId: text("notification_id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
  type: text("type").notNull(),
  content: jsonb("content").$type<Record<string, unknown>>().notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const attachments = pgTable("attachments", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  attachmentId: text("attachment_id").notNull(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  visibilityScope: text("visibility_scope").notNull().default("dm_only"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.campaignId, table.attachmentId] }),
}));

export const campaignNotebooks = pgTable("campaign_notebooks", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  notebookId: text("notebook_id").notNull(),
  parentNotebookId: text("parent_notebook_id"),
  title: text("title").notNull(),
  description: text("description"),
  icon: text("icon"),
  sortOrder: integer("sort_order").notNull(),
  archivedAt: timestamp("archived_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.campaignId, table.notebookId] }),
  parentFk: foreignKey({
    name: "fk_campaign_notebooks_parent",
    columns: [table.campaignId, table.parentNotebookId],
    foreignColumns: [table.campaignId, table.notebookId],
  }).onDelete("restrict"),
  selfReferenceCheck: check("chk_campaign_notebooks_self_reference", sql`${table.parentNotebookId} IS NULL OR ${table.parentNotebookId} <> ${table.notebookId}`),
  sortOrderCheck: check("chk_campaign_notebooks_sort_order", sql`${table.sortOrder} >= 0`),
  parentSortIdx: index("idx_campaign_notebooks_parent_sort").on(table.campaignId, table.parentNotebookId, table.sortOrder),
  archivedIdx: index("idx_campaign_notebooks_archived").on(table.campaignId, table.archivedAt),
}));

export const campaignNotebookItems = pgTable("campaign_notebook_items", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  notebookItemId: text("notebook_item_id").notNull(),
  notebookId: text("notebook_id").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  sortOrder: integer("sort_order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.campaignId, table.notebookItemId] }),
  notebookFk: foreignKey({
    name: "fk_campaign_notebook_items_notebook",
    columns: [table.campaignId, table.notebookId],
    foreignColumns: [campaignNotebooks.campaignId, campaignNotebooks.notebookId],
  }).onDelete("cascade"),
  uniqueTarget: uniqueIndex("uq_campaign_notebook_items_target").on(table.campaignId, table.notebookId, table.targetType, table.targetId),
  targetTypeCheck: check("chk_campaign_notebook_items_target_type", sql`${table.targetType} IN ('entity', 'fact', 'relation', 'session', 'session_event', 'canvas', 'attachment')`),
  sortOrderCheck: check("chk_campaign_notebook_items_sort_order", sql`${table.sortOrder} >= 0`),
}));

export const campaignStoryThreads = pgTable("campaign_story_threads", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  threadId: text("thread_id").notNull(),
  title: text("title").notNull(),
  summary: text("summary"),
  status: text("status").notNull(),
  sortOrder: integer("sort_order").notNull(),
  archivedAt: timestamp("archived_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.campaignId, table.threadId] }),
  statusCheck: check("chk_campaign_story_threads_status", sql`${table.status} IN ('planned', 'active', 'resolved', 'discarded')`),
  sortOrderCheck: check("chk_campaign_story_threads_sort_order", sql`${table.sortOrder} >= 0`),
}));

export const campaignStorySteps = pgTable("campaign_story_steps", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  stepId: text("step_id").notNull(),
  threadId: text("thread_id").notNull(),
  title: text("title").notNull(),
  intent: text("intent"),
  expectedOutcome: text("expected_outcome"),
  actualOutcome: text("actual_outcome"),
  status: text("status").notNull(),
  resolutionKind: text("resolution_kind"),
  sceneEntityId: text("scene_entity_id"),
  plannedSessionId: text("planned_session_id"),
  plannedSessionOrder: integer("planned_session_order"),
  resolvedSessionId: text("resolved_session_id"),
  sortOrder: integer("sort_order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.campaignId, table.stepId] }),
  threadFk: foreignKey({
    name: "fk_campaign_story_steps_thread",
    columns: [table.campaignId, table.threadId],
    foreignColumns: [campaignStoryThreads.campaignId, campaignStoryThreads.threadId],
  }).onDelete("cascade"),
  sceneFk: foreignKey({
    name: "fk_campaign_story_steps_scene",
    columns: [table.campaignId, table.sceneEntityId],
    foreignColumns: [campaignEntities.campaignId, campaignEntities.entityId],
  }).onDelete("restrict"),
  plannedSessionFk: foreignKey({
    name: "fk_campaign_story_steps_planned_session",
    columns: [table.campaignId, table.plannedSessionId],
    foreignColumns: [campaignSessions.campaignId, campaignSessions.sessionId],
  }).onDelete("restrict"),
  resolvedSessionFk: foreignKey({
    name: "fk_campaign_story_steps_resolved_session",
    columns: [table.campaignId, table.resolvedSessionId],
    foreignColumns: [campaignSessions.campaignId, campaignSessions.sessionId],
  }).onDelete("restrict"),
  statusCheck: check("chk_campaign_story_steps_status", sql`${table.status} IN ('planned', 'ready', 'active', 'resolved', 'discarded')`),
  resolutionKindCheck: check("chk_campaign_story_steps_resolution_kind", sql`${table.resolutionKind} IN ('as_planned', 'changed', 'discarded') OR ${table.resolutionKind} IS NULL`),
  statusResolutionCoherence: check("chk_campaign_story_steps_status_resolution_coherence", sql`
    (${table.status} IN ('planned', 'ready', 'active') AND ${table.resolutionKind} IS NULL) OR
    (${table.status} = 'resolved' AND ${table.resolutionKind} IN ('as_planned', 'changed')) OR
    (${table.status} = 'discarded' AND ${table.resolutionKind} = 'discarded')
  `),
  actualOutcomeCheck: check("chk_campaign_story_steps_actual_outcome", sql`
    ${table.resolutionKind} <> 'changed' OR (NULLIF(TRIM(${table.actualOutcome}), '') IS NOT NULL)
  `),
  plannedSessionCoherence: check("chk_campaign_story_steps_planned_session_coherence", sql`
    (${table.plannedSessionId} IS NULL AND ${table.plannedSessionOrder} IS NULL) OR
    (${table.plannedSessionId} IS NOT NULL AND ${table.plannedSessionOrder} IS NOT NULL AND ${table.plannedSessionOrder} >= 0)
  `),
  sortOrderCheck: check("chk_campaign_story_steps_sort_order", sql`${table.sortOrder} >= 0`),
}));

export const campaignStoryThreadEntities = pgTable("campaign_story_thread_entities", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  threadId: text("thread_id").notNull(),
  entityId: text("entity_id").notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.campaignId, table.threadId, table.entityId] }),
  threadFk: foreignKey({
    name: "fk_campaign_story_thread_entities_thread",
    columns: [table.campaignId, table.threadId],
    foreignColumns: [campaignStoryThreads.campaignId, campaignStoryThreads.threadId],
  }).onDelete("cascade"),
  entityFk: foreignKey({
    name: "fk_campaign_story_thread_entities_entity",
    columns: [table.campaignId, table.entityId],
    foreignColumns: [campaignEntities.campaignId, campaignEntities.entityId],
  }).onDelete("cascade"),
}));

export const campaignStoryStepEntities = pgTable("campaign_story_step_entities", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  stepId: text("step_id").notNull(),
  entityId: text("entity_id").notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.campaignId, table.stepId, table.entityId] }),
  stepFk: foreignKey({
    name: "fk_campaign_story_step_entities_step",
    columns: [table.campaignId, table.stepId],
    foreignColumns: [campaignStorySteps.campaignId, campaignStorySteps.stepId],
  }).onDelete("cascade"),
  entityFk: foreignKey({
    name: "fk_campaign_story_step_entities_entity",
    columns: [table.campaignId, table.entityId],
    foreignColumns: [campaignEntities.campaignId, campaignEntities.entityId],
  }).onDelete("cascade"),
}));
