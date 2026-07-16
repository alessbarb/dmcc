import { apiFetch, readApiError } from "../shared/api/apiClient.js";

export type AdminOverview = {
  totalUsers: number;
  activeUsers: number;
  totalCampaigns: number;
  activeCampaigns: number;
  trashedCampaigns: number;
  totalPurgeJobs: number;
  failedPurgeJobs: number;
  pendingPurgeJobs: number;
};

export type AdminCampaignSummary = {
  campaignId: string;
  title: string;
  status: "active" | "trashed" | "importing";
  ownerId: string;
  ownerEmail: string;
  ownerName: string | null;
  createdAt: string;
  trashedAt: string | null;
  purgeEligibleAt: string | null;
  trashedByUserId: string | null;
};

export type AdminCampaignDetails = AdminCampaignSummary & {
  counts: {
    entities: number;
    facts: number;
    relations: number;
    sessions: number;
    scenes: number;
    clues: number;
    characters: number;
    notes: number;
    attachments: number;
    messages: number;
  };
};

export type AdminUserSummary = {
  userId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  isPlatformAdmin: boolean;
  roles?: Array<"dm" | "player" | "admin">;
  createdAt: string;
  lastLoginAt: string | null;
  disabledAt: string | null;
};

export type PurgeJobSummary = {
  jobId: string;
  campaignId: string;
  actorUserId: string | null;
  actorType: "user" | "system";
  reason: "manual" | "retention_expired" | "incomplete_import";
  status: "pending" | "running" | "failed" | "completed" | "cancelled";
  attemptCount: number;
  workerId: string | null;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
  updatedAt: string;
};

export type InvitationSummary = {
  invitationId: string;
  campaignId: string;
  role: "dm" | "co_dm" | "player";
  maxUses: number;
  usesCount: number;
  expiresAt: string;
  revokedAt: string | null;
  createdBy: string;
  createdAt: string;
};

export type AuditLogSummary = {
  auditId: string;
  actorUserId: string | null;
  actorType: "user" | "system";
  action: string;
  targetType: string;
  targetId: string | null;
  details: Record<string, any>;
  commandId: string | null;
  createdAt: string;
};

export type AnnouncementContent = { title: string; body: string };

export type AnnouncementSummary = {
  announcementId: string;
  content: AnnouncementContent;
  kind: "info" | "warning" | "maintenance";
  isEnabled: boolean;
  showOnLanding: boolean;
  showOnDashboard: boolean;
  isDismissible: boolean;
  priority: number;
  startsAt: string | null;
  expiresAt: string | null;
  archivedAt: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AnnouncementInput = {
  content: AnnouncementContent;
  kind: "info" | "warning" | "maintenance";
  isEnabled?: boolean;
  showOnLanding?: boolean;
  showOnDashboard?: boolean;
  isDismissible?: boolean;
  priority?: number;
  startsAt?: string | null;
  expiresAt?: string | null;
};

export type CampaignTemplateSetting = {
  templateId: string;
  title: string;
  system: string;
  difficulty: string;
  locale: string;
  isVisible: boolean;
  sortOrder: number;
  isFeatured: boolean;
  updatedAt: string | null;
};

export type GameSystemSetting = {
  systemId: string;
  label: string;
  isEnabledForNewCampaigns: boolean;
  sortOrder: number;
  updatedAt: string | null;
};

export async function fetchAdminOverview(): Promise<AdminOverview> {
  const res = await apiFetch("/api/admin/overview");
  if (!res.ok) throw new Error(await readApiError(res, "Failed to fetch admin overview"));
  return res.json();
}

export async function fetchAdminCampaigns(params: { status?: string; query?: string; limit?: number; cursor?: string }): Promise<{ campaigns: AdminCampaignSummary[]; nextCursor: string | null }> {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.query) q.set("query", params.query);
  if (params.limit) q.set("limit", String(params.limit));
  if (params.cursor) q.set("cursor", params.cursor);
  const res = await apiFetch(`/api/admin/campaigns?${q.toString()}`);
  if (!res.ok) throw new Error(await readApiError(res, "Failed to fetch admin campaigns"));
  return res.json();
}

export async function restoreCampaign(campaignId: string): Promise<void> {
  const res = await apiFetch(`/api/admin/campaigns/${campaignId}/restore`, { init: { method: "POST" } });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to restore campaign"));
}

export async function purgeCampaign(campaignId: string, currentPassword: string): Promise<{ success: boolean; outcome: string }> {
  const res = await apiFetch(`/api/admin/campaigns/${campaignId}/purge`, {
    init: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword }) },
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to purge campaign"));
  return res.json();
}

export async function fetchPurgeJobs(params: { status?: string; cursor?: string; limit?: number }): Promise<{ jobs: PurgeJobSummary[]; nextCursor: string | null }> {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.limit) q.set("limit", String(params.limit));
  if (params.cursor) q.set("cursor", params.cursor);
  const res = await apiFetch(`/api/admin/purge-jobs?${q.toString()}`);
  if (!res.ok) throw new Error(await readApiError(res, "Failed to fetch purge jobs"));
  return res.json();
}

export async function retryPurgeJob(jobId: string): Promise<void> {
  const res = await apiFetch(`/api/admin/purge-jobs/${jobId}/retry`, { init: { method: "POST" } });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to retry purge job"));
}

