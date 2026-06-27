// Generated seed content module. Edit directly; kept split by campaign data typology.
import { api } from "./client.js";
import { CMP } from "./config.js";
import * as ids from "./ids.js";

// ---------------------------------------------------------------------------
// Locations
// ---------------------------------------------------------------------------

export async function seedLocations() {
  const LOCATIONS = [
    {
      entityId: ids.ENT_LOC_VALDRIS,
      entityType: "location",
      title: "Ciudad de Valdris",
      summary:
        "Ciudad portuaria de tamaño medio de arquitectura de piedra blanca y tejados grises. Es el centro del comercio de la costa, pero su estabilidad política depende por completo del Oráculo.",
      status: "active",
      importance: "critical",
      metadata: {
        locationType: "settlement",
        publicDescription:
          "Una próspera y bulliciosa ciudad comercial en la costa. Sus mercados están siempre activos y las tabernas llenas de marineros, pero todos los ciudadanos veneran la guía del Oráculo.",
        playerIntro:
          "Valdris parece rica, devota y estable. Sus plazas rebosan comercio, sus campanas marcan las audiencias del Oráculo y nadie habla demasiado alto contra el templo.",
        readAloud:
          "Valdris se alza junto al mar como una corona de piedra blanca y tejados grises. Gaviotas, pregoneros y campanas compiten por hacerse oír mientras, sobre todo ello, la silueta del templo del Oráculo domina la ciudad.",
      },
    },
    {
      entityId: ids.ENT_LOC_SALA_ORACULO,
      entityType: "location",
      title: "Sala del Oráculo",
      summary:
        "El sanctum del templo del culto. Aquí, Veradis recibe a los convocados y les transmite las supuestas profecías.",
      status: "active",
      importance: "critical",
      metadata: {
        locationType: "building",
        publicDescription:
          "Una impresionante cámara circular sumida en una penumbra mística. El olor a mirra y sándalo satura el aire, mientras la voz del Oráculo resuena con un eco sobrenatural.",
        privateDescription:
          "Cámara de ilusión arcana equipada con espejos reflectantes cóncavos, amplificadores de sonido mágicos y un cristal de resonancia oculto tras un tapiz doble. La voz divina no es más que una ilusión.",
        readAloud:
          "La sala circular os recibe con un silencio casi religioso. El incienso flota en capas espesas y, desde algún punto imposible de ubicar, una voz grave parece vibrar dentro de las columnas antes de llegar a vuestros oídos.",
      },
    },
    {
      entityId: ids.ENT_LOC_RUINAS,
      entityType: "location",
      title: "Ruinas del Templo Antiguo",
      summary:
        "Restos carbonizados del antiguo templo original de la Verdad, destruido hace 20 años durante una fatídica noche de incendios sospechosamente oportunos.",
      status: "active",
      importance: "high",
      metadata: {
        locationType: "dungeon",
        atmosphere:
          "Aire frío y húmedo. Columnas de mármol negro cubiertas de hiedra y un silencio opresivo roto solo por los susurros del viento en las grietas.",
        dangers: [
          "Trampas mecánicas antiguas de aguja y veneno",
          "Guardianes no-muertos menores (esqueletos y zombis cubiertos de hollín)",
        ],
        readAloud:
          "Las ruinas apenas conservan la forma de un templo. Las columnas quemadas sobresalen como huesos negros entre la hiedra, y cada pisada levanta polvo gris de una noche que Valdris insiste en olvidar.",
      },
    },
    {
      entityId: ids.ENT_LOC_BOVEDA,
      entityType: "location",
      title: "Bóveda Subterránea",
      summary:
        "Una cámara secreta subterránea construida bajo las ruinas del antiguo templo. Aquí se custodian las pruebas más comprometedoras de la conspiración.",
      status: "active",
      importance: "critical",
      metadata: {
        locationType: "dungeon",
        privateDescription:
          "Registros meticulosos de las 847 profecías falsificadas durante 20 años, organizadas por fechas, pagos recibidos y nombres de los beneficiarios aristócratas.",
        dangers: [
          "Inquisidores del culto fuertemente armados",
          "Una cerradura arcana con alarma mágica vinculada a la mente de Veradis",
        ],
        readAloud:
          "La bóveda huele a hierro viejo, cera apagada y papel encerrado durante décadas. Filas de cofres reposan contra los muros, etiquetados con nombres, fechas y pagos que alguien esperaba mantener ocultos para siempre.",
      },
    },
    {
      entityId: ids.ENT_LOC_TABERNA_CUERVO,
      entityType: "location",
      title: "Taberna del Cuervo",
      summary:
        "Una taberna de madera tosca y techos bajos situada en el corazón del barrio portuario. Es el cuartel general de facto de los contrabandistas y oídos del Gremio.",
      status: "active",
      importance: "normal",
      metadata: {
        locationType: "building",
        publicDescription:
          "Un local ruidoso e impregnado de olor a tabaco de pipa, pescado frito y cerveza barata. Ideal para quien busca información confidencial o pasaje sin preguntas.",
        atmosphere:
          "Luz tenue de velas de sebo, murmullos constantes y ojos que vigilan discretamente cada entrada desde las esquinas oscuras.",
        readAloud:
          "La Taberna del Cuervo os traga entre humo, cerveza agria y madera vieja. Nadie deja de hablar al veros entrar, pero varias conversaciones bajan de volumen lo justo para que lo notéis.",
      },
    },
    {
      entityId: ids.ENT_LOC_PUERTO,
      entityType: "location",
      title: "Puerto de Valdris",
      summary:
        "La principal arteria comercial de la ciudad. Barcos de todos los rincones del mundo atracan aquí, trayendo mercancías y, frecuentemente, secretos oscuros.",
      status: "active",
      importance: "normal",
      metadata: {
        locationType: "landmark",
        publicDescription:
          "Un hervidero de marineros, estibadores e inquisidores que patrullan para confiscar cualquier cargamento sospechoso de atentar contra el culto.",
        readAloud:
          "El puerto golpea los sentidos: sal, brea, pescado fresco, gritos de descarga y cadenas arrastrándose sobre madera mojada. Entre los barcos, las patrullas del culto caminan como si también poseyeran el mar.",
      },
    },
    {
      entityId: ids.ENT_LOC_BARRIO_NOBLE,
      entityType: "location",
      title: "Barrio Noble",
      summary:
        "El exclusivo distrito residencial de la élite de Valdris, protegido por altos muros de piedra pulida y guardias privados que impenden el paso a la plebe.",
      status: "active",
      importance: "normal",
      metadata: { locationType: "region" },
    },
    {
      entityId: ids.ENT_LOC_ARCHIVO,
      entityType: "location",
      title: "Archivo de la Ciudad",
      summary:
        "El repositorio de registros y anales históricos de la ciudad de Valdris. La mayor parte de su sección histórica ardió misteriosamente hace dos décadas.",
      status: "active",
      importance: "high",
      metadata: {
        locationType: "building",
        publicDescription:
          "Una vasta biblioteca de techos altos y estanterías infinitas de roble, llena del aroma a pergamino y polvo antiguo. La Archivista Mira pasa aquí sus días.",
        readAloud:
          "El Archivo de la Ciudad respira polvo, tinta seca y silencio. En una de sus alas, la piedra ennegrecida aún conserva las marcas del incendio que borró una parte entera de la memoria de Valdris.",
      },
    },
    {
      entityId: ids.ENT_LOC_CAMPAMENTO_GREMIO,
      entityType: "location",
      title: "Guarida del Gremio",
      summary:
        "La base de operaciones secreta del Gremio de Ladrones, oculta en la antigua red de cloacas bajo los muelles. Su entrada está protegida por trampas e ilusiones.",
      status: "active",
      importance: "normal",
      visibility: { kind: "dm_only" as const },
      metadata: {
        locationType: "dungeon",
        dangers: [
          "Trampas de foso con estacas",
          "Centinelas apostados en la oscuridad armados con ballestas cargadas con virotes envenenados",
        ],
      },
    },
    {
      entityId: ids.ENT_LOC_SANTUARIO_BOSQUE,
      entityType: "location",
      title: "Santuario del Bosque",
      summary:
        "Un modesto templo de madera oculto en la espesura del bosque, a varias millas de las murallas de Valdris. Sirve de refugio para los verdaderos creyentes de la Verdad.",
      status: "active",
      importance: "normal",
      metadata: {
        locationType: "landmark",
        publicDescription:
          "Un claro pacífico rodeado de árboles ancestrales. Los peregrinos acuden aquí para escuchar sermones limpios del influjo político del Oráculo.",
        atmosphere:
          "Paz perturbada por la creciente tensión de que los Inquisidores del culto descubran el lugar y lo purguen por fuego.",
      },
    },
    {
      entityId: ids.ENT_LOC_SALA_CONSEJO,
      entityType: "location",
      title: "Sala del Consejo",
      summary:
        "La fastuosa cámara parlamentaria en el palacio municipal, donde los consejeros se reúnen para debatir las leyes y los impuestos de Valdris.",
      status: "active",
      importance: "normal",
      metadata: { locationType: "building" },
    },
    {
      entityId: ids.ENT_LOC_CUARTEL_GUARDIA,
      entityType: "location",
      title: "Cuartel de la Guardia",
      summary:
        "El bastión fortificado de la guardia municipal, que alberga los calabozos, la armería y la oficina privada de la Capitana Lyra.",
      status: "active",
      importance: "normal",
      metadata: { locationType: "building" },
    },
    {
      entityId: ids.ENT_LOC_MANSION_VANTIS,
      entityType: "location",
      title: "Mansión Vantis",
      summary:
        "La opulenta y fuertemente custodiada mansión de Lord Vantis, repleta de lujos extranjeros financiados gracias a las profecías del culto.",
      status: "active",
      importance: "high",
      visibility: { kind: "dm_only" as const },
      metadata: {
        locationType: "building",
        privateDescription:
          "Una elegante sala de reuniones subterránea equipada con un pasadizo secreto que conecta directamente con la red de alcantarillado de la ciudad.",
      },
    },
    {
      entityId: ids.ENT_LOC_TEMPLO_VERDAD,
      entityType: "location",
      title: "Templo de la Verdad (Ciudad)",
      summary:
        "El degradado templo urbano del culto a la Verdad, cuyas finanzas e influencia han sido sistemáticamente ahogadas por la propaganda del Oráculo.",
      status: "active",
      importance: "normal",
      metadata: { locationType: "building" },
    },
    {
      entityId: ids.ENT_LOC_MUELLES,
      entityType: "location",
      title: "Muelles del Puerto",
      summary:
        "Los muelles de madera carcomida del puerto. Es el lugar idóneo para contrabandear componentes mágicos y celebrar encuentros clandestinos a altas horas de la noche.",
      status: "active",
      importance: "low",
      metadata: { locationType: "landmark" },
    },
  ];

  for (const loc of LOCATIONS) {
    await api("POST", `/api/campaigns/${CMP}/entities`, {
      ...loc,
      actorId: "usr_dm",
    });
  }
  console.log(`✓ ${LOCATIONS.length} locations created`);
}
