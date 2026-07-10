import type { FastifyInstance } from "fastify";
import { registerAccountRoutes } from "../routes/accountRoutes.js";
import { registerAssetRoutes } from "../routes/assetRoutes.js";
import { registerAuthWebRoutes } from "./routes/authWebRoutes.js";
import { registerCampaignWebRoutes } from "./routes/campaignWebRoutes.js";
import { registerDmDashboardWebRoutes } from "./routes/dmDashboardWebRoutes.js";
import { registerHealthWebRoutes } from "./routes/healthWebRoutes.js";
import { registerInvitationWebRoutes } from "./routes/invitationWebRoutes.js";
import { registerLiveTableWebRoutes } from "./routes/liveTableWebRoutes.js";
import { registerPlatformCompatibilityRoutes } from "./routes/platformCompatibilityRoutes.js";
import { registerPlayerPortalWebRoutes } from "./routes/playerPortalWebRoutes.js";
import { registerSearchWebRoutes } from "./routes/searchWebRoutes.js";

export interface WebRoutesOptions {
  dataDir: string;
  assetsDir?: string;
}

/** Registers the PostgreSQL-backed multi-user web API surface. */
export function registerWebRoutes(server: FastifyInstance, options: WebRoutesOptions): void {
  void registerAuthWebRoutes(server);
  void registerHealthWebRoutes(server);
  void registerCampaignWebRoutes(server);
  void registerDmDashboardWebRoutes(server);
  void registerInvitationWebRoutes(server);
  void registerLiveTableWebRoutes(server);
  void registerPlatformCompatibilityRoutes(server);
  void registerPlayerPortalWebRoutes(server);
  void registerSearchWebRoutes(server);
  server.register(registerAccountRoutes, { dataDir: options.dataDir });
  server.register(registerAssetRoutes, { assetsDir: options.assetsDir });
}
