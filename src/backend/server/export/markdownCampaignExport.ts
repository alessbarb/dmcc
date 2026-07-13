import { basename, dirname, join } from "path";
import * as fs from "fs/promises";
import { assertWithinDir, slugifyTitle } from "../helpers.js";
import type { CampaignProjection } from "@core/projections/campaignProjection.js";
import type { Entity, EntityType } from "@core/domain/entity/types.js";
import type { Relation } from "@core/domain/relation/types.js";
import type { Fact } from "@core/domain/fact/fact.js";
import type { Session } from "@core/domain/session/types.js";
import type { Canvas, CanvasNode } from "@core/domain/canvas/types.js";
import type { VisibilityRule } from "@core/domain/visibility/visibility.js";
import type { StoredEvent } from "@core/domain/shared/events.js";

export interface MarkdownCampaignExportResult {
  campaignId: string;
  format: "markdown";
  exportId: string;
  path: string;
  primaryFile: string;
  downloadUrl: string;
  fileCount: number;
}

interface EntityReferences {
  relations: Relation[];
  facts: Fact[];
  sessions: Session[];
  canvases: Canvas[];
}

type ArchivableStatus = { archived: boolean; status?: string };

const PRIMARY_FILE = "Campaña completa.md";

const ENTITY_FOLDERS: Record<string, string> = {
  npc: "NPCs",
  location: "Lugares",
  faction: "Facciones",
  quest: "Misiones",
  player_character: "Personajes",
  item: "Objetos",
  clue: "Pistas",
  secret: "Secretos",
  scene: "Escenas",
  note: "Notas",
};

const ENTITY_TYPE_LABELS: Record<string, string> = {
  player_character: "Personaje",
  npc: "NPC",
  location: "Lugar",
  faction: "Facción",
  quest: "Misión",
  clue: "Pista",
  secret: "Secreto",
  item: "Objeto",
  creature: "Criatura",
  encounter: "Encuentro",
  scene: "Escena",
  front: "Frente",
  clock: "Reloj",
  decision: "Decisión",
  consequence: "Consecuencia",
  rumor: "Rumor",
  rule_reference: "Referencia de regla",
  handout: "Documento",
  note: "Nota",
};

const RELATION_LABELS: Record<string, string> = {
  appears_in: "aparece en",
  located_in: "está en",
  contains: "contiene",
  lives_in: "vive en",
  works_for: "trabaja para",
  member_of: "es miembro de",
  leader_of: "lidera",
  ally_of: "es aliado de",
  enemy_of: "es enemigo de",
  family_of: "es familia de",
  owes_debt_to: "debe una deuda a",
  protects: "protege a",
  threatens: "amenaza a",
  hates: "odia a",
  loves: "ama a",
  fears: "teme a",
  trusts: "confía en",
  suspects: "sospecha de",
  knows: "conoce a",
  knows_partially: "conoce parcialmente a",
  hides: "oculta",
  lies_about: "miente sobre",
  reveals: "revela",
  unlocks: "desbloquea",
  points_to: "apunta a",
  confirms: "confirma",
  contradicts: "contradice",
  causes: "causa",
  depends_on: "depende de",
  blocks: "bloquea",
  foreshadows: "anticipa",
  transforms_into: "se transforma en",
  affected_by: "está afectado por",
  created_by: "fue creado por",
  relacionado_con: "está relacionado con",
};

const VISIBILITY_LABELS: Record<string, string> = {
  dm_only: "Nota del DM",
  public: "Información pública",
  party: "Información para la mesa",
  players: "Información para jugadores concretos",
  characters: "Información para personajes concretos",
};

const FACT_SECTION_LABELS: Record<string, string> = {
  canon: "Verdades establecidas",
  dm_secret: "Secretos del DM",
  rumor: "Rumores de taberna",
  lie: "Mentiras en circulación",
  player_theory: "Teorías de los jugadores",
  mistake: "Errores detectados",
  retcon: "Cambios de continuidad",
  unknown: "Información incierta",
};

const CONFIDENCE_LABELS: Record<string, string> = {
  confirmed: "verdad establecida",
  likely: "probable",
  suspected: "sospecha",
  unconfirmed: "sin confirmar",
  false: "falso",
};

const BOOKLET_RELATION_LABELS: Record<string, string> = {
  ...RELATION_LABELS,
  employs: "financia o emplea a",
  reports_to: "responde ante",
  allied_with: "mantiene una alianza con",
  revealed_by: "puede ser revelado por",
  sells_info: "vende información a",
  subordinate_to: "sirve bajo las órdenes de",
  owns: "custodia",
  belongs_to: "pertenece a",
  guards: "protege",
  guardian_of: "custodia",
  disciple_of: "es discípulo de",
  consults: "consulta a",
  seeks_audience: "busca audiencia con",
  "custom:employs": "financia o emplea a",
  "custom:reports_to": "responde ante",
  "custom:allied_with": "mantiene una alianza con",
  "custom:revealed_by": "puede ser revelado por",
  "custom:sells_info": "vende información a",
  "custom:subordinate_to": "sirve bajo las órdenes de",
  "custom:owns": "custodia",
  "custom:belongs_to": "pertenece a",
  "custom:guards": "protege",
  "custom:guardian_of": "custodia",
  "custom:disciple_of": "es discípulo de",
  "custom:consults": "consulta a",
  "custom:seeks_audience": "busca audiencia con",
};

