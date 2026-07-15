import { closeDatabasePool } from "../db/client.js";
import { createServer } from "../server/createServer.js";
import { formatListenUrl, resolveListenHost } from "./serverConfig.js";

const host = resolveListenHost(process.env);
const port = Number(process.env.PORT ?? process.env.DMCC_PORT ?? "4877");
const server = createServer({ dataDir: process.env.DMCC_DATA_DIR });
const SHUTDOWN_TIMEOUT_MS = 15_000;

let shutdownPromise: Promise<void> | undefined;

async function closeRuntimeResources(): Promise<void> {
  const failures: unknown[] = [];

  try {
    await server.close();
  } catch (error) {
    failures.push(error);
    console.error("[shutdown] HTTP server close failed:", error);
  }

  try {
    await closeDatabasePool();
  } catch (error) {
    failures.push(error);
    console.error("[shutdown] Database pool close failed:", error);
  }

  if (failures.length > 0) {
    throw new AggregateError(failures, "Runtime resources did not close cleanly");
  }
}

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  shutdownPromise ??= (async () => {
    console.info(`[shutdown] ${signal} received; draining HTTP requests before closing PostgreSQL.`);

    const forceExitTimer = setTimeout(() => {
      console.error(`[shutdown] Shutdown exceeded ${SHUTDOWN_TIMEOUT_MS} ms; forcing process exit.`);
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceExitTimer.unref();

    try {
      await closeRuntimeResources();
      console.info("[shutdown] Graceful shutdown completed.");
    } catch (error) {
      console.error("[shutdown] Graceful shutdown failed:", error);
      process.exitCode = 1;
    } finally {
      clearTimeout(forceExitTimer);
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
