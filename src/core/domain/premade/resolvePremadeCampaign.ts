import type {
  PremadeLocale,
  PremadeDifficulty,
  PremadeSystem,
  PremadeVisibility,
  PremadeEntityFile,
  PremadeRelationFile,
  PremadeFactFile,
  PremadeSessionFile,
  PremadeCanvasFile,
  PremadeTemplateFile,
  PremadeLocaleOverlay,
} from "./schemas.js";

export type ResolvedPremadeEntity = {
  entityId: string;
  entityType: string;
  title: string;
  subtitle?: string;
  summary?: string;
  content?: string;
  status?: string;
  importance?: "low" | "normal" | "high" | "critical";
  visibility?: PremadeVisibility;
  metadata?: Record<string, any>;
};

export type ResolvedPremadeRelation = {
  relationId: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationType: string;
  description?: string;
  visibility?: PremadeVisibility;
};

export type ResolvedPremadeFact = {
  factId: string;
  statement: string;
  kind: "canon" | "dm_secret" | "rumor" | "lie" | "player_theory" | "mistake" | "retcon" | "unknown";
  confidence: "unconfirmed" | "suspected" | "likely" | "confirmed" | "false";
  visibility?: PremadeVisibility;
  relatedEntityIds?: string[];
};

export type ResolvedPremadeSession = {
  sessionId: string;
  title: string;
  scheduledAt?: string;
  prep?: {
    state?: "draft" | "ready";
    summary?: string;
    openingPrompt?: string;
    goals?: string[];
    sceneIds?: string[];
    involvedEntityIds?: string[];
    availableClueIds?: string[];
    secretsAtRiskIds?: string[];
    expectedConsequenceIds?: string[];
    checklist?: Array<{ id: string; label: string; priority?: "low" | "medium" | "high"; done?: boolean }>;
    notes?: string;
  };
};

export type ResolvedPremadeCanvas = {
  canvasId: string;
  title: string;
  kind: "world" | "session" | "mystery" | "location" | "characters" | "custom";
  description?: string;
  nodes?: Array<{
    id: string;
    kind: "entity" | "note" | "group" | "image" | "fact";
    entityId?: string;
    factId?: string;
    groupId?: string;
    title?: string;
    text?: string;
    color?: "yellow" | "blue" | "green" | "pink" | "purple";
    x: number;
    y: number;
    width?: number;
    height?: number;
    status?: "draft" | "ready" | "revealed" | "resolved";
    visibility?: "dm" | "public";
  }>;
  edges?: Array<{
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    relationshipId?: string;
    label?: string;
    status: "draft" | "domain";
    visibility?: "dm" | "public";
    style?: "solid" | "dashed" | "secret" | "weak" | "strong";
  }>;
};

export type ResolvedPremadeCampaign = {
  schemaVersion: number;
  templateId: string;
  version: string;
  title: string;
  subtitle: string;
  description: string;
  summary: string;
  locale: PremadeLocale;
  defaultLocale: PremadeLocale;
  availableLocales: PremadeLocale[];
  system: PremadeSystem;
  difficulty: PremadeDifficulty;
  recommendedFor: string;
  tags: string[];
  pitch?: string;
  learningGoals: string[];
  includedMaterial: string[];
  quickStart?: { title: string; steps: string[] };
  highlightEntityIds: string[];
  featuredFactIds: string[];
  featuredRelationIds: string[];
  stats: {
    entities: number;
    relations: number;
    facts: number;
    preparedSessions: number;
  };
  entities: ResolvedPremadeEntity[];
  relations: ResolvedPremadeRelation[];
  facts: ResolvedPremadeFact[];
  sessions: ResolvedPremadeSession[];
  canvases: ResolvedPremadeCanvas[];
};

