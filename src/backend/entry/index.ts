import { createServer } from "../server/createServer.js";
import { formatListenUrl, resolveListenHost } from "./serverConfig.js";

const host = resolveListenHost(process.env);
const port = Number(process.env.PORT ?? "4877");
const server = createServer({ dataDir: process.env.DMCC_DATA_DIR });

if (host === "0.0.0.0") {
  (server as any).lanExposed = true;
}

await server.listen({ host, port });
console.log(`DM Campaign Companion listening at ${formatListenUrl(host, port)}`);
