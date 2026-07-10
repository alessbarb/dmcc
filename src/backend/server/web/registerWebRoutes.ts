import type { FastifyInstance } from "fastify";
import { registerAssetRoutes } from "../routes/assetRoutes.js";
import { registerAccountWebRoutes } from "./routes/accountWebRoutes.js";
import { registerAuthWebRoutes } from "./routes/authWebRoutes.js";
import { registerCampaignWebRoutes } from "./routes/campaignWebRoutes.js";
import { registerCanvasWebRoutes } from "./routes/canvasWebRoutes.js";
import { registerDmDashboardWebRoutes } from "./routes/dmDashboardWebRoutes.js";
import { registerHealthWebRoutes } from "./routes/healthWebRoutes.js";
import { registerInvitationWebRoutes } from "./routes/invitationWebRoutes.js";
import { registerLiveTableWebRoutes } from "./routes/liveTableWebRoutes.js";
import { registerPlayerPortalWebRoutes } from "./routes/playerPortalWebRoutes.js";
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
  void registerCampaignWebRoutes(server);
  void registerCanvasWebRoutes(server);
  void registerDmDashboardWebRoutes(server);
  void registerInvitationWebRoutes(server);
  void registerLiveTableWebRoutes(server);
  void registerPlayerPortalWebRoutes(server);
  void registerSearchWebRoutes(server);
  server.register(registerAssetRoutes, { assetsDir: options.assetsDir });
}
