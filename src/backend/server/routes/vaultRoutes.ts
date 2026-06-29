import type { FastifyInstance } from "fastify";
import { join } from "path";
import * as fs from "fs/promises";
import { assertDM } from "../auth.js";
import { assertWithinDir } from "../helpers.js";

export async function registerVaultRoutes(server: FastifyInstance, opts: { dataDir: string }) {
  const { dataDir } = opts;

  server.get("/api/vaults", async (request, _reply) => {
    assertDM(request, server.dmSessionToken);
    const vaultsDir = join(dataDir, "vaults");
    try {
      await fs.mkdir(vaultsDir, { recursive: true });
      const dirs = await fs.readdir(vaultsDir);
      const vaults = [];
      for (const dirName of dirs) {
        const statObj = await fs.stat(join(vaultsDir, dirName));
        if (statObj.isDirectory()) {
          try {
            const info = JSON.parse(await fs.readFile(join(vaultsDir, dirName, "vault.json"), "utf8"));
            vaults.push(info);
          } catch {
            vaults.push({ vaultId: dirName, name: dirName, createdAt: statObj.birthtime.toISOString() });
          }
        }
      }
      return vaults;
    } catch {
      return [{ vaultId: "default", name: "Default Vault", createdAt: new Date().toISOString() }];
    }
  });

  server.post<{ Body: { name: string } }>("/api/vaults", async (request, reply) => {
    assertDM(request, server.dmSessionToken);
    const { name } = request.body;
    if (!name || name.trim() === "") {
      reply.code(400);
      return { error: "Vault name is required" };
    }
    const cleanName = name.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/^_+|_+$/g, "") || "vault";
    const vaultsDir = join(dataDir, "vaults");
    const vaultDir = join(vaultsDir, cleanName);
    assertWithinDir(vaultDir, vaultsDir);
    await fs.mkdir(vaultDir, { recursive: true });
    const vaultInfo = { vaultId: cleanName, name, createdAt: new Date().toISOString() };
    await fs.writeFile(join(vaultDir, "vault.json"), JSON.stringify(vaultInfo, null, 2), "utf8");
    reply.code(201);
    return vaultInfo;
  });
}
