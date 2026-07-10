import type { FastifyInstance } from "fastify";
import { registerAccountRoutes } from "../routes/accountRoutes.js";
import { registerAssetRoutes } from "../routes/assetRoutes.js";
import { registerAuthWebRoutes } from "./routes/authWebRoutes.js";
import { registerWebPlatformRoutes } from "./webPlatformRoutes.js";

export interface WebRoutesOptions {
  dataDir: string;
  assetsDir?: string;
}

/** Registers the PostgreSQL-backed multi-user web API surface. */
export function registerWebRoutes(server: FastifyInstance, options: WebRoutesOptions): void {
  void registerAuthWebRoutes(server);
  registerWebPlatformRoutes(server);
  server.register(registerAccountRoutes, { dataDir: options.dataDir });
  server.register(registerAssetRoutes, { assetsDir: options.assetsDir });
}
