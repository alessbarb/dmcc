export { hashSecret, verifySecret } from "./web/webSession.js";
export {
  allowLegacyTestAuth,
  assertCampaignAccess,
  assertDM,
  assertDmCampaignAccess,
  createDmSessionToken,
  getRequestActorId,
  getRequestDmId,
  getRequestDmSession,
  getRequestPlayerId,
  getRequestRole,
  getRequestRoleWithTokens,
  getValidatedVaultId,
  hashPin,
  isLoopbackRequest,
  verifyDmSessionToken,
  verifyPin,
  type DmSessionPayload,
} from "./legacy/legacyAuth.js";
export { hashAccessCode, hashCampaignAccessCode, verifyCampaignAccessCode } from "./legacy/legacyAccessCodes.js";
export { generatePlayerToken, hashPlayerToken } from "./legacy/legacyPlayerTokens.js";

export function getValidatedCampaignId(campaignId: string): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(campaignId)) {
    const err = new Error("Invalid campaign ID format");
    (err as any).statusCode = 400;
    throw err;
  }
  return campaignId;
}
