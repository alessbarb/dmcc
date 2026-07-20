import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  GitFork,
  Layers,
  Lock,
  ScrollText,
  Sparkles,
  Wand2,
} from "lucide-react";
import type { VisibilityRule } from "@core/domain/visibility/visibility.js";
import { fetchSession } from "../../shared/auth/authClient.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { useCampaignStore, type CampaignStateStore, type Entity, type Relation } from "../../shared/stores/campaignStore.js";
import { CampaignTemplateImportDialog, type CampaignTemplateImportMode } from "../../shared/components/CampaignTemplateImportDialog.js";
import { EntityRelationsTab } from "../entities/relations/EntityRelationsTab.js";
import { buildEntityNeighborhood } from "../entities/relations/entityRelationshipNeighborhood.js";
import { TemplateEntityPreviewModal } from "./TemplateEntityPreviewModal.js";
import {
  CONFIDENCE_LABEL_KEYS,
  DIFFICULTY_LABEL_KEYS,
  ENTITY_TYPE_LABEL_KEYS,
  FACT_KIND_LABEL_KEYS,
  RELATION_LABEL_KEYS,
  SYSTEM_LABEL_KEYS,
  isDefined,
  isGuideEntity,
  labelFor,
  visibilityLabel,
  type TranslateFn,
} from "./campaignTemplatePreviewLabels.js";
import "../../shared/styles/features/campaign-template.css";

type PreviewCampaignState = NonNullable<CampaignStateStore["campaignState"]>;

/** `EntityRelationsTab` expects live-campaign `Entity`/`Relation` records; the
 *  template only carries the subset it needs to import, so the rest is
 *  padded with inert defaults purely to satisfy the shape. */
function toPreviewEntity(entity: {
  entityId: string;
  entityType: string;
  title: string;
  subtitle?: string;
  summary?: string;
  content?: string;
  status?: string;
  importance?: string;
  visibility?: VisibilityRule;
  metadata?: Record<string, unknown>;
}): Entity {
  return {
    entityId: entity.entityId,
    campaignId: "preview",
    entityType: entity.entityType,
    title: entity.title,
    subtitle: entity.subtitle,
    summary: entity.summary,
    content: entity.content,
    status: entity.status ?? "active",
    importance: entity.importance ?? "minor",
    visibility: entity.visibility ?? { kind: "dm_only" },
    metadata: entity.metadata ?? {},
    tagIds: [],
    archived: false,
    createdAt: "",
    updatedAt: "",
  };
}

function toPreviewRelation(relation: {
  relationId: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationType: string;
  description?: string;
  visibility?: VisibilityRule;
}): Relation {
  return {
    relationId: relation.relationId,
    campaignId: "preview",
    sourceEntityId: relation.sourceEntityId,
    targetEntityId: relation.targetEntityId,
    relationType: relation.relationType,
    status: "active",
    description: relation.description,
    visibility: relation.visibility ?? { kind: "dm_only" },
    archived: false,
  };
}

function runCampaignTemplatePreviewAction(operation: Promise<unknown>, errorMessage: string): void {
  void operation.catch((error: unknown) => {
    console.error(errorMessage, error);
  });
}

/** How much of the reference lists an unregistered visitor sees before the
 *  rest blurs behind a "create your copy" gate — enough to prove the depth
 *  of the content without functioning as a free full read. */
const SESSIONS_FREE_PREVIEW_COUNT = 1;
const FACTS_FREE_PREVIEW_COUNT = 2;

interface PreviewSecretFact {
  factId: string;
  statement: string;
  relatedEntityIds?: string[];
}

function SecretRevealCard({
  secret,
  entityTitle,
  t,
}: {
  secret: PreviewSecretFact;
  entityTitle: string | null;
  t: TranslateFn;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <section className="card campaign-template-preview-card campaign-template-preview-secret-card">
      <div className="campaign-template-preview-section-heading">
        <h2>{t("campaignTemplatePreview.secretMomentTitle")}</h2>
        <span>{entityTitle ?? t("campaignTemplatePreview.secretMomentDesc")}</span>
      </div>
      <button
        type="button"
        className={`campaign-template-preview-secret ${revealed ? "is-revealed" : ""}`}
        onClick={() => setRevealed(true)}
        disabled={revealed}
        aria-live="polite"
      >
        <span className="campaign-template-preview-secret__icon">
          {revealed ? <Eye size={20} /> : <EyeOff size={20} />}
        </span>
        <span className="campaign-template-preview-secret__text">
          {revealed ? secret.statement : t("campaignTemplatePreview.secretMomentHidden")}
        </span>
        {!revealed && (
          <span className="campaign-template-preview-secret__cta">{t("campaignTemplatePreview.secretMomentReveal")}</span>
        )}
      </button>
      {revealed && (
        <p className="campaign-template-preview-secret__followup">{t("campaignTemplatePreview.secretMomentFollowup")}</p>
      )}
    </section>
  );
}

