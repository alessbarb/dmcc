import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { hashSecret } from "../../src/backend/server/auth.js";
import {
  hashOpaque,
  readUserAuthStore,
} from "../../src/backend/server/userAuthStore.js";

const cleanup: string[] = [];

afterEach(async () => {
  await Promise.all(cleanup.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

describe("account store schema", () => {
  it("migrates schema 3 without changing user IDs or memberships", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "dmcc-account-store-"));
    cleanup.push(dataDir);
    const vaultDir = join(dataDir, "vaults", "default");
    await mkdir(vaultDir, { recursive: true });
    const password = await hashSecret("correct horse battery");
    const createdAt = "2025-01-02T03:04:05.000Z";
    const memberships = [{
      campaignId: "cmp_one",
      userId: "usr_dm",
      role: "dm",
      createdAt,
    }];
    await writeFile(join(vaultDir, "auth.json"), JSON.stringify({
      schemaVersion: 3,
      accessCodePepper: "pepper",
      users: [{
        userId: "usr_dm",
        emailNormalized: "dm@example.com",
        emailHash: hashOpaque("dm@example.com"),
        passwordHash: password.hash,
        passwordSalt: password.salt,
        passwordAlgorithm: "scrypt",
        vaultRole: "admin",
        createdAt,
      }],
      memberships,
      sessions: [],
      recoveryCodes: [],
      passwordResetTokens: [],
      createdAt,
      updatedAt: createdAt,
    }));

    const store = await readUserAuthStore(vaultDir);

    expect(store.schemaVersion).toBe(4);
    expect(store.users.map((user) => user.userId)).toEqual(["usr_dm"]);
    expect(store.memberships).toEqual(memberships);
    expect(store.preferences).toEqual([]);
    expect(store.dmProfiles).toEqual([]);
    expect(store.playerProfiles).toEqual([]);
  });
});
