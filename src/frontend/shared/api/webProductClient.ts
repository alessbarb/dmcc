import { apiFetch, readApiError } from "./apiClient.js";

export interface PlayerCampaignSummary {
  campaignId: string;
  playerId?: string | null;
  title: string;
  coverUrl?: string | null;
}

export interface CampaignSearchResult {
  type: "entity" | "fact" | "relation" | "clue" | "objective" | "note" | "rule";
  item: {
    id: string;
    title?: string;
    summary?: string;
    dmSummary?: string;
    visibility?: string;
    entityId?: string;
    sourceEntityId?: string;
    targetEntityId?: string;
    linkedEntityIds?: string[];
    category?: string;
    subtitle?: string;
    content?: string;
  };
}

export interface PortalCampaignSummary {
  campaignId: string;
  title?: string;
  summary?: string | null;
  status?: string;
}

export interface PortalPlayerSummary {
  playerId: string;
  displayName: string;
}

export interface PortalEntity {
  entityId: string;
  entityType: string;
  typeLabel?: string;
  title: string;
  summary?: string;
  status: string;
  importance: string;
}

export interface PortalFact {
  factId: string;
  statement: string;
  kind: string;
  confidence: string;
}

export interface PortalRelation {
  relationId: string;
  label: string;
  description?: string;
  sourceEntityId: string;
  targetEntityId: string;
}

export interface PortalObjective {
  objectiveId: string;
  title: string;
  description?: string;
  kind: string;
  status: string;
  visibility: string;
  linkedEntityIds: string[];
  playerId: string | null;
}

export interface PortalClue {
  clueId: string;
  entityId: string;
  title: string;
  summary?: string;
  status: string;
}

export interface PortalCanvasNode {
  id: string;
  kind: string;
  entityId?: string;
  factId?: string;
  title?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface PortalCanvasEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationshipId?: string;
  label?: string;
}

export interface PortalCanvas {
  canvasId: string;
  title: string;
  nodes: PortalCanvasNode[];
  edges: PortalCanvasEdge[];
}

export interface PortalHistoryEntry {
  sessionId: string;
  number: number;
  title: string;
  recap: string | null;
  playedDate: string | null;
}

export interface PortalNote {
  noteId: string;
  title: string;
  content: string;
  visibility: string;
  createdAt: string;
  updatedAt: string;
}

export interface LiveTableSummary {
  liveTableId: string;
  campaignId?: string;
  activeSessionId?: string | null;
  shortCode: string;
  status: string;
  expiresAt: string;
  createdAt?: string;
  closedAt?: string | null;
}

export interface CommandCenterAttentionItem {
  type: string;
  count: number;
  label: string;
}

export interface CommandCenterActivityItem {
  campaignId: string;
  activityId: string;
  type: string;
  content: unknown;
  actorUserId?: string | null;
  occurredAt: string;
}

