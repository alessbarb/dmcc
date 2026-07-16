import { createCampaign } from "../domain/campaign/campaign.js";
import { campaignSettingsSchema } from "../domain/campaign/types.js";
import type { StoredEvent } from "../domain/events.js";
import type { CampaignState } from "../domain/state.js";
import type { Command } from "./commands.js";
import type { CommandResult } from "./commandBus.js";

type CampaignCommand = Extract<Command, { type: "CreateCampaign" | "UpdateCampaign" }>;

function singleEvent(state: CampaignState, event: StoredEvent): CommandResult {
  return { state, events: [event] };
}

function makeEvent<TPayload>(actorId: string, campaignId: CampaignState["campaignId"], type: StoredEvent["type"], payload: TPayload): StoredEvent<TPayload> {
  // The event union is discriminated by the command handlers above; the generic payload is preserved by callers.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return {
    eventId: `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    campaignId,
    type,
    actorId,
    occurredAt: new Date().toISOString(),
    payload,
  } as StoredEvent<TPayload>;
}

export function handleCampaignCommand(state: CampaignState, command: CampaignCommand): CommandResult {
  switch (command.type) {
case "CreateCampaign": {
  const campaign = createCampaign({
    campaignId: command.campaignId,
    title: command.title,
    summary: command.summary,
    system: command.system,
    coverUrl: command.coverUrl,
    settings: command.settings ? campaignSettingsSchema.parse(command.settings) : undefined,
    metadata: command.metadata,
  });
  const nextState = { ...state, campaign };
  return singleEvent(nextState, makeEvent(command.actorId, command.campaignId, "CampaignCreated", campaign));
}
case "UpdateCampaign": {
  if (!state.campaign) throw new Error("Campaign not found");
  const title = command.title !== undefined ? command.title.trim() : undefined;
  if (title !== undefined && title.length === 0) {
    throw new Error("Campaign title is required");
  }
  const nextCampaign = {
    ...state.campaign,
    ...(title !== undefined && { title }),
    ...(command.summary !== undefined && { summary: command.summary }),
    ...(command.system !== undefined && { system: command.system }),
    ...(command.status !== undefined && { status: command.status }),
    ...(command.coverUrl !== undefined && { coverUrl: command.coverUrl }),
    ...(command.metadata !== undefined && { metadata: { ...state.campaign.metadata, ...command.metadata } }),
    updatedAt: new Date().toISOString(),
  };
  return singleEvent({ ...state, campaign: nextCampaign }, makeEvent(command.actorId, command.campaignId, "CampaignUpdated", {
    id: command.campaignId,
    campaignId: command.campaignId,
    ...(title !== undefined && { title }),
    ...(command.summary !== undefined && { summary: command.summary }),
    ...(command.system !== undefined && { system: command.system }),
    ...(command.status !== undefined && { status: command.status }),
    ...(command.coverUrl !== undefined && { coverUrl: command.coverUrl }),
    ...(command.metadata !== undefined && { metadata: nextCampaign.metadata }),
  }));
}
  }
  throw new Error("Unsupported campaign command");
}
