import { closeDatabasePool } from "../db/client.js";
import { createServer } from "../server/createServer.js";
import { formatListenUrl, resolveListenHost } from "./serverConfig.js";

const host = resolveListenHost(process.env);
const port = Number(process.env.PORT ?? process.env.DMCC_PORT ?? "4877");
const server = createServer({ dataDir: process.env.DMCC_DATA_DIR });

if (host === "0.0.0.0") {
  (server as any).lanExposed = true;
}

let shutdownPromise: Promise<void> | undefined;

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  shutdownPromise ??= (async () => {
    console.info(`[shutdown] ${signal} received; closing HTTP server and database pool.`);

    try {
      await server.close();
      await closeDatabasePool();
      console.info("[shutdown] Graceful shutdown completed.");
    } catch (error) {
      console.error("[shutdown] Graceful shutdown failed:", error);
      process.exitCode = 1;
    }
  })();

  await shutdownPromise;
}

for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.once(signal, () => {
    void shutdown(signal);
  });
}

await server.listen({ host, port });
console.log(`DM Campaign Companion listening at ${formatListenUrl(host, port)}`);
