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
    summary: [
      "Valdris vive bajo la sombra de un Oráculo venerado como voz de los dioses. Sus profecías deciden matrimonios, rutas comerciales, condenas públicas y el destino político de la ciudad.",
      "Pero la fe que sostiene a Valdris descansa sobre una mentira: una red de ilusión arcana, chantajes nobles, documentos quemados y cadáveres arrojados al puerto.",
      "Cuando una profecía presenta una anomalía imposible, los aventureros empiezan a tirar de un hilo que conecta al Culto del Oráculo, el Consejo de la Ciudad, el Gremio de Ladrones y los mercaderes más poderosos de la costa.",
      "La campaña pregunta qué ocurre con una ciudad entera cuando descubre que su verdad sagrada era un fraude. Aventura para niveles 1-6.",
    ].join("\n\n"),
    system: "dnd_srd_5_2_1",
  });
  console.log(`✓ Campaign created: ${CMP}`);
}
