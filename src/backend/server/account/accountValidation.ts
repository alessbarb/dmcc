import { isSafeImageUrl } from "../../../shared/schemas.js";

export const PROFILE_LIMITS = {
  displayName: 80,
  pronouns: 80,
  timeZone: 80,
  biography: 1000,
  contact: 500,
  publicHandle: 32,
} as const;

export function normalizePublicHandle(value: string): string {
  const handle = value.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9_-]{2,31}$/.test(handle)) {
    throw Object.assign(new Error("Invalid public handle"), {
      statusCode: 400,
      field: "publicHandle",
    });
  }
  return handle;
}

export function validateDisplayName(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string" || value.trim().length > PROFILE_LIMITS.displayName) {
    throw Object.assign(new Error("Invalid display name"), {
      statusCode: 400,
      field: "displayName",
    });
  }
  return value.trim();
}

export function validateAvatarUrl(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string" || !isSafeImageUrl(value.trim())) {
    throw Object.assign(new Error("Invalid avatar URL"), {
      statusCode: 400,
      field: "avatarUrl",
    });
  }
  return value.trim();
}