export async function fetchAdminUsers(params: { query?: string; status?: string; cursor?: string; limit?: number }): Promise<{ users: AdminUserSummary[]; nextCursor: string | null }> {
  const q = new URLSearchParams();
  if (params.query) q.set("query", params.query);
  if (params.status) q.set("status", params.status);
  if (params.limit) q.set("limit", String(params.limit));
  if (params.cursor) q.set("cursor", params.cursor);
  const res = await apiFetch(`/api/admin/users?${q.toString()}`);
  if (!res.ok) throw new Error(await readApiError(res, "Failed to fetch admin users"));
  return res.json();
}

export async function disableUser(userId: string, currentPassword: string): Promise<void> {
  const res = await apiFetch(`/api/admin/users/${userId}/disable`, {
    init: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword }) },
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to disable user"));
}

export async function enableUser(userId: string): Promise<void> {
  const res = await apiFetch(`/api/admin/users/${userId}/enable`, { init: { method: "POST" } });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to enable user"));
}

export async function revokeUserSessions(userId: string, currentPassword: string): Promise<void> {
  const res = await apiFetch(`/api/admin/users/${userId}/revoke-sessions`, {
    init: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword }) },
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to revoke user sessions"));
}

export async function grantPlatformAdmin(userId: string, currentPassword: string): Promise<void> {
  const res = await apiFetch(`/api/admin/users/${userId}/grant-platform-admin`, {
    init: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword }) },
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to grant platform admin"));
}

export async function revokePlatformAdmin(userId: string, currentPassword: string): Promise<void> {
  const res = await apiFetch(`/api/admin/users/${userId}/revoke-platform-admin`, {
    init: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword }) },
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to revoke platform admin"));
}

export async function fetchInvitations(params: { activeOnly?: boolean; cursor?: string; limit?: number }): Promise<{ invitations: InvitationSummary[]; nextCursor: string | null }> {
  const q = new URLSearchParams();
  if (params.activeOnly) q.set("activeOnly", "true");
  if (params.limit) q.set("limit", String(params.limit));
  if (params.cursor) q.set("cursor", params.cursor);
  const res = await apiFetch(`/api/admin/invitations?${q.toString()}`);
  if (!res.ok) throw new Error(await readApiError(res, "Failed to fetch invitations"));
  return res.json();
}

export async function revokeInvitation(invitationId: string): Promise<void> {
  const res = await apiFetch(`/api/admin/invitations/${invitationId}/revoke`, { init: { method: "POST" } });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to revoke invitation"));
}

export async function fetchAuditLog(params: { action?: string; actorUserId?: string; cursor?: string; limit?: number }): Promise<{ auditLog: AuditLogSummary[]; nextCursor: string | null }> {
  const q = new URLSearchParams();
  if (params.action) q.set("action", params.action);
  if (params.actorUserId) q.set("actorUserId", params.actorUserId);
  if (params.limit) q.set("limit", String(params.limit));
  if (params.cursor) q.set("cursor", params.cursor);
  const res = await apiFetch(`/api/admin/audit-log?${q.toString()}`);
  if (!res.ok) throw new Error(await readApiError(res, "Failed to fetch audit log"));
  return res.json();
}

export async function fetchAdminAnnouncements(params: { cursor?: string; limit?: number }): Promise<{ announcements: AnnouncementSummary[]; nextCursor: string | null }> {
  const q = new URLSearchParams();
  if (params.limit) q.set("limit", String(params.limit));
  if (params.cursor) q.set("cursor", params.cursor);
  const res = await apiFetch(`/api/admin/announcements?${q.toString()}`);
  if (!res.ok) throw new Error(await readApiError(res, "Failed to fetch announcements"));
  return res.json();
}

export async function createAnnouncement(input: AnnouncementInput): Promise<{ announcementId: string }> {
  const res = await apiFetch("/api/admin/announcements", {
    init: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) },
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to create announcement"));
  return res.json();
}

export async function updateAnnouncement(announcementId: string, input: Partial<AnnouncementInput>): Promise<void> {
  const res = await apiFetch(`/api/admin/announcements/${announcementId}`, {
    init: { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) },
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to update announcement"));
}

export async function archiveAnnouncement(announcementId: string): Promise<void> {
  const res = await apiFetch(`/api/admin/announcements/${announcementId}`, { init: { method: "DELETE" } });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to archive announcement"));
}

export async function fetchCampaignTemplateSettings(): Promise<{ templates: CampaignTemplateSetting[] }> {
  const res = await apiFetch("/api/admin/campaign-templates");
  if (!res.ok) throw new Error(await readApiError(res, "Failed to fetch campaign template settings"));
  return res.json();
}

export async function updateCampaignTemplateSettings(templateId: string, input: { isVisible?: boolean; sortOrder?: number; isFeatured?: boolean }): Promise<void> {
  const res = await apiFetch(`/api/admin/campaign-templates/${templateId}`, {
    init: { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) },
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to update campaign template settings"));
}

export async function fetchGameSystemSettings(): Promise<{ systems: GameSystemSetting[] }> {
  const res = await apiFetch("/api/admin/game-systems");
  if (!res.ok) throw new Error(await readApiError(res, "Failed to fetch game system settings"));
  return res.json();
}

export async function updateGameSystemSettings(systemId: string, input: { isEnabledForNewCampaigns?: boolean; sortOrder?: number }): Promise<void> {
  const res = await apiFetch(`/api/admin/game-systems/${systemId}`, {
    init: { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) },
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to update game system settings"));
}
