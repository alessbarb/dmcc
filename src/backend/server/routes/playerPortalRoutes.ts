import type { FastifyInstance } from "fastify";
import { randomBytes } from "crypto";
import type { CampaignRepository } from "@core/persistence/repositories/campaignRepository.js";
import { makeRepositoryFactory } from "../repositoryFactory.js";
import { buildPlayerPortalProjection } from "@core/projections/playerPortalProjection.js";
import { getRuleSystem } from "@core/domain/rules/index.js";
import { createId } from "@shared/ids.js";
import {
  assertDM,
  getValidatedVaultId,
  getValidatedCampaignId,
  getRequestActorId,
  hashPlayerToken,
} from "../auth.js";
import { sendCommandError } from "../commandHttp.js";

type StatusBody = {
  characterEntityId?: string;
  hitPointsCurrent?: number;
  hitPointsMax?: number;
  armorClass?: number;
  inspiration?: boolean;
  conditions?: string[];
};

type ResourceRecovery = "short_rest" | "long_rest" | "manual";

type ResourceBody = {
  resourceId?: string;
  characterEntityId?: string;
  label?: string;
  current?: number;
  max?: number;
  recovery?: ResourceRecovery | string;
};

type NoteBody = {
  visibility?: "private" | "dm_visible";
  title?: string;
  content?: string;
  linkedEntityIds?: string[];
  archived?: boolean;
};

type ObjectiveBody = {
  visibility?: "private" | "dm_visible";
  title?: string;
  description?: string;
  kind?: "personal" | "session" | "question_for_dm";
  status?: "open" | "done" | "archived";
  linkedEntityIds?: string[];
};

type LinkBody = {
  playerId?: string;
  characterEntityId?: string;
  ownership?: "campaign_premade" | "player_owned";
  syncMode?: "live_player_editable" | "dm_review_required";
};

type ProposalBody = {
  kind?: "create_character" | "update_character_core" | "link_request";
  targetCharacterEntityId?: string;
  proposedChanges?: Record<string, unknown>;
};

type ResolveProposalBody = {
  status?: "approved" | "rejected";
  dmResolutionNote?: string;
};

