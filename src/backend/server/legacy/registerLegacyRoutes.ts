import type { FastifyInstance } from "fastify";
import { registerAccountRoutes } from "../routes/accountRoutes.js";
import { registerAssetRoutes } from "../routes/assetRoutes.js";
import { registerAuthRoutes } from "../routes/authRoutes.js";
import { registerCampaignRoutes } from "../routes/campaignRoutes.js";
import { registerCanvasRoutes } from "../routes/canvasRoutes.js";
import { registerEntityRoutes } from "../routes/entityRoutes.js";
import { registerExportRoutes } from "../routes/exportRoutes.js";
import { registerFactRoutes } from "../routes/factRoutes.js";
import { registerHardeningRoutes } from "../routes/hardeningRoutes.js";
import { registerPlayerPortalRoutes } from "../routes/playerPortalRoutes.js";
import { registerPlayerRoutes } from "../routes/playerRoutes.js";
import { registerPremadeCampaignRoutes } from "../routes/premadeCampaignRoutes.js";
import { registerProjectionRoutes } from "../routes/projectionRoutes.js";
import { registerRelationRoutes } from "../routes/relationRoutes.js";
import { registerRuleRoutes } from "../routes/ruleRoutes.js";
import { registerSessionRoutes } from "../routes/sessionRoutes.js";
import { registerTagRoutes } from "../routes/tagRoutes.js";
import { registerUserAuthRoutes } from "../routes/userAuthRoutes.js";
import { registerVaultRoutes } from "../routes/vaultRoutes.js";

export interface LegacyRoutesOptions {
  dataDir: string;
  assetsDir?: string;
}

/**
 * Registers the local-first filesystem API surface used by legacy desktop/LAN
 * flows. PostgreSQL web deployments must not call this module.
 */
export function registerLegacyRoutes(server: FastifyInstance, options: LegacyRoutesOptions): void {
  server.get("/api/auth/local-token", async (_request, reply) => {
    if (!server.allowLegacyTestAuth) {
      reply.code(410);
      return { error: "Local DM token shortcut has been removed. Use DM email + key login." };
    }

    const token = server.dmSessionToken;
    return { token, dmSessionToken: token };
  });

  const routeOptions = { dataDir: options.dataDir };
  server.register(registerVaultRoutes, routeOptions);
  // Register resource-specific campaign subroutes before the legacy catch-all
  // campaign routes so POST /api/campaigns/:campaignId/entities and similar
  // paths cannot be consumed by /api/campaigns/:campaignId.
  server.register(registerPlayerRoutes, routeOptions);
  server.register(registerEntityRoutes, routeOptions);
  server.register(registerRelationRoutes, routeOptions);
  server.register(registerFactRoutes, routeOptions);
  server.register(registerSessionRoutes, routeOptions);
  server.register(registerExportRoutes, routeOptions);
  server.register(registerProjectionRoutes, routeOptions);
  server.register(registerTagRoutes, routeOptions);
  server.register(registerRuleRoutes, routeOptions);
  server.register(registerCanvasRoutes, routeOptions);
  server.register(registerPlayerPortalRoutes, routeOptions);
  server.register(registerHardeningRoutes, routeOptions);
  server.register(registerPremadeCampaignRoutes, routeOptions);
  server.register(registerCampaignRoutes, routeOptions);
  server.register(registerAuthRoutes, routeOptions);
  server.register(registerUserAuthRoutes, routeOptions);
  server.register(registerAccountRoutes, routeOptions);
  server.register(registerAssetRoutes, { assetsDir: options.assetsDir });
}
