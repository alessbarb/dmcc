import type { FastifyInstance } from "fastify";
import { registerAccountRoutes } from "../routes/accountRoutes.js";
import { registerAssetRoutes } from "../routes/assetRoutes.js";
import { registerAuthWebRoutes } from "./routes/authWebRoutes.js";
import { registerWebPlatformRoutes } from "./webPlatformRoutes.js";

export interface WebRoutesOptions {
  dataDir: string;
  assetsDir?: string;
}

const AUTH_WEB_ROUTES = new Set([
  "POST /api/auth/register",
  "POST /api/auth/login",
  "POST /api/auth/logout",
  "POST /api/auth/forgot-password",
  "POST /api/auth/reset-password",
  "GET /api/auth/session",
  "GET /api/auth/status",
  "GET /api/me",
  "GET /api/me/campaigns",
]);

/**
 * Transitional facade for Oleada 1.
 *
 * Auth routes now live in `routes/authWebRoutes.ts`, but the remaining platform
 * module still contains the old handlers until the monolith is physically
 * reduced. The facade lets us wire the new auth module without registering
 * duplicate Fastify routes. Remove this once the duplicated auth block is deleted
 * from `webPlatformRoutes.ts`.
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
        if (typeof routePath === "string" && AUTH_WEB_ROUTES.has(`${property.toUpperCase()} ${routePath}`)) {
          return target;
        }
        return registerRoute.call(target, routePath, ...args);
      };
    },
  });
}

/** Registers the PostgreSQL-backed multi-user web API surface. */
export function registerWebRoutes(server: FastifyInstance, options: WebRoutesOptions): void {
  registerAuthWebRoutes(server);
  registerWebPlatformRoutes(createWebPlatformRoutesFacade(server));
  server.register(registerAccountRoutes, { dataDir: options.dataDir });
  server.register(registerAssetRoutes, { assetsDir: options.assetsDir });
}
