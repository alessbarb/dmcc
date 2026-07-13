import type { FastifyInstance } from "fastify";
import { registerAssetRoutes } from "../routes/assetRoutes.js";
import { registerAccountWebRoutes } from "./routes/accountWebRoutes.js";
import { registerAuthWebRoutes } from "./routes/authWebRoutes.js";
import { registerCampaignMessagingWebRoutes } from "./routes/campaignMessagingWebRoutes.js";
import { registerCampaignWebRoutes } from "./routes/campaignWebRoutes.js";
import { registerCanvasWebRoutes } from "./routes/canvasWebRoutes.js";
import { registerCommandCenterWebRoutes } from "./routes/commandCenterWebRoutes.js";
import { registerDmHubWebRoutes } from "./routes/dmHubWebRoutes.js";
import { registerHealthWebRoutes } from "./routes/healthWebRoutes.js";
import { registerInvitationWebRoutes } from "./routes/invitationWebRoutes.js";
import { registerLiveTableWebRoutes } from "./routes/liveTableWebRoutes.js";
import { registerPlayerCharacterLinkWebRoutes } from "./routes/playerCharacterLinkWebRoutes.js";
import { registerPlayerCharacterProposalWebRoutes } from "./routes/playerCharacterProposalWebRoutes.js";
import { registerPlayerKnowledgeWebRoutes } from "./routes/playerKnowledgeWebRoutes.js";
import { registerPlayerPortalWebRoutes } from "./routes/playerPortalWebRoutes.js";
import { registerPremadeCampaignWebRoutes } from "./routes/premadeCampaignWebRoutes.js";
import { registerRoleScopedCampaignListWebRoutes } from "./routes/roleScopedCampaignListWebRoutes.js";
import { registerRulesWebRoutes } from "./routes/rulesWebRoutes.js";
import { registerSearchWebRoutes } from "./routes/searchWebRoutes.js";

export interface WebRoutesOptions {
  dataDir: string;
  assetsDir?: string;
}

export function sanitizeProductionContentSecurityPolicy(value: unknown, nodeEnv = process.env.NODE_ENV): unknown {
  if (nodeEnv !== "production" || typeof value !== "string") return value;

  return value
    .replace(/\s+(?:ws:|wss:|http:\/\/localhost:\*|http:\/\/127\.0\.0\.1:\*)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Registers the PostgreSQL-backed multi-user web API surface. */
export function registerWebRoutes(server: FastifyInstance, options: WebRoutesOptions): void {
  server.addHook("onSend", async (_request, reply, payload) => {
    const currentPolicy = reply.getHeader("content-security-policy");
    const sanitizedPolicy = sanitizeProductionContentSecurityPolicy(currentPolicy);
    if (typeof sanitizedPolicy === "string" && sanitizedPolicy !== currentPolicy) {
      reply.header("content-security-policy", sanitizedPolicy);
    }
    return payload;
  });

  void registerAuthWebRoutes(server);
  void registerAccountWebRoutes(server);
  void registerHealthWebRoutes(server);
  void registerRoleScopedCampaignListWebRoutes(server);
  void registerCampaignWebRoutes(server);
  void registerCampaignMessagingWebRoutes(server);
  void registerCanvasWebRoutes(server);
  void registerDmHubWebRoutes(server);
  void registerCommandCenterWebRoutes(server);
  void registerInvitationWebRoutes(server);
  void registerLiveTableWebRoutes(server);
  void registerPlayerKnowledgeWebRoutes(server);
  void registerPlayerPortalWebRoutes(server);
  void registerPlayerCharacterLinkWebRoutes(server);
  void registerPlayerCharacterProposalWebRoutes(server);
  void registerPremadeCampaignWebRoutes(server);
  void registerRulesWebRoutes(server);
  void registerSearchWebRoutes(server);
  server.register(registerAssetRoutes, { assetsDir: options.assetsDir });
}