export interface CommandCenterCampaignSummary {
  campaignId: string;
  title: string;
  summary?: string | null;
  status: string;
  metadata?: Record<string, unknown>;
  currentLocationId?: string;
  currentQuestId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommandCenterResponse {
  campaign?: CommandCenterCampaignSummary;
  recap: string | null;
  lastSession: Record<string, unknown> | null;
  nextSession: Record<string, unknown> | null;
  attention: CommandCenterAttentionItem[];
  counts: {
    entities: number;
    facts: number;
    relations: number;
    sessions: number;
    clues: number;
    objectives: number;
    proposals: number;
    hiddenSecrets: number;
  };
  openObjectives: Record<string, unknown>[];
  unresolvedClues: Record<string, unknown>[];
  pendingProposals: Record<string, unknown>[];
  recentActivity: CommandCenterActivityItem[];
}

/**
 * Merged, all-optional shape covering every /api/player/campaigns/:id/<tab> response.
 * Each endpoint returns a different subset of these fields; consumers read them
 * defensively per active tab rather than narrowing a discriminated union.
 */
export interface PlayerPortalTabPayload {
  campaign?: PortalCampaignSummary;
  player?: PortalPlayerSummary;
  recap?: string | null;
  objectives?: PortalObjective[];
  memoryCounts?: Record<string, number>;
  notifications?: unknown[];
  liveTable?: LiveTableSummary | null;
  entities?: Record<string, PortalEntity[]>;
  facts?: PortalFact[];
  relations?: PortalRelation[];
  history?: PortalHistoryEntry[];
  activeThreads?: { quests: PortalEntity[]; cluesAndRumors: PortalEntity[] };
  counts?: Record<string, number>;
  linkedCharacter?: PortalEntity | null;
  sheet?: { status: Record<string, unknown>; resources: Array<Record<string, unknown>> };
  availableCharacters?: PortalEntity[];
  proposals?: unknown[];
  notes?: PortalNote[];
}

export interface PlayerConstellationResponse {
  campaign?: PortalCampaignSummary;
  entities: PortalEntity[];
  facts: PortalFact[];
  relations: PortalRelation[];
  objectives: PortalObjective[];
  clues: PortalClue[];
  canvases: PortalCanvas[];
}

export interface InvitationSummary {
  invitationId: string;
  role: string;
  maxUses: number;
  usesCount: number;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  status: "active" | "revoked" | "expired" | "exhausted";
}

export interface CreatedInvitation {
  invitationId: string;
  url: string;
  token: string;
  expiresAt: string;
}

async function readJson<T>(response: Response, fallback: string): Promise<T> {
  if (!response.ok) throw new Error(await readApiError(response, fallback));
  const data: unknown = await response.json();
  // Trusted API boundary: caller-declared response shape, not runtime-validated here.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return data as T;
}

export async function getCommandCenter(campaignId: string): Promise<CommandCenterResponse> {
  return readJson(
    await apiFetch(`/api/campaigns/${encodeURIComponent(campaignId)}/command-center`),
    "No se pudo cargar el Command Center",
  );
}

export async function searchCampaign(
  campaignId: string,
  query: string,
  signal?: AbortSignal,
): Promise<{ results: CampaignSearchResult[] }> {
  const q = query.trim();
  if (!q) return { results: [] };
  return readJson(
    await apiFetch(`/api/campaigns/${encodeURIComponent(campaignId)}/search?q=${encodeURIComponent(q)}`, {
      init: { signal },
    }),
    "No se pudo buscar en la campaña",
  );
}

export async function searchRules(
  query: string,
  signal?: AbortSignal,
): Promise<{ results: CampaignSearchResult[] }> {
  const q = query.trim();
  if (!q) return { results: [] };
  const response = await readJson<{ results?: Array<Record<string, unknown>> }>(
    await apiFetch(`/api/rules/search?q=${encodeURIComponent(q)}`, { init: { signal } }),
    "No se pudo buscar en las reglas",
  );
  return {
    results: (response.results ?? []).map((rule) => ({
      type: "rule" as const,
      item: {
        id: String(rule.id),
        title: typeof rule.title === "string" ? rule.title : undefined,
        subtitle: typeof rule.subtitle === "string" ? rule.subtitle : undefined,
        summary: typeof rule.content === "string" ? rule.content : undefined,
        content: typeof rule.content === "string" ? rule.content : undefined,
        category: typeof rule.category === "string" ? rule.category : undefined,
      },
    })),
  };
}

export async function getLiveTable(campaignId: string): Promise<{ liveTable: LiveTableSummary | null }> {
  return readJson(
    await apiFetch(`/api/campaigns/${encodeURIComponent(campaignId)}/live-tables/current`),
    "No se pudo cargar el modo mesa",
  );
}

export async function openLiveTable(
  campaignId: string,
  input: { activeSessionId?: string | null; durationHours?: number } = {},
): Promise<{ liveTable: LiveTableSummary }> {
  return readJson(
    await apiFetch(`/api/campaigns/${encodeURIComponent(campaignId)}/live-tables`, {
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
    }),
    "No se pudo abrir el modo mesa",
  );
}

export async function closeLiveTable(campaignId: string, liveTableId: string): Promise<void> {
  await readJson(
    await apiFetch(
      `/api/campaigns/${encodeURIComponent(campaignId)}/live-tables/${encodeURIComponent(liveTableId)}/close`,
      { init: { method: "POST" } },
    ),
    "No se pudo cerrar el modo mesa",
  );
}

export async function listInvitations(campaignId: string): Promise<{ invitations: InvitationSummary[] }> {
  return readJson(
    await apiFetch(`/api/campaigns/${encodeURIComponent(campaignId)}/invitations`),
    "No se pudieron cargar las invitaciones",
  );
}

export async function createInvitation(
  campaignId: string,
  input: { role?: string; maxUses?: number; expiresInHours?: number; label?: string } = {},
): Promise<{ invitation: CreatedInvitation }> {
  return readJson(
    await apiFetch(`/api/campaigns/${encodeURIComponent(campaignId)}/invitations`, {
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
    }),
    "No se pudo crear la invitación",
  );
}

export async function revokeInvitation(campaignId: string, invitationId: string): Promise<void> {
  await readJson(
    await apiFetch(
      `/api/campaigns/${encodeURIComponent(campaignId)}/invitations/${encodeURIComponent(invitationId)}/revoke`,
      { init: { method: "POST" } },
    ),
    "No se pudo revocar la invitación",
  );
}

export async function getPlayerCampaigns(): Promise<{ campaigns: PlayerCampaignSummary[] }> {
  return readJson(await apiFetch("/api/player/campaigns"), "No se pudieron cargar las campañas del jugador");
}

export async function getPlayerHome(campaignId: string): Promise<PlayerPortalTabPayload> {
  return readJson(
    await apiFetch(`/api/player/campaigns/${encodeURIComponent(campaignId)}/home`),
    "No se pudo cargar el portal",
  );
}

export async function getPlayerMemory(campaignId: string): Promise<PlayerPortalTabPayload> {
  return readJson(
    await apiFetch(`/api/player/campaigns/${encodeURIComponent(campaignId)}/memory`),
    "No se pudo cargar la memoria del jugador",
  );
}

export async function getPlayerConstellation(campaignId: string): Promise<PlayerConstellationResponse> {
  return readJson(
    await apiFetch(`/api/player/campaigns/${encodeURIComponent(campaignId)}/constellation`),
    "No se pudo cargar la constelación del jugador",
  );
}

export async function getPlayerCharacter(campaignId: string): Promise<PlayerPortalTabPayload> {
  return readJson(
    await apiFetch(`/api/player/campaigns/${encodeURIComponent(campaignId)}/character`),
    "No se pudo cargar el personaje",
  );
}

export async function getPlayerObjectives(campaignId: string): Promise<PlayerPortalTabPayload> {
  return readJson(
    await apiFetch(`/api/player/campaigns/${encodeURIComponent(campaignId)}/objectives`),
    "No se pudieron cargar los objetivos",
  );
}

export async function getPlayerRecap(campaignId: string): Promise<PlayerPortalTabPayload> {
  return readJson(
    await apiFetch(`/api/player/campaigns/${encodeURIComponent(campaignId)}/recap`),
    "No se pudo cargar el recap",
  );
}

export async function getPlayerNotes(campaignId: string): Promise<PlayerPortalTabPayload> {
  return readJson(
    await apiFetch(`/api/player/campaigns/${encodeURIComponent(campaignId)}/notes`),
    "No se pudieron cargar las notas",
  );
}

export async function createPlayerNote(
  campaignId: string,
  input: { content: string; visibility?: string },
): Promise<{ ok: true; noteId: string }> {
  return readJson(
    await apiFetch(`/api/campaigns/${encodeURIComponent(campaignId)}/player-portal/notes`, {
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
    }),
    "No se pudo guardar la nota",
  );
}

export async function requestPlayerCharacterLink(
  campaignId: string,
  input: { characterEntityId: string; characterTitle?: string },
): Promise<{ ok: true; proposalId: string }> {
  return readJson(
    await apiFetch(`/api/campaigns/${encodeURIComponent(campaignId)}/player-portal/proposals`, {
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "link_request",
          type: "link_request",
          targetCharacterEntityId: input.characterEntityId,
          characterEntityId: input.characterEntityId,
          characterTitle: input.characterTitle,
        }),
      },
    }),
    "No se pudo solicitar la vinculación del personaje",
  );
}