const BOOKLET_SECTION_RELATION_TITLES: Record<string, string> = {
  faction: "Aliados, agentes y enemigos",
  npc: "Vínculos relevantes",
  player_character: "Vínculos relevantes",
  location: "Qué se encuentra aquí",
  quest: "Cómo se desarrolla",
  clue: "Qué revela",
  secret: "Cómo puede salir a la luz",
  item: "Uso narrativo",
  scene: "Conexiones de escena",
};

const PUBLIC_FACT_KINDS = new Set(["canon", "rumor", "player_theory"]);
const DM_FACT_KINDS = new Set([
  "dm_secret",
  "lie",
  "retcon",
  "mistake",
  "unknown",
]);

function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function values<T>(map: Map<string, T> | undefined): T[] {
  return Array.from(map?.values() ?? []);
}

function titleOf(
  entity: Entity | undefined,
  fallback = "Entidad desconocida",
): string {
  return entity?.title || entity?.entityId || fallback;
}

function typeLabel(type: string | undefined): string {
  return ENTITY_TYPE_LABELS[type || ""] || type || "Sin tipo";
}

function relationLabel(type: string | undefined): string {
  if (!type) return "está relacionado con";
  if (type.startsWith("custom:"))
    return type.slice("custom:".length).replace(/[_-]+/g, " ");
  return RELATION_LABELS[type] || type.replace(/[_-]+/g, " ");
}

function visibilityLabel(visibility: VisibilityRule | undefined): string {
  if (!visibility) return "dm_only";
  return visibility.kind;
}

function archiveLabel(item: ArchivableStatus): string {
  return item.archived ? "archivado" : item.status || "activo";
}

function visibilityNarrativeLabel(visibility: VisibilityRule | undefined): string {
  const raw = visibilityLabel(visibility);
  return VISIBILITY_LABELS[raw] || raw.replace(/[_-]+/g, " ");
}

function confidenceNarrativeLabel(confidence: string | undefined): string {
  if (!confidence) return "sin confirmar";
  return CONFIDENCE_LABELS[confidence] || confidence.replace(/[_-]+/g, " ");
}

function factSectionLabel(kind: string | undefined): string {
  if (!kind) return FACT_SECTION_LABELS.unknown;
  return FACT_SECTION_LABELS[kind] || kind.replace(/[_-]+/g, " ");
}

function rawVisibility(visibility: VisibilityRule | undefined): string {
  return visibilityLabel(visibility);
}

function isDmOnlyVisibility(visibility: VisibilityRule | undefined): boolean {
  return rawVisibility(visibility) === "dm_only";
}

function isDmOnlyFact(fact: Fact): boolean {
  return isDmOnlyVisibility(fact.visibility) || fact.kind === "dm_secret";
}

function isPublicBookletFact(fact: Fact): boolean {
  return !isDmOnlyFact(fact) && PUBLIC_FACT_KINDS.has(fact.kind || "unknown");
}

function isDmBookletFact(fact: Fact): boolean {
  return isDmOnlyFact(fact) || DM_FACT_KINDS.has(fact.kind || "unknown");
}

function relationBookletLabel(type: string | undefined): string {
  if (!type) return "está relacionado con";
  if (BOOKLET_RELATION_LABELS[type]) return BOOKLET_RELATION_LABELS[type];
  return "se relaciona con";
}

function sentenceWithoutFinalDot(text: string): string {
  return text.trim().replace(/[.。]+$/u, "");
}

function withFinalDot(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  return /[.!?…]$/u.test(trimmed) ? trimmed : `${trimmed}.`;
}

