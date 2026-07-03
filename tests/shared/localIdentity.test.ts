import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock localStorage and window
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key];
  }),
  clear: vi.fn(() => {
    for (const key in store) {
      delete store[key];
    }
  }),
};

global.window = {
  location: {
    origin: "http://localhost:3000",
  },
} as any;

global.localStorage = localStorageMock as any;

import {
  readIdentity,
  upsertDmProfile,
} from "../../src/frontend/shared/auth/localIdentity.js";

describe("localIdentity", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("returns default identity when localStorage is empty", () => {
    const identity = readIdentity();
    expect(identity.version).toBe(1);
    expect(identity.serverOrigin).toBe("http://localhost:3000");
    expect(identity.dmProfiles).toEqual([]);
  });

  it("upserts profiles and deduplicates on read and write", () => {
    // 1. Upsert a first profile
    upsertDmProfile({
      dmId: "dm_1",
      email: "User@example.com",
      displayName: "User",
    });

    let identity = readIdentity();
    expect(identity.dmProfiles).toHaveLength(1);
    expect(identity.dmProfiles[0].email).toBe("User@example.com");

    // 2. Upsert a profile with the same email but different casing and different dmId
    // It should match the existing one, update it, and NOT create a duplicate
    upsertDmProfile({
      dmId: "dm_2",
      email: "user@example.com",
      displayName: "User Updated",
    });

    identity = readIdentity();
    expect(identity.dmProfiles).toHaveLength(1);
    expect(identity.dmProfiles[0].dmId).toBe("dm_2");
    expect(identity.dmProfiles[0].displayName).toBe("User Updated");
    expect(identity.dmProfiles[0].email).toBe("user@example.com");
  });

  it("deduplicates existing duplicates in localStorage keeping the most recent one", () => {
    // Manually set duplicate profiles with same email in localStorage
    const legacyIdentity = {
      version: 1,
      serverOrigin: "http://localhost:3000",
      vaultId: "default",
      dmProfiles: [
        {
          dmId: "dm_older",
          email: "alessbarb@gmail.com",
          displayName: "User Old",
          lastAccessed: "2026-07-02T10:00:00.000Z",
        },
        {
          dmId: "dm_newer",
          email: "ALESSBARB@gmail.com",
          displayName: "User New",
          lastAccessed: "2026-07-02T12:00:00.000Z",
        },
      ],
      playerProfiles: [],
    };
    localStorageMock.setItem("dmcc_identity", JSON.stringify(legacyIdentity));

    const identity = readIdentity();
    expect(identity.dmProfiles).toHaveLength(1);
    expect(identity.dmProfiles[0].dmId).toBe("dm_newer");
    expect(identity.dmProfiles[0].displayName).toBe("User New");
    expect(identity.dmProfiles[0].email).toBe("ALESSBARB@gmail.com");
  });
});
