import type {
  CampaignTemplateLocale,
  CampaignTemplateDifficulty,
  CampaignTemplateSystem,
  CampaignTemplateVisibility,
  CampaignTemplateEntityFile,
  CampaignTemplateRelationFile,
  CampaignTemplateFactFile,
  CampaignTemplateSessionFile,
  CampaignTemplateCanvasFile,
  CampaignTemplateTemplateFile,
  CampaignTemplateLocaleOverlay,
} from "./schemas.js";

export type ResolvedCampaignTemplateEntity = {
  entityId: string;
  entityType: string;
  title: string;
  subtitle?: string;
  summary?: string;
  content?: string;
  status?: string;
  importance?: "low" | "normal" | "high" | "critical";
  visibility?: CampaignTemplateVisibility;
  metadata?: Record<string, unknown>;
  imageUrl?: string;
};

export type ResolvedCampaignTemplateRelation = {
  relationId: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationType: string;
  description?: string;
  visibility?: CampaignTemplateVisibility;
};

export type ResolvedCampaignTemplateFact = {
  factId: string;
  statement: string;
  kind: "canon" | "dm_secret" | "rumor" | "lie" | "player_theory" | "mistake" | "retcon" | "unknown";
  confidence: "unconfirmed" | "suspected" | "likely" | "confirmed" | "false";
  visibility?: CampaignTemplateVisibility;
  relatedEntityIds?: string[];
};

export type ResolvedCampaignTemplateSession = {
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

export type ResolvedCampaignTemplateCanvas = {
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

export type ResolvedCampaignTemplateCampaign = {
  schemaVersion: number;
  templateId: string;
  version: string;
  title: string;
  subtitle: string;
  description: string;
  summary: string;
  locale: CampaignTemplateLocale;
  defaultLocale: CampaignTemplateLocale;
  availableLocales: CampaignTemplateLocale[];
  system: CampaignTemplateSystem;
  difficulty: CampaignTemplateDifficulty;
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
  entities: ResolvedCampaignTemplateEntity[];
  relations: ResolvedCampaignTemplateRelation[];
  facts: ResolvedCampaignTemplateFact[];
  sessions: ResolvedCampaignTemplateSession[];
  canvases: ResolvedCampaignTemplateCanvas[];
};

type CampaignTemplateOverlayEntities = NonNullable<CampaignTemplateLocaleOverlay["entities"]>;
type CampaignTemplateOverlayRelations = NonNullable<CampaignTemplateLocaleOverlay["relations"]>;
type CampaignTemplateOverlayFacts = NonNullable<CampaignTemplateLocaleOverlay["facts"]>;
type CampaignTemplateOverlaySessions = NonNullable<CampaignTemplateLocaleOverlay["sessions"]>;
type CampaignTemplateOverlayCanvases = NonNullable<CampaignTemplateLocaleOverlay["canvases"]>;

function mergeEntities(base: CampaignTemplateEntityFile[], overlayEntities?: CampaignTemplateOverlayEntities): ResolvedCampaignTemplateEntity[] {
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
      imageUrl: overlay?.imageUrl ?? entity.imageUrl,
    };
  });
}

function mergeRelations(base: CampaignTemplateRelationFile[], overlayRelations?: CampaignTemplateOverlayRelations): ResolvedCampaignTemplateRelation[] {
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

function mergeFacts(base: CampaignTemplateFactFile[], overlayFacts?: CampaignTemplateOverlayFacts): ResolvedCampaignTemplateFact[] {
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

function mergeSessions(base: CampaignTemplateSessionFile[], overlaySessions?: CampaignTemplateOverlaySessions): ResolvedCampaignTemplateSession[] {
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

    let resolvedPrep: ResolvedCampaignTemplateSession["prep"] = undefined;
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

function mergeCanvases(base: CampaignTemplateCanvasFile[], overlayCanvases?: CampaignTemplateOverlayCanvases): ResolvedCampaignTemplateCanvas[] {
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

export function resolveCampaignTemplateCampaign(
  base: CampaignTemplateTemplateFile,
  overlay: CampaignTemplateLocaleOverlay,
  locale: CampaignTemplateLocale,
  defaultLocale: CampaignTemplateLocale,
  availableLocales: CampaignTemplateLocale[]
): ResolvedCampaignTemplateCampaign {
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
