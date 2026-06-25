import { createServer } from "../server/createServer.js";

const host = process.env.DMCC_HOST ?? "127.0.0.1";
const port = Number(process.env.DMCC_PORT ?? "4877");
const server = createServer();

await server.listen({ host, port });
console.log(`DM Campaign Companion listening at http://${host}:${port}`);
