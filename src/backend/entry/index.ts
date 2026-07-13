import { closeDatabasePool } from "../db/client.js";
import { createServer } from "../server/createServer.js";
import { formatListenUrl, resolveListenHost } from "./serverConfig.js";

const host = resolveListenHost(process.env);
const port = Number(process.env.PORT ?? process.env.DMCC_PORT ?? "4877");
const server = createServer({ dataDir: process.env.DMCC_DATA_DIR });
const SHUTDOWN_TIMEOUT_MS = 15_000;

if (host === "0.0.0.0") {
  (server as any).lanExposed = true;
}

let shutdownPromise: Promise<void> | undefined;

async function closeRuntimeResources(): Promise<void> {
  const results = await Promise.allSettled([
    server.close(),
    closeDatabasePool(),
  ]);

  const failures = results.filter((result): result is PromiseRejectedResult => result.status === "rejected");
  if (failures.length === 0) return;

  for (const failure of failures) {
    console.error("[shutdown] Resource close failed:", failure.reason);
  }
  throw new AggregateError(failures.map((failure) => failure.reason), "Runtime resources did not close cleanly");
}

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  shutdownPromise ??= (async () => {
    console.info(`[shutdown] ${signal} received; closing HTTP server and database pool.`);

    let timeout: NodeJS.Timeout | undefined;
    try {
      await Promise.race([
        closeRuntimeResources(),
        new Promise<never>((_, reject) => {
          timeout = setTimeout(() => reject(new Error(`Shutdown exceeded ${SHUTDOWN_TIMEOUT_MS} ms`)), SHUTDOWN_TIMEOUT_MS);
          timeout.unref();
        }),
      ]);
      console.info("[shutdown] Graceful shutdown completed.");
    } catch (error) {
      console.error("[shutdown] Graceful shutdown failed:", error);
      process.exitCode = 1;
    } finally {
      if (timeout) clearTimeout(timeout);
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
