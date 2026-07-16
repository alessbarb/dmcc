import type { FastifyRequest } from "fastify";
import { and, eq, isNull, sql } from "drizzle-orm";
import { createId } from "@shared/ids.js";
import { db } from "../../db/client.js";
import * as schema from "../../db/schema.js";
import { getRequiredWebUser, type WebUser } from "./webSession.js";
import { HttpError } from "../errors.js";

export type AccessibleCampaignRow = typeof schema.campaigns.$inferSelect & {
  role: typeof schema.campaignMemberships.$inferSelect["role"];
  playerId: string | null;
};

export type CampaignAccessMembership = typeof schema.campaignMemberships.$inferSelect;

export function isDmRole(role?: string | null): boolean {
  return role === "dm" || role === "co_dm";
}

function getExpectedAuthErrorStatusCode(error: unknown): 401 | 403 | null {
  if (error instanceof HttpError) {
    return error.statusCode === 401 || error.statusCode === 403 ? error.statusCode : null;
  }
  if (error instanceof Error && "statusCode" in error) {
    const statusCode = (error as { statusCode?: unknown }).statusCode;
    return statusCode === 401 || statusCode === 403 ? statusCode : null;
  }
  return null;
}

function getSafeErrorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : "Authentication required";
}

export async function ensureDefaultWorkspace(user: WebUser): Promise<string> {
  const existing = await db
    .select({ workspaceId: schema.workspaceMemberships.workspaceId })
    .from(schema.workspaceMemberships)
    .where(eq(schema.workspaceMemberships.userId, user.userId))
    .limit(1);
  if (existing[0]) return existing[0].workspaceId;

  const workspaceId = createId("wks");
  await db.transaction(async (tx) => {
    await tx.insert(schema.workspaces).values({
      workspaceId,
      name: `${user.displayName}'s workspace`,
      ownerId: user.userId,
    });
    await tx.insert(schema.workspaceMemberships).values({
      workspaceId,
      userId: user.userId,
      role: "owner",
    });
  });
  return workspaceId;
}

export async function getMembership(campaignId: string, userId: string): Promise<CampaignAccessMembership | undefined> {
  const [membership] = await db
    .select()
    .from(schema.campaignMemberships)
    .where(and(
      eq(schema.campaignMemberships.campaignId, campaignId),
      eq(schema.campaignMemberships.userId, userId),
      isNull(schema.campaignMemberships.revokedAt),
    ))
    .limit(1);
  return membership;
}

export async function requireCampaignMembership(request: FastifyRequest, campaignId: string) {
  const user = getRequiredWebUser(request);
  const membership = await getMembership(campaignId, user.userId);
  if (!membership) throw new HttpError("Campaign membership required", 403);
  return { user, membership };
}

export async function requireCampaignRole(request: FastifyRequest, campaignId: string, roles: string[]) {
  const context = await requireCampaignMembership(request, campaignId);
  if (!roles.includes(context.membership.role)) {
    throw new HttpError("Forbidden: insufficient campaign role", 403);
  }
  return context;
}

export async function requireCampaignOwner(request: FastifyRequest, campaignId: string) {
  const context = await requireCampaignRole(request, campaignId, ["dm", "co_dm"]);
  const [campaign] = await db.select({ ownerId: schema.campaigns.ownerId })
    .from(schema.campaigns)
    .where(eq(schema.campaigns.campaignId, campaignId))
    .limit(1);
  if (!campaign || campaign.ownerId !== context.user.userId) {
    throw new HttpError("Forbidden: campaign owner required", 403);
  }
  return context;
}

export async function listAccessibleCampaigns(userId: string): Promise<AccessibleCampaignRow[]> {
  const rows = await db
    .select({ campaign: schema.campaigns, membership: schema.campaignMemberships })
    .from(schema.campaignMemberships)
    .innerJoin(schema.campaigns, eq(schema.campaignMemberships.campaignId, schema.campaigns.campaignId))
    .where(and(
      eq(schema.campaignMemberships.userId, userId),
      isNull(schema.campaignMemberships.revokedAt),
      sql`${schema.campaigns.status} <> 'trashed'`,
      sql`${schema.campaigns.status} <> 'importing'`,
    ));

  return rows.map((row) => ({
    ...row.campaign,
    role: row.membership.role,
    playerId: row.membership.playerId ?? null,
  }));
}

export function getRequiredPlatformAdmin(request: FastifyRequest): WebUser {
  const user = getRequiredWebUser(request);
  if (!user.roles.includes("admin")) {
    throw new HttpError("Platform administrator access required", 403);
  }
  return user;
}
