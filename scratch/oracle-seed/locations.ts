// Generated seed content module. Edit directly; kept split by campaign data typology.
import { api } from "./client.ts";
import { CMP } from "./config.ts";
import * as ids from "./ids.ts";

// ---------------------------------------------------------------------------
// Locations
// ---------------------------------------------------------------------------

export async function seedLocations() {
  const LOCATIONS = [
    {
      entityId: ids.ENT_LOC_VALDRIS, entityType: "location",
      title: "Ciudad de Valdris",
      summary: "Ciudad portuaria de tamaño medio de arquitectura de piedra blanca y tejados grises. Es el centro del comercio de la costa, pero su estabilidad política depende por completo del Oráculo.",
      status: "active", importance: "critical",
      metadata: { 
        locationType: "settlement", 
        publicDescription: "Una próspera y bulliciosa ciudad comercial en la costa. Sus mercados están siempre activos y las tabernas llenas de marineros, pero todos los ciudadanos veneran la guía del Oráculo." 
      },
    },
    {
      entityId: ids.ENT_LOC_SALA_ORACULO, entityType: "location",
      title: "Sala del Oráculo",
      summary: "El sanctum del templo del culto. Aquí, Veradis recibe a los convocados y les transmite las supuestas profecías.",
      status: "active", importance: "critical",
      metadata: {
        locationType: "building",
        publicDescription: "Una impresionante cámara circular sumida en una penumbra mística. El olor a mirra y sándalo satura el aire, mientras la voz del Oráculo resuena con un eco sobrenatural.",
        privateDescription: "Cámara de ilusión arcana equipada con espejos reflectantes cóncavos, amplificadores de sonido mágicos y un cristal de resonancia oculto tras un tapiz doble. La voz divina no es más que una ilusión.",
      },
    },
    {
      entityId: ids.ENT_LOC_RUINAS, entityType: "location",
      title: "Ruinas del Templo Antiguo",
      summary: "Restos carbonizados del antiguo templo original de la Verdad, destruido hace 20 años durante una fatídica noche de incendios sospechosamente oportunos.",
      status: "active", importance: "high",
      metadata: {
        locationType: "dungeon",
        atmosphere: "Aire frío y húmedo. Columnas de mármol negro cubiertas de hiedra y un silencio opresivo roto solo por los susurros del viento en las grietas.",
        dangers: ["Trampas mecánicas antiguas de aguja y veneno", "Guardianes no-muertos menores (esqueletos y zombis cubiertos de hollín)"],
      },
    },
    {
      entityId: ids.ENT_LOC_BOVEDA, entityType: "location",
      title: "Bóveda Subterránea",
      summary: "Una cámara secreta subterránea construida bajo las ruinas del antiguo templo. Aquí se custodian las pruebas más comprometedoras de la conspiración.",
      status: "active", importance: "critical",
      metadata: {
        locationType: "dungeon",
        privateDescription: "Registros meticulosos de las 847 profecías falsificadas durante 20 años, organizadas por fechas, pagos recibidos y nombres de los beneficiarios aristócratas.",
        dangers: ["Inquisidores del culto fuertemente armados", "Una cerradura arcana con alarma mágica vinculada a la mente de Veradis"],
      },
    },
    {
      entityId: ids.ENT_LOC_TABERNA_CUERVO, entityType: "location",
      title: "Taberna del Cuervo",
      summary: "Una taberna de madera tosca y techos bajos situada en el corazón del barrio portuario. Es el cuartel general de facto de los contrabandistas y oídos del Gremio.",
      status: "active", importance: "normal",
      metadata: {
        locationType: "building",
        publicDescription: "Un local ruidoso e impregnado de olor a tabaco de pipa, pescado frito y cerveza barata. Ideal para quien busca información confidencial o pasaje sin preguntas.",
        atmosphere: "Luz tenue de velas de sebo, murmullos constantes y ojos que vigilan discretamente cada entrada desde las esquinas oscuras.",
      },
    },
    {
      entityId: ids.ENT_LOC_PUERTO, entityType: "location",
      title: "Puerto de Valdris",
      summary: "La principal arteria comercial de la ciudad. Barcos de todos los rincones del mundo atracan aquí, trayendo mercancías y, frecuentemente, secretos oscuros.",
      status: "active", importance: "normal",
      metadata: { 
        locationType: "landmark", 
        publicDescription: "Un hervidero de marineros, estibadores e inquisidores que patrullan para confiscar cualquier cargamento sospechoso de atentar contra el culto." 
      },
    },
    {
      entityId: ids.ENT_LOC_BARRIO_NOBLE, entityType: "location",
      title: "Barrio Noble",
      summary: "El exclusivo distrito residencial de la élite de Valdris, protegido por altos muros de piedra pulida y guardias privados que impenden el paso a la plebe.",
      status: "active", importance: "normal",
      metadata: { locationType: "region" },
    },
    {
      entityId: ids.ENT_LOC_ARCHIVO, entityType: "location",
      title: "Archivo de la Ciudad",
      summary: "El repositorio de registros y anales históricos de la ciudad de Valdris. La mayor parte de su sección histórica ardió misteriosamente hace dos décadas.",
      status: "active", importance: "high",
      metadata: { 
        locationType: "building", 
        publicDescription: "Una vasta biblioteca de techos altos y estanterías infinitas de roble, llena del aroma a pergamino y polvo antiguo. La Archivista Mira pasa aquí sus días." 
      },
    },
    {
      entityId: ids.ENT_LOC_CAMPAMENTO_GREMIO, entityType: "location",
      title: "Guarida del Gremio",
      summary: "La base de operaciones secreta del Gremio de Ladrones, oculta en la antigua red de cloacas bajo los muelles. Su entrada está protegida por trampas e ilusiones.",
      status: "active", importance: "normal",
      visibility: { kind: "dm_only" as const },
      metadata: { 
        locationType: "dungeon", 
        dangers: ["Trampas de foso con estacas", "Centinelas apostados en la oscuridad armados con ballestas cargadas con virotes envenenados"] 
      },
    },
    {
      entityId: ids.ENT_LOC_SANTUARIO_BOSQUE, entityType: "location",
      title: "Santuario del Bosque",
      summary: "Un modesto templo de madera oculto en la espesura del bosque, a varias millas de las murallas de Valdris. Sirve de refugio para los verdaderos creyentes de la Verdad.",
      status: "active", importance: "normal",
      metadata: {
        locationType: "landmark",
        publicDescription: "Un claro pacífico rodeado de árboles ancestrales. Los peregrinos acuden aquí para escuchar sermones limpios del influjo político del Oráculo.",
        atmosphere: "Paz perturbada por la creciente tensión de que los Inquisidores del culto descubran el lugar y lo purguen por fuego.",
      },
    },
    {
      entityId: ids.ENT_LOC_SALA_CONSEJO, entityType: "location",
      title: "Sala del Consejo",
      summary: "La fastuosa cámara parlamentaria en el palacio municipal, donde los consejeros se reúnen para debatir las leyes y los impuestos de Valdris.",
      status: "active", importance: "normal",
      metadata: { locationType: "building" },
    },
    {
      entityId: ids.ENT_LOC_CUARTEL_GUARDIA, entityType: "location",
      title: "Cuartel de la Guardia",
      summary: "El bastión fortificado de la guardia municipal, que alberga los calabozos, la armería y la oficina privada de la Capitana Lyra.",
      status: "active", importance: "normal",
      metadata: { locationType: "building" },
    },
    {
      entityId: ids.ENT_LOC_MANSION_VANTIS, entityType: "location",
      title: "Mansión Vantis",
      summary: "La opulenta y fuertemente custodiada mansión de Lord Vantis, repleta de lujos extranjeros financiados gracias a las profecías del culto.",
      status: "active", importance: "high",
      visibility: { kind: "dm_only" as const },
      metadata: { 
        locationType: "building", 
        privateDescription: "Una elegante sala de reuniones subterránea equipada con un pasadizo secreto que conecta directamente con la red de alcantarillado de la ciudad." 
      },
    },
    {
      entityId: ids.ENT_LOC_TEMPLO_VERDAD, entityType: "location",
      title: "Templo de la Verdad (Ciudad)",
      summary: "El degradado templo urbano del culto a la Verdad, cuyas finanzas e influencia han sido sistemáticamente ahogadas por la propaganda del Oráculo.",
      status: "active", importance: "normal",
      metadata: { locationType: "building" },
    },
    {
      entityId: ids.ENT_LOC_MUELLES, entityType: "location",
      title: "Muelles del Puerto",
      summary: "Los muelles de madera carcomida del puerto. Es el lugar idóneo para contrabandear componentes mágicos y celebrar encuentros clandestinos a altas horas de la noche.",
      status: "active", importance: "low",
      metadata: { locationType: "landmark" },
    },
  ];

  for (const loc of LOCATIONS) {
    await api("POST", `/api/campaigns/${CMP}/entities`, { ...loc, actorId: "usr_dm" });
  }
  console.log(`✓ ${LOCATIONS.length} locations created`);
}
