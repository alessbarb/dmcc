import { describe, expect, it } from "vitest";
import type { DmSocialProfile } from "../../src/backend/server/account/accountTypes.js";
import { projectProfile } from "../../src/backend/server/account/profileProjection.js";

const profile: DmSocialProfile = {
  userId: "usr_owner",
  displayName: "Alex",
  avatarUrl: "/assets/avatars/aric.jpg",
  pronouns: "they/them",
  timeZone: "Europe/Madrid",
  biography: "Private biography",
  contact: "Discord: alex",
  publicHandle: "alex",
  publicationState: "published",
  version: 1,
  visibility: {
    displayName: "global",
    avatarUrl: "table",
    pronouns: "table",
    timeZone: "dm",
    biography: "private",
    contact: "dm",
  },
};

describe("profile audience projections", () => {
  it("returns only table-visible fields to table members", () => {
    expect(projectProfile(profile, "table")).toEqual({
      displayName: "Alex",
      avatarUrl: "/assets/avatars/aric.jpg",
      pronouns: "they/them",
    });
  });

  it("returns only global fields plus handle in a published global projection", () => {
    expect(projectProfile(profile, "global")).toEqual({
      publicHandle: "alex",
      displayName: "Alex",
    });
  });

  it("returns no global projection while the profile is private", () => {
    expect(projectProfile({ ...profile, publicationState: "private" }, "global")).toBeNull();
  });
});
