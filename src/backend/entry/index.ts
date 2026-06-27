import { createServer } from "../server/createServer.js";
import { formatListenUrl, resolveListenHost } from "./serverConfig.js";

const host = resolveListenHost(process.env);
const port = Number(process.env.DMCC_PORT ?? "4877");
const server = createServer();

await server.listen({ host, port });
console.log(`DM Campaign Companion listening at ${formatListenUrl(host, port)}`);
