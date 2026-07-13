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

    const results = await Promise.allSettled([
      server.close(),
      closeDatabasePool(),
    ]);
    const failure = results.find((result): result is PromiseRejectedResult => result.status === "rejected");

    if (failure) {
      console.error("[shutdown] Graceful shutdown failed:", failure.reason);
      process.exitCode = 1;
      return;
    }

    console.info("[shutdown] Graceful shutdown completed.");
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
