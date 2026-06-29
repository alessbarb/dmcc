import type { FastifyInstance } from "fastify";
import { randomBytes } from "crypto";

type StatusBody = {
  characterEntityId?: string;
  hitPointsCurrent?: number;
  hitPointsMax?: number;
  armorClass?: number;
  inspiration?: boolean;
  conditions?: string[];
};

type ResourceBody = {
  resourceId?: string;
  characterEntityId?: string;
  label?: string;
  current?: number;
  max?: number;
  recovery?: "short_rest" | "long_rest" | "manual";
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
import { EventStore } from "@core/persistence/eventStore/eventStore.js";
import { SnapshotStore } from "@core/persistence/snapshotStore/snapshotStore.js";
import { CampaignRepository } from "@core/persistence/repositories/campaignRepository.js";
import { buildPlayerPortalProjection } from "@core/projections/playerPortalProjection.js";
import {
  assertDM,
  getValidatedVaultId,
  getValidatedCampaignId,
  hashPlayerToken,
} from "../auth.js";

export async function registerPlayerPortalRoutes(
  server: FastifyInstance,
  opts: { dataDir: string }
) {
  const { dataDir } = opts;

  function getRepository(vaultId = "default") {
    return new CampaignRepository(
      new EventStore(dataDir, vaultId),
      new SnapshotStore(dataDir, vaultId)
    );
  }

  async function requirePlayerFromToken(
    repository: CampaignRepository,
    campaignId: string,
    rawToken: string | undefined
  ) {
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

  // GET /api/campaigns/:campaignId/player-portal/state
  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/player-portal/state",
    async (request, reply) => {
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const rawToken = request.headers["x-player-token"] as string | undefined;

      try {
        const repo = getRepository(vaultId);
        const { state, portal, playerId } = await requirePlayerFromToken(repo, campaignId, rawToken);

        const link = portal.linksByPlayerId.get(playerId) ?? null;
        const linkedCharacter = link
          ? (() => {
              const e = state.entities.get(link.characterEntityId);
              return e ? { entityId: e.entityId, title: e.title } : null;
            })()
          : null;
        const availableCharacters = Array.from(state.entities.values())
          .filter(
            (e: any) =>
              e.entityType === "player_character" &&
              !e.archived &&
              (e.visibility?.kind === "party" || e.visibility?.kind === "public")
          )
          .map((e: any) => ({ entityId: e.entityId, title: e.title }));

        return {
          playerId,
          link,
          linkedCharacter,
          availableCharacters,
          sheet: portal.sheetsByPlayerId.get(playerId) ?? null,
          notes: portal.notesByPlayerId.get(playerId) ?? [],
          objectives: portal.objectivesByPlayerId.get(playerId) ?? [],
          proposals: portal.proposalsByPlayerId.get(playerId) ?? [],
          history: { status: "stub" },
        };
      } catch (err: any) {
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
        const { playerId } = await requirePlayerFromToken(repo, campaignId, rawToken);
        const body = request.body;

        await repo.executeCommand(campaignId, {
          type: "UpdatePlayerLiveStatus",
          campaignId: campaignId,
          actorId: playerId,
          playerId,
          characterEntityId: body.characterEntityId!,
          status: {
            hitPointsCurrent: body.hitPointsCurrent,
            hitPointsMax: body.hitPointsMax,
            armorClass: body.armorClass,
            inspiration: body.inspiration,
            conditions: body.conditions ?? [],
          },
          updatedBy: "player",
          updatedAt: new Date().toISOString(),
        });

        return { ok: true };
      } catch (err: any) {
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
        const { playerId } = await requirePlayerFromToken(repo, campaignId, rawToken);
        const body = request.body;
        const resourceId = body.resourceId ?? `pres_${randomBytes(8).toString("hex")}`;

        await repo.executeCommand(campaignId, {
          type: "UpsertPlayerResource",
          campaignId: campaignId,
          actorId: playerId,
          playerId,
          characterEntityId: body.characterEntityId!,
          resource: {
            resourceId,
            label: body.label!,
            current: body.current!,
            max: body.max!,
            recovery: body.recovery,
          },
          updatedBy: "player",
          updatedAt: new Date().toISOString(),
        });

        reply.code(201);
        return { ok: true, resourceId };
      } catch (err: any) {
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
        const { playerId } = await requirePlayerFromToken(repo, campaignId, rawToken);
        const body = request.body;
        const { resourceId } = request.params;

        await repo.executeCommand(campaignId, {
          type: "UpsertPlayerResource",
          campaignId: campaignId,
          actorId: playerId,
          playerId,
          characterEntityId: body.characterEntityId!,
          resource: {
            resourceId,
            label: body.label!,
            current: body.current!,
            max: body.max!,
            recovery: body.recovery,
          },
          updatedBy: "player",
          updatedAt: new Date().toISOString(),
        });

        return { ok: true };
      } catch (err: any) {
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
        const { playerId } = await requirePlayerFromToken(repo, campaignId, rawToken);
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
          campaignId: campaignId,
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
        const { portal, playerId } = await requirePlayerFromToken(repo, campaignId, rawToken);
        const body = request.body;

        const playerNotes = portal.notesByPlayerId.get(playerId) ?? [];
        const ownsNote = playerNotes.some((n) => n.noteId === request.params.noteId);
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
          campaignId: campaignId,
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
        const { playerId } = await requirePlayerFromToken(repo, campaignId, rawToken);
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
          campaignId: campaignId,
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
        const { portal, playerId } = await requirePlayerFromToken(repo, campaignId, rawToken);
        const body = request.body;

        const playerObjectives = portal.objectivesByPlayerId.get(playerId) ?? [];
        const ownsObjective = playerObjectives.some((o) => o.objectiveId === request.params.objectiveId);
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
          campaignId: campaignId,
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
        const now = new Date().toISOString();

        await repo.executeCommand(campaignId, {
          type: "LinkPlayerCharacter",
          campaignId: campaignId,
          actorId: "usr_dm",
          playerId: body.playerId!,
          characterEntityId: body.characterEntityId!,
          ownership: body.ownership ?? "campaign_premade",
          syncMode: body.syncMode ?? "live_player_editable",
          createdAt: now,
        });

        reply.code(201);
        return { ok: true };
      } catch (err: any) {
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
        const { state, playerId } = await requirePlayerFromToken(repo, campaignId, rawToken);
        const body = request.body;

        // Validate link_request target is a visible player_character
        if (body.kind === "link_request") {
          if (!body.targetCharacterEntityId) {
            reply.code(400);
            return { error: "link_request requires targetCharacterEntityId" };
          }
          const targetEntity = state.entities.get(body.targetCharacterEntityId);
          if (
            !targetEntity ||
            targetEntity.entityType !== "player_character" ||
            targetEntity.archived ||
            !["party", "public"].includes(targetEntity.visibility?.kind)
          ) {
            reply.code(400);
            return { error: "Target entity is not a visible player_character" };
          }
        }

        const proposalId = `pprop_${randomBytes(8).toString("hex")}`;
        const now = new Date().toISOString();

        await repo.executeCommand(campaignId, {
          type: "CreatePlayerCharacterProposal",
          campaignId: campaignId,
          actorId: playerId,
          playerId,
          proposalId,
          targetCharacterEntityId: body.targetCharacterEntityId,
          kind: body.kind ?? "update_character_core",
          proposedChanges: body.proposedChanges ?? {},
          createdAt: now,
        });

        reply.code(201);
        return { ok: true, proposalId };
      } catch (err: any) {
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

        // Find proposal across all players
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

        if (status === "approved" && foundProposal.targetCharacterEntityId) {
          if (foundProposal.kind === "link_request") {
            linkUpdate = {
              playerId: foundProposal.playerId,
              characterEntityId: foundProposal.targetCharacterEntityId,
              ownership: "campaign_premade",
              syncMode: "live_player_editable",
              linkedAt: now,
            };
          } else {
            entityUpdate = {
              entityId: foundProposal.targetCharacterEntityId,
              updates: foundProposal.proposedChanges,
            };
          }
        }

        await repo.executeCommand(campaignId, {
          type: "ResolvePlayerCharacterProposal",
          campaignId: campaignId,
          actorId: "usr_dm",
          proposal: foundProposal,
          status,
          dmResolutionNote: body.dmResolutionNote,
          resolvedAt: now,
          entityUpdate,
          linkUpdate,
        });

        return { ok: true };
      } catch (err: any) {
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

        return { players: portal.dmSummaries };
      } catch (err: any) {
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
