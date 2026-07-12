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

async function readJson<T>(response: Response, fallback: string): Promise<T> {
  if (!response.ok) throw new Error(await readApiError(response, fallback));
  return response.json() as Promise<T>;
}

export async function getCommandCenter(campaignId: string): Promise<any> {
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
    results: (response.results ?? []).map((rule: any) => ({
      type: "rule" as const,
      item: {
        id: String(rule.id),
        title: rule.title,
        subtitle: rule.subtitle,
        summary: rule.content,
        content: rule.content,
        category: rule.category,
      },
    })),
  };
}

export async function getLiveTable(campaignId: string): Promise<{ liveTable: any | null }> {
  return readJson(
    await apiFetch(`/api/campaigns/${encodeURIComponent(campaignId)}/live-tables/current`),
    "No se pudo cargar el modo mesa",
  );
}

export async function openLiveTable(
  campaignId: string,
  input: { activeSessionId?: string | null; durationHours?: number } = {},
): Promise<{ liveTable: any }> {
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

export async function listInvitations(campaignId: string): Promise<{ invitations: any[] }> {
  return readJson(
    await apiFetch(`/api/campaigns/${encodeURIComponent(campaignId)}/invitations`),
    "No se pudieron cargar las invitaciones",
  );
}

export async function createInvitation(
  campaignId: string,
  input: { role?: string; maxUses?: number; expiresInHours?: number; label?: string } = {},
): Promise<{ invitation: any }> {
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

export async function getPlayerHome(campaignId: string): Promise<any> {
  return readJson(
    await apiFetch(`/api/player/campaigns/${encodeURIComponent(campaignId)}/home`),
    "No se pudo cargar el portal",
  );
}

export async function getPlayerMemory(campaignId: string): Promise<any> {
  return readJson(
    await apiFetch(`/api/player/campaigns/${encodeURIComponent(campaignId)}/memory`),
    "No se pudo cargar la memoria del jugador",
  );
}

export async function getPlayerConstellation(campaignId: string): Promise<any> {
  return readJson(
    await apiFetch(`/api/player/campaigns/${encodeURIComponent(campaignId)}/constellation`),
    "No se pudo cargar la constelación del jugador",
  );
}

export async function getPlayerCharacter(campaignId: string): Promise<any> {
  return readJson(
    await apiFetch(`/api/player/campaigns/${encodeURIComponent(campaignId)}/character`),
    "No se pudo cargar el personaje",
  );
}

export async function getPlayerObjectives(campaignId: string): Promise<{ objectives: any[] }> {
  return readJson(
    await apiFetch(`/api/player/campaigns/${encodeURIComponent(campaignId)}/objectives`),
    "No se pudieron cargar los objetivos",
  );
}

export async function getPlayerRecap(campaignId: string): Promise<any> {
  return readJson(
    await apiFetch(`/api/player/campaigns/${encodeURIComponent(campaignId)}/recap`),
    "No se pudo cargar el recap",
  );
}

export async function getPlayerNotes(campaignId: string): Promise<{ notes: any[] }> {
  return readJson(
    await apiFetch(`/api/player/campaigns/${encodeURIComponent(campaignId)}/notes`),
    "No se pudieron cargar las notas",
  );
}

export async function getPlayerProposals(campaignId: string): Promise<{ proposals: any[] }> {
  return readJson(
    await apiFetch(`/api/player/campaigns/${encodeURIComponent(campaignId)}/proposals`),
    "No se pudieron cargar las propuestas",
  );
}

export async function createPlayerNote(
  campaignId: string,
  input: { content: string; visibility?: string },
): Promise<any> {
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

export async function createPlayerProposal(campaignId: string, input: any): Promise<any> {
  return readJson(
    await apiFetch(`/api/campaigns/${encodeURIComponent(campaignId)}/player-portal/proposals`, {
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
    }),
    "No se pudo enviar la propuesta",
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
