import { beforeEach } from "vitest";
import { db } from "../src/backend/db/client.js";
import { campaignMessageReads, campaignMessages } from "../src/backend/db/messagingSchema.js";
import { playerPortalResources, playerPortalStates } from "../src/backend/db/playerPortalSchema.js";
import * as schema from "../src/backend/db/schema.js";

async function cleanDatabase() {
  await db.delete(campaignMessageReads);
  await db.delete(campaignMessages);
  await db.delete(schema.activityFeed);
  await db.delete(schema.attachments);
  await db.delete(schema.campaignInvitationAcceptances);
  await db.delete(schema.campaignInvitations);
  await db.delete(schema.campaignNotes);
  await db.delete(schema.playerProposals);
  await db.delete(schema.campaignObjectives);
  await db.delete(schema.campaignClues);
  await db.delete(schema.characters);
  await db.delete(schema.campaignScenes);
  await db.delete(schema.campaignSessions);
  await db.delete(schema.liveTables);
  await db.delete(playerPortalResources);
  await db.delete(playerPortalStates);
  await db.delete(schema.visibilityGrants);
  await db.delete(schema.campaignRelations);
  await db.delete(schema.campaignFacts);
  await db.delete(schema.campaignEntities);
  await db.delete(schema.campaignSnapshots);
  await db.delete(schema.commandIndex);
  await db.delete(schema.domainEvents);
  await db.delete(schema.playerProfiles);
  await db.delete(schema.dmProfiles);
  await db.delete(schema.campaignMemberships);
  await db.delete(schema.campaigns);
  await db.delete(schema.workspaceMemberships);
  await db.delete(schema.workspaces);
  await db.delete(schema.authSessions);
  await db.delete(schema.userPreferences);
  await db.delete(schema.recoveryCodes);
  await db.delete(schema.passwordResetTokens);
  await db.delete(schema.users);
}

beforeEach(async () => {
  await cleanDatabase();
});
