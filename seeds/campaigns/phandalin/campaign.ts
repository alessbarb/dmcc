import { api } from "./client.js";
import { CAMPAIGN_TITLE, CMP } from "./config.js";

export async function seedCampaign() {
  await api("POST", "/api/campaigns", {
    campaignId: CMP,
    actorId: "usr_dm",
    title: CAMPAIGN_TITLE,
    summary: [
      "Phandalin es un pueblo de frontera construido sobre ruinas antiguas y promesas mineras. Sus vecinos intentan levantar una vida tranquila entre caminos peligrosos, rumores de oro y amenazas que nadie quiere mirar de frente.",
      "La desaparición de Gundren Rockseeker rompe ese equilibrio. Goblins del clan Cragmaw, matones de capa roja, facciones locales y una figura conocida como la Araña Negra compiten por llegar antes que nadie a la Cueva del Eco de la Ola.",
      "Esta versión seed está preparada como campaña jugable de niveles 1-5: incluye relaciones completas, pistas ancladas a secretos, sesiones jugadas, sesiones futuras listas para dirigir, frentes opcionales y una capa clara entre conocimiento DM y conocimiento de jugadores.",
    ].join("\n\n"),
    system: "dnd_srd_5_2_1",
  });
  console.log(`✓ Campaign created: ${CMP}`);
}