function mergeEntities(base: PremadeEntityFile[], overlayEntities?: Record<string, any>): ResolvedPremadeEntity[] {
  return base.map((entity) => {
    const id = entity.entityId;
    const overlay = overlayEntities?.[id];

    let title = overlay?.title ?? entity.title;
    if (!title) {
      const idParts = id.split("_");
      const nameParts = idParts.length > 3 ? idParts.slice(3) : idParts;
      title = nameParts
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    return {
      entityId: id,
      entityType: entity.entityType,
      title,
      subtitle: overlay?.subtitle ?? entity.subtitle,
      summary: overlay?.summary ?? entity.summary,
      content: overlay?.content ?? entity.content,
      status: overlay?.status ?? entity.status,
      importance: entity.importance,
      visibility: entity.visibility,
      metadata: overlay?.metadata ?? entity.metadata,
    };
  });
}

function mergeRelations(base: PremadeRelationFile[], overlayRelations?: Record<string, any>): ResolvedPremadeRelation[] {
  return base.map((relation) => {
    const id = relation.relationId;
    const overlay = overlayRelations?.[id];
    return {
      relationId: id,
      sourceEntityId: relation.sourceEntityId,
      targetEntityId: relation.targetEntityId,
      relationType: relation.relationType,
      description: overlay?.description ?? relation.description,
      visibility: relation.visibility,
    };
  });
}

function mergeFacts(base: PremadeFactFile[], overlayFacts?: Record<string, any>): ResolvedPremadeFact[] {
  return base.map((fact) => {
    const id = fact.factId;
    const overlay = overlayFacts?.[id];
    return {
      factId: id,
      statement: overlay?.statement ?? fact.statement ?? "",
      kind: fact.kind,
      confidence: fact.confidence,
      visibility: fact.visibility,
      relatedEntityIds: fact.relatedEntityIds,
    };
  });
}

function mergeSessions(base: PremadeSessionFile[], overlaySessions?: Record<string, any>): ResolvedPremadeSession[] {
  return base.map((session) => {
    const id = session.sessionId;
    const overlay = overlaySessions?.[id];

    let title = overlay?.title ?? session.title;
    if (!title) {
      const idParts = id.split("_");
      const nameParts = idParts.length > 3 ? idParts.slice(3) : idParts;
      title = nameParts
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    const basePrep = session.prep;
    const overlayPrep = overlay?.prep;

    let resolvedPrep: ResolvedPremadeSession["prep"] = undefined;
    if (basePrep || overlayPrep) {
      const baseChecklist = basePrep?.checklist ?? [];
      const overlayChecklist = overlayPrep?.checklist ?? {};

      const resolvedChecklist = baseChecklist.map((item) => {
        const itemOverlay = overlayChecklist[item.id];
        return {
          id: item.id,
          label: itemOverlay?.label ?? item.label ?? "",
          priority: item.priority,
          done: item.done,
        };
      });

      resolvedPrep = {
        state: basePrep?.state,
        summary: overlayPrep?.summary ?? basePrep?.summary,
        openingPrompt: overlayPrep?.openingPrompt ?? basePrep?.openingPrompt,
        goals: overlayPrep?.goals ?? basePrep?.goals,
        sceneIds: basePrep?.sceneIds,
        involvedEntityIds: basePrep?.involvedEntityIds,
        availableClueIds: basePrep?.availableClueIds,
        secretsAtRiskIds: basePrep?.secretsAtRiskIds,
        expectedConsequenceIds: basePrep?.expectedConsequenceIds,
        checklist: resolvedChecklist.length ? resolvedChecklist : undefined,
        notes: overlayPrep?.notes ?? basePrep?.notes,
      };
    }

    return {
      sessionId: id,
      title,
      scheduledAt: session.scheduledAt,
      prep: resolvedPrep,
    };
  });
}

function mergeCanvases(base: PremadeCanvasFile[], overlayCanvases?: Record<string, any>): ResolvedPremadeCanvas[] {
  return base.map((canvas) => {
    const id = canvas.canvasId;
    const overlay = overlayCanvases?.[id];

    let title = overlay?.title ?? canvas.title;
    if (!title) {
      const idParts = id.split("_");
      const nameParts = idParts.length > 3 ? idParts.slice(3) : idParts;
      title = nameParts
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    const baseNodes = canvas.nodes ?? [];
    const overlayNodes = overlay?.nodes ?? {};
    const resolvedNodes = baseNodes.map((node) => {
      const nodeOverlay = overlayNodes[node.id];
      return {
        ...node,
        title: nodeOverlay?.title ?? node.title,
        text: nodeOverlay?.text ?? node.text,
      };
    });

    const baseEdges = canvas.edges ?? [];
    const overlayEdges = overlay?.edges ?? {};
    const resolvedEdges = baseEdges.map((edge) => {
      const edgeOverlay = overlayEdges[edge.id];
      return {
        ...edge,
        label: edgeOverlay?.label ?? edge.label,
        status: edge.status === "domain" ? ("domain" as const) : ("draft" as const),
      };
    });

    return {
      canvasId: id,
      title,
      kind: canvas.kind,
      description: overlay?.description ?? canvas.description,
      nodes: resolvedNodes.length ? resolvedNodes : undefined,
      edges: resolvedEdges.length ? resolvedEdges : undefined,
    };
  });
}

export function resolvePremadeCampaign(
  base: PremadeTemplateFile,
  overlay: PremadeLocaleOverlay,
  locale: PremadeLocale,
  defaultLocale: PremadeLocale,
  availableLocales: PremadeLocale[]
): ResolvedPremadeCampaign {
  const templateId = base.templateId;

  return {
    schemaVersion: base.schemaVersion ?? 2,
    templateId,
    version: base.version,
    title: overlay.title,
    subtitle: overlay.subtitle ?? "",
    description: overlay.description ?? "",
    summary: overlay.summary ?? overlay.description ?? "",
    locale,
    defaultLocale,
    availableLocales,
    system: base.system,
    difficulty: base.difficulty,
    recommendedFor: overlay.recommendedFor ?? "",
    tags: overlay.tags ?? base.tags,
    pitch: overlay.pitch,
    learningGoals: overlay.learningGoals ?? [],
    includedMaterial: overlay.includedMaterial ?? [],
    quickStart: overlay.quickStart,
    highlightEntityIds: base.highlightEntityIds,
    featuredFactIds: base.featuredFactIds,
    featuredRelationIds: base.featuredRelationIds,
    stats: base.stats,
    entities: mergeEntities(base.entities, overlay.entities),
    relations: mergeRelations(base.relations, overlay.relations),
    facts: mergeFacts(base.facts, overlay.facts),
    sessions: mergeSessions(base.sessions, overlay.sessions),
    canvases: mergeCanvases(base.canvases, overlay.canvases),
  };
}
