import { createHash, createHmac, timingSafeEqual } from "crypto";

export function hashAccessCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export function hashCampaignAccessCode(campaignId: string, code: string, pepper: string): string {
  return `hmac-sha256:${createHmac("sha256", pepper).update(`${campaignId}:${code}`).digest("hex")}`;
}

export function verifyCampaignAccessCode(campaignId: string, code: string, storedHash: string | undefined, pepper: string): boolean {
  if (!storedHash) return false;
  const candidate = storedHash.startsWith("hmac-sha256:")
    ? hashCampaignAccessCode(campaignId, code, pepper)
    : hashAccessCode(code);
  const actual = Buffer.from(storedHash);
  const expected = Buffer.from(candidate);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
