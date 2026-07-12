import { describe, expect, it } from "vitest";
import {
  canReadCampaignMessage,
  canSendCampaignMessage,
  MAX_CAMPAIGN_MESSAGE_LENGTH,
} from "../../src/backend/server/web/routes/campaignMessagingWebRoutes.js";

const partyMessage = {
  audience: "party",
  senderUserId: "usr_a",
  recipientPlayerId: null,
};

const dmMessage = {
  audience: "dm",
  senderUserId: "usr_a",
  recipientPlayerId: null,
};

const privatePlayerMessage = {
  audience: "player",
  senderUserId: "usr_a",
  recipientPlayerId: "ply_b",
};

describe("campaign messaging visibility", () => {
  it("shows party messages to every campaign participant", () => {
    expect(canReadCampaignMessage(partyMessage, { role: "player", userId: "usr_b", playerId: "ply_b" })).toBe(true);
    expect(canReadCampaignMessage(partyMessage, { role: "viewer", userId: "usr_viewer", playerId: null })).toBe(true);
  });

  it("gives dm and co_dm identical access to every message", () => {
    for (const role of ["dm", "co_dm"]) {
      expect(canReadCampaignMessage(dmMessage, { role, userId: `usr_${role}`, playerId: null })).toBe(true);
      expect(canReadCampaignMessage(privatePlayerMessage, { role, userId: `usr_${role}`, playerId: null })).toBe(true);
    }
  });

  it("keeps DM-private messages away from other players", () => {
    expect(canReadCampaignMessage(dmMessage, { role: "player", userId: "usr_b", playerId: "ply_b" })).toBe(false);
    expect(canReadCampaignMessage(dmMessage, { role: "player", userId: "usr_a", playerId: "ply_a" })).toBe(true);
  });

  it("shows player-private messages only to sender, recipient and direction", () => {
    expect(canReadCampaignMessage(privatePlayerMessage, { role: "player", userId: "usr_a", playerId: "ply_a" })).toBe(true);
    expect(canReadCampaignMessage(privatePlayerMessage, { role: "player", userId: "usr_b", playerId: "ply_b" })).toBe(true);
    expect(canReadCampaignMessage(privatePlayerMessage, { role: "player", userId: "usr_c", playerId: "ply_c" })).toBe(false);
  });
});

describe("campaign messaging write permissions", () => {
  it("allows direction and players to send messages", () => {
    expect(canSendCampaignMessage("dm")).toBe(true);
    expect(canSendCampaignMessage("co_dm")).toBe(true);
    expect(canSendCampaignMessage("player")).toBe(true);
  });

  it("keeps read-only and unknown roles from sending messages", () => {
    expect(canSendCampaignMessage("viewer")).toBe(false);
    expect(canSendCampaignMessage("guest")).toBe(false);
    expect(canSendCampaignMessage("")).toBe(false);
  });

  it("defines a bounded message size", () => {
    expect(MAX_CAMPAIGN_MESSAGE_LENGTH).toBe(4_000);
  });
});
