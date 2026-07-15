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
import { registerCampaignTemplateWebRoutes } from "./routes/campaignTemplateWebRoutes.js";
import { registerRoleScopedCampaignListWebRoutes } from "./routes/roleScopedCampaignListWebRoutes.js";
import { registerRulesWebRoutes } from "./routes/rulesWebRoutes.js";
import { registerSearchWebRoutes } from "./routes/searchWebRoutes.js";
import { registerAdminWebRoutes } from "./routes/adminWebRoutes.js";
import { registerAnnouncementsWebRoutes } from "./routes/announcementsWebRoutes.js";
import { registerGameSystemsWebRoutes } from "./routes/gameSystemsWebRoutes.js";
import { registerHistoryWebRoutes } from "./routes/historyWebRoutes.js";
import { registerShortcutsWebRoutes } from "./routes/shortcutsWebRoutes.js";
import { registerNotebooksWebRoutes } from "./routes/notebooksWebRoutes.js";
import { registerStoryWebRoutes } from "./routes/storyWebRoutes.js";
import { registerNetworkInfoWebRoutes } from "./routes/networkInfoWebRoutes.js";

export interface WebRoutesOptions {
  dataDir: string;
  assetsDir?: string;
}

/** Registers the PostgreSQL-backed multi-user web API surface. */
export function registerWebRoutes(server: FastifyInstance, options: WebRoutesOptions): void {
  registerAuthWebRoutes(server);
  void registerAccountWebRoutes(server);
  void registerHealthWebRoutes(server);
  void registerRoleScopedCampaignListWebRoutes(server);
  void registerCampaignWebRoutes(server, { dataDir: options.dataDir });
  void registerCampaignMessagingWebRoutes(server);
  void registerCanvasWebRoutes(server);
  void registerDmHubWebRoutes(server);
  void registerCommandCenterWebRoutes(server);
  void registerInvitationWebRoutes(server);
  void registerLiveTableWebRoutes(server);
  registerPlayerKnowledgeWebRoutes(server);
  void registerPlayerPortalWebRoutes(server);
  registerPlayerCharacterLinkWebRoutes(server);
  registerPlayerCharacterProposalWebRoutes(server);
  void registerCampaignTemplateWebRoutes(server);
  void registerRulesWebRoutes(server);
  void registerSearchWebRoutes(server);
  void registerAdminWebRoutes(server);
  void registerAnnouncementsWebRoutes(server);
  void registerGameSystemsWebRoutes(server);
  void registerHistoryWebRoutes(server);
  void registerShortcutsWebRoutes(server);
  void registerNotebooksWebRoutes(server);
  void registerStoryWebRoutes(server);
  void registerNetworkInfoWebRoutes(server);
  server.register(registerAssetRoutes, { assetsDir: options.assetsDir });
}