function normalizeForComparison(text: string): string {
  return text
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[*_`.,;:¡!¿?()[\]{}«»"']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function relationDescriptionAddsValue(
  base: string,
  description: string | undefined,
): boolean {
  if (!description?.trim()) return false;
  const normalizedBase = normalizeForComparison(base);
  const normalizedDescription = normalizeForComparison(description);
  return (
    normalizedDescription.length > 0 &&
    !normalizedBase.includes(normalizedDescription) &&
    !normalizedDescription.includes(normalizedBase)
  );
}

function relationCounterpart(
  entity: Entity | undefined,
  relation: Relation,
  state: CampaignProjection,
): Entity | undefined {
  if (!entity) return undefined;
  const otherId =
    relation.sourceEntityId === entity.entityId
      ? relation.targetEntityId
      : relation.sourceEntityId;
  return state.entities.get(otherId);
}

function relationSectionTitle(entity: Entity): string {
  return (
    BOOKLET_SECTION_RELATION_TITLES[entity.entityType || ""] ||
    "Conexiones narrativas"
  );
}

function firstNonEmpty(...valuesToCheck: unknown[]): string | undefined {
  for (const value of valuesToCheck) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function isPlaceholderEntity(entity: Entity): boolean {
  const title = (entity.title || "").trim();
  return !title || /^Nuevo\b/i.test(title) || /^New\b/i.test(title);
}

function activeEntities(state: CampaignProjection): Entity[] {
  return values(state.entities).filter((entity) => !entity.archived);
}

function bookletEntities(state: CampaignProjection): Entity[] {
  return activeEntities(state).filter(
    (entity) => !isPlaceholderEntity(entity),
  );
}

function pendingEntities(state: CampaignProjection): Entity[] {
  return activeEntities(state).filter((entity) => isPlaceholderEntity(entity));
}

function relationCount(entity: Entity, state: CampaignProjection): number {
  return values(state.relations).filter(
    (relation) =>
      !relation.archived &&
      (relation.sourceEntityId === entity.entityId ||
        relation.targetEntityId === entity.entityId),
  ).length;
}

function narrativeScore(entity: Entity, state: CampaignProjection): number {
  const importanceScore: Record<string, number> = {
    critical: 100,
    high: 60,
    normal: 20,
    low: 0,
  };
  const typeScore: Record<string, number> = {
    quest: 20,
    faction: 18,
    npc: 16,
    player_character: 14,
    location: 12,
    clue: 10,
    secret: 10,
    scene: 8,
  };
  return (
    (importanceScore[entity.importance || "normal"] ?? 20) +
    (typeScore[entity.entityType || ""] ?? 0) +
    relationCount(entity, state)
  );
}

function sortNarrative(entities: Entity[], state: CampaignProjection): Entity[] {
  return [...entities].sort((a, b) => {
    const byScore = narrativeScore(b, state) - narrativeScore(a, state);
    if (byScore !== 0) return byScore;
    return String(a.title || "").localeCompare(String(b.title || ""));
  });
}

function entitiesOfType(state: CampaignProjection, type: EntityType): Entity[] {
  return sortNarrative(
    bookletEntities(state).filter((entity) => entity.entityType === type),
    state,
  );
}

function entityDescription(entity: Entity): string {
  return (
    firstNonEmpty(
      entity.summary,
      entity.metadata?.bookletDescription,
      entity.metadata?.publicDescription,
      entity.subtitle,
      entity.content,
      entity.metadata?.description,
      entity.metadata?.role,
      entity.metadata?.goal,
      entity.metadata?.truth,
      entity.metadata?.content,
    ) || "Sin descripción escrita todavía."
  );
}

function entityDmNote(entity: Entity): string | undefined {
  return firstNonEmpty(
    entity.metadata?.dmNotes,
    entity.metadata?.privateNotes,
    entity.metadata?.secret,
    entity.metadata?.truth,
    entity.metadata?.hiddenTruth,
    entity.metadata?.privateDescription,
  );
}

function entityPlayerFacingText(entity: Entity): string | undefined {
  return firstNonEmpty(
    entity.metadata?.playerIntro,
    entity.metadata?.publicDescription,
    entity.summary,
    entity.subtitle,
  );
}

function entityReadAloud(entity: Entity): string | undefined {
  return firstNonEmpty(
    entity.metadata?.readAloud,
    entity.metadata?.read_aloud,
    entity.metadata?.readAloudText,
  );
}

function md(value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";
  if (typeof value === "string") return value;
  return `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
}

function bullet(lines: string[]): string {
  return lines.length ? lines.map((line) => `- ${line}`).join("\n") : "- —";
}

function uniqueFileName(title: string, used: Set<string>): string {
  const base = slugifyTitle(title);
  let candidate = `${base}.md`;
  let index = 2;
  while (used.has(candidate)) {
    candidate = `${base} ${index}.md`;
    index += 1;
  }
  used.add(candidate);
  return candidate;
}

function plainState(state: CampaignProjection) {
  return {
    campaignId: state.campaign?.campaignId,
    campaign: state.campaign,
    players: values(state.players),
    entities: values(state.entities),
    relations: values(state.relations),
    facts: values(state.facts),
    sessions: values(state.sessions),
    sessionEvents: values(state.sessionEvents),
    tags: values(state.tags),
    attachments: values(state.attachments),
    canvases: values(state.canvases),
  };
}

function buildGraph(state: CampaignProjection) {
  return {
    nodes: values(state.entities).map((entity) => ({
      id: entity.entityId,
      title: entity.title,
      type: entity.entityType,
      archived: Boolean(entity.archived),
    })),
    edges: values(state.relations).map((relation) => ({
      id: relation.relationId,
      source: relation.sourceEntityId,
      target: relation.targetEntityId,
      type: relation.relationType,
      archived: Boolean(relation.archived),
    })),
  };
}

function technicalRelationSentence(relation: Relation, state: CampaignProjection): string {
  const source = state.entities.get(relation.sourceEntityId);
  const target = state.entities.get(relation.targetEntityId);
  const sentence = `**${titleOf(source)}** ${relationLabel(relation.relationType)} **${titleOf(target)}**`;
  const suffix = [
    relation.description,
    `tipo: ${relation.relationType}`,
    `visibilidad: ${visibilityLabel(relation.visibility)}`,
    `estado: ${archiveLabel(relation)}`,
  ]
    .filter(Boolean)
    .join(" · ");
  return `${sentence}${suffix ? ` — ${suffix}` : ""}`;
}

function relationSentence(relation: Relation, state: CampaignProjection): string {
  const source = state.entities.get(relation.sourceEntityId);
  const target = state.entities.get(relation.targetEntityId);
  const base = `**${titleOf(source)}** ${relationBookletLabel(relation.relationType)} **${titleOf(target)}**`;
  if (relationDescriptionAddsValue(base, relation.description)) {
    return `${withFinalDot(base)} ${withFinalDot(relation.description ?? "")}`;
  }
  return withFinalDot(base);
}

function relationBulletForEntity(
  entity: Entity,
  relation: Relation,
  state: CampaignProjection,
): string {
  const source = state.entities.get(relation.sourceEntityId);
  const target = state.entities.get(relation.targetEntityId);
  const other = relationCounterpart(entity, relation, state);
  const otherTitle = titleOf(other);
  const sourceTitle = titleOf(source);
  const targetTitle = titleOf(target);
  const label = relationBookletLabel(relation.relationType);
  const base =
    relation.sourceEntityId === entity.entityId
      ? `${label} **${targetTitle}**`
      : `recibe la conexión de **${sourceTitle}**`;

  if (relation.description?.trim()) {
    return `**${otherTitle}.** ${withFinalDot(relation.description)}`;
  }

  return withFinalDot(base);
}

function relationBookletBlock(relation: Relation, state: CampaignProjection): string {
  const source = state.entities.get(relation.sourceEntityId);
  const target = state.entities.get(relation.targetEntityId);
  const note = isDmOnlyVisibility(relation.visibility)
    ? "\n\n> **Nota del DM.** Esta conexión es información privada hasta que la mesa encuentre pruebas o la relación salga a la luz."
    : "";
  return [
    `### ${titleOf(source)} y ${titleOf(target)}`,
    "",
    relationSentence(relation, state) + note,
    "",
  ].join("\n");
}

function factBookletLine(fact: Fact, state: CampaignProjection): string {
  const entities = fact.relatedEntityIds
    .map((id) => titleOf(state.entities.get(id), id))
    .join(", ");
  const confidence = confidenceNarrativeLabel(fact.confidence);
  const suffix = entities ? ` _Relacionado con: ${entities}._` : "";
  if (isDmOnlyFact(fact)) {
    return `> **Secreto del DM.** ${fact.statement}${confidence ? ` _${confidence}._` : ""}${suffix}`;
  }
  return `- ${fact.statement}${confidence && confidence !== "verdad establecida" ? ` _${confidence}._` : ""}${suffix}`;
}

function entityReferences(entityId: string, state: CampaignProjection): EntityReferences {
  const relations = values(state.relations).filter(
    (relation) =>
      relation.sourceEntityId === entityId ||
      relation.targetEntityId === entityId,
  );
  const facts = values(state.facts).filter((fact) =>
    fact.relatedEntityIds.includes(entityId),
  );
  const sessions = values(state.sessions).filter((session) =>
    session.prep?.involvedEntityIds.includes(entityId),
  );
  const canvases = values(state.canvases).filter((canvas) =>
    canvas.nodes.some((node) => node.entityId === entityId),
  );
  return { relations, facts, sessions, canvases };
}

function entityMarkdown(entity: Entity, state: CampaignProjection): string {
  const refs = entityReferences(entity.entityId, state);
  const outgoing = refs.relations.filter(
    (relation) => relation.sourceEntityId === entity.entityId,
  );
  const incoming = refs.relations.filter(
    (relation) => relation.targetEntityId === entity.entityId,
  );

  return [
    `# ${entity.title}`,
    "",
    "## Metadatos",
    bullet([
      `Tipo: ${typeLabel(entity.entityType)} (${entity.entityType})`,
      `Estado: ${archiveLabel(entity)}`,
      `Importancia: ${entity.importance || "normal"}`,
      `Visibilidad: ${visibilityNarrativeLabel(entity.visibility)}`,
      `ID: ${entity.entityId}`,
      `Creada: ${entity.createdAt || "—"}`,
      `Actualizada: ${entity.updatedAt || "—"}`,
    ]),
    "",
    "## Resumen narrativo",
    md(entity.summary),
    "",
    "## Contenido completo",
    md(entity.content),
    "",
    "## Detalles para el DM",
    md(entity.metadata),
    "",
    "## Relaciones salientes",
    bullet(outgoing.map((relation) => relationSentence(relation, state))),
    "",
    "## Relaciones entrantes",
    bullet(incoming.map((relation) => relationSentence(relation, state))),
    "",
    "## Hechos asociados",
    refs.facts.length
      ? refs.facts.map((fact) => factBookletLine(fact, state)).join("\n")
      : "- —",
    "",
    "## Aparece en sesiones",
    bullet(
      refs.sessions.map(
        (session) => `${session.title} (${session.status || "sin estado"})`,
      ),
    ),
    "",
    "## Aparece en canvas",
    bullet(refs.canvases.map((canvas) => `${canvas.title} (${canvas.kind})`)),
    "",
  ].join("\n");
}

function dashboardMarkdown(state: CampaignProjection): string {
  const activeQuests = values(state.entities).filter(
    (entity) =>
      entity.entityType === "quest" &&
      !entity.archived &&
      entity.status === "active",
  );
  const critical = values(state.entities).filter(
    (entity) => !entity.archived && entity.importance === "critical",
  );
  const unresolvedFacts = values(state.facts).filter(
    (fact) => !fact.archived && fact.confidence !== "confirmed",
  );
  return [
    "# Dashboard narrativo",
    "",
    "## Misiones activas",
    bullet(
      activeQuests.map(
        (quest) => `${quest.title}${quest.summary ? ` — ${quest.summary}` : ""}`,
      ),
    ),
    "",
    "## Elementos críticos",
    bullet(
      critical.map((entity) => `${entity.title} (${typeLabel(entity.entityType)})`),
    ),
    "",
    "## Hechos no confirmados",
    bullet(
      unresolvedFacts.map(
        (fact) => `${fact.statement} (${fact.kind}, ${fact.confidence})`,
      ),
    ),
    "",
  ].join("\n");
}

function timelineMarkdown(state: CampaignProjection, events: StoredEvent[]): string {
  const sessions = values(state.sessions).sort(
    (a, b) => (a.number ?? 0) - (b.number ?? 0),
  );
  return [
    "# Línea de tiempo",
    "",
    "## Sesiones",
    bullet(
      sessions.map(
        (session) =>
          `Sesión ${session.number ?? "?"}: ${session.title} — ${session.status || "sin estado"}`,
      ),
    ),
    "",
    "## Eventos registrados",
    bullet(
      events.map((event) => `${event.occurredAt || "—"} — ${event.type}`),
    ),
    "",
  ].join("\n");
}

function relationsMarkdown(state: CampaignProjection): string {
  const relations = values(state.relations).filter(
    (relation) => !relation.archived,
  );
  return [
    "# Relaciones narrativas",
    "",
    relations.length
      ? relations
          .map((relation) => relationBookletBlock(relation, state))
          .join("\n")
      : "No hay relaciones registradas.\n",
  ].join("\n");
}

function factsMarkdown(state: CampaignProjection): string {
  const facts = values(state.facts).filter((fact) => !fact.archived);
  const groups = new Map<string, Fact[]>();
  for (const fact of facts) {
    const key = fact.kind || "unknown";
    groups.set(key, [...(groups.get(key) ?? []), fact]);
  }
  return [
    "# Hechos",
    "",
    ...Array.from(groups.entries()).map(([key, group]) =>
      [
        `## ${factSectionLabel(key)}`,
        "",
        group.map((fact) => factBookletLine(fact, state)).join("\n"),
        "",
      ].join("\n"),
    ),
    facts.length ? "" : "No hay hechos registrados.\n",
  ].join("\n");
}

function sessionsMarkdown(state: CampaignProjection): string {
  const sessions = values(state.sessions);
  return [
    "# Sesiones",
    "",
    ...sessions.map((session) =>
      [
        `## Sesión ${session.number ?? "?"}: ${session.title}`,
        "",
        bullet([
          `Estado: ${session.status || "sin estado"}`,
          `ID: ${session.sessionId}`,
          `Creada: ${session.createdAt || "—"}`,
          `Actualizada: ${session.updatedAt || "—"}`,
        ]),
        "",
        "### Resumen",
        md(session.summary),
        "",
      ].join("\n"),
    ),
    sessions.length ? "" : "No hay sesiones registradas.\n",
  ].join("\n");
}

function canvasMarkdown(state: CampaignProjection): string {
  const canvases = values(state.canvases);
  return [
    "# Canvas y grafo",
    "",
    "Las posiciones y layouts exactos se preservan en `Datos/campaign-state.json`.",
    "",
    ...canvases.map((canvas) =>
      [
        `## ${canvas.title}`,
        "",
        bullet([
          `Tipo: ${canvas.kind}`,
          `Estado: ${canvas.archived ? "archivado" : "activo"}`,
          `Nodos: ${canvas.nodes.length}`,
          `Edges: ${canvas.edges.length}`,
        ]),
        "",
        "### Nodos",
        bullet(
          canvas.nodes.map((node) => {
            const entity = node.entityId
              ? state.entities.get(node.entityId)
              : undefined;
            return `${node.kind}: ${entity ? titleOf(entity) : node.title || node.text || node.id} (${node.x}, ${node.y})`;
          }),
        ),
        "",
        "### Conexiones",
        bullet(
          canvas.edges.map(
            (edge) =>
              `${edge.label || edge.relationshipId || "línea visual"}: ${edge.sourceNodeId} → ${edge.targetNodeId}`,
          ),
        ),
        "",
      ].join("\n"),
    ),
  ].join("\n");
}

function entityBookletBlock(entity: Entity, state: CampaignProjection): string {
  const refs = entityReferences(entity.entityId, state);
  const relations = refs.relations
    .filter((relation) => !relation.archived)
    .sort((a, b) => {
      const scoreOf = (other: Entity | undefined) =>
        other ? narrativeScore(other, state) : 0;
      return (
        scoreOf(relationCounterpart(entity, b, state)) -
        scoreOf(relationCounterpart(entity, a, state))
      );
    })
    .slice(0, 5);
  const description = entityDescription(entity);
  const readAloud = entityReadAloud(entity);
  const dmNote = entityDmNote(entity);
  const lines = [`### ${entity.title}`, "", description, ""];

  if (readAloud) {
    lines.push("#### Para leer en voz alta", "", `> ${readAloud}`, "");
  }

  if (dmNote && dmNote !== description) {
    lines.push(`> **Nota del DM.** ${dmNote}`, "");
  }

  if (relations.length) {
    lines.push(
      `**${relationSectionTitle(entity)}:**`,
      "",
      bullet(
        relations.map((relation) =>
          relationBulletForEntity(entity, relation, state),
        ),
      ),
      "",
    );
  }

  return lines.join("\n");
}

function entityBookletSection(
  title: string,
  entities: Entity[],
  state: CampaignProjection,
): string {
  return [
    `## ${title}`,
    "",
    entities.length
      ? entities.map((entity) => entityBookletBlock(entity, state)).join("\n")
      : "Sin entradas destacadas todavía.",
    "",
  ].join("\n");
}

function factsBookletSubset(
  state: CampaignProjection,
  predicate: (fact: Fact) => boolean,
  title: string,
): string {
  const facts = values(state.facts).filter(
    (fact) => !fact.archived && predicate(fact),
  );
  return [
    `## ${title}`,
    "",
    facts.length
      ? facts.map((fact) => factBookletLine(fact, state)).join("\n")
      : "Sin entradas registradas.",
    "",
  ].join("\n");
}

function bookletSynopsis(state: CampaignProjection): string {
  const title = state.campaign?.title || "La campaña";
  const mainLocation = entitiesOfType(state, "location")[0];
  const topFaction = entitiesOfType(state, "faction")[0];
  const mainQuest = entitiesOfType(state, "quest")[0];
  const factions = entitiesOfType(state, "faction")
    .slice(0, 3)
    .map((entity) => entity.title);
  const centralSecret = values(state.entities)
    .filter((entity) => entity.entityType === "secret" && !entity.archived)
    .sort((a, b) => narrativeScore(b, state) - narrativeScore(a, state))[0];

  const parts = [
    `${title} transcurre en ${titleOf(mainLocation, "un territorio marcado por el conflicto")}, donde ${titleOf(topFaction, "una fuerza dominante")} condiciona la vida pública y privada.`,
  ];

  if (mainQuest) {
    parts.push(
      `La campaña arranca alrededor de **${mainQuest.title}**: ${sentenceWithoutFinalDot(entityDescription(mainQuest))}.`,
    );
  }

  if (factions.length) {
    parts.push(
      `El tablero de poder se reparte entre ${factions.join(", ")}, cada cual con intereses incompatibles y secretos que pueden cambiar el equilibrio de la ciudad.`,
    );
  }

  if (centralSecret) {
    parts.push(
      `Para el Director de Juego, la pregunta central es cómo y cuándo saldrá a la luz **${centralSecret.title}**.`,
    );
  }

  return parts.join("\n\n");
}

function playerKnowledgeMarkdown(state: CampaignProjection): string {
  const facts = values(state.facts).filter(
    (fact) => !fact.archived && isPublicBookletFact(fact),
  );
  const publicEntities = sortNarrative(
    bookletEntities(state).filter(
      (entity) => !isDmOnlyVisibility(entity.visibility),
    ),
    state,
  ).slice(0, 8);
  const entityLines = publicEntities.map((entity) => {
    const text = entityPlayerFacingText(entity);
    return text
      ? `**${entity.title}.** ${sentenceWithoutFinalDot(text)}.`
      : `**${entity.title}.** ${typeLabel(entity.entityType)} relevante para la campaña.`;
  });
  const factLines = facts
    .slice(0, 8)
    .map((fact) => factBookletLine(fact, state).replace(/^- /, ""));
  return [
    "## 2. Lo que saben los jugadores",
    "",
    entityLines.length || factLines.length
      ? bullet([...entityLines, ...factLines].slice(0, 10))
      : "Completa información pública o rumores para generar aquí una introducción segura para la mesa.",
    "",
  ].join("\n");
}

function dmTruthMarkdown(state: CampaignProjection): string {
  const secrets = sortNarrative(
    bookletEntities(state).filter(
      (entity) =>
        entity.entityType === "secret" || isDmOnlyVisibility(entity.visibility),
    ),
    state,
  ).slice(0, 8);
  const secretFacts = values(state.facts)
    .filter((fact) => !fact.archived && isDmBookletFact(fact))
    .slice(0, 8);
  const entityLines = secrets.map((entity) => {
    const truth = entityDmNote(entity) || entityDescription(entity);
    return `**${entity.title}.** ${sentenceWithoutFinalDot(truth)}.`;
  });
  const factLines = secretFacts.map((fact) =>
    factBookletLine(fact, state).replace(/^> \*\*Secreto del DM\.\*\* /, ""),
  );
  return [
    "## 3. Lo que solo sabe el DM",
    "",
    entityLines.length || factLines.length
      ? bullet([...entityLines, ...factLines].slice(0, 10))
      : "No hay secretos registrados todavía.",
    "",
  ].join("\n");
}

function appendixEntityIndex(state: CampaignProjection): string {
  const entities = sortNarrative(bookletEntities(state), state);
  const pending = pendingEntities(state);
  return [
    "## Apéndice A — Índice de entidades",
    "",
    bullet(
      entities.map(
        (entity) =>
          `${entity.title} — ${typeLabel(entity.entityType)} · ${visibilityNarrativeLabel(entity.visibility)}`,
      ),
    ),
    "",
    pending.length
      ? [
          "### Elementos pendientes de completar",
          "",
          bullet(
            pending.map(
              (entity) =>
                `${entity.title || entity.entityId} — ${typeLabel(entity.entityType)}`,
            ),
          ),
          "",
        ].join("\n")
      : "",
  ].join("\n");
}

function sceneDetailsMarkdown(entity: Entity): string {
  const dramaticObjective = readString(entity.metadata?.dramaticObjective);
  const complications = readString(entity.metadata?.complications);
  const consequences = readString(entity.metadata?.consequences);

  let sceneDetails = "";
  if (dramaticObjective) sceneDetails += `\n   - **Objetivo Dramático:** ${dramaticObjective}`;
  if (complications) sceneDetails += `\n   - **Complicaciones:** ${complications}`;
  if (consequences) sceneDetails += `\n   - **Consecuencias:** ${consequences}`;
  return sceneDetails;
}

function canvasOrderedItemMarkdown(
  entity: Entity,
  itemIndex: number,
  sections: string[],
): void {
  const label = ENTITY_TYPE_LABELS[entity.entityType] || entity.entityType;
  sections.push(`${itemIndex}. **${entity.title}** (${label})`);

  if (entity.entityType === "scene") {
    sections.push(
      `   ${entity.summary || entity.content || "_Sin descripción de escena._"}${sceneDetailsMarkdown(entity)}`,
    );
  } else {
    sections.push(`   ${entity.summary || entity.content || "_Sin descripción._"}`);
  }
  sections.push("");
}

function canvasOrderedBookletSection(state: CampaignProjection): string {
  const canvases = values(state.canvases).filter((c) => !c.archived);
  if (canvases.length === 0) return "";

  const sections: string[] = ["## 3. Estructura Narrativa (según Canvas)", ""];

  const GROUP_TYPE_LABELS: Record<string, string> = {
    location: "📍 Ubicación",
    faction: "🛡️ Facción",
    arc: "🎭 Arco Narrativo",
    session: "🚀 Sesión",
    mystery: "🔍 Conspiración / Misterio",
    custom: "📁 Grupo",
  };

  for (const canvas of canvases) {
    sections.push(`### Tablero: ${canvas.title}`);
    sections.push("");
    if (canvas.description) {
      sections.push(`> ${canvas.description}`);
      sections.push("");
    }

    const nodes = canvas.nodes;
    const groups = nodes
      .filter((n) => n.kind === "group")
      .sort((a, b) => a.y - b.y || a.x - b.x);
    const nonGroupNodes = nodes.filter((n) => n.kind !== "group");
    const rootNodes = nonGroupNodes
      .filter((n) => !n.parentId)
      .sort((a, b) => a.y - b.y || a.x - b.x);
    const orderedItems: CanvasNode[] = [...rootNodes, ...groups].sort(
      (a, b) => a.y - b.y || a.x - b.x,
    );

    if (orderedItems.length === 0) {
      sections.push("_Este tablero no tiene elementos._");
      sections.push("");
      continue;
    }

    let itemIndex = 1;
    for (const item of orderedItems) {
      if (item.kind === "group") {
        // groupType is a frontend-only convention stored in node metadata;
        // canvasNodeSchema has no dedicated top-level field for it.
        const groupType = readString(item.metadata?.groupType, "custom");
        const groupLabel = GROUP_TYPE_LABELS[groupType] || "📁 Grupo";
        sections.push(`#### ${groupLabel}: ${item.title || "Sin título"}`);
        sections.push("");
        const children = nonGroupNodes
          .filter((n) => n.parentId === item.id)
          .sort((a, b) => a.y - b.y || a.x - b.x);
        if (children.length === 0) {
          sections.push("_Grupo vacío._");
          sections.push("");
        } else {
          for (const child of children) {
            const entity = child.entityId
              ? state.entities.get(child.entityId)
              : undefined;
            if (entity) {
              canvasOrderedItemMarkdown(entity, itemIndex, sections);
              itemIndex++;
            } else if (child.kind === "note" && child.text) {
              sections.push(`${itemIndex}. *Nota:* ${child.text}`);
              sections.push("");
              itemIndex++;
            }
          }
        }
      } else {
        const entity = item.entityId
          ? state.entities.get(item.entityId)
          : undefined;
        if (entity) {
          canvasOrderedItemMarkdown(entity, itemIndex, sections);
          itemIndex++;
        } else if (item.kind === "note" && item.text) {
          sections.push(`${itemIndex}. *Nota:* ${item.text}`);
          sections.push("");
          itemIndex++;
        }
      }
    }
    sections.push("");
  }

  return sections.join("\n");
}

function bookletMarkdown(state: CampaignProjection): string {
  const campaignTitle = state.campaign?.title || "Campaña";
  const mainQuests = entitiesOfType(state, "quest");
  const clues = entitiesOfType(state, "clue");
  const secrets = entitiesOfType(state, "secret");
  const relations = values(state.relations)
    .filter((relation) => !relation.archived)
    .slice(0, 12);
  const sessions = values(state.sessions).sort(
    (a, b) => (a.number ?? 0) - (b.number ?? 0),
  );

  return [
    `# ${campaignTitle}`,
    "",
    "> Booklet de campaña para Director de Juego",
    "",
    "## 1. Premisa",
    "",
    md(state.campaign?.summary || bookletSynopsis(state)),
    "",
    playerKnowledgeMarkdown(state),
    dmTruthMarkdown(state),
    "",
    canvasOrderedBookletSection(state),
    "",
    "## 4. La situación inicial",
    "",
    mainQuests[0]
      ? `**${mainQuests[0].title}.** ${entityDescription(mainQuests[0])}`
      : "Define aquí el punto de partida de la campaña cuando exista una misión principal.",
    "",
    entityBookletSection(
      "5. Facciones principales",
      entitiesOfType(state, "faction"),
      state,
    ),
    entityBookletSection(
      "6. Personajes principales",
      [
        ...entitiesOfType(state, "npc"),
        ...entitiesOfType(state, "player_character"),
      ],
      state,
    ),
    entityBookletSection(
      "7. Lugares clave",
      entitiesOfType(state, "location"),
      state,
    ),
    entityBookletSection("8. Trama principal", mainQuests, state),
    entityBookletSection("9. Red de pistas", [...clues, ...secrets], state),
    factsBookletSubset(
      state,
      isPublicBookletFact,
      "10. Rumores, verdades públicas y teorías",
    ),
    factsBookletSubset(state, isDmBookletFact, "11. Secretos y notas del DM"),
    "## 12. Relaciones importantes",
    "",
    relations.length
      ? relations
          .map((relation) => relationBookletBlock(relation, state))
          .join("\n")
      : "Sin relaciones registradas.",
    "",
    "## 13. Preparación de sesiones",
    "",
    sessions.length
      ? bullet(
          sessions.map(
            (session) =>
              `Sesión ${session.number ?? "?"}: ${session.title} — ${session.summary || session.status || "sin preparar"}`,
          ),
        )
      : "No hay sesiones registradas. Añade sesiones cuando quieras preparar escenas concretas.",
    "",
    appendixEntityIndex(state),
    "",
    "## Apéndice B — Datos técnicos",
    "",
    "La exportación conserva el estado completo en `Datos/campaign-state.json`, los eventos en `Datos/events.ndjson`, el grafo en `Datos/graph.json` y una vista técnica en `Apéndice técnico.md`.",
    "",
  ].join("\n");
}

function technicalMarkdown(state: CampaignProjection): string {
  const campaignTitle = state.campaign?.title || "Campaña";
  const entities = values(state.entities);
  return [
    `# ${campaignTitle}`,
    "",
    "> Exportación técnica completa para DM. Incluye información pública, privada y oculta.",
    "",
    "## Resumen de campaña",
    md(state.campaign?.summary),
    "",
    "## Índice",
    "- [Campaña completa](Campaña completa.md)",
    "- [01 Dashboard narrativo](01 Dashboard narrativo.md)",
    "- [02 Línea de tiempo](02 Línea de tiempo.md)",
    "- [03 Relaciones](03 Relaciones.md)",
    "- [04 Hechos](04 Hechos.md)",
    "- [05 Sesiones](05 Sesiones.md)",
    "- [06 Canvas y grafo](06 Canvas y grafo.md)",
    "- [Entidades](Entidades/)",
    "- [Datos](Datos/)",
    "",
    "## Entidades",
    bullet(
      entities.map(
        (entity) =>
          `${entity.title} — ${typeLabel(entity.entityType)} (${visibilityLabel(entity.visibility)})`,
      ),
    ),
    "",
    "## Relaciones principales",
    bullet(
      values(state.relations).map((relation) =>
        technicalRelationSentence(relation, state),
      ),
    ),
    "",
    "## Hechos",
    bullet(
      values(state.facts).map(
        (fact) => `${fact.statement} (${fact.kind}, ${fact.confidence})`,
      ),
    ),
    "",
  ].join("\n");
}

function completeMarkdown(state: CampaignProjection): string {
  return bookletMarkdown(state);
}

async function writeText(
  rootDir: string,
  relativePath: string,
  content: string,
): Promise<void> {
  const filePath = join(rootDir, relativePath);
  assertWithinDir(filePath, rootDir);
  await fs.mkdir(dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

export async function writeMarkdownCampaignExport(input: {
  state: CampaignProjection;
  events: StoredEvent[];
  exportDir: string;
  campaignId: string;
  exportId: string;
}): Promise<MarkdownCampaignExportResult> {
  const { state, events, exportDir, campaignId, exportId } = input;
  const written: string[] = [];
  const write = async (relativePath: string, content: string) => {
    await writeText(exportDir, relativePath, content);
    written.push(relativePath);
  };

  await fs.mkdir(exportDir, { recursive: true });

  await write(PRIMARY_FILE, completeMarkdown(state));
  await write(
    "README.md",
    `# ${state.campaign?.title || "Campaña"}\n\nAbre \`${PRIMARY_FILE}\` como booklet narrativo principal. La vista técnica completa está en \`Apéndice técnico.md\`.\n`,
  );
  await write("00 Resumen de campaña.md", completeMarkdown(state));
  await write("Apéndice técnico.md", technicalMarkdown(state));
  await write("01 Dashboard narrativo.md", dashboardMarkdown(state));
  await write("02 Línea de tiempo.md", timelineMarkdown(state, events));
  await write("03 Relaciones.md", relationsMarkdown(state));
  await write("04 Hechos.md", factsMarkdown(state));
  await write("05 Sesiones.md", sessionsMarkdown(state));
  await write("06 Canvas y grafo.md", canvasMarkdown(state));

  const folderNames = new Set([...Object.values(ENTITY_FOLDERS), "Otros"]);
  for (const folderName of folderNames) {
    await fs.mkdir(join(exportDir, "Entidades", folderName), {
      recursive: true,
    });
  }

  const usedByFolder = new Map<string, Set<string>>();
  for (const entity of values(state.entities)) {
    const folderName = ENTITY_FOLDERS[entity.entityType] || "Otros";
    const used = usedByFolder.get(folderName) ?? new Set<string>();
    usedByFolder.set(folderName, used);
    const fileName = uniqueFileName(entity.title || entity.entityId, used);
    await write(
      join("Entidades", folderName, fileName),
      entityMarkdown(entity, state),
    );

    // Compatibility with the initial export layout used by older tests/users.
    if (entity.entityType === "npc") {
      await fs.mkdir(join(exportDir, "NPCs"), { recursive: true });
      await write(join("NPCs", fileName), entityMarkdown(entity, state));
    }
  }

  const graph = buildGraph(state);
  const plain = plainState(state);
  await write(
    "Datos/campaign-state.json",
    `${JSON.stringify(plain, null, 2)}\n`,
  );
  await write(
    "Datos/events.ndjson",
    events.map((event) => JSON.stringify(event)).join("\n") +
      (events.length ? "\n" : ""),
  );
  await write("Datos/graph.json", `${JSON.stringify(graph, null, 2)}\n`);

  // Compatibility aliases.
  await write(
    "Dashboard.md",
    `## Active Quests\n\n${dashboardMarkdown(state)}\n`,
  );
  await write("Graph.json", `${JSON.stringify(graph, null, 2)}\n`);

  return {
    campaignId,
    format: "markdown",
    exportId,
    path: exportDir,
    primaryFile: PRIMARY_FILE,
    downloadUrl: `/api/campaigns/${campaignId}/exports/${basename(exportId)}/download`,
    fileCount: written.length,
  };
}
