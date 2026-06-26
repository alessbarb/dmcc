// Generated seed content module. Edit directly; kept split by campaign data typology.
import { api } from "./client.ts";
import { CMP } from "./config.ts";
import * as ids from "./ids.ts";

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export async function seedRelations() {
  const RELATIONS = [
    // NPC ↔ Faction
    { sourceEntityId: ids.ENT_NPC_VERADIS,         targetEntityId: ids.ENT_FAC_CULTO,          relationType: "leader_of",     description: "Veradis lidera el culto que lleva su nombre." },
    { sourceEntityId: ids.ENT_NPC_VANTIS,           targetEntityId: ids.ENT_FAC_CULTO,          relationType: "custom:employs",      description: "Financia al culto a cambio de profecías favorables." },
    { sourceEntityId: ids.ENT_NPC_SENRA,            targetEntityId: ids.ENT_FAC_CULTO,          relationType: "member_of",    description: "Mantiene la ilusión. Atrapada, no leal.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_NPC_GUARDIAN_JEFE,    targetEntityId: ids.ENT_FAC_CULTO,          relationType: "member_of",    description: "Jefe de seguridad del culto." },
    { sourceEntityId: ids.ENT_NPC_ALDRIC,           targetEntityId: ids.ENT_FAC_CONSEJO,        relationType: "leader_of",     description: "Magister y líder del Consejo del que depende la estabilidad de la ciudad." },
    { sourceEntityId: ids.ENT_NPC_CONSEJERA_LENA,   targetEntityId: ids.ENT_FAC_CONSEJO,        relationType: "member_of",    description: "Miembro de la facción reformista del Consejo." },
    { sourceEntityId: ids.ENT_NPC_CONSEJERO_BRANN,  targetEntityId: ids.ENT_FAC_CONSEJO,        relationType: "member_of",    description: "Miembro de la facción conservadora que prefiere ignorar la corrupción." },
    { sourceEntityId: ids.ENT_NPC_DORIAN,           targetEntityId: ids.ENT_FAC_CONSORCIO,      relationType: "member_of",    description: "Espía infiltrado del Consorcio en el Consejo.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_NPC_KAEL,             targetEntityId: ids.ENT_FAC_GREMIO,         relationType: "leader_of",     description: "Líder supremo del Gremio de Ladrones.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_NPC_TORBEN,           targetEntityId: ids.ENT_FAC_GREMIO,         relationType: "member_of",    description: "Informador de bajo perfil del Gremio." },
    { sourceEntityId: ids.ENT_NPC_SERA,             targetEntityId: ids.ENT_FAC_TEMPLO_VERDAD,  relationType: "member_of",    description: "Sacerdotisa y guardiana del Templo de la Verdad." },
    { sourceEntityId: ids.ENT_NPC_LYRA,             targetEntityId: ids.ENT_FAC_CONSEJO,        relationType: "custom:employs",      description: "Capitana de la guardia municipal, dependiente jerárquicamente del Consejo." },
    { sourceEntityId: ids.ENT_NPC_CIRA,             targetEntityId: ids.ENT_FAC_GREMIO,         relationType: "member_of",    description: "Cira es una leal y activa operativa del Gremio." },
    { sourceEntityId: ids.ENT_NPC_MERCADER_JEFE,    targetEntityId: ids.ENT_FAC_CONSORCIO,      relationType: "leader_of",     description: "La Maestra Ola Brightstone preside el Consorcio de Mercaderes." },
    { sourceEntityId: ids.ENT_NPC_INICIADO_CULTO,    targetEntityId: ids.ENT_FAC_CULTO,          relationType: "member_of",    description: "Los iniciados son la base creyente y operativa del Templo del Oráculo." },
    { sourceEntityId: ids.ENT_NPC_HERALDO,          targetEntityId: ids.ENT_FAC_CULTO,          relationType: "member_of",    description: "El Heraldo Vorn es la voz oficial y organizador del culto." },
    { sourceEntityId: ids.ENT_NPC_ESCRIBA_CONSEJO,  targetEntityId: ids.ENT_FAC_CONSEJO,        relationType: "member_of",    description: "Pell es el escriba y copista de actas del Consejo de la Ciudad." },
    { sourceEntityId: ids.ENT_NPC_VETERANO_GUARDIA,  targetEntityId: ids.ENT_FAC_CONSEJO,        relationType: "member_of",    description: "El Sargento Bren pertenece a la milicia dependiente del Consejo." },

    // Player Characters (PCs) ↔ Factions / Locations / NPCs
    { sourceEntityId: ids.ENT_PC_CAMUS,             targetEntityId: ids.ENT_FAC_TEMPLO_VERDAD, relationType: "member_of",    description: "Camus es un clérigo consagrado al Templo de la Verdad." },
    { sourceEntityId: ids.ENT_PC_RAGNA,             targetEntityId: ids.ENT_NPC_LYRA,           relationType: "custom:allied_with", description: "Ragna sirvió en la guardia municipal bajo las órdenes de Lyra." },
    { sourceEntityId: ids.ENT_PC_SILAS,             targetEntityId: ids.ENT_LOC_TABERNA_CUERVO, relationType: "located_in",   description: "Silas frecuenta la Taberna del Cuervo recopilando historias y rumores." },
    { sourceEntityId: ids.ENT_PC_ELOWYN,            targetEntityId: ids.ENT_FAC_GREMIO,         relationType: "custom:allied_with", description: "Elowyn colabora con el Gremio de Ladrones para infiltraciones urbanas." },

    // NPC ↔ NPC
    { sourceEntityId: ids.ENT_NPC_VERADIS,          targetEntityId: ids.ENT_NPC_ALDRIC,         relationType: "leader_of",     description: "El Oráculo influye drásticamente en el Magister mediante profecías políticas manipuladas." },
    { sourceEntityId: ids.ENT_NPC_LYRA,             targetEntityId: ids.ENT_NPC_VERADIS,        relationType: "fears",        description: "Desconfía profundamente del Oráculo pero teme actuar sin pruebas por las repercusiones.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_NPC_KAEL,             targetEntityId: ids.ENT_NPC_VANTIS,         relationType: "threatens",    description: "Los registros contables del Gremio mantienen a Kael a salvo de la avaricia de Vantis.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_NPC_VERADIS,          targetEntityId: ids.ENT_NPC_SENRA,          relationType: "custom:employs",      description: "Senra mantiene la ilusión por orden y coacción de Veradis.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_NPC_VANTIS,           targetEntityId: ids.ENT_NPC_SENRA,          relationType: "threatens",    description: "Vantis chantajea a Senra financiando la retención forzosa de su hermana en la capital.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_NPC_LYRA,             targetEntityId: ids.ENT_NPC_ALDRIC,         relationType: "custom:reports_to", description: "Informa directamente al Magister, temiendo que esté cegado por el Oráculo." },
    { sourceEntityId: ids.ENT_NPC_CONSEJERA_LENA,   targetEntityId: ids.ENT_NPC_MIRA,           relationType: "custom:consults",   description: "Lena visita en secreto el archivo de noche para recabar información de Mira." },
    { sourceEntityId: ids.ENT_NPC_CONSEJERO_BRANN,  targetEntityId: ids.ENT_NPC_VANTIS,         relationType: "custom:allied_with", description: "Brann y Lord Vantis comparten dividendos comerciales ilícitos.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_NPC_DORIAN,           targetEntityId: ids.ENT_NPC_KAEL,           relationType: "custom:sells_info",  description: "Dorian vende actas secretas del Consejo a Kael a cambio de favores criminales.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_NPC_SERA,             targetEntityId: ids.ENT_NPC_ABAD_SANTUARIO, relationType: "custom:disciple_of", description: "Sera considera a Fenwick su mentor espiritual y acude a él en busca de lore histórico." },
    { sourceEntityId: ids.ENT_NPC_GUARDIAN_JEFE,    targetEntityId: ids.ENT_NPC_LYRA,           relationType: "enemy_of",      description: "Mors espía las investigaciones de Lyra e intenta sabotearlas.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_NPC_GUARDIA_RIKU,     targetEntityId: ids.ENT_NPC_LYRA,           relationType: "custom:subordinate_to", description: "Riku es un guardia novato bajo las órdenes de Lyra." },
    { sourceEntityId: ids.ENT_NPC_CIRA,             targetEntityId: ids.ENT_NPC_KAEL,           relationType: "custom:subordinate_to", description: "Cira opera bajo las directrices estratégicas de Kael.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_NPC_MERCADER_JEFE,    targetEntityId: ids.ENT_NPC_DORIAN,         relationType: "custom:employs", description: "Ola emplea a Dorian Vex como el enlace del Consorcio ante el Consejo." },
    { sourceEntityId: ids.ENT_NPC_HERALDO,          targetEntityId: ids.ENT_NPC_VERADIS,        relationType: "custom:reports_to", description: "Vorn gestiona la agenda y filtra el acceso a las audiencias de Veradis." },
    { sourceEntityId: ids.ENT_NPC_CAPITAN_BARCO,    targetEntityId: ids.ENT_FAC_GREMIO,         relationType: "custom:employs", description: "El Capitán Drez es contratado habitualmente por el Gremio para contrabando.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_NPC_ESCRIBA_CONSEJO,  targetEntityId: ids.ENT_NPC_ALDRIC,         relationType: "custom:reports_to", description: "Pell asiste y registra la correspondencia personal del Magister Aldric." },
    { sourceEntityId: ids.ENT_NPC_RUMORISTA,        targetEntityId: ids.ENT_NPC_TORBEN,         relationType: "custom:allied_with", description: "Pica intercambia cotilleos y rumores del mercado con Torben." },
    { sourceEntityId: ids.ENT_NPC_VETERANO_GUARDIA,  targetEntityId: ids.ENT_NPC_LYRA,           relationType: "custom:subordinate_to", description: "El Sargento Bren es el lugarteniente de absoluta confianza de Lyra." },
    { sourceEntityId: ids.ENT_NPC_PETICIONARIO,     targetEntityId: ids.ENT_NPC_VERADIS,        relationType: "custom:seeks_audience", description: "Asha busca desesperadamente una audiencia con Veradis para saber de su hijo." },

    // Clue → Quest
    { sourceEntityId: ids.ENT_CLUE_PROPHECY_TEXT,   targetEntityId: ids.ENT_Q_PROFECIA_ROTA,   relationType: "points_to",    description: "Primera inconsistencia gramatical que lleva a investigar la profecía." },
    { sourceEntityId: ids.ENT_CLUE_ARCANE_COMPONENT,targetEntityId: ids.ENT_Q_PROFECIA_ROTA,   relationType: "unlocks",      description: "Evidencia física de la ilusión arcana de la Sala del Oráculo.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_VAULT_RECORDS,   targetEntityId: ids.ENT_Q_PROFECIA_ROTA,   relationType: "confirms",     description: "La prueba reina que demuestra el fraude de 20 años.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_GUILD_LEDGER,    targetEntityId: ids.ENT_Q_PROFECIA_ROTA,   relationType: "confirms",     description: "Vincula formalmente a Lord Vantis con la financiación del templo.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_PORT_BODIES,     targetEntityId: ids.ENT_Q_SANGRE_PUERTO,   relationType: "points_to",    description: "La marca inquisitorial en las víctimas vincula al culto con los asesinatos." },
    { sourceEntityId: ids.ENT_CLUE_ARCHIVE_RECORDS, targetEntityId: ids.ENT_Q_ARCHIVISTA,      relationType: "unlocks",      description: "Los restos del incendio en el archivo son clave para revelar la verdad sobre los antiguos videntes." },

    // Clue ↔ Entity (Relacionar todas las pistas con su entidad correspondiente)
    { sourceEntityId: ids.ENT_CLUE_PROPHECY_TEXT,   targetEntityId: ids.ENT_NPC_VERADIS,       relationType: "points_to",    description: "El papiro imita de forma imperfecta la caligrafía oficial de Veradis." },
    { sourceEntityId: ids.ENT_CLUE_PETITIONER_FEAR, targetEntityId: ids.ENT_NPC_PETICIONARIO,  relationType: "points_to",    description: "El terror se manifiesta tras las profecías adversas dadas a Asha y otros fieles." },
    { sourceEntityId: ids.ENT_CLUE_MERCHANT_PAYMENT, targetEntityId: ids.ENT_NPC_VANTIS,        relationType: "points_to",    description: "Los pagos proceden de cuentas vinculadas directamente a la Mansión Vantis." },
    { sourceEntityId: ids.ENT_CLUE_ARCANE_COMPONENT,targetEntityId: ids.ENT_LOC_SALA_ORACULO,  relationType: "located_in",   description: "Los componentes químicos y cristales se ocultan en la Sala del Oráculo." },
    { sourceEntityId: ids.ENT_CLUE_TORBEN_TIP,      targetEntityId: ids.ENT_NPC_TORBEN,        relationType: "custom:revealed_by", description: "Torben el Tabernero es el testigo que revela esta confidencia." },
    { sourceEntityId: ids.ENT_CLUE_ARCHIVE_RECORDS, targetEntityId: ids.ENT_LOC_ARCHIVO,       relationType: "located_in",   description: "Los pergaminos supervivientes al incendio se guardan en el Archivo." },
    { sourceEntityId: ids.ENT_CLUE_GUILD_LEDGER,    targetEntityId: ids.ENT_NPC_KAEL,          relationType: "custom:owns",  description: "Kael el líder del Gremio custodia y posee el libro contable.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_PORT_BODIES,     targetEntityId: ids.ENT_LOC_PUERTO,        relationType: "located_in",   description: "Los cadáveres marcados por la Inquisición aparecen flotando en el Puerto." },
    { sourceEntityId: ids.ENT_CLUE_SERA_TEXTS,      targetEntityId: ids.ENT_FAC_TEMPLO_VERDAD, relationType: "custom:belongs_to", description: "Las Crónicas son un texto doctrinal custodiado por el Templo de la Verdad." },
    { sourceEntityId: ids.ENT_CLUE_LYRA_INVESTIGATION, targetEntityId: ids.ENT_NPC_LYRA,       relationType: "custom:owns",  description: "El diario de notas es propiedad intelectual de la Capitana Lyra." },
    { sourceEntityId: ids.ENT_CLUE_INNER_CIRCLE_MTG, targetEntityId: ids.ENT_NPC_GUARDIAN_JEFE, relationType: "points_to",    description: "Las minutas documentan las reuniones dirigidas por el Inquisidor Mors.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_FALSE_PROPHECY_AUDIO, targetEntityId: ids.ENT_NPC_VERADIS,  relationType: "points_to",    description: "La grabación contiene la resonancia mágica de la voz de Veradis.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_SENRA_DOUBTS,    targetEntityId: ids.ENT_NPC_SENRA,          relationType: "custom:owns",  description: "La carta con dudas morales fue redactada en secreto por la Maga Senra.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_VAULT_ENTRANCE,  targetEntityId: ids.ENT_LOC_RUINAS,        relationType: "located_in",   description: "La trampilla secreta de acceso a la bóveda se localiza en las Ruinas." },
    { sourceEntityId: ids.ENT_CLUE_VAULT_RECORDS,   targetEntityId: ids.ENT_LOC_BOVEDA,        relationType: "located_in",   description: "El archivo maestro de las 847 profecías está guardado dentro de la Bóveda." },
    { sourceEntityId: ids.ENT_CLUE_VERADIS_ESCAPE,  targetEntityId: ids.ENT_NPC_VERADIS,       relationType: "custom:owns",  description: "La misiva de huida pertenece y fue escrita para Veradis.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_VANTIS_CONFESSION, targetEntityId: ids.ENT_NPC_VANTIS,       relationType: "custom:revealed_by", description: "El testimonio es la confesión oficial firmada por Lord Vantis." },
    { sourceEntityId: ids.ENT_CLUE_CULTO_DISBANDS,  targetEntityId: ids.ENT_NPC_INICIADO_CULTO, relationType: "custom:revealed_by", description: "Las declaraciones proceden de los iniciados del culto desbandados." },
    { sourceEntityId: ids.ENT_CLUE_ELDERTOME,       targetEntityId: ids.ENT_NPC_ABAD_SANTUARIO, relationType: "custom:guards", description: "El Abad Fenwick custodia este tomo sagrado en el Santuario." },
    { sourceEntityId: ids.ENT_CLUE_FINAL_TRUTH,      targetEntityId: ids.ENT_NPC_VERADIS,       relationType: "points_to",    description: "Revela la usurpación de identidad cometida por el actual Oráculo.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_FORGERY_TOOL,    targetEntityId: ids.ENT_LOC_SALA_ORACULO,  relationType: "located_in",   description: "El cristal de resonancia está físicamente instalado en la Sala del Oráculo.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_NPC_GUARDIA_RIKU,     targetEntityId: ids.ENT_CLUE_PORT_BODIES,   relationType: "points_to",    description: "Riku presenció en secreto cómo arrojaban un cuerpo marcado al mar.", visibility: { kind: "dm_only" as const } },

    // Secret ↔ Entity (Relacionar todos los secretos con su entidad correspondiente)
    { sourceEntityId: ids.ENT_SEC_ORACLE_FRAUD,     targetEntityId: ids.ENT_NPC_VERADIS,       relationType: "hides",        description: "Veradis oculta activamente que en realidad es Jack Corvo.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_SEC_VANTIS_FUNDING,   targetEntityId: ids.ENT_NPC_VANTIS,        relationType: "hides",        description: "Lord Vantis oculta que financia al culto para su lucro personal.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_SEC_DIVINE_VOICE,     targetEntityId: ids.ENT_LOC_SALA_ORACULO,  relationType: "hides",        description: "Los componentes de la ilusión acústica están camuflados tras el altar del templo.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_SEC_LYRA_SUSPECTS,    targetEntityId: ids.ENT_NPC_LYRA,          relationType: "hides",        description: "La capitana Lyra oculta sus sospechas y notas sobre el culto por miedo a represalias.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_SEC_KAEL_EVIDENCE,    targetEntityId: ids.ENT_NPC_KAEL,          relationType: "custom:owns",  description: "Kael custodia los registros secretos en las alcantarillas de la guarida.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_SEC_ARCHIVE_FIRE,     targetEntityId: ids.ENT_LOC_ARCHIVO,       relationType: "hides",        description: "Oculta el hecho de que el gran incendio de hace 20 años fue intencional.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_SEC_SENRA_DEFECT,     targetEntityId: ids.ENT_NPC_SENRA,          relationType: "hides",        description: "Senra oculta su plan para desertar y delatar el fraude del templo.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_SEC_DORIAN_SPY,       targetEntityId: ids.ENT_NPC_DORIAN,        relationType: "hides",        description: "Dorian oculta que actúa como espía para el culto y el Consorcio.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_SEC_ORIGINAL_ORACLE,  targetEntityId: ids.ENT_NPC_VERADIS,       relationType: "hides",        description: "El impostor oculta que asesinó al vidente real Veradis Thorn hace 22 años.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_SEC_VAULT_LOCATION,   targetEntityId: ids.ENT_LOC_BOVEDA,        relationType: "points_to",    description: "Señala la entrada secreta sellada bajo las Ruinas del Templo Antiguo.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_SEC_PROPHECY_COUNT,   targetEntityId: ids.ENT_LOC_BOVEDA,        relationType: "hides",        description: "El registro exacto de las 847 profecías falsas está oculto en la bóveda.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_SEC_CONSEJO_CORRUPTION, targetEntityId: ids.ENT_NPC_CONSEJERO_BRANN, relationType: "hides",      description: "Brann oculta que descubrió el fraude y aceptó sobornos a cambio de silencio.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_SEC_CAPTAIN_ESCAPE,   targetEntityId: ids.ENT_NPC_CAPITAN_BARCO, relationType: "hides",        description: "El Capitán Drez mantiene su barco preparado en secreto para la huida.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_SEC_SENRA_EXIT_CODE,  targetEntityId: ids.ENT_NPC_SENRA,          relationType: "hides",        description: "Senra custodia en secreto la contraseña arcana para abrir la bóveda.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_SEC_WIDOW_SON,        targetEntityId: ids.ENT_NPC_PETICIONARIO,  relationType: "hides",        description: "Oculta a la viuda Asha que su hijo ha fallecido en la guerra del este.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_SEC_WIDOW_SON,        targetEntityId: ids.ENT_NPC_VERADIS,       relationType: "hides",        description: "Veradis planea mentirle a Asha ocultándole que su hijo ha fallecido para extorsionarla.", visibility: { kind: "dm_only" as const } },

    // Faction ↔ Faction
    { sourceEntityId: ids.ENT_FAC_CULTO,            targetEntityId: ids.ENT_FAC_CONSEJO,       relationType: "leader_of",     description: "El Culto del Oráculo ejerce una influencia teocrática de facto sobre las leyes del Consejo.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_FAC_GREMIO,           targetEntityId: ids.ENT_FAC_CULTO,         relationType: "enemy_of",      description: "El Gremio ve la expansión de la guardia del culto como una amenaza directa a su contrabando.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_FAC_TEMPLO_VERDAD,    targetEntityId: ids.ENT_FAC_CULTO,         relationType: "contradicts",  description: "El Templo predica activamente contra la falsedad del Oráculo." },
    { sourceEntityId: ids.ENT_FAC_CONSORCIO,        targetEntityId: ids.ENT_FAC_CONSEJO,       relationType: "leader_of",     description: "El Consorcio financia las campañas de consejeros para controlar la balanza arancelaria." },

    // NPC ↔ Location
    { sourceEntityId: ids.ENT_NPC_VERADIS,          targetEntityId: ids.ENT_LOC_SALA_ORACULO,  relationType: "located_in",   description: "La Sala del Oráculo es el dominio público y teatral de Veradis." },
    { sourceEntityId: ids.ENT_NPC_MIRA,             targetEntityId: ids.ENT_LOC_ARCHIVO,       relationType: "located_in",   description: "Mira vive entre los manuscritos del Archivo de la Ciudad." },
    { sourceEntityId: ids.ENT_NPC_KAEL,             targetEntityId: ids.ENT_LOC_CAMPAMENTO_GREMIO, relationType: "located_in", description: "Kael opera desde el campamento fortificado del Gremio.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_NPC_ABAD_SANTUARIO,   targetEntityId: ids.ENT_LOC_RUINAS,        relationType: "custom:guardian_of", description: "El Abad Fenwick custodia los restos no profanados de las ruinas." },
    { sourceEntityId: ids.ENT_NPC_CURANDERO,        targetEntityId: ids.ENT_LOC_PUERTO,        relationType: "located_in",   description: "La consulta de la Maestra Ilva está en los callejones del Puerto." },
    { sourceEntityId: ids.ENT_NPC_RUMORISTA,        targetEntityId: ids.ENT_LOC_PUERTO,        relationType: "located_in",   description: "Pica vende pescado en la plaza principal del Puerto." },

    // Location ↔ Location (Estructura de Valdris)
    { sourceEntityId: ids.ENT_LOC_SALA_ORACULO,     targetEntityId: ids.ENT_LOC_VALDRIS,       relationType: "located_in",   description: "El Sanctum del Oráculo se ubica en el centro monumental de Valdris." },
    { sourceEntityId: ids.ENT_LOC_TABERNA_CUERVO,   targetEntityId: ids.ENT_LOC_VALDRIS,       relationType: "located_in",   description: "La Taberna del Cuervo opera en los distritos bajos de Valdris." },
    { sourceEntityId: ids.ENT_LOC_PUERTO,           targetEntityId: ids.ENT_LOC_VALDRIS,       relationType: "located_in",   description: "El Puerto es la arteria económica más importante de Valdris." },
    { sourceEntityId: ids.ENT_LOC_BARRIO_NOBLE,     targetEntityId: ids.ENT_LOC_VALDRIS,       relationType: "located_in",   description: "El Barrio Noble es la zona residencial amurallada de la élite de Valdris." },
    { sourceEntityId: ids.ENT_LOC_ARCHIVO,          targetEntityId: ids.ENT_LOC_VALDRIS,       relationType: "located_in",   description: "El Archivo Municipal se sitúa cerca del edificio del Consejo en Valdris." },
    { sourceEntityId: ids.ENT_LOC_SALA_CONSEJO,     targetEntityId: ids.ENT_LOC_VALDRIS,       relationType: "located_in",   description: "La Sala del Consejo se encuentra en el palacio municipal de Valdris." },
    { sourceEntityId: ids.ENT_LOC_CUARTEL_GUARDIA,  targetEntityId: ids.ENT_LOC_VALDRIS,       relationType: "located_in",   description: "El Cuartel General de la Guardia protege la puerta norte de Valdris." },
    { sourceEntityId: ids.ENT_LOC_MANSION_VANTIS,   targetEntityId: ids.ENT_LOC_VALDRIS,       relationType: "located_in",   description: "La Mansión Vantis se alza en la colina del Barrio Noble de Valdris." },
    { sourceEntityId: ids.ENT_LOC_TEMPLO_VERDAD,    targetEntityId: ids.ENT_LOC_VALDRIS,       relationType: "located_in",   description: "El Templo de la Verdad urbano se encuentra en el barrio viejo de Valdris." },
    { sourceEntityId: ids.ENT_LOC_MUELLES,          targetEntityId: ids.ENT_LOC_PUERTO,        relationType: "located_in",   description: "Los muelles de carga son la zona de atraque directo del Puerto." },
    { sourceEntityId: ids.ENT_LOC_CAMPAMENTO_GREMIO, targetEntityId: ids.ENT_LOC_PUERTO,        relationType: "located_in",   description: "La guarida del Gremio está camuflada bajo la red de cloacas del Puerto.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_LOC_SANTUARIO_BOSQUE, targetEntityId: ids.ENT_FAC_TEMPLO_VERDAD, relationType: "custom:belongs_to", description: "El Santuario del Bosque pertenece a la orden del Templo de la Verdad." },

    // Quests ↔ Entities (Relacionar tramas secundarias)
    { sourceEntityId: ids.ENT_Q_PRECIO_SILENCIO,   targetEntityId: ids.ENT_FAC_GREMIO,         relationType: "points_to",    description: "Esta investigación afecta a las rutas y la seguridad financiera del Gremio." },
    { sourceEntityId: ids.ENT_Q_ARCHIVISTA,         targetEntityId: ids.ENT_NPC_MIRA,           relationType: "points_to",    description: "Esta misión gira en torno a conseguir el favor y sanar a la Archivista Mira." },
    { sourceEntityId: ids.ENT_Q_SANGRE_PUERTO,      targetEntityId: ids.ENT_NPC_LYRA,           relationType: "points_to",    description: "La Capitana Lyra dirige la investigación oficial de los asesinatos del puerto." },
    { sourceEntityId: ids.ENT_Q_TRAIDOR_INTERIOR,   targetEntityId: ids.ENT_NPC_DORIAN,        relationType: "points_to",    description: "La investigación del traidor lleva directamente al espía Dorian Vex.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_Q_TRAIDOR_INTERIOR,   targetEntityId: ids.ENT_Q_PROFECIA_ROTA,    relationType: "points_to",    description: "Esta investigación surge cuando el culto empieza a anticipar los movimientos del grupo durante la misión principal." },
    { sourceEntityId: ids.ENT_Q_EPILOGO,            targetEntityId: ids.ENT_NPC_ALDRIC,         relationType: "points_to",    description: "El Magister Aldric debe gestionar la transición política tras la caída del Oráculo." },

    // NPC ↔ Clue
    { sourceEntityId: ids.ENT_NPC_SERA,             targetEntityId: ids.ENT_CLUE_SERA_TEXTS,    relationType: "custom:guards", description: "Sera oculta y protege activamente las Crónicas del Verdadero Vidente." },
    { sourceEntityId: ids.ENT_NPC_SENRA,            targetEntityId: ids.ENT_CLUE_FORGERY_TOOL,  relationType: "custom:owns",   description: "Senra es la operaria principal del cristal de resonancia arcana.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_NPC_CURANDERO,        targetEntityId: ids.ENT_Q_SANGRE_PUERTO,    relationType: "points_to",    description: "Ilva ha tratado heridas de víctimas que sobrevivieron a ataques del culto.", visibility: { kind: "dm_only" as const } },

    // Revelation anchors: Clue → Secret
    // These relations make Lore Lint and Mystery Flow understand how every DM secret can be discovered.
    { sourceEntityId: ids.ENT_CLUE_PROPHECY_TEXT,        targetEntityId: ids.ENT_SEC_ORACLE_FRAUD,       relationType: "points_to", description: "La profecía rota es la primera grieta verificable del fraude del Oráculo.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_FALSE_PROPHECY_AUDIO, targetEntityId: ids.ENT_SEC_ORACLE_FRAUD,       relationType: "confirms",  description: "La resonancia mágica demuestra que la voz profética fue fabricada.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_VAULT_RECORDS,        targetEntityId: ids.ENT_SEC_ORACLE_FRAUD,       relationType: "confirms",  description: "Los registros de la bóveda documentan el fraude completo.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_FINAL_TRUTH,          targetEntityId: ids.ENT_SEC_ORACLE_FRAUD,       relationType: "confirms",  description: "La identidad del verdadero Veradis prueba la usurpación del impostor.", visibility: { kind: "dm_only" as const } },

    { sourceEntityId: ids.ENT_CLUE_MERCHANT_PAYMENT,     targetEntityId: ids.ENT_SEC_VANTIS_FUNDING,     relationType: "points_to", description: "Las donaciones anónimas apuntan a la Mansión Vantis.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_GUILD_LEDGER,         targetEntityId: ids.ENT_SEC_VANTIS_FUNDING,     relationType: "confirms",  description: "El libro del Gremio confirma los pagos de Lord Vantis al culto.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_VAULT_RECORDS,        targetEntityId: ids.ENT_SEC_VANTIS_FUNDING,     relationType: "confirms",  description: "La bóveda conserva el registro maestro de pagos y beneficiarios.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_VANTIS_CONFESSION,    targetEntityId: ids.ENT_SEC_VANTIS_FUNDING,     relationType: "confirms",  description: "La confesión de Vantis cierra la línea financiera de la conspiración.", visibility: { kind: "dm_only" as const } },

    { sourceEntityId: ids.ENT_CLUE_ARCANE_COMPONENT,     targetEntityId: ids.ENT_SEC_DIVINE_VOICE,       relationType: "unlocks",   description: "Los componentes del altar permiten deducir cómo se fabrica la voz divina.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_FALSE_PROPHECY_AUDIO, targetEntityId: ids.ENT_SEC_DIVINE_VOICE,       relationType: "confirms",  description: "La resonancia mágica es incompatible con una voz natural.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_FORGERY_TOOL,         targetEntityId: ids.ENT_SEC_DIVINE_VOICE,       relationType: "confirms",  description: "El cristal de resonancia confirma el mecanismo de la ilusión.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_SERA_TEXTS,           targetEntityId: ids.ENT_SEC_DIVINE_VOICE,       relationType: "points_to", description: "Las Crónicas describen técnicas similares de falso profeta.", visibility: { kind: "dm_only" as const } },

    { sourceEntityId: ids.ENT_CLUE_LYRA_INVESTIGATION,   targetEntityId: ids.ENT_SEC_LYRA_SUSPECTS,      relationType: "confirms",  description: "El diario de Lyra revela sus sospechas y el miedo a actuar sin pruebas.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_PORT_BODIES,          targetEntityId: ids.ENT_SEC_LYRA_SUSPECTS,      relationType: "points_to", description: "Las marcas de los cuerpos justifican la investigación secreta de Lyra.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_INNER_CIRCLE_MTG,     targetEntityId: ids.ENT_SEC_LYRA_SUSPECTS,      relationType: "points_to", description: "Las minutas prueban que Mors vigila y sabotea a la capitana.", visibility: { kind: "dm_only" as const } },

    { sourceEntityId: ids.ENT_CLUE_GUILD_LEDGER,         targetEntityId: ids.ENT_SEC_KAEL_EVIDENCE,      relationType: "confirms",  description: "El libro contable es la prueba que Kael conserva como seguro de vida.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_TORBEN_TIP,           targetEntityId: ids.ENT_SEC_KAEL_EVIDENCE,      relationType: "points_to", description: "Torben puede orientar al grupo hacia los archivos ocultos del Gremio.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_MERCHANT_PAYMENT,     targetEntityId: ids.ENT_SEC_KAEL_EVIDENCE,      relationType: "points_to", description: "El patrón financiero hace evidente el valor del libro del Gremio.", visibility: { kind: "dm_only" as const } },

    { sourceEntityId: ids.ENT_CLUE_ARCHIVE_RECORDS,      targetEntityId: ids.ENT_SEC_ARCHIVE_FIRE,       relationType: "confirms",  description: "Los registros chamuscados documentan desapariciones coordinadas durante el incendio.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_TORBEN_TIP,           targetEntityId: ids.ENT_SEC_ARCHIVE_FIRE,       relationType: "points_to", description: "La confidencia de Torben contradice la versión oficial del accidente.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_SERA_TEXTS,           targetEntityId: ids.ENT_SEC_ARCHIVE_FIRE,       relationType: "points_to", description: "Las Crónicas preservan la historia que el incendio intentó borrar.", visibility: { kind: "dm_only" as const } },

    { sourceEntityId: ids.ENT_CLUE_SENRA_DOUBTS,         targetEntityId: ids.ENT_SEC_SENRA_DEFECT,       relationType: "confirms",  description: "La carta de Senra revela que puede desertar si recibe protección.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_FORGERY_TOOL,         targetEntityId: ids.ENT_SEC_SENRA_DEFECT,       relationType: "points_to", description: "El cristal prueba que Senra es una operaria clave del fraude.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_INNER_CIRCLE_MTG,     targetEntityId: ids.ENT_SEC_SENRA_DEFECT,       relationType: "points_to", description: "Las minutas muestran que el círculo interno la presiona y vigila.", visibility: { kind: "dm_only" as const } },

    { sourceEntityId: ids.ENT_CLUE_INNER_CIRCLE_MTG,     targetEntityId: ids.ENT_SEC_DORIAN_SPY,         relationType: "confirms",  description: "Las minutas sitúan a Dorian en comunicaciones que no debería conocer.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_LYRA_INVESTIGATION,   targetEntityId: ids.ENT_SEC_DORIAN_SPY,         relationType: "points_to", description: "El diario de Lyra revela filtraciones procedentes del entorno del Consejo.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_GUILD_LEDGER,         targetEntityId: ids.ENT_SEC_DORIAN_SPY,         relationType: "points_to", description: "El libro del Gremio muestra pagos cruzados a intermediarios del Consorcio.", visibility: { kind: "dm_only" as const } },

    { sourceEntityId: ids.ENT_CLUE_FINAL_TRUTH,          targetEntityId: ids.ENT_SEC_ORIGINAL_ORACLE,    relationType: "confirms",  description: "La lápida y las notas de la bóveda confirman que existió un Veradis real.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_SERA_TEXTS,           targetEntityId: ids.ENT_SEC_ORIGINAL_ORACLE,    relationType: "points_to", description: "Las Crónicas conservan una versión anterior del vidente auténtico.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_ELDERTOME,            targetEntityId: ids.ENT_SEC_ORIGINAL_ORACLE,    relationType: "confirms",  description: "El Tomo de la Antigua Fe recoge la genealogía de los videntes reales.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_ARCHIVE_RECORDS,      targetEntityId: ids.ENT_SEC_ORIGINAL_ORACLE,    relationType: "points_to", description: "Los registros quemados muestran desapariciones alrededor de la ascensión del impostor.", visibility: { kind: "dm_only" as const } },

    { sourceEntityId: ids.ENT_CLUE_VAULT_ENTRANCE,       targetEntityId: ids.ENT_SEC_VAULT_LOCATION,     relationType: "confirms",  description: "El mapa de las ruinas marca la entrada sellada de la bóveda.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_ARCHIVE_RECORDS,      targetEntityId: ids.ENT_SEC_VAULT_LOCATION,     relationType: "points_to", description: "Los registros supervivientes mencionan dependencias subterráneas bajo el templo.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_ELDERTOME,            targetEntityId: ids.ENT_SEC_VAULT_LOCATION,     relationType: "points_to", description: "El tomo antiguo nombra la cripta sellada de los videntes.", visibility: { kind: "dm_only" as const } },

    { sourceEntityId: ids.ENT_CLUE_VAULT_RECORDS,        targetEntityId: ids.ENT_SEC_PROPHECY_COUNT,     relationType: "confirms",  description: "La bóveda contiene el recuento exacto de las 847 profecías falsas.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_PROPHECY_TEXT,        targetEntityId: ids.ENT_SEC_PROPHECY_COUNT,     relationType: "points_to", description: "La profecía rota permite reconocer un patrón de falsificaciones.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_PETITIONER_FEAR,      targetEntityId: ids.ENT_SEC_PROPHECY_COUNT,     relationType: "points_to", description: "El miedo de los fieles muestra que las víctimas no son casos aislados.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_CULTO_DISBANDS,       targetEntityId: ids.ENT_SEC_PROPHECY_COUNT,     relationType: "points_to", description: "Los iniciados confirman que hubo muchas audiencias manipuladas.", visibility: { kind: "dm_only" as const } },

    { sourceEntityId: ids.ENT_CLUE_INNER_CIRCLE_MTG,     targetEntityId: ids.ENT_SEC_CONSEJO_CORRUPTION, relationType: "points_to", description: "Las minutas conectan al Consejo conservador con reuniones del círculo interno.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_GUILD_LEDGER,         targetEntityId: ids.ENT_SEC_CONSEJO_CORRUPTION, relationType: "points_to", description: "El libro registra dividendos desviados a intermediarios del Consejo.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_LYRA_INVESTIGATION,   targetEntityId: ids.ENT_SEC_CONSEJO_CORRUPTION, relationType: "points_to", description: "El diario de Lyra apunta a presiones de la facción conservadora.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_VANTIS_CONFESSION,    targetEntityId: ids.ENT_SEC_CONSEJO_CORRUPTION, relationType: "confirms",  description: "Vantis puede delatar a Brann para reducir su propia condena.", visibility: { kind: "dm_only" as const } },

    { sourceEntityId: ids.ENT_CLUE_VERADIS_ESCAPE,       targetEntityId: ids.ENT_SEC_CAPTAIN_ESCAPE,     relationType: "confirms",  description: "La misiva cifrada describe la ruta y el barco preparado para Veradis.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_PORT_BODIES,          targetEntityId: ids.ENT_SEC_CAPTAIN_ESCAPE,     relationType: "points_to", description: "La actividad de los inquisidores en el puerto conduce hacia el Capitán Drez.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_VANTIS_CONFESSION,    targetEntityId: ids.ENT_SEC_CAPTAIN_ESCAPE,     relationType: "points_to", description: "Vantis conoce el plan de huida y puede usarlo como moneda de cambio.", visibility: { kind: "dm_only" as const } },

    { sourceEntityId: ids.ENT_CLUE_SENRA_DOUBTS,         targetEntityId: ids.ENT_SEC_SENRA_EXIT_CODE,    relationType: "confirms",  description: "La carta de Senra permite obtener la palabra arcana de la bóveda.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_VAULT_ENTRANCE,       targetEntityId: ids.ENT_SEC_SENRA_EXIT_CODE,    relationType: "points_to", description: "El acceso oculto indica que se requiere una palabra clave.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_ELDERTOME,            targetEntityId: ids.ENT_SEC_SENRA_EXIT_CODE,    relationType: "points_to", description: "El Tomo de la Antigua Fe conserva la frase litúrgica original.", visibility: { kind: "dm_only" as const } },

    { sourceEntityId: ids.ENT_CLUE_EASTERN_FRONT_LETTER, targetEntityId: ids.ENT_SEC_WIDOW_SON,          relationType: "confirms",  description: "La carta militar confirma que el hijo de Asha murió antes de la audiencia.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_PETITIONER_FEAR,      targetEntityId: ids.ENT_SEC_WIDOW_SON,          relationType: "points_to", description: "El temor de los fieles permite presentar a Asha como víctima del patrón de extorsión.", visibility: { kind: "dm_only" as const } },
    { sourceEntityId: ids.ENT_CLUE_CULTO_DISBANDS,       targetEntityId: ids.ENT_SEC_WIDOW_SON,          relationType: "points_to", description: "Los iniciados pueden reconocer que se preparó una profecía falsa para Asha.", visibility: { kind: "dm_only" as const } },
  ];

  for (const r of RELATIONS) {
    const res = await api("POST", `/api/campaigns/${CMP}/relations`, {
      ...r, campaignId: CMP, actorId: "usr_dm",
    }, { okStatuses: [200, 201, 409] });
    if (res.status === 409) {
      console.warn(`  ⚠ Relation already existed/skipped: ${r.sourceEntityId} → ${r.targetEntityId}: ${JSON.stringify(res.json)}`);
    }
  }
  console.log(`✓ ${RELATIONS.length} relations created`);
}
