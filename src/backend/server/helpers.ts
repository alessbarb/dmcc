import * as path from "node:path";

type PathLike = Pick<typeof path, "isAbsolute" | "relative" | "resolve">;

export function slugifyTitle(title: string): string {
  return title
    .replace(/[/\\]/g, "-")
    .replace(/\.\./g, "-")
    .replace(/[<>:"|?*\x00-\x1f]/g, "")
    .replace(/^\.+/, "")
    .slice(0, 120)
    .trim() || "entity";
}

export function isPathWithinDir(
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

export function getStoredAccessCode(state: any, _campaignId: string): string | null {
  // Only return explicitly persisted previous cleartext codes.
  // New campaigns persist only localAccessCodeHash, so the cleartext code is available
  // exclusively during the web toggle response and the current process lifetime.
  return state?.campaign?.settings?.localAccessCode ?? null;
}

export function getCharacterEntityIdForPlayer(entities: any[], playerId: string): string | undefined {
  const character = entities.find(
    (e: any) => e.entityType === "player_character" && e.metadata?.playerId === playerId
  );
  return character?.entityId;
}

export function getVisibleEntities(
  entities: any[],
  role: string,
  playerId?: string,
  characterEntityId?: string
) {
  return entities.filter((e: any) => {
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

export function getVisibleRelations(
  relations: any[],
  visibleEntityIds: Set<string>,
  role: string,
  playerId?: string,
  characterEntityId?: string
) {
  return relations.filter((r: any) => {
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
    return visibleEntityIds.has(r.sourceEntityId) && visibleEntityIds.has(r.targetEntityId);
  });
}

export function getVisibleFacts(
  facts: any[],
  role: string,
  playerId?: string,
  characterEntityId?: string
) {
  return facts.filter((f: any) => {
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

export function getVisibleSessions(sessions: any[], role: string) {
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

export function toPublicCampaign(campaign: any) {
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
