import { api } from "./client.js";
import { CMP } from "./config.js";
import * as ids from "./ids.js";

export async function seedFactions() {
  const party = { kind: "party" as const };
  const dm = { kind: "dm_only" as const };
  const FACTIONS = [
    { entityId: ids.ENT_FAC_TOWN, title: "Vecinos de Phandalin", summary: "Granjeros, mineros, comerciantes y familias que quieren seguridad sin provocar una guerra abierta.", status: "active", importance: "high", visibility: party, metadata: { agenda: "Sobrevivir, trabajar y que alguien ponga límites a los abusos." } },
    { entityId: ids.ENT_FAC_REDBRANDS, title: "Redbrands", summary: "Banda de matones que controla calles, deudas y silencios mediante violencia selectiva.", status: "active", importance: "critical", visibility: party, metadata: { agenda: "Mantener miedo suficiente para que nadie investigue a Glasstaff." } },
    { entityId: ids.ENT_FAC_CRAGMAW, title: "Clan Cragmaw", summary: "Goblins y goblinoides divididos entre supervivencia, codicia y obediencia a jefes más peligrosos.", status: "active", importance: "critical", visibility: party, metadata: { agenda: "Cobrar por Gundren, conservar el mapa y no morir por órdenes ajenas." } },
    { entityId: ids.ENT_FAC_ROCKSEEKER, title: "Hermanos Rockseeker", summary: "Buscadores de minas que han encontrado más de lo que podían proteger.", status: "active", importance: "critical", visibility: party, metadata: { agenda: "Recuperar la mina perdida y honrar el trabajo familiar." } },
    { entityId: ids.ENT_FAC_LORDS_ALLIANCE, title: "Alianza de los Señores", summary: "Red política interesada en estabilizar Phandalin sin perder prestigio ni recursos.", status: "available", importance: "normal", visibility: party, metadata: { agenda: "Restaurar orden sin admitir cuánto se les ha escapado la región." } },
    { entityId: ids.ENT_FAC_ZHENTARIM, title: "Red Zhentarim", summary: "Contactos mercantiles y de poder que ven Phandalin como una inversión futura.", status: "hidden", importance: "high", visibility: dm, metadata: { agenda: "Convertir el vacío de poder en ventaja comercial." } },
    { entityId: ids.ENT_FAC_ORDER_GAUNTLET, title: "Orden del Guantelete", summary: "Idealistas marciales atentos a señales de corrupción y abuso de poder.", status: "available", importance: "normal", visibility: party, metadata: { agenda: "Que la región no normalice el miedo como gobierno." } },
    { entityId: ids.ENT_FAC_EMERALD_ENCLAVE, title: "Enclave Esmeralda", summary: "Guardianes del equilibrio natural preocupados por Thundertree y por fuerzas que despiertan bajo la tierra.", status: "hidden", importance: "normal", visibility: dm, metadata: { agenda: "Evitar que ruinas, dragones y magia minera rompan el equilibrio local." } },
    { entityId: ids.ENT_FAC_WYVERN_ORCS, title: "Orcos del Tor del Guiverno", summary: "Asaltantes de frontera que presionan caminos y ponen a prueba la capacidad defensiva del pueblo.", status: "available", importance: "normal", visibility: party, metadata: { agenda: "Robar, probar fuerza y retirarse antes de una respuesta organizada." } },
    { entityId: ids.ENT_FAC_ASH_ZOMBIES, title: "Muertos de ceniza de Thundertree", summary: "Restos animados por catástrofe antigua, más síntoma de ruina que facción consciente.", status: "hidden", importance: "normal", visibility: dm, metadata: { agenda: "Ser recordatorio físico de que algunas ruinas no perdonan curiosidad." } },
  ];

  for (const faction of FACTIONS) {
    await api("POST", `/api/campaigns/${CMP}/entities`, { actorId: "usr_dm", entityType: "faction", ...faction });
  }
  console.log(`✓ ${FACTIONS.length} factions created`);
}