export function CampaignTemplatePreviewPage() {
  const { templateId } = useParams({ from: "/campaign-templates/$templateId" });
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    campaigns,
    activeCampaignTemplate,
    loading,
    error,
    fetchCampaigns,
    fetchCampaignTemplate,
    importCampaignTemplate,
    campaignTemplateImportState,
    clearCampaignTemplateImportState,
  } = useCampaignStore();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [templateLoaded, setTemplateLoaded] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const importing = campaignTemplateImportState.status === "running";
  const importError = campaignTemplateImportState.error ? t(campaignTemplateImportState.error) : null;

  useEffect(() => {
    const init = async () => {
      const session = await fetchSession().catch(() => null);
      if (session?.sessionValid) {
        setAuthenticated(true);
        await Promise.all([fetchCampaignTemplate(templateId), fetchCampaigns().catch(() => {})]);
      } else {
        await fetchCampaignTemplate(templateId);
      }
      setTemplateLoaded(true);
    };

    runCampaignTemplatePreviewAction(init(), "No se pudo inicializar la vista previa de aventura preparada.");
  }, [fetchCampaigns, fetchCampaignTemplate, templateId]);

  const goBack = () => {
    runCampaignTemplatePreviewAction(
      navigate({ to: authenticated ? "/dm" : "/" }),
      "No se pudo volver a campañas.",
    );
  };

  const requestCreateCopy = () => {
    if (!authenticated) {
      runCampaignTemplatePreviewAction(
        navigate({ to: "/auth/register" }),
        "No se pudo abrir el registro.",
      );
      return;
    }
    setImportDialogOpen(true);
  };

  const template = activeCampaignTemplate?.templateId === templateId ? activeCampaignTemplate : null;

  const groupedEntities = useMemo(() => {
    if (!template) return [];
    const groups = new Map<string, typeof template.entities>();
    for (const entity of template.entities.filter((item) => !isGuideEntity(item))) {
      const list = groups.get(entity.entityType) ?? [];
      list.push(entity);
      groups.set(entity.entityType, list);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => labelFor(a, ENTITY_TYPE_LABEL_KEYS, t).localeCompare(labelFor(b, ENTITY_TYPE_LABEL_KEYS, t)));
  }, [t, template]);

  const entityById = useMemo(() => {
    const map = new Map<string, NonNullable<typeof template>["entities"][number]>();
    for (const entity of template?.entities ?? []) {
      map.set(entity.entityId, entity);
    }
    return map;
  }, [template]);

  const guideEntities = useMemo(() => template?.entities.filter(isGuideEntity) ?? [], [template]);

  const featuredEntities = useMemo(() => {
    if (!template) return [];
    const byId = (template.highlightEntityIds ?? [])
      .map((entityId) => entityById.get(entityId))
      .filter(isDefined);
    return (byId.length ? byId : template.entities.filter((entity) => !isGuideEntity(entity))).slice(0, 10);
  }, [entityById, template]);

  const featuredFacts = useMemo(() => {
    if (!template) return [];
    const factById = new Map(template.facts.map((fact) => [fact.factId, fact]));
    const selected = (template.featuredFactIds ?? [])
      .map((factId) => factById.get(factId))
      .filter(isDefined);
    return (selected.length ? selected : template.facts).slice(0, 10);
  }, [template]);

  const featuredRelations = useMemo(() => {
    if (!template) return [];
    const relationById = new Map(template.relations.map((relation) => [relation.relationId, relation]));
    const selected = (template.featuredRelationIds ?? [])
      .map((relationId) => relationById.get(relationId))
      .filter(isDefined);
    return (selected.length ? selected : template.relations).slice(0, 10);
  }, [template]);

  const graphEntities = useMemo(() => (template ? template.entities.map(toPreviewEntity) : []), [template]);
  const graphRelations = useMemo(() => (template ? template.relations.map(toPreviewRelation) : []), [template]);

  const graphPreviewState: PreviewCampaignState = useMemo(
    () => ({
      campaign: null,
      entities: graphEntities,
      relations: graphRelations,
      facts: [],
      sessions: [],
      players: [],
      canvases: [],
      notebooks: [],
      notebookItems: [],
      storyThreads: [],
      storySteps: [],
    }),
    [graphEntities, graphRelations],
  );

  const graphCenterEntity = useMemo(() => {
    if (!graphEntities.length) return null;
    const degreeById = new Map<string, number>();
    for (const relation of graphRelations) {
      degreeById.set(relation.sourceEntityId, (degreeById.get(relation.sourceEntityId) ?? 0) + 1);
      degreeById.set(relation.targetEntityId, (degreeById.get(relation.targetEntityId) ?? 0) + 1);
    }
    const highlighted = (template?.highlightEntityIds ?? [])
      .map((entityId) => graphEntities.find((entity) => entity.entityId === entityId))
      .find((entity) => entity && (degreeById.get(entity.entityId) ?? 0) > 0);
    if (highlighted) return highlighted;
    return [...graphEntities].sort((a, b) => (degreeById.get(b.entityId) ?? 0) - (degreeById.get(a.entityId) ?? 0))[0] ?? null;
  }, [graphEntities, graphRelations, template]);

  // Clicking any node opens the read-only entity modal (matches the real app's
  // click-to-inspect behavior) instead of silently recentering the background graph.
  const [modalEntityId, setModalEntityId] = useState<string | null>(null);

  useEffect(() => {
    setModalEntityId(null);
  }, [templateId]);

  const modalEntity = useMemo(
    () => (modalEntityId ? graphEntities.find((entity) => entity.entityId === modalEntityId) ?? null : null),
    [modalEntityId, graphEntities],
  );

  const modalFacts = useMemo(() => template?.facts ?? [], [template]);

  const featuredSecret = useMemo(() => {
    if (!template) return null;
    const secretFacts = template.facts.filter((fact) => fact.kind === "dm_secret" && fact.statement);
    if (!secretFacts.length) return null;
    const preferred = (template.featuredFactIds ?? [])
      .map((factId) => secretFacts.find((fact) => fact.factId === factId))
      .find(isDefined);
    return preferred ?? secretFacts[0];
  }, [template]);

  const featuredSecretEntityTitle = useMemo(() => {
    if (!featuredSecret?.relatedEntityIds?.length) return null;
    const relatedId = featuredSecret.relatedEntityIds[0];
    return graphEntities.find((entity) => entity.entityId === relatedId)?.title ?? null;
  }, [featuredSecret, graphEntities]);

  const handleCreateCopy = async (options: { title: string; summary?: string; importMode: CampaignTemplateImportMode; openAfterCreate: boolean }) => {
    if (!template) return;
    try {
      const campaignId = await importCampaignTemplate(template.templateId, {
        title: options.title,
        summary: options.summary,
        importMode: options.importMode,
      });
      if (campaignId) {
        setImportDialogOpen(false);
        clearCampaignTemplateImportState();
        if (options.openAfterCreate) {
          await navigate({ to: `/campaigns/${campaignId}/overview` });
        }
      }
    } catch (err) {
      console.error("Import failed:", err);
    }
  };

  if (!templateLoaded || (loading && !template)) {
    return (
      <div className="campaign-template-preview-page campaign-template-preview-page--centered">
        <p className="landing-muted">{t("campaignTemplatePreview.loading")}</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="campaign-template-preview-page campaign-template-preview-page--centered">
        <section className="card campaign-template-preview-error">
          <Sparkles size={28} />
          <h1>{t("campaignTemplatePreview.notFoundTitle")}</h1>
          <p>{error || t("campaignTemplatePreview.notFoundDesc")}</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={goBack}
          >
            <ArrowLeft size={14} />
            {t("campaignTemplatePreview.backToCampaigns")}
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="campaign-template-preview-page">
      <header className="campaign-template-preview-hero">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => {
            runCampaignTemplatePreviewAction(navigate({ to: "/dm" }), "No se pudo volver a campañas.");
          }}
        >
          <ArrowLeft size={14} />
          {t("campaignTemplatePreview.backToCampaigns")}
        </button>

        <div className="campaign-template-preview-hero__body">
          <div className="campaign-template-preview-hero__eyebrow">
            <Eye size={16} />
            {t("campaignTemplatePreview.eyebrow")}
          </div>
          <h1>{template.title}</h1>
          <p>{template.pitch || template.summary || template.description}</p>
          <div className="campaign-template-preview-hero__meta">
            <span>{labelFor(template.system, SYSTEM_LABEL_KEYS, t)}</span>
            <span>{labelFor(template.difficulty, DIFFICULTY_LABEL_KEYS, t)}</span>
            <span>{t("campaignTemplatePreview.version", { version: template.version })}</span>
          </div>
          <div className="campaign-template-template-card__tags" aria-label={t("landing.campaignTemplateTagsLabel")}>
            {template.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>

        <div className="campaign-template-preview-hero__actions">
          <button type="button" className="btn btn-primary" onClick={requestCreateCopy} disabled={importing || loading}>
            <Wand2 size={16} />
            {importing ? t("campaignTemplatePreview.importing") : t("campaignTemplatePreview.createCopy")}
          </button>
        </div>
      </header>

      {graphCenterEntity && (
        <section className="card campaign-template-preview-card campaign-template-preview-graph-card">
          <div className="campaign-template-preview-section-heading">
            <h2>{t("campaignTemplatePreview.graphTitle")}</h2>
            <span>{t("campaignTemplatePreview.graphDesc")}</span>
          </div>
          <EntityRelationsTab
            entity={graphCenterEntity}
            campaignState={graphPreviewState}
            onNavigateEntity={setModalEntityId}
          />
          <p className="campaign-template-preview-graph-hint">{t("campaignTemplatePreview.graphHint")}</p>
        </section>
      )}

      {modalEntity && (
        <TemplateEntityPreviewModal
          entity={modalEntity}
          entities={graphEntities}
          relations={graphRelations}
          facts={modalFacts}
          onNavigateEntity={setModalEntityId}
          onClose={() => setModalEntityId(null)}
          onRequestCopy={() => {
            setModalEntityId(null);
            requestCreateCopy();
          }}
        />
      )}

      <section className="campaign-template-preview-graph-cta">
        <div>
          <strong>{t("campaignTemplatePreview.graphCtaTitle")}</strong>
          <p>{t("campaignTemplatePreview.graphCtaDesc")}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={requestCreateCopy} disabled={importing || loading}>
          <Wand2 size={16} />
          {importing ? t("campaignTemplatePreview.importing") : t("campaignTemplatePreview.createCopy")}
        </button>
      </section>

      {featuredSecret && (
        <SecretRevealCard secret={featuredSecret} entityTitle={featuredSecretEntityTitle} t={t} />
      )}

      <section className="campaign-template-readonly-banner" role="note">
        <Lock size={18} />
        <div>
          <strong>{t("campaignTemplatePreview.readOnlyTitle")}</strong>
          <p>{t("campaignTemplatePreview.readOnlyDesc")}</p>
        </div>
      </section>

      <section className="campaign-template-preview-stats" aria-label={t("campaignTemplatePreview.statsLabel")}>
        <article className="card">
          <Layers size={18} />
          <strong>{template.entities.filter((entity) => !isGuideEntity(entity)).length}</strong>
          <span>{t("campaignTemplatePreview.entities")}</span>
        </article>
        <article className="card">
          <GitFork size={18} />
          <strong>{template.relations.length}</strong>
          <span>{t("campaignTemplatePreview.relations")}</span>
        </article>
        <article className="card">
          <BookOpen size={18} />
          <strong>{template.sessions.length}</strong>
          <span>{t("campaignTemplatePreview.sessions")}</span>
        </article>
        <article className="card">
          <ScrollText size={18} />
          <strong>{template.facts.length}</strong>
          <span>{t("campaignTemplatePreview.facts")}</span>
        </article>
      </section>

      <div className="campaign-template-editorial-grid">
        <section className="card campaign-template-preview-card campaign-template-editorial-card">
          <div className="campaign-template-preview-section-heading">
            <h2>{t("campaignTemplatePreview.whyTitle")}</h2>
            <span>{t("campaignTemplatePreview.whyDesc")}</span>
          </div>
          <p>{template.recommendedFor}</p>
          <ul className="campaign-template-preview-check-list">
            {(template.learningGoals ?? []).map((goal) => (
              <li key={goal}>
                <CheckCircle2 size={15} />
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card campaign-template-preview-card campaign-template-editorial-card">
          <div className="campaign-template-preview-section-heading">
            <h2>{t("campaignTemplatePreview.includesTitle")}</h2>
            <span>{t("campaignTemplatePreview.includesDesc")}</span>
          </div>
          <ul className="campaign-template-preview-check-list">
            {(template.includedMaterial ?? []).map((material) => (
              <li key={material}>
                <CheckCircle2 size={15} />
                <span>{material}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {template.quickStart ? (
        <section className="card campaign-template-preview-card campaign-template-quickstart-card">
          <div className="campaign-template-preview-section-heading">
            <h2>{template.quickStart.title}</h2>
            <span>{t("campaignTemplatePreview.quickStartDesc")}</span>
          </div>
          <ol>
            {template.quickStart.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      ) : null}

      <div className="campaign-template-preview-grid">
        <section className="card campaign-template-preview-card campaign-template-preview-card--wide">
          <div className="campaign-template-preview-section-heading">
            <h2>{t("campaignTemplatePreview.entityMapTitle")}</h2>
            <span>{t("campaignTemplatePreview.entityMapDesc")}</span>
          </div>
          <div className="campaign-template-preview-entity-groups">
            {groupedEntities.map(([type, entities]) => (
              <div key={type} className="campaign-template-preview-entity-group">
                <strong>{labelFor(type, ENTITY_TYPE_LABEL_KEYS, t)}</strong>
                <span>{entities.length}</span>
              </div>
            ))}
          </div>
        </section>

        {guideEntities.length > 0 ? (
          <section className="card campaign-template-preview-card">
            <div className="campaign-template-preview-section-heading">
              <h2>{t("campaignTemplatePreview.guideTitle")}</h2>
              <span>{t("campaignTemplatePreview.guideDesc")}</span>
            </div>
            <div className="campaign-template-preview-list">
              {guideEntities.map((entity) => (
                <article key={entity.entityId}>
                  <strong>{entity.title}</strong>
                  <p>{entity.summary || entity.content || t("campaignTemplatePreview.noSummary")}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="card campaign-template-preview-card">
          <div className="campaign-template-preview-section-heading">
            <h2>{t("campaignTemplatePreview.sessionsTitle")}</h2>
            <span>{t("campaignTemplatePreview.sessionsDesc")}</span>
          </div>
          <div className="campaign-template-preview-list">
            {template.sessions.slice(0, SESSIONS_FREE_PREVIEW_COUNT).map((session) => (
              <article key={session.sessionId}>
                <strong>{session.title}</strong>
                <p>{session.prep?.summary || session.prep?.openingPrompt || t("campaignTemplatePreview.noSummary")}</p>
                <span>
                  {t("campaignTemplatePreview.sessionPrepared", {
                    goals: String(session.prep?.goals?.length ?? 0),
                    checklist: String(session.prep?.checklist?.length ?? 0),
                  })}
                </span>
              </article>
            ))}
          </div>
          {template.sessions.length > SESSIONS_FREE_PREVIEW_COUNT && (
            <div className="campaign-template-preview-gated">
              <div className="campaign-template-preview-list campaign-template-preview-gated__blur" aria-hidden="true">
                {template.sessions.slice(SESSIONS_FREE_PREVIEW_COUNT).map((session) => (
                  <article key={session.sessionId}>
                    <strong>{session.title}</strong>
                    <p>{session.prep?.summary || session.prep?.openingPrompt || t("campaignTemplatePreview.noSummary")}</p>
                  </article>
                ))}
              </div>
              <div className="campaign-template-preview-gated__overlay">
                <Lock size={18} />
                <p>
                  {t("campaignTemplatePreview.sessionsGateHint", {
                    count: String(template.sessions.length - SESSIONS_FREE_PREVIEW_COUNT),
                  })}
                </p>
                <button type="button" className="btn btn-primary btn-sm" onClick={requestCreateCopy}>
                  {t("campaignTemplatePreview.createCopy")}
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="card campaign-template-preview-card">
          <div className="campaign-template-preview-section-heading">
            <h2>{t("campaignTemplatePreview.featuredEntitiesTitle")}</h2>
            <span>{t("campaignTemplatePreview.featuredEntitiesDesc")}</span>
          </div>
          <div className="campaign-template-preview-list campaign-template-preview-list--compact">
            {featuredEntities.map((entity) => (
              <article key={entity.entityId}>
                <div className="campaign-template-preview-item-heading">
                  <strong>{entity.title}</strong>
                  <span className="campaign-template-preview-badge">{labelFor(entity.entityType, ENTITY_TYPE_LABEL_KEYS, t)}</span>
                </div>
                <p>{entity.subtitle || entity.summary || labelFor(entity.entityType, ENTITY_TYPE_LABEL_KEYS, t)}</p>
                <span>{visibilityLabel(entity.visibility, t)}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="card campaign-template-preview-card">
          <div className="campaign-template-preview-section-heading">
            <h2>{t("campaignTemplatePreview.factsTitle")}</h2>
            <span>{t("campaignTemplatePreview.factsDesc")}</span>
          </div>
          <div className="campaign-template-preview-list campaign-template-preview-list--compact">
            {featuredFacts.slice(0, FACTS_FREE_PREVIEW_COUNT).map((fact) => (
              <article key={fact.factId}>
                <div className="campaign-template-preview-item-heading">
                  <strong>{labelFor(fact.kind, FACT_KIND_LABEL_KEYS, t)}</strong>
                  <span className="campaign-template-preview-badge">{labelFor(fact.confidence, CONFIDENCE_LABEL_KEYS, t)}</span>
                </div>
                <p>{fact.statement}</p>
                <span>{visibilityLabel(fact.visibility, t)}</span>
              </article>
            ))}
          </div>
          {featuredFacts.length > FACTS_FREE_PREVIEW_COUNT && (
            <div className="campaign-template-preview-gated">
              <div
                className="campaign-template-preview-list campaign-template-preview-list--compact campaign-template-preview-gated__blur"
                aria-hidden="true"
              >
                {featuredFacts.slice(FACTS_FREE_PREVIEW_COUNT).map((fact) => (
                  <article key={fact.factId}>
                    <strong>{labelFor(fact.kind, FACT_KIND_LABEL_KEYS, t)}</strong>
                    <p>{fact.statement}</p>
                  </article>
                ))}
              </div>
              <div className="campaign-template-preview-gated__overlay">
                <Lock size={18} />
                <p>
                  {t("campaignTemplatePreview.factsGateHint", {
                    count: String(featuredFacts.length - FACTS_FREE_PREVIEW_COUNT),
                  })}
                </p>
                <button type="button" className="btn btn-primary btn-sm" onClick={requestCreateCopy}>
                  {t("campaignTemplatePreview.createCopy")}
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="card campaign-template-preview-card">
          <div className="campaign-template-preview-section-heading">
            <h2>{t("campaignTemplatePreview.relationsTitle")}</h2>
            <span>{t("campaignTemplatePreview.relationsDesc")}</span>
          </div>
          <div className="campaign-template-preview-list campaign-template-preview-list--compact">
            {featuredRelations.map((relation) => {
              const source = entityById.get(relation.sourceEntityId)?.title;
              const target = entityById.get(relation.targetEntityId)?.title;
              return (
                <article key={relation.relationId}>
                  <strong>{relation.description || t("campaignTemplatePreview.relationFallback", { source: source ?? relation.sourceEntityId, target: target ?? relation.targetEntityId })}</strong>
                  <p>{source && target ? t("campaignTemplatePreview.relationBetween", { source, target }) : labelFor(relation.relationType, RELATION_LABEL_KEYS, t)}</p>
                  <span>{labelFor(relation.relationType, RELATION_LABEL_KEYS, t)} · {visibilityLabel(relation.visibility, t)}</span>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <section className="campaign-template-preview-bottom-cta card">
        <div>
          <h2>{t("campaignTemplatePreview.bottomCtaTitle")}</h2>
          <p>{t("campaignTemplatePreview.bottomCtaDesc")}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={requestCreateCopy} disabled={importing || loading}>
          <Wand2 size={16} />
          {importing ? t("campaignTemplatePreview.importing") : t("campaignTemplatePreview.createCopy")}
        </button>
      </section>

      <CampaignTemplateImportDialog
        template={importDialogOpen ? template : null}
        campaigns={campaigns}
        importing={importing}
        importProgress={campaignTemplateImportState}
        error={importError}
        onClose={() => { if (!importing) { setImportDialogOpen(false); clearCampaignTemplateImportState(); } }}
        onOpenExisting={(campaignId) => {
          setImportDialogOpen(false);
          clearCampaignTemplateImportState();
          runCampaignTemplatePreviewAction(
            navigate({ to: `/campaigns/${campaignId}/overview` }),
            "No se pudo abrir la campaña existente.",
          );
        }}
        onConfirm={(options) => handleCreateCopy(options)}
      />
    </div>
  );
}
