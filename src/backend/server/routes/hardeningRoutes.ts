import type { FastifyInstance } from "fastify";
import { makeRepositoryFactory } from "../repositoryFactory.js";
import * as fs from "fs/promises";
import { join } from "path";
import { VERSION_INFO } from "@shared/appVersion.js";
import { assertDM, getValidatedCampaignId, getValidatedVaultId } from "../auth.js";
import { createCampaignBackup, listCampaignBackups } from "../hardening/backups.js";
import { buildCampaignIntegrityReport, findMissingAttachmentFiles } from "../hardening/integrity.js";

export async function registerHardeningRoutes(server: FastifyInstance, opts: { dataDir: string }) {
  const { dataDir } = opts;

  const getRepository = makeRepositoryFactory(dataDir);

  async function countCampaignDirs(vaultId: string): Promise<number> {
    const campaignsDir = join(dataDir, "vaults", vaultId, "campaigns");
    try {
      const entries = await fs.readdir(campaignsDir, { withFileTypes: true });
      return entries.filter((entry) => entry.isDirectory() && entry.name.startsWith("cmp_")).length;
    } catch {
      return 0;
    }
  }

  server.get("/api/diagnostics", async (request) => {
    assertDM(request, server.dmSessionToken);
    const vaultId = getValidatedVaultId(request);
    const dataDirExists = await fs.stat(dataDir).then((stat) => stat.isDirectory()).catch(() => false);
    return {
      ok: true,
      checkedAt: new Date().toISOString(),
      version: VERSION_INFO,
      runtime: {
        node: process.version,
        platform: process.platform,
        mode: process.env.NODE_ENV ?? "production",
      },
      storage: {
        dataDir,
        dataDirExists,
        activeVaultId: vaultId,
        campaignCount: await countCampaignDirs(vaultId),
      },
      server: {
        lanCodesActive: server.activeAccessCodes?.size ?? 0,
        playerSessionsActive: server.playerTokens?.size ?? 0,
      },
    };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/integrity", async (request, reply) => {
    assertDM(request, server.dmSessionToken);
    const vaultId = getValidatedVaultId(request);
    const campaignId = getValidatedCampaignId(request.params.campaignId);
    try {
      const repo = getRepository(vaultId);
      const state = await repo.getCampaignState(campaignId);
      const events = await repo.loadEvents(campaignId);
      const report = buildCampaignIntegrityReport({ state, events });
      const attachmentIssues = await findMissingAttachmentFiles({ dataDir, vaultId, campaignId, state });
      report.issues.push(...attachmentIssues);
      report.summary.warnings += attachmentIssues.filter((issue) => issue.severity === "warning").length;
      report.summary.errors += attachmentIssues.filter((issue) => issue.severity === "error").length;
      report.summary.infos += attachmentIssues.filter((issue) => issue.severity === "info").length;
      report.ok = report.summary.errors === 0;
      return report;
    } catch (err: any) {
      reply.code(500);
      return {
        ok: false,
        checkedAt: new Date().toISOString(),
        summary: { errors: 1, warnings: 0, infos: 0, events: 0, entities: 0, relations: 0, facts: 0, sessions: 0, players: 0, canvases: 0 },
        readiness: [],
        issues: [{ severity: "error", code: "integrity.load_failed", targetType: "campaign", targetId: campaignId, message: err.message }],
      };
    }
  });

  server.post<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/integrity/rebuild-snapshot", async (request, reply) => {
    assertDM(request, server.dmSessionToken);
    const vaultId = getValidatedVaultId(request);
    const campaignId = getValidatedCampaignId(request.params.campaignId);
    try {
      const autoBackup = await createCampaignBackup({
        dataDir,
        vaultId,
        campaignId,
        reason: "auto-before-rebuild",
        description: "Auto-backup before rebuilding campaign projection snapshot",
      });
      const repo = getRepository(vaultId);
      const projection = await repo.rebuildSnapshot(campaignId);
      return {
        ok: true,
        campaignId,
        rebuiltAt: new Date().toISOString(),
        lastSequence: projection.lastSequence,
        autoBackup,
      };
    } catch (err: any) {
      reply.code(500);
      return { ok: false, error: err.message };
    }
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/diagnostics", async (request, reply) => {
    assertDM(request, server.dmSessionToken);
    const vaultId = getValidatedVaultId(request);
    const campaignId = getValidatedCampaignId(request.params.campaignId);
    try {
      const repo = getRepository(vaultId);
      const state = await repo.getCampaignState(campaignId);
      const events = await repo.loadEvents(campaignId);
      const backups = await listCampaignBackups({ dataDir, vaultId, campaignId });
      const integrity = buildCampaignIntegrityReport({ state, events });
      return {
        ok: integrity.ok,
        checkedAt: new Date().toISOString(),
        version: VERSION_INFO,
        campaign: {
          campaignId,
          title: state.campaign?.title ?? campaignId,
          lastSequence: state.lastSequence,
          events: events.length,
          entities: state.entities.size,
          relations: state.relations.size,
          facts: state.facts.size,
          sessions: state.sessions.size,
          players: state.players.size,
          canvases: state.canvases.size,
        },
        backups: {
          count: backups.length,
          latest: backups[0] ?? null,
        },
        integrity,
      };
    } catch (err: any) {
      reply.code(500);
      return { ok: false, error: err.message };
    }
  });
}