export async function registerPlayerPortalRoutes(
  server: FastifyInstance,
  opts: { dataDir: string }
) {
  const { dataDir } = opts;

  const getRepository = makeRepositoryFactory(dataDir);

  async function requirePlayerFromToken(
    repository: CampaignRepository,
    campaignId: string,
    rawToken: string | undefined,
    membershipPlayerId?: string
  ) {
    if (membershipPlayerId) {
      const state = await repository.getCampaignState(campaignId);
      const events = await repository.loadEvents(campaignId);
      return {
        state,
        portal: buildPlayerPortalProjection(state, events),
        playerId: membershipPlayerId,
      };
    }
    if (!server.allowLegacyTestAuth) {
      throw Object.assign(new Error("Player campaign membership is required"), { statusCode: 401 });
    }
    if (!rawToken) {
      throw Object.assign(new Error("Player token is required"), { statusCode: 401 });
    }

    const state = await repository.getCampaignState(campaignId);
    const events = await repository.loadEvents(campaignId);
    const portal = buildPlayerPortalProjection(state, events);
    const token = portal.tokensByHash.get(hashPlayerToken(rawToken));

    if (!token || token.revokedAt) {
      throw Object.assign(new Error("Invalid player token"), { statusCode: 401 });
    }

    return { state, portal, playerId: token.playerId };
  }

  function toPublicCharacter(e: any) {
    return {
      entityId: e.entityId,
      title: e.title,
      subtitle: e.subtitle,
      summary: e.summary,
      content: e.content,
      status: e.status,
      metadata: e.metadata ?? {},
    };
  }

  function getLinkedCharacterIdForPlayer(portal: any, playerId: string, requestedCharacterEntityId?: string): string {
    const link = portal.linksByPlayerId.get(playerId);
    if (!link?.characterEntityId) {
      throw Object.assign(new Error("Player has no linked character yet"), { statusCode: 409 });
    }

    if (requestedCharacterEntityId && requestedCharacterEntityId !== link.characterEntityId) {
      throw Object.assign(new Error("Player cannot update another character"), { statusCode: 403 });
    }

    return link.characterEntityId;
  }

  function getCharacterLinkedToAnotherPlayer(portal: any, characterEntityId: string, playerId?: string): any | null {
    for (const link of portal.linksByPlayerId.values()) {
      if (link.characterEntityId === characterEntityId && link.playerId !== playerId) {
        return link;
      }
    }
    return null;
  }

  function assertCharacterCanBeLinked(state: any, portal: any, playerId: string, characterEntityId: string) {
    const entity = state.entities.get(characterEntityId);
    if (!entity || entity.entityType !== "player_character" || entity.archived) {
      throw Object.assign(new Error("Target entity is not an active player_character"), { statusCode: 400 });
    }

    const visibilityKind = entity.visibility?.kind ?? entity.visibility?.mode;
    if (visibilityKind !== "party" && visibilityKind !== "public") {
      throw Object.assign(new Error("Target character is not visible to players"), { statusCode: 400 });
    }

    // A player may request a different available character; the DM approval is the
    // explicit decision point that replaces any legacy soft link or prior link.
    // Only block when the target character already belongs to someone else.
    const otherLink = getCharacterLinkedToAnotherPlayer(portal, characterEntityId, playerId);
    if (otherLink) {
      throw Object.assign(new Error("Character is already linked to another player"), { statusCode: 409 });
    }

    return entity;
  }

  function asTrimmedString(value: unknown, fallback = ""): string {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
  }

  function asInteger(value: unknown, fallback: number): number {
    const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function normalizeRecovery(value: unknown, fallback: ResourceRecovery = "manual"): ResourceRecovery {
    if (value === "short_rest" || value === "long_rest" || value === "manual") {
      return value;
    }

    const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
    if (["short", "short rest", "descanso corto", "corto"].includes(normalized)) return "short_rest";
    if (["long", "long rest", "descanso largo", "largo"].includes(normalized)) return "long_rest";
    return fallback;
  }

  function buildInitialStatusFromMetadata(metadata: Record<string, unknown>) {
    return {
      hitPointsCurrent: asInteger(metadata.hitPointsCurrent, asInteger(metadata.hitPointsMax, 10)),
      hitPointsMax: asInteger(metadata.hitPointsMax, 10),
      armorClass: asInteger(metadata.armorClass, 10),
      inspiration: false,
      conditions: [] as string[],
    };
  }


  function visibilityKind(item: any): string {
    return item?.visibility?.kind ?? item?.visibility?.mode ?? "dm_only";
  }

  function canPlayerSee(item: any, playerId: string, characterEntityId?: string | null): boolean {
    const visibility = item?.visibility ?? { kind: "dm_only" };
    const kind = visibility.kind ?? visibility.mode ?? "dm_only";

    if (kind === "public" || kind === "party") return true;
    if (kind === "players") return Array.isArray(visibility.playerIds) && visibility.playerIds.includes(playerId);
    if (kind === "characters") {
      return Boolean(
        characterEntityId &&
          Array.isArray(visibility.characterEntityIds) &&
          visibility.characterEntityIds.includes(characterEntityId)
      );
    }

    return false;
  }

  function textExcerpt(value: unknown, max = 420): string | undefined {
    if (typeof value !== "string") return undefined;
    const normalized = value.replace(/\s+/g, " ").trim();
    if (!normalized) return undefined;
    return normalized.length > max ? `${normalized.slice(0, max - 1)}…` : normalized;
  }

  function memoryEntityTypeLabel(entityType: string): string {
    const labels: Record<string, string> = {
      npc: "PNJ",
      location: "Lugar",
      faction: "Facción",
      quest: "Misión",
      clue: "Pista",
      rumor: "Rumor",
      item: "Objeto",
      creature: "Criatura",
      scene: "Escena",
      handout: "Documento",
      note: "Nota",
    };
    return labels[entityType] ?? entityType.replace(/_/g, " ");
  }

  function relationLabel(relation: any): string {
    return (relation.label || relation.relationType || relation.type || "relacionado con")
      .replace(/^custom:/, "")
      .replace(/_/g, " ");
  }

  function toMemoryEntity(entity: any) {
    return {
      entityId: entity.entityId,
      entityType: entity.entityType,
      typeLabel: memoryEntityTypeLabel(entity.entityType),
      title: entity.title,
      subtitle: entity.subtitle,
      summary: textExcerpt(entity.summary ?? entity.content),
      content: textExcerpt(entity.content, 720),
      status: entity.status,
      importance: entity.importance ?? "normal",
      visibility: visibilityKind(entity),
      firstSeenSessionId: entity.firstSeenSessionId,
      lastSeenSessionId: entity.lastSeenSessionId,
      updatedAt: entity.updatedAt ?? entity.createdAt,
    };
  }

  function sortByImportanceAndTitle(a: any, b: any): number {
    const rank: Record<string, number> = { critical: 0, high: 1, normal: 2, low: 3 };
    const ar = rank[a.importance ?? "normal"] ?? 2;
    const br = rank[b.importance ?? "normal"] ?? 2;
    if (ar !== br) return ar - br;
    return String(a.title ?? "").localeCompare(String(b.title ?? ""), "es");
  }

  function buildPlayerCampaignMemory(state: any, playerId: string, characterEntityId?: string | null) {
    const visibleEntities = Array.from(state.entities.values())
      .filter((entity: any) => !entity.archived && canPlayerSee(entity, playerId, characterEntityId))
      .map(toMemoryEntity)
      .sort(sortByImportanceAndTitle);

    const visibleEntityIds = new Set(visibleEntities.map((entity: any) => entity.entityId));
    const entitiesById = new Map(visibleEntities.map((entity: any) => [entity.entityId, entity]));
    const byType = (types: string[]) => visibleEntities.filter((entity: any) => types.includes(entity.entityType));

    const facts = Array.from(state.facts.values())
      .filter((fact: any) => {
        if (fact.archived || !canPlayerSee(fact, playerId, characterEntityId)) return false;
        const relatedIds = Array.isArray(fact.relatedEntityIds) ? fact.relatedEntityIds : [];
        return relatedIds.length === 0 || relatedIds.some((id: string) => visibleEntityIds.has(id));
      })
      .sort((a: any, b: any) => String(b.updatedAt ?? b.createdAt ?? "").localeCompare(String(a.updatedAt ?? a.createdAt ?? "")))
      .slice(0, 30)
      .map((fact: any) => ({
        factId: fact.factId,
        statement: fact.statement,
        kind: fact.kind,
        confidence: fact.confidence,
        relatedEntities: (fact.relatedEntityIds ?? [])
          .map((id: string) => entitiesById.get(id))
          .filter(Boolean)
          .map((entity: any) => ({ entityId: entity.entityId, title: entity.title, entityType: entity.entityType })),
        updatedAt: fact.updatedAt ?? fact.createdAt,
      }));

    const relations = Array.from(state.relations.values())
      .filter((relation: any) => {
        if (relation.archived || !canPlayerSee(relation, playerId, characterEntityId)) return false;
        return visibleEntityIds.has(relation.sourceEntityId) && visibleEntityIds.has(relation.targetEntityId);
      })
      .slice(0, 40)
      .map((relation: any) => ({
        relationId: relation.relationId,
        label: relationLabel(relation),
        description: textExcerpt(relation.description, 280),
        status: relation.status,
        source: entitiesById.get(relation.sourceEntityId),
        target: entitiesById.get(relation.targetEntityId),
        updatedAt: relation.updatedAt ?? relation.createdAt,
      }))
      .filter((relation: any) => relation.source && relation.target);

    const visibleSessionEvents = Array.from(state.sessionEvents.values())
      .filter((event: any) => !event.archived && canPlayerSee(event, playerId, characterEntityId))
      .sort((a: any, b: any) => String(a.occurredAt ?? "").localeCompare(String(b.occurredAt ?? "")));

    const sessionEventsBySessionId = new Map<string, any[]>();
    for (const event of visibleSessionEvents as any[]) {
      const list = sessionEventsBySessionId.get(event.sessionId) ?? [];
      list.push({
        eventId: event.id,
        type: event.type,
        title: event.title,
        description: textExcerpt(event.description, 360),
        occurredAt: event.occurredAt,
        relatedEntities: (event.relatedEntityIds ?? [])
          .map((id: string) => entitiesById.get(id))
          .filter(Boolean)
          .map((entity: any) => ({ entityId: entity.entityId, title: entity.title, entityType: entity.entityType })),
      });
      sessionEventsBySessionId.set(event.sessionId, list);
    }

    const history = Array.from(state.sessions.values())
      .filter((session: any) => !session.archived)
      .sort((a: any, b: any) => (Number(b.number ?? 0) - Number(a.number ?? 0)) || String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? "")))
      .map((session: any) => {
        const events = sessionEventsBySessionId.get(session.sessionId ?? session.id) ?? [];
        return {
          sessionId: session.sessionId ?? session.id,
          number: session.number,
          title: session.title,
          status: session.status,
          scheduledAt: session.scheduledAt,
          startedAt: session.startedAt,
          endedAt: session.endedAt,
          playerSummary: textExcerpt(session.playerSummary, 900),
          events,
        };
      })
      .filter((session: any) => session.playerSummary || session.events.length > 0 || session.status === "active")
      .slice(0, 12);

    const quests = byType(["quest"]).filter((entity: any) => entity.status !== "done" && entity.status !== "completed" && entity.status !== "archived");
    const cluesAndRumors = byType(["clue", "rumor"]).slice(0, 12);

    return {
      entities: {
        characters: byType(["player_character"]),
        npcs: byType(["npc", "creature"]),
        locations: byType(["location", "scene"]),
        factions: byType(["faction"]),
        quests,
        clues: byType(["clue"]),
        rumors: byType(["rumor"]),
        items: byType(["item", "handout"]),
        all: visibleEntities,
      },
      activeThreads: {
        quests: quests.slice(0, 8),
        cluesAndRumors,
      },
      facts,
      relations,
      history,
      counts: {
        visibleEntities: visibleEntities.length,
        facts: facts.length,
        relations: relations.length,
        historyEntries: history.length,
      },
    };
  }

  function buildCharacterEntityFromCreateProposal(options: {
    campaignId: string;
    playerId: string;
    proposalId: string;
    campaignSystem?: string;
    proposedChanges: Record<string, unknown>;
  }) {
    const { campaignId, playerId, proposalId, campaignSystem, proposedChanges } = options;
    const rules = getRuleSystem(campaignSystem);
    const initial = rules.getInitialCharacterMetadata();
    const nestedMetadata =
      proposedChanges.metadata && typeof proposedChanges.metadata === "object" && !Array.isArray(proposedChanges.metadata)
        ? (proposedChanges.metadata as Record<string, unknown>)
        : {};

    const title = asTrimmedString(proposedChanges.title, asTrimmedString(proposedChanges.name, "Nuevo personaje"));
    const className = asTrimmedString(proposedChanges.className, asTrimmedString((proposedChanges as any).class, asTrimmedString(nestedMetadata.className, initial.className ?? "Aventurero")));
    const species = asTrimmedString(proposedChanges.species, asTrimmedString((proposedChanges as any).race, asTrimmedString(nestedMetadata.species, initial.species ?? "Humano")));
    const background = asTrimmedString(proposedChanges.background, asTrimmedString(nestedMetadata.background, initial.background ?? "Aventurero"));
    const level = Math.max(1, asInteger(proposedChanges.level ?? nestedMetadata.level, asInteger(initial.level, 1)));
    const hitPointsMax = Math.max(1, asInteger(proposedChanges.hitPointsMax ?? nestedMetadata.hitPointsMax, asInteger(initial.hitPointsMax, 10)));
    const hitPointsCurrent = Math.max(0, asInteger(proposedChanges.hitPointsCurrent ?? nestedMetadata.hitPointsCurrent, hitPointsMax));
    const armorClass = Math.max(0, asInteger(proposedChanges.armorClass ?? nestedMetadata.armorClass, asInteger(initial.armorClass, 10)));

    const metadata = {
      ...initial,
      ...nestedMetadata,
      playerId,
      isPremade: false,
      className,
      species,
      background,
      level,
      armorClass,
      hitPointsCurrent,
      hitPointsMax,
      hitPointsTemp: asInteger(nestedMetadata.hitPointsTemp, asInteger(initial.hitPointsTemp, 0)),
      hitDice: asTrimmedString(nestedMetadata.hitDice, asTrimmedString(initial.hitDice, "1d8")),
      speed: asInteger(nestedMetadata.speed, asInteger(initial.speed, 30)),
      initiative: asInteger(nestedMetadata.initiative, asInteger(initial.initiative, 0)),
      passivePerception: asInteger(nestedMetadata.passivePerception, asInteger(initial.passivePerception, 10)),
      passiveInsight: asInteger(nestedMetadata.passiveInsight, asInteger(initial.passiveInsight, 10)),
      passiveInvestigation: asInteger(nestedMetadata.passiveInvestigation, asInteger(initial.passiveInvestigation, 10)),
      strength: asInteger(nestedMetadata.strength, asInteger(initial.strength, 10)),
      dexterity: asInteger(nestedMetadata.dexterity, asInteger(initial.dexterity, 10)),
      constitution: asInteger(nestedMetadata.constitution, asInteger(initial.constitution, 10)),
      intelligence: asInteger(nestedMetadata.intelligence, asInteger(initial.intelligence, 10)),
      wisdom: asInteger(nestedMetadata.wisdom, asInteger(initial.wisdom, 10)),
      charisma: asInteger(nestedMetadata.charisma, asInteger(initial.charisma, 10)),
      note: asTrimmedString(proposedChanges.description, asTrimmedString(nestedMetadata.note, "")) || undefined,
    };

    return {
      entityId: createId("ent"),
      campaignId,
      entityType: "player_character" as const,
      title,
      subtitle: `${metadata.species} ${metadata.className}`.trim(),
      summary: asTrimmedString(proposedChanges.description, `Propuesta creada desde el portal del jugador (${proposalId}).`),
      content: asTrimmedString(proposedChanges.description) || undefined,
      status: "active",
      importance: "high" as const,
      visibility: { kind: "party" as const },
      metadata,
    };
  }

  async function upsertPlayerResource(options: {
    repo: CampaignRepository;
    campaignId: string;
    playerId: string;
    portal: any;
    body: ResourceBody;
    resourceId?: string;
  }) {
    const { repo, campaignId, playerId, portal, body, resourceId: routeResourceId } = options;
    const characterEntityId = getLinkedCharacterIdForPlayer(portal, playerId, body.characterEntityId);
    const resourceId = routeResourceId ?? body.resourceId ?? `pres_${randomBytes(8).toString("hex")}`;
    const sheet = portal.sheetsByPlayerId.get(playerId);
    const existing = sheet?.resources?.find((r: any) => r.resourceId === resourceId);

    const label = body.label ?? existing?.label;
    if (!label || !String(label).trim()) {
      throw Object.assign(new Error("Resource label is required"), { statusCode: 400 });
    }

    const max = asInteger(body.max, asInteger(existing?.max, 0));
    const current = asInteger(body.current, asInteger(existing?.current, max));
    const recovery = normalizeRecovery(body.recovery, normalizeRecovery(existing?.recovery, "manual"));

    await repo.executeCommand(campaignId, {
      type: "UpsertPlayerResource",
      campaignId,
      actorId: playerId,
      playerId,
      characterEntityId,
      resource: {
        resourceId,
        label: String(label).trim(),
        current,
        max,
        recovery,
      },
      updatedBy: "player",
      updatedAt: new Date().toISOString(),
    });

    return resourceId;
  }

  // GET /api/campaigns/:campaignId/player-portal/state
  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/player-portal/state",
    async (request, reply) => {
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const rawToken = request.headers["x-player-token"] as string | undefined;

      try {
        const repo = getRepository(vaultId);
        const { state, portal, playerId } = await requirePlayerFromToken(repo, campaignId, rawToken, (request as any).unifiedCampaignMembership?.playerId);

        const link = portal.linksByPlayerId.get(playerId) ?? null;
        const player = state.players.get(playerId) ?? null;
        const linkedCharacter = link
          ? (() => {
              const e = state.entities.get(link.characterEntityId);
              return e ? toPublicCharacter(e) : null;
            })()
          : null;
        const linkedCharacterIds = new Set(
          Array.from(portal.linksByPlayerId.values()).map((item: any) => item.characterEntityId)
        );
        const availableCharacters = Array.from(state.entities.values())
          .filter(
            (e: any) =>
              e.entityType === "player_character" &&
              !e.archived &&
              !linkedCharacterIds.has(e.entityId) &&
              (e.visibility?.kind === "party" || e.visibility?.kind === "public")
          )
          .map(toPublicCharacter);

        const storedSheet = portal.sheetsByPlayerId.get(playerId) ?? null;
        const fallbackSheet = link && linkedCharacter
          ? {
              campaignId,
              playerId,
              characterEntityId: link.characterEntityId,
              status: buildInitialStatusFromMetadata(linkedCharacter.metadata ?? {}),
              resources: [],
              updatedBy: "system" as const,
              updatedAt: link.updatedAt ?? link.createdAt ?? "",
            }
          : null;

        return {
          campaign: state.campaign
            ? {
                campaignId: state.campaign.campaignId ?? campaignId,
                title: state.campaign.title ?? campaignId,
                system: state.campaign.system,
              }
            : { campaignId, title: campaignId },
          player: player
            ? {
                playerId: player.playerId,
                displayName: player.displayName ?? player.name ?? player.playerId,
                color: player.color,
              }
            : { playerId, displayName: playerId },
          playerId,
          link,
          linkedCharacter,
          availableCharacters,
          sheet: storedSheet ?? fallbackSheet,
          notes: portal.notesByPlayerId.get(playerId) ?? [],
          objectives: portal.objectivesByPlayerId.get(playerId) ?? [],
          proposals: portal.proposalsByPlayerId.get(playerId) ?? [],
          memory: buildPlayerCampaignMemory(state, playerId, link?.characterEntityId ?? null),
        };
      } catch (err: any) {
        if (sendCommandError(reply, err)) return;
        if (err.statusCode) {
          reply.code(err.statusCode);
          return { error: err.message };
        }
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // PUT /api/campaigns/:campaignId/player-portal/status
  server.put<{ Params: { campaignId: string }; Body: StatusBody }>(
    "/api/campaigns/:campaignId/player-portal/status",
    async (request, reply) => {
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const rawToken = request.headers["x-player-token"] as string | undefined;

      try {
        const repo = getRepository(vaultId);
        const { portal, playerId } = await requirePlayerFromToken(repo, campaignId, rawToken, (request as any).unifiedCampaignMembership?.playerId);
        const body = request.body;
        const characterEntityId = getLinkedCharacterIdForPlayer(portal, playerId, body.characterEntityId);

        await repo.executeCommand(campaignId, {
          type: "UpdatePlayerLiveStatus",
          campaignId,
          actorId: playerId,
          playerId,
          characterEntityId,
          status: {
            ...(body.hitPointsCurrent !== undefined && { hitPointsCurrent: body.hitPointsCurrent }),
            ...(body.hitPointsMax !== undefined && { hitPointsMax: body.hitPointsMax }),
            ...(body.armorClass !== undefined && { armorClass: body.armorClass }),
            ...(body.inspiration !== undefined && { inspiration: body.inspiration }),
            ...(body.conditions !== undefined && { conditions: body.conditions }),
          },
          updatedBy: "player",
          updatedAt: new Date().toISOString(),
        });

        return { ok: true };
      } catch (err: any) {
        if (sendCommandError(reply, err)) return;
        if (err.statusCode) {
          reply.code(err.statusCode);
          return { error: err.message };
        }
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // POST /api/campaigns/:campaignId/player-portal/resources
  server.post<{ Params: { campaignId: string }; Body: ResourceBody }>(
    "/api/campaigns/:campaignId/player-portal/resources",
    async (request, reply) => {
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const rawToken = request.headers["x-player-token"] as string | undefined;

      try {
        const repo = getRepository(vaultId);
        const { portal, playerId } = await requirePlayerFromToken(repo, campaignId, rawToken, (request as any).unifiedCampaignMembership?.playerId);
        const resourceId = await upsertPlayerResource({ repo, campaignId, playerId, portal, body: request.body });

        reply.code(201);
        return { ok: true, resourceId };
      } catch (err: any) {
        if (sendCommandError(reply, err)) return;
        if (err.statusCode) {
          reply.code(err.statusCode);
          return { error: err.message };
        }
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // PUT /api/campaigns/:campaignId/player-portal/resources/:resourceId
  server.put<{ Params: { campaignId: string; resourceId: string }; Body: ResourceBody }>(
    "/api/campaigns/:campaignId/player-portal/resources/:resourceId",
    async (request, reply) => {
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const rawToken = request.headers["x-player-token"] as string | undefined;

      try {
        const repo = getRepository(vaultId);
        const { portal, playerId } = await requirePlayerFromToken(repo, campaignId, rawToken, (request as any).unifiedCampaignMembership?.playerId);
        await upsertPlayerResource({
          repo,
          campaignId,
          playerId,
          portal,
          body: request.body,
          resourceId: request.params.resourceId,
        });

        return { ok: true };
      } catch (err: any) {
        if (sendCommandError(reply, err)) return;
        if (err.statusCode) {
          reply.code(err.statusCode);
          return { error: err.message };
        }
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // POST /api/campaigns/:campaignId/player-portal/notes
  server.post<{ Params: { campaignId: string }; Body: NoteBody }>(
    "/api/campaigns/:campaignId/player-portal/notes",
    async (request, reply) => {
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const rawToken = request.headers["x-player-token"] as string | undefined;

      try {
        const repo = getRepository(vaultId);
        const { playerId } = await requirePlayerFromToken(repo, campaignId, rawToken, (request as any).unifiedCampaignMembership?.playerId);
        const body = request.body;

        const visibility = body.visibility;
        if (visibility !== "private" && visibility !== "dm_visible") {
          reply.code(400);
          return { error: "visibility must be 'private' or 'dm_visible'" };
        }

        const noteId = `pnote_${randomBytes(8).toString("hex")}`;
        const now = new Date().toISOString();

        await repo.executeCommand(campaignId, {
          type: "CreatePlayerPortalNote",
          campaignId,
          actorId: playerId,
          playerId,
          noteId,
          title: body.title!,
          content: body.content ?? "",
          visibility,
          linkedEntityIds: body.linkedEntityIds ?? [],
          createdAt: now,
        });

        reply.code(201);
        return { ok: true, noteId };
      } catch (err: any) {
        if (sendCommandError(reply, err)) return;
        if (err.statusCode) {
          reply.code(err.statusCode);
          return { error: err.message };
        }
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // PUT /api/campaigns/:campaignId/player-portal/notes/:noteId
  server.put<{ Params: { campaignId: string; noteId: string }; Body: NoteBody }>(
    "/api/campaigns/:campaignId/player-portal/notes/:noteId",
    async (request, reply) => {
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const rawToken = request.headers["x-player-token"] as string | undefined;

      try {
        const repo = getRepository(vaultId);
        const { portal, playerId } = await requirePlayerFromToken(repo, campaignId, rawToken, (request as any).unifiedCampaignMembership?.playerId);
        const body = request.body;

        const playerNotes = portal.notesByPlayerId.get(playerId) ?? [];
        const ownsNote = playerNotes.some((n: any) => n.noteId === request.params.noteId);
        if (!ownsNote) {
          reply.code(404);
          return { error: "Note not found" };
        }

        if (body.visibility !== undefined && body.visibility !== "private" && body.visibility !== "dm_visible") {
          reply.code(400);
          return { error: "visibility must be 'private' or 'dm_visible'" };
        }

        await repo.executeCommand(campaignId, {
          type: "UpdatePlayerPortalNote",
          campaignId,
          actorId: playerId,
          playerId,
          noteId: request.params.noteId,
          ...(body.title !== undefined && { title: body.title }),
          ...(body.content !== undefined && { content: body.content }),
          ...(body.visibility !== undefined && { visibility: body.visibility }),
          ...(body.linkedEntityIds !== undefined && { linkedEntityIds: body.linkedEntityIds }),
          ...(body.archived !== undefined && { archived: body.archived }),
          updatedAt: new Date().toISOString(),
        });

        return { ok: true };
      } catch (err: any) {
        if (sendCommandError(reply, err)) return;
        if (err.statusCode) {
          reply.code(err.statusCode);
          return { error: err.message };
        }
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // POST /api/campaigns/:campaignId/player-portal/objectives
  server.post<{ Params: { campaignId: string }; Body: ObjectiveBody }>(
    "/api/campaigns/:campaignId/player-portal/objectives",
    async (request, reply) => {
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const rawToken = request.headers["x-player-token"] as string | undefined;

      try {
        const repo = getRepository(vaultId);
        const { playerId } = await requirePlayerFromToken(repo, campaignId, rawToken, (request as any).unifiedCampaignMembership?.playerId);
        const body = request.body;

        const visibility = body.visibility;
        if (visibility !== "private" && visibility !== "dm_visible") {
          reply.code(400);
          return { error: "visibility must be 'private' or 'dm_visible'" };
        }

        const objectiveId = `pobj_${randomBytes(8).toString("hex")}`;
        const now = new Date().toISOString();

        await repo.executeCommand(campaignId, {
          type: "CreatePlayerPortalObjective",
          campaignId,
          actorId: playerId,
          playerId,
          objectiveId,
          title: body.title!,
          description: body.description,
          kind: body.kind ?? "personal",
          status: "open",
          visibility,
          linkedEntityIds: body.linkedEntityIds ?? [],
          createdAt: now,
        });

        reply.code(201);
        return { ok: true, objectiveId };
      } catch (err: any) {
        if (sendCommandError(reply, err)) return;
        if (err.statusCode) {
          reply.code(err.statusCode);
          return { error: err.message };
        }
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // PUT /api/campaigns/:campaignId/player-portal/objectives/:objectiveId
  server.put<{ Params: { campaignId: string; objectiveId: string }; Body: ObjectiveBody }>(
    "/api/campaigns/:campaignId/player-portal/objectives/:objectiveId",
    async (request, reply) => {
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const rawToken = request.headers["x-player-token"] as string | undefined;

      try {
        const repo = getRepository(vaultId);
        const { portal, playerId } = await requirePlayerFromToken(repo, campaignId, rawToken, (request as any).unifiedCampaignMembership?.playerId);
        const body = request.body;

        const playerObjectives = portal.objectivesByPlayerId.get(playerId) ?? [];
        const ownsObjective = playerObjectives.some((o: any) => o.objectiveId === request.params.objectiveId);
        if (!ownsObjective) {
          reply.code(404);
          return { error: "Objective not found" };
        }

        if (body.visibility !== undefined && body.visibility !== "private" && body.visibility !== "dm_visible") {
          reply.code(400);
          return { error: "visibility must be 'private' or 'dm_visible'" };
        }

        await repo.executeCommand(campaignId, {
          type: "UpdatePlayerPortalObjective",
          campaignId,
          actorId: playerId,
          playerId,
          objectiveId: request.params.objectiveId,
          ...(body.title !== undefined && { title: body.title }),
          ...(body.description !== undefined && { description: body.description }),
          ...(body.kind !== undefined && { kind: body.kind }),
          ...(body.status !== undefined && { status: body.status }),
          ...(body.visibility !== undefined && { visibility: body.visibility }),
          ...(body.linkedEntityIds !== undefined && { linkedEntityIds: body.linkedEntityIds }),
          updatedAt: new Date().toISOString(),
        });

        return { ok: true };
      } catch (err: any) {
        if (sendCommandError(reply, err)) return;
        if (err.statusCode) {
          reply.code(err.statusCode);
          return { error: err.message };
        }
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // POST /api/campaigns/:campaignId/player-portal/links (DM auth)
  server.post<{ Params: { campaignId: string }; Body: LinkBody }>(
    "/api/campaigns/:campaignId/player-portal/links",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const body = request.body;

      try {
        const repo = getRepository(vaultId);
        const state = await repo.getCampaignState(campaignId);
        const events = await repo.loadEvents(campaignId);
        const portal = buildPlayerPortalProjection(state, events);
        const now = new Date().toISOString();

        if (!body.playerId || !body.characterEntityId) {
          reply.code(400);
          return { error: "playerId and characterEntityId are required" };
        }

        assertCharacterCanBeLinked(state, portal, body.playerId, body.characterEntityId);

        await repo.executeCommand(campaignId, {
          type: "LinkPlayerCharacter",
          campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
          playerId: body.playerId,
          characterEntityId: body.characterEntityId,
          ownership: body.ownership ?? "campaign_premade",
          syncMode: body.syncMode ?? "live_player_editable",
          createdAt: now,
        });

        const character = state.entities.get(body.characterEntityId);
        await repo.executeCommand(campaignId, {
          type: "UpdatePlayerLiveStatus",
          campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
          playerId: body.playerId,
          characterEntityId: body.characterEntityId,
          status: buildInitialStatusFromMetadata(character?.metadata ?? {}),
          updatedBy: "dm",
          updatedAt: now,
        });

        reply.code(201);
        return { ok: true };
      } catch (err: any) {
        if (sendCommandError(reply, err)) return;
        if (err.statusCode) {
          reply.code(err.statusCode);
          return { error: err.message };
        }
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // DELETE /api/campaigns/:campaignId/player-portal/links/:playerId (DM auth)
  server.delete<{ Params: { campaignId: string; playerId: string } }>(
    "/api/campaigns/:campaignId/player-portal/links/:playerId",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { playerId } = request.params;

      try {
        const repo = getRepository(vaultId);
        const state = await repo.getCampaignState(campaignId);
        const events = await repo.loadEvents(campaignId);
        const portal = buildPlayerPortalProjection(state, events);
        const link = portal.linksByPlayerId.get(playerId);
        if (!link) {
          reply.code(404);
          return { error: "Player character link not found" };
        }

        await repo.executeCommand(campaignId, {
          type: "UnlinkPlayerCharacter",
          campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
          playerId,
          characterEntityId: link.characterEntityId,
          removedAt: new Date().toISOString(),
        });

        return { ok: true };
      } catch (err: any) {
        if (sendCommandError(reply, err)) return;
        if (err.statusCode) {
          reply.code(err.statusCode);
          return { error: err.message };
        }
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // POST /api/campaigns/:campaignId/player-portal/proposals (player token)
  server.post<{ Params: { campaignId: string }; Body: ProposalBody }>(
    "/api/campaigns/:campaignId/player-portal/proposals",
    async (request, reply) => {
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const rawToken = request.headers["x-player-token"] as string | undefined;

      try {
        const repo = getRepository(vaultId);
        const { state, portal, playerId } = await requirePlayerFromToken(repo, campaignId, rawToken, (request as any).unifiedCampaignMembership?.playerId);
        const body = request.body;
        const kind = body.kind ?? "update_character_core";

        if (kind === "link_request") {
          if (!body.targetCharacterEntityId) {
            reply.code(400);
            return { error: "link_request requires targetCharacterEntityId" };
          }
          assertCharacterCanBeLinked(state, portal, playerId, body.targetCharacterEntityId);
        }

        if (kind === "create_character" && portal.linksByPlayerId.has(playerId)) {
          reply.code(409);
          return { error: "Player already has a linked character" };
        }

        const proposalId = `pprop_${randomBytes(8).toString("hex")}`;
        const now = new Date().toISOString();

        await repo.executeCommand(campaignId, {
          type: "CreatePlayerCharacterProposal",
          campaignId,
          actorId: playerId,
          playerId,
          proposalId,
          targetCharacterEntityId: body.targetCharacterEntityId,
          kind,
          proposedChanges: body.proposedChanges ?? {},
          createdAt: now,
        });

        reply.code(201);
        return { ok: true, proposalId };
      } catch (err: any) {
        if (sendCommandError(reply, err)) return;
        if (err.statusCode) {
          reply.code(err.statusCode);
          return { error: err.message };
        }
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // PUT /api/campaigns/:campaignId/player-portal/proposals/:proposalId/resolve (DM auth)
  server.put<{ Params: { campaignId: string; proposalId: string }; Body: ResolveProposalBody }>(
    "/api/campaigns/:campaignId/player-portal/proposals/:proposalId/resolve",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { proposalId } = request.params;
      const body = request.body;

      try {
        const repo = getRepository(vaultId);
        const state = await repo.getCampaignState(campaignId);
        const events = await repo.loadEvents(campaignId);
        const portal = buildPlayerPortalProjection(state, events);

        let foundProposal: any = undefined;
        for (const proposals of portal.proposalsByPlayerId.values()) {
          for (const p of proposals) {
            if (p.proposalId === proposalId) {
              foundProposal = p;
              break;
            }
          }
          if (foundProposal) break;
        }

        if (!foundProposal) {
          reply.code(404);
          return { error: "Proposal not found" };
        }

        if (foundProposal.status !== "pending") {
          reply.code(400);
          return { error: "Proposal already resolved" };
        }

        const status: "approved" | "rejected" = body.status === "approved" ? "approved" : "rejected";
        const now = new Date().toISOString();

        let entityUpdate: { entityId: string; updates: Record<string, unknown> } | undefined;
        let linkUpdate:
          | {
              playerId: string;
              characterEntityId: string;
              ownership: "campaign_premade" | "player_owned";
              syncMode: "live_player_editable" | "dm_review_required";
              linkedAt: string;
            }
          | undefined;
        let createdCharacterId: string | undefined;
        let createdCharacterMetadata: Record<string, unknown> | undefined;

        if (status === "approved") {
          if (foundProposal.kind === "link_request") {
            if (!foundProposal.targetCharacterEntityId) {
              reply.code(400);
              return { error: "link_request proposal has no target character" };
            }
            assertCharacterCanBeLinked(state, portal, foundProposal.playerId, foundProposal.targetCharacterEntityId);
            linkUpdate = {
              playerId: foundProposal.playerId,
              characterEntityId: foundProposal.targetCharacterEntityId,
              ownership: "campaign_premade",
              syncMode: "live_player_editable",
              linkedAt: now,
            };
            createdCharacterMetadata = state.entities.get(foundProposal.targetCharacterEntityId)?.metadata ?? {};
          } else if (foundProposal.kind === "create_character") {
            if (portal.linksByPlayerId.has(foundProposal.playerId)) {
              reply.code(409);
              return { error: "Player already has a linked character" };
            }
            const character = buildCharacterEntityFromCreateProposal({
              campaignId,
              playerId: foundProposal.playerId,
              proposalId,
              campaignSystem: state.campaign?.system,
              proposedChanges: foundProposal.proposedChanges ?? {},
            });
            createdCharacterId = character.entityId;
            createdCharacterMetadata = character.metadata;

            await repo.executeCommand(campaignId, {
              type: "CreateEntity",
              campaignId,
              actorId: getRequestActorId(request, server.dmSessionToken),
              entityId: character.entityId,
              entityType: "player_character" as const,
              title: character.title,
              subtitle: character.subtitle,
              summary: character.summary,
              content: character.content,
              status: character.status,
              importance: "high" as const,
              visibility: { kind: "party" as const },
              metadata: character.metadata,
            });

            linkUpdate = {
              playerId: foundProposal.playerId,
              characterEntityId: character.entityId,
              ownership: "player_owned",
              syncMode: "live_player_editable",
              linkedAt: now,
            };
          } else if (foundProposal.kind === "update_character_core") {
            const linkedCharacterId = getLinkedCharacterIdForPlayer(portal, foundProposal.playerId, foundProposal.targetCharacterEntityId);
            entityUpdate = {
              entityId: linkedCharacterId,
              updates: foundProposal.proposedChanges,
            };
          }
        }

        await repo.executeCommand(campaignId, {
          type: "ResolvePlayerCharacterProposal",
          campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
          proposal: foundProposal,
          status,
          dmResolutionNote: body.dmResolutionNote,
          resolvedAt: now,
          entityUpdate,
          linkUpdate,
        });

        if (status === "approved" && linkUpdate) {
          await repo.executeCommand(campaignId, {
            type: "UpdatePlayerLiveStatus",
            campaignId,
            actorId: getRequestActorId(request, server.dmSessionToken),
            playerId: linkUpdate.playerId,
            characterEntityId: linkUpdate.characterEntityId,
            status: buildInitialStatusFromMetadata(createdCharacterMetadata ?? {}),
            updatedBy: "dm",
            updatedAt: now,
          });
        }

        return { ok: true, characterEntityId: createdCharacterId ?? linkUpdate?.characterEntityId };
      } catch (err: any) {
        if (sendCommandError(reply, err)) return;
        if (err.statusCode) {
          reply.code(err.statusCode);
          return { error: err.message };
        }
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // GET /api/campaigns/:campaignId/player-portal/dm-summary (DM only)
  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/player-portal/dm-summary",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);

      try {
        const repo = getRepository(vaultId);
        const state = await repo.getCampaignState(campaignId);
        const events = await repo.loadEvents(campaignId);
        const portal = buildPlayerPortalProjection(state, events);
        const linkedCharacterIds = new Set(
          Array.from(portal.linksByPlayerId.values()).map((link: any) => link.characterEntityId)
        );
        const availableCharacters = Array.from(state.entities.values())
          .filter(
            (e: any) =>
              e.entityType === "player_character" &&
              !e.archived &&
              !linkedCharacterIds.has(e.entityId) &&
              (e.visibility?.kind === "party" || e.visibility?.kind === "public")
          )
          .map(toPublicCharacter);

        const players = portal.dmSummaries.map((summary) => {
          const linkedEntity = summary.link?.characterEntityId
            ? state.entities.get(summary.link.characterEntityId)
            : null;
          return {
            ...summary,
            linkedCharacter: linkedEntity ? toPublicCharacter(linkedEntity) : null,
          };
        });

        return { players, availableCharacters };
      } catch (err: any) {
        if (sendCommandError(reply, err)) return;
        if (err.statusCode) {
          reply.code(err.statusCode);
          return { error: err.message };
        }
        reply.code(500);
        return { error: err.message };
      }
    }
  );
}
