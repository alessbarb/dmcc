import { describe, expect, it } from "vitest";
import {
  campaignMessageSenderColorIndex,
  canReadCampaignMessage,
  canSendCampaignMessage,
  MAX_CAMPAIGN_MESSAGE_LENGTH,
} from "../../src/backend/server/web/routes/campaignMessagingWebRoutes.js";

const partyMessage = { audience: "party", senderUserId: "usr_a", recipientPlayerId: null };
const dmMessage = { audience: "dm", senderUserId: "usr_a", recipientPlayerId: null };
const privatePlayerMessage = { audience: "player", senderUserId: "usr_a", recipientPlayerId: "ply_b" };

describe("campaign messaging visibility", () => {
  it("shows party messages to every campaign participant", () => {
    expect(canReadCampaignMessage(partyMessage, { role: "player", userId: "usr_b", playerId: "ply_b" })).toBe(true);
    expect(canReadCampaignMessage(partyMessage, { role: "unknown", userId: "usr_unknown", playerId: null })).toBe(true);
  });

  it("shows DM-private messages only to direction and their sender", () => {
    for (const role of ["dm", "co_dm"]) {
      expect(canReadCampaignMessage(dmMessage, { role, userId: `usr_${role}`, playerId: null })).toBe(true);
    }
    expect(canReadCampaignMessage(dmMessage, { role: "player", userId: "usr_b", playerId: "ply_b" })).toBe(false);
    expect(canReadCampaignMessage(dmMessage, { role: "player", userId: "usr_a", playerId: "ply_a" })).toBe(true);
  });

  it("keeps player-private messages between sender and recipient only", () => {
    expect(canReadCampaignMessage(privatePlayerMessage, { role: "player", userId: "usr_a", playerId: "ply_a" })).toBe(true);
    expect(canReadCampaignMessage(privatePlayerMessage, { role: "player", userId: "usr_b", playerId: "ply_b" })).toBe(true);
    expect(canReadCampaignMessage(privatePlayerMessage, { role: "player", userId: "usr_c", playerId: "ply_c" })).toBe(false);
    expect(canReadCampaignMessage(privatePlayerMessage, { role: "dm", userId: "usr_dm", playerId: null })).toBe(false);
    expect(canReadCampaignMessage(privatePlayerMessage, { role: "co_dm", userId: "usr_co_dm", playerId: null })).toBe(false);
  });
});

describe("campaign messaging write permissions", () => {
  it("allows direction and players to send bounded messages", () => {
    expect(canSendCampaignMessage("dm")).toBe(true);
    expect(canSendCampaignMessage("co_dm")).toBe(true);
    expect(canSendCampaignMessage("player")).toBe(true);
    expect(MAX_CAMPAIGN_MESSAGE_LENGTH).toBe(4_000);
  });

  it("keeps unrecognized roles from sending messages", () => {
    expect(canSendCampaignMessage("guest")).toBe(false);
    expect(canSendCampaignMessage("")).toBe(false);
  });
});

describe("campaign sender colors", () => {
  it("assigns a stable bounded color index per sender", () => {
    expect(campaignMessageSenderColorIndex("usr_a")).toBe(campaignMessageSenderColorIndex("usr_a"));
    expect(campaignMessageSenderColorIndex("usr_a")).toBeGreaterThanOrEqual(0);
    expect(campaignMessageSenderColorIndex("usr_a")).toBeLessThan(10);
  });
});