export async function searchPlayerCampaign(
  campaignId: string,
  query: string,
  signal?: AbortSignal,
): Promise<{ results: CampaignSearchResult[] }> {
  const q = query.trim();
  if (!q) return { results: [] };
  return readJson(
    await apiFetch(`/api/player/campaigns/${encodeURIComponent(campaignId)}/search?q=${encodeURIComponent(q)}`, {
      init: { signal },
    }),
    "No se pudo buscar en el portal",
  );
}

export interface CampaignHistoryResponse {
  entries: {
    activityId: string;
    campaignId: string;
    sourceKind: "domain_event" | "operation";
    sourceId: string;
    type: string;
    category: "session" | "content" | "knowledge" | "story" | "people" | "collaboration" | "operation";
    data: Record<string, unknown>;
    actorUserId?: string | null;
    sessionId?: string | null;
    targetType?: string | null;
    targetId?: string | null;
    occurredAt: string;
  }[];
  nextCursor?: string;
}

export async function getCampaignHistory(
  campaignId: string,
  filters: {
    category?: string;
    actorUserId?: string;
    sessionId?: string;
    targetType?: string;
    targetId?: string;
    cursor?: string;
    limit?: number;
  } = {},
  signal?: AbortSignal,
): Promise<CampaignHistoryResponse> {
  const params = new URLSearchParams();
  if (filters.category) params.append("category", filters.category);
  if (filters.actorUserId) params.append("actorUserId", filters.actorUserId);
  if (filters.sessionId) params.append("sessionId", filters.sessionId);
  if (filters.targetType) params.append("targetType", filters.targetType);
  if (filters.targetId) params.append("targetId", filters.targetId);
  if (filters.cursor) params.append("cursor", filters.cursor);
  if (filters.limit !== undefined) params.append("limit", String(filters.limit));

  const queryStr = params.toString() ? `?${params.toString()}` : "";
  return readJson(
    await apiFetch(`/api/campaigns/${encodeURIComponent(campaignId)}/history${queryStr}`, { init: { signal } }),
    "No se pudo cargar el historial de la campaña",
  );
}
