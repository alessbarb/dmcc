import * as path from "node:path";

type PathLike = Pick<typeof path, "isAbsolute" | "relative" | "resolve">;

// These generic visibility-filtering helpers are not currently wired into any route (superseded
// by server-side filtering in the web routes); they accept a loosely-shaped structural type
// rather than a strict domain type since callers may pass either raw domain objects or DTOs
// that only share these fields.
interface VisibilityLike {
  kind?: string;
  playerIds?: string[];
  characterEntityIds?: string[];
}

interface EntityLike {
  entityId?: string;
  entityType?: string;
  archived?: boolean;
  visibility?: VisibilityLike;
  metadata?: Record<string, unknown>;
}

interface RelationLike {
  archived?: boolean;
  visibility?: VisibilityLike;
  sourceEntityId?: string;
  targetEntityId?: string;
}

interface FactLike {
  archived?: boolean;
  visibility?: VisibilityLike;
}

interface SessionLike {
  sessionId?: string;
  id?: string;
  number?: number;
  title?: string;
  status?: string;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  playerSummary?: string;
}

interface CampaignLike {
  campaignId?: string;
  title?: string;
  summary?: string;
  system?: string;
  status?: string;
  archived?: boolean;
}



export function slugifyTitle(title: string): string {
  return title
    .replace(/[/\\]/g, "-")
    .replace(/\.\./g, "-")
    .replace(/[<>:"|?*\x00-\x1f]/g, "")
    .replace(/^\.+/, "")
    .slice(0, 120)
    .trim() || "entity";
}

function isPathWithinDir(
  filePath: string,
  allowedDir: string,
  pathApi: PathLike = path,
): boolean {
  const resolved = pathApi.resolve(filePath);
  const allowedResolved = pathApi.resolve(allowedDir);
  const relativePath = pathApi.relative(allowedResolved, resolved);

  return (
    relativePath === "" ||
    (!relativePath.startsWith("..") && !pathApi.isAbsolute(relativePath))
  );
}

export function assertWithinDir(filePath: string, allowedDir: string): void {
  if (!isPathWithinDir(filePath, allowedDir)) {
    throw new Error("Path traversal detected");
  }
}



function getCharacterEntityIdForPlayer(entities: EntityLike[], playerId: string): string | undefined {
  const character = entities.find(
    (e) => e.entityType === "player_character" && e.metadata?.playerId === playerId
  );
  return character?.entityId;
}

function getVisibleEntities(
  entities: EntityLike[],
  role: string,
  playerId?: string,
  characterEntityId?: string
) {
  return entities.filter((e) => {
    if (e.archived) return false;
    if (role === "dm") return true;

    if (role === "player" && e.entityId === characterEntityId) return true;

    const kind = e.visibility?.kind || "dm_only";
    if (kind === "dm_only") return false;
    if (kind === "party" || kind === "public") return true;
    if (role === "player") {
      if (kind === "players" && playerId && e.visibility?.playerIds?.includes(playerId)) return true;
      if (kind === "characters" && characterEntityId && e.visibility?.characterEntityIds?.includes(characterEntityId)) return true;
    }
    return false;
  });
}

function getVisibleRelations(
  relations: RelationLike[],
  visibleEntityIds: Set<string>,
  role: string,
  playerId?: string,
  characterEntityId?: string
) {
  return relations.filter((r) => {
    if (r.archived) return false;
    if (role === "dm") return true;
    const kind = r.visibility?.kind || "dm_only";
    if (kind === "dm_only") return false;
    if (kind === "players") {
      if (!playerId || !r.visibility?.playerIds?.includes(playerId)) return false;
    }
    if (kind === "characters") {
      if (!characterEntityId || !r.visibility?.characterEntityIds?.includes(characterEntityId)) return false;
    }
    return Boolean(r.sourceEntityId && r.targetEntityId && visibleEntityIds.has(r.sourceEntityId) && visibleEntityIds.has(r.targetEntityId));
  });
}

function getVisibleFacts(
  facts: FactLike[],
  role: string,
  playerId?: string,
  characterEntityId?: string
) {
  return facts.filter((f) => {
    if (f.archived) return false;
    if (role === "dm") return true;
    const kind = f.visibility?.kind || "dm_only";
    if (kind === "dm_only") return false;
    if (kind === "party" || kind === "public") return true;
    if (role === "player") {
      if (kind === "players" && playerId && f.visibility?.playerIds?.includes(playerId)) return true;
      if (kind === "characters" && characterEntityId && f.visibility?.characterEntityIds?.includes(characterEntityId)) return true;
    }
    return false;
  });
}

function getVisibleSessions(sessions: SessionLike[], role: string) {
  if (role === "dm") return sessions;

  return sessions
    .filter((session) => session.status === "active" || session.status === "completed" || session.status === "closed")
    .map((session) => ({
      sessionId: session.sessionId ?? session.id,
      ...(session.number !== undefined && { number: session.number }),
      ...(session.title !== undefined && { title: session.title }),
      status: session.status,
      ...(session.scheduledAt !== undefined && { scheduledAt: session.scheduledAt }),
      ...(session.startedAt !== undefined && { startedAt: session.startedAt }),
      ...(session.endedAt !== undefined && { endedAt: session.endedAt }),
      ...(session.playerSummary !== undefined && { playerSummary: session.playerSummary }),
    }));
}

function toPublicCampaign(campaign: CampaignLike | null | undefined) {
  if (!campaign) return null;
  return {
    campaignId: campaign.campaignId,
    title: campaign.title,
    ...(campaign.summary !== undefined && { summary: campaign.summary }),
    ...(campaign.system !== undefined && { system: campaign.system }),
    ...(campaign.status !== undefined && { status: campaign.status }),
    ...(campaign.archived !== undefined && { archived: campaign.archived }),
  };
}
