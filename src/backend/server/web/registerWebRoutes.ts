import type { FastifyInstance } from "fastify";
import { registerAccountRoutes } from "../routes/accountRoutes.js";
import { registerAssetRoutes } from "../routes/assetRoutes.js";
import { registerAuthWebRoutes } from "./routes/authWebRoutes.js";
import { registerInvitationWebRoutes } from "./routes/invitationWebRoutes.js";
import { registerSearchWebRoutes } from "./routes/searchWebRoutes.js";
import { registerWebPlatformRoutes } from "./webPlatformRoutes.js";

export interface WebRoutesOptions {
  dataDir: string;
  assetsDir?: string;
}

const EXTRACTED_WEB_ROUTES = new Set([
  "POST /api/campaigns/:campaignId/invitations",
  "GET /api/campaigns/:campaignId/invitations",
  "POST /api/campaigns/:campaignId/invitations/:invitationId/revoke",
  "GET /api/invitations/:token",
  "POST /api/invitations/:token/accept",
  "GET /api/campaigns/:campaignId/search",
  "GET /api/player/campaigns/:campaignId/search",
]);

/**
 * Transitional facade for Oleada 1 route extraction.
 *
 * Extracted routes live in focused route modules; this facade prevents the
 * remaining platform monolith from registering old duplicate handlers until
 * those blocks are physically removed from `webPlatformRoutes.ts`.
 */
function createWebPlatformRoutesFacade(server: FastifyInstance): FastifyInstance {
  const routeMethods = new Set(["get", "post"]);

  return new Proxy(server, {
    get(target, property, receiver) {
      if (typeof property !== "string" || !routeMethods.has(property)) {
        return Reflect.get(target, property, receiver);
      }

      const registerRoute = Reflect.get(target, property, receiver);
      if (typeof registerRoute !== "function") {
        return registerRoute;
      }

      return (routePath: unknown, ...args: unknown[]) => {
        if (typeof routePath === "string" && EXTRACTED_WEB_ROUTES.has(`${property.toUpperCase()} ${routePath}`)) {
          return target;
        }
        return registerRoute.call(target, routePath, ...args);
      };
    },
  });
}

/** Registers the PostgreSQL-backed multi-user web API surface. */
export function registerWebRoutes(server: FastifyInstance, options: WebRoutesOptions): void {
  void registerAuthWebRoutes(server);
  void registerInvitationWebRoutes(server);
  void registerSearchWebRoutes(server);
  registerWebPlatformRoutes(createWebPlatformRoutesFacade(server));
  server.register(registerAccountRoutes, { dataDir: options.dataDir });
  server.register(registerAssetRoutes, { assetsDir: options.assetsDir });
}
