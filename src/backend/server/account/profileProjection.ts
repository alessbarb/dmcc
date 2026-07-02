import type {
  ProfileAudience,
  SocialField,
  SocialProfileBase,
} from "./accountTypes.js";

const SOCIAL_FIELDS: SocialField[] = [
  "displayName",
  "avatarUrl",
  "pronouns",
  "timeZone",
  "biography",
  "contact",
];

const visibleAudiences: Record<ProfileAudience, Set<ProfileAudience>> = {
  private: new Set(["private", "dm", "table", "global"]),
  dm: new Set(["dm", "table", "global"]),
  table: new Set(["table", "global"]),
  global: new Set(["global"]),
};

export function projectProfile(
  profile: SocialProfileBase,
  audience: ProfileAudience
): Record<string, string> | null {
  if (audience === "global" && profile.publicationState === "private") return null;
  const output: Record<string, string> = {};
  for (const field of SOCIAL_FIELDS) {
    const value = profile[field];
    if (value && visibleAudiences[audience].has(profile.visibility[field])) {
      output[field] = value;
    }
  }
  if (audience === "global" && profile.publicHandle) {
    output.publicHandle = profile.publicHandle;
  }
  return output;
}
