// Generated seed content module. Edit directly; kept split by campaign data typology.
import { api } from "./client.ts";
import { CAMPAIGN_TITLE, CMP } from "./config.ts";

// ---------------------------------------------------------------------------
// Campaign
// ---------------------------------------------------------------------------

export async function seedCampaign() {
  await api("POST", "/api/campaigns", {
    campaignId: CMP,
    actorId: "usr_dm",
    title: CAMPAIGN_TITLE,
    summary: "Una intriga político-religiosa sacude la próspera ciudad costera de Valdris. El Oráculo, la mayor autoridad moral de la ciudad, sostiene su poder a base de profecías falsificadas mediante magia de ilusión. Los aventureros deberán infiltrarse en los bajos fondos, cooperar con la guardia, desenterrar secretos históricos y adentrarse en ruinas prohibidas para descubrir la verdad antes de que los inquisidores del culto los silencien para siempre. Aventura para niveles 1-6.",
    system: "dnd_srd_5_2_1",
  });
  console.log(`✓ Campaign created: ${CMP}`);
}
