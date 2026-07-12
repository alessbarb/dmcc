import type { FastifyInstance } from "fastify";
import { registerAssetRoutes } from "../routes/assetRoutes.js";
import { registerAccountWebRoutes } from "./routes/accountWebRoutes.js";
import { registerAuthWebRoutes } from "./routes/authWebRoutes.js";
import { registerCampaignWebRoutes } from "./routes/campaignWebRoutes.js";
import { registerCanvasWebRoutes } from "./routes/canvasWebRoutes.js";
import { registerCommandCenterWebRoutes } from "./routes/commandCenterWebRoutes.js";
import { registerDmHubWebRoutes } from "./routes/dmHubWebRoutes.js";
import { registerHealthWebRoutes } from "./routes/healthWebRoutes.js";
import { registerInvitationWebRoutes } from "./routes/invitationWebRoutes.js";
import { registerLiveTableWebRoutes } from "./routes/liveTableWebRoutes.js";
import { registerPlayerCharacterLinkWebRoutes } from "./routes/playerCharacterLinkWebRoutes.js";
import { registerPlayerCharacterProposalWebRoutes } from "./routes/playerCharacterProposalWebRoutes.js";
import { registerPlayerCharacterSelectionWebRoutes } from "./routes/playerCharacterSelectionWebRoutes.js";
import { registerPlayerKnowledgeWebRoutes } from "./routes/playerKnowledgeWebRoutes.js";
import { registerPlayerPortalSynchronizationWebRoutes } from "./routes/playerPortalSynchronizationWebRoutes.js";
import { registerPlayerPortalWebRoutes } from "./routes/playerPortalWebRoutes.js";
import { registerPremadeCampaignWebRoutes } from "./routes/premadeCampaignWebRoutes.js";
import { registerRoleScopedCampaignListWebRoutes } from "./routes/roleScopedCampaignListWebRoutes.js";
import { registerRulesWebRoutes } from "./routes/rulesWebRoutes.js";
import { registerSearchWebRoutes } from "./routes/searchWebRoutes.js";

export interface WebRoutesOptions {
  dataDir: string;
  assetsDir?: string;
}

/** Registers the PostgreSQL-backed multi-user web API surface. */
export function registerWebRoutes(server: FastifyInstance, options: WebRoutesOptions): void {
  void registerAuthWebRoutes(server);
  void registerAccountWebRoutes(server);
  void registerHealthWebRoutes(server);
  void registerRoleScopedCampaignListWebRoutes(server);
  void registerCampaignWebRoutes(server);
  void registerCanvasWebRoutes(server);
  void registerDmHubWebRoutes(server);
  void registerCommandCenterWebRoutes(server);
  void registerInvitationWebRoutes(server);
  void registerLiveTableWebRoutes(server);
  void registerPlayerKnowledgeWebRoutes(server);
  void registerPlayerPortalSynchronizationWebRoutes(server);
  void registerPlayerPortalWebRoutes(server);
  void registerPlayerCharacterLinkWebRoutes(server);
  void registerPlayerCharacterProposalWebRoutes(server);
  void registerPlayerCharacterSelectionWebRoutes(server);
  void registerPremadeCampaignWebRoutes(server);
  void registerRulesWebRoutes(server);
  void registerSearchWebRoutes(server);
  server.register(registerAssetRoutes, { assetsDir: options.assetsDir });
}
