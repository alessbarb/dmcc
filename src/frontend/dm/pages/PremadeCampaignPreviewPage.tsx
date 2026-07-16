import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Eye,
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
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { PremadeImportDialog, type PremadeImportMode } from "../../shared/components/PremadeImportDialog.js";

function runPremadePreviewAction(operation: Promise<unknown>, errorMessage: string): void {
  void operation.catch((error: unknown) => {
    console.error(errorMessage, error);
  });
}

type TranslateFn = (key: string, vars?: Record<string, string>) => string;

const ENTITY_TYPE_LABEL_KEYS: Record<string, string> = {
  player_character: "premadePreview.entityType.playerCharacter",
  npc: "premadePreview.entityType.npc",
  location: "premadePreview.entityType.location",
  faction: "premadePreview.entityType.faction",
  quest: "premadePreview.entityType.quest",
  clue: "premadePreview.entityType.clue",
  secret: "premadePreview.entityType.secret",
  item: "premadePreview.entityType.item",
  creature: "premadePreview.entityType.creature",
  encounter: "premadePreview.entityType.encounter",
  scene: "premadePreview.entityType.scene",
  front: "premadePreview.entityType.front",
  clock: "premadePreview.entityType.clock",
  decision: "premadePreview.entityType.decision",
  consequence: "premadePreview.entityType.consequence",
  rumor: "premadePreview.entityType.rumor",
  rule_reference: "premadePreview.entityType.ruleReference",
  handout: "premadePreview.entityType.handout",
  note: "premadePreview.entityType.note",
};

const RELATION_LABEL_KEYS: Record<string, string> = {
  ally_of: "premadePreview.relationType.allyOf",
  blocks: "premadePreview.relationType.blocks",
  causes: "premadePreview.relationType.causes",
  contains: "premadePreview.relationType.contains",
  depends_on: "premadePreview.relationType.dependsOn",
  enemy_of: "premadePreview.relationType.enemyOf",
  hides: "premadePreview.relationType.hides",
  knows: "premadePreview.relationType.knows",
  leader_of: "premadePreview.relationType.leaderOf",
  located_in: "premadePreview.relationType.locatedIn",
  points_to: "premadePreview.relationType.pointsTo",
  protects: "premadePreview.relationType.protects",
  reveals: "premadePreview.relationType.reveals",
  threatens: "premadePreview.relationType.threatens",
  unlocks: "premadePreview.relationType.unlocks",
};

const FACT_KIND_LABEL_KEYS: Record<string, string> = {
  canon: "premadePreview.factKind.canon",
  dm_secret: "premadePreview.factKind.dmSecret",
  rumor: "premadePreview.factKind.rumor",
  lie: "premadePreview.factKind.lie",
  player_theory: "premadePreview.factKind.playerTheory",
  mistake: "premadePreview.factKind.mistake",
  retcon: "premadePreview.factKind.retcon",
  unknown: "premadePreview.factKind.unknown",
};

const CONFIDENCE_LABEL_KEYS: Record<string, string> = {
  unconfirmed: "premadePreview.confidence.unconfirmed",
  suspected: "premadePreview.confidence.suspected",
  likely: "premadePreview.confidence.likely",
  confirmed: "premadePreview.confidence.confirmed",
  false: "premadePreview.confidence.false",
};

const SYSTEM_LABEL_KEYS: Record<string, string> = {
  dnd_5e: "premadePreview.system.dndSrd521",
  pathfinder_2e: "premadePreview.system.custom",
  shadowdark: "premadePreview.system.custom",
  custom: "premadePreview.system.custom",
};

const DIFFICULTY_LABEL_KEYS: Record<string, string> = {
  starter: "premadePreview.difficulty.starter",
  medium: "premadePreview.difficulty.medium",
  advanced: "premadePreview.difficulty.advanced",
};

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function tokenFallback(value: string): string {
  return value
    .split(/[_.-]+/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function labelFor(value: string | undefined, labels: Record<string, string>, t: TranslateFn): string {
  if (!value) return "";
  const key = labels[value];
  return key ? t(key) : tokenFallback(value);
}

function visibilityLabel(visibility: VisibilityRule | undefined, t: TranslateFn): string {
  const kind = visibility?.kind ?? "dm_only";
  switch (kind) {
    case "public":
      return t("premadePreview.visibilityPublic");
    case "party":
      return t("premadePreview.visibilityParty");
    case "dm_only":
      return t("premadePreview.visibilityDmOnly");
    default:
      return tokenFallback(kind);
  }
}

function isGuideEntity(entity: { entityType: string; metadata?: Record<string, unknown> }): boolean {
  return entity.entityType === "note" || entity.metadata?.previewRole === "guide";
}

export function PremadeCampaignPreviewPage() {
  const { templateId } = useParams({ from: "/premades/$templateId" });
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    campaigns,
    activePremadeTemplate,
    loading,
    error,
    fetchCampaigns,
    fetchPremadeCampaignTemplate,
    importCampaignTemplate,
    premadeImportState,
    clearPremadeImportState,
  } = useCampaignStore();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const importing = premadeImportState.status === "running";
  const importError = premadeImportState.error ? t(premadeImportState.error) : null;

  useEffect(() => {
    const init = async () => {
      const session = await fetchSession().catch(() => null);
      if (!session?.sessionValid) {
        await navigate({ to: "/auth/login" });
        return;
      }
      await Promise.all([fetchPremadeCampaignTemplate(templateId), fetchCampaigns().catch(() => {})]);
      setAuthChecked(true);
    };

    runPremadePreviewAction(init(), "No se pudo inicializar la vista previa de aventura preparada.");
  }, [fetchCampaigns, fetchPremadeCampaignTemplate, navigate, templateId]);

  const template = activePremadeTemplate?.templateId === templateId ? activePremadeTemplate : null;

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

  const handleCreateCopy = async (options: { title: string; summary?: string; importMode: PremadeImportMode; openAfterCreate: boolean }) => {
    if (!template) return;
    try {
      const campaignId = await importCampaignTemplate(template.templateId, {
        title: options.title,
        summary: options.summary,
        importMode: options.importMode,
      });
      if (campaignId) {
        setImportDialogOpen(false);
        clearPremadeImportState();
        if (options.openAfterCreate) {
          await navigate({ to: `/campaigns/${campaignId}/overview` });
        }
      }
    } catch (err) {
      console.error("Import failed:", err);
    }
  };

  if (!authChecked || (loading && !template)) {
    return (
      <div className="premade-preview-page premade-preview-page--centered">
        <p className="landing-muted">{t("premadePreview.loading")}</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="premade-preview-page premade-preview-page--centered">
        <section className="card premade-preview-error">
          <Sparkles size={28} />
          <h1>{t("premadePreview.notFoundTitle")}</h1>
          <p>{error || t("premadePreview.notFoundDesc")}</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              runPremadePreviewAction(navigate({ to: "/dm" }), "No se pudo volver a campañas.");
            }}
          >
            <ArrowLeft size={14} />
            {t("premadePreview.backToCampaigns")}
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="premade-preview-page">
      <header className="premade-preview-hero">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => {
            runPremadePreviewAction(navigate({ to: "/dm" }), "No se pudo volver a campañas.");
          }}
        >
          <ArrowLeft size={14} />
          {t("premadePreview.backToCampaigns")}
        </button>

        <div className="premade-preview-hero__body">
          <div className="premade-preview-hero__eyebrow">
            <Eye size={16} />
            {t("premadePreview.eyebrow")}
          </div>
          <h1>{template.title}</h1>
          <p>{template.pitch || template.summary || template.description}</p>
          <div className="premade-preview-hero__meta">
            <span>{labelFor(template.system, SYSTEM_LABEL_KEYS, t)}</span>
            <span>{labelFor(template.difficulty, DIFFICULTY_LABEL_KEYS, t)}</span>
            <span>{t("premadePreview.version", { version: template.version })}</span>
          </div>
          <div className="premade-template-card__tags" aria-label={t("landing.premadeTagsLabel")}>
            {template.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>

        <div className="premade-preview-hero__actions">
          <button type="button" className="btn btn-primary" onClick={() => setImportDialogOpen(true)} disabled={importing || loading}>
            <Wand2 size={16} />
            {importing ? t("premadePreview.importing") : t("premadePreview.createCopy")}
          </button>
        </div>
      </header>

      <section className="premade-readonly-banner" role="note">
        <Lock size={18} />
        <div>
          <strong>{t("premadePreview.readOnlyTitle")}</strong>
          <p>{t("premadePreview.readOnlyDesc")}</p>
        </div>
      </section>

      <section className="premade-preview-stats" aria-label={t("premadePreview.statsLabel")}>
        <article className="card">
          <Layers size={18} />
          <strong>{template.entities.filter((entity) => !isGuideEntity(entity)).length}</strong>
          <span>{t("premadePreview.entities")}</span>
        </article>
        <article className="card">
          <GitFork size={18} />
          <strong>{template.relations.length}</strong>
          <span>{t("premadePreview.relations")}</span>
        </article>
        <article className="card">
          <BookOpen size={18} />
          <strong>{template.sessions.length}</strong>
          <span>{t("premadePreview.sessions")}</span>
        </article>
        <article className="card">
          <ScrollText size={18} />
          <strong>{template.facts.length}</strong>
          <span>{t("premadePreview.facts")}</span>
        </article>
      </section>

      <div className="premade-editorial-grid">
        <section className="card premade-preview-card premade-editorial-card">
          <div className="premade-preview-section-heading">
            <h2>{t("premadePreview.whyTitle")}</h2>
            <span>{t("premadePreview.whyDesc")}</span>
          </div>
          <p>{template.recommendedFor}</p>
          <ul className="premade-preview-check-list">
            {(template.learningGoals ?? []).map((goal) => (
              <li key={goal}>
                <CheckCircle2 size={15} />
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card premade-preview-card premade-editorial-card">
          <div className="premade-preview-section-heading">
            <h2>{t("premadePreview.includesTitle")}</h2>
            <span>{t("premadePreview.includesDesc")}</span>
          </div>
          <ul className="premade-preview-check-list">
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
        <section className="card premade-preview-card premade-quickstart-card">
          <div className="premade-preview-section-heading">
            <h2>{template.quickStart.title}</h2>
            <span>{t("premadePreview.quickStartDesc")}</span>
          </div>
          <ol>
            {template.quickStart.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      ) : null}

      <div className="premade-preview-grid">
        <section className="card premade-preview-card premade-preview-card--wide">
          <div className="premade-preview-section-heading">
            <h2>{t("premadePreview.entityMapTitle")}</h2>
            <span>{t("premadePreview.entityMapDesc")}</span>
          </div>
          <div className="premade-preview-entity-groups">
            {groupedEntities.map(([type, entities]) => (
              <div key={type} className="premade-preview-entity-group">
                <strong>{labelFor(type, ENTITY_TYPE_LABEL_KEYS, t)}</strong>
                <span>{entities.length}</span>
              </div>
            ))}
          </div>
        </section>

        {guideEntities.length > 0 ? (
          <section className="card premade-preview-card">
            <div className="premade-preview-section-heading">
              <h2>{t("premadePreview.guideTitle")}</h2>
              <span>{t("premadePreview.guideDesc")}</span>
            </div>
            <div className="premade-preview-list">
              {guideEntities.map((entity) => (
                <article key={entity.entityId}>
                  <strong>{entity.title}</strong>
                  <p>{entity.summary || entity.content || t("premadePreview.noSummary")}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="card premade-preview-card">
          <div className="premade-preview-section-heading">
            <h2>{t("premadePreview.sessionsTitle")}</h2>
            <span>{t("premadePreview.sessionsDesc")}</span>
          </div>
          <div className="premade-preview-list">
            {template.sessions.map((session) => (
              <article key={session.sessionId}>
                <strong>{session.title}</strong>
                <p>{session.prep?.summary || session.prep?.openingPrompt || t("premadePreview.noSummary")}</p>
                <span>
                  {t("premadePreview.sessionPrepared", {
                    goals: String(session.prep?.goals?.length ?? 0),
                    checklist: String(session.prep?.checklist?.length ?? 0),
                  })}
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className="card premade-preview-card">
          <div className="premade-preview-section-heading">
            <h2>{t("premadePreview.featuredEntitiesTitle")}</h2>
            <span>{t("premadePreview.featuredEntitiesDesc")}</span>
          </div>
          <div className="premade-preview-list premade-preview-list--compact">
            {featuredEntities.map((entity) => (
              <article key={entity.entityId}>
                <div className="premade-preview-item-heading">
                  <strong>{entity.title}</strong>
                  <span className="premade-preview-badge">{labelFor(entity.entityType, ENTITY_TYPE_LABEL_KEYS, t)}</span>
                </div>
                <p>{entity.subtitle || entity.summary || labelFor(entity.entityType, ENTITY_TYPE_LABEL_KEYS, t)}</p>
                <span>{visibilityLabel(entity.visibility, t)}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="card premade-preview-card">
          <div className="premade-preview-section-heading">
            <h2>{t("premadePreview.factsTitle")}</h2>
            <span>{t("premadePreview.factsDesc")}</span>
          </div>
          <div className="premade-preview-list premade-preview-list--compact">
            {featuredFacts.map((fact) => (
              <article key={fact.factId}>
                <div className="premade-preview-item-heading">
                  <strong>{labelFor(fact.kind, FACT_KIND_LABEL_KEYS, t)}</strong>
                  <span className="premade-preview-badge">{labelFor(fact.confidence, CONFIDENCE_LABEL_KEYS, t)}</span>
                </div>
                <p>{fact.statement}</p>
                <span>{visibilityLabel(fact.visibility, t)}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="card premade-preview-card">
          <div className="premade-preview-section-heading">
            <h2>{t("premadePreview.relationsTitle")}</h2>
            <span>{t("premadePreview.relationsDesc")}</span>
          </div>
          <div className="premade-preview-list premade-preview-list--compact">
            {featuredRelations.map((relation) => {
              const source = entityById.get(relation.sourceEntityId)?.title;
              const target = entityById.get(relation.targetEntityId)?.title;
              return (
                <article key={relation.relationId}>
                  <strong>{relation.description || t("premadePreview.relationFallback", { source: source ?? relation.sourceEntityId, target: target ?? relation.targetEntityId })}</strong>
                  <p>{source && target ? t("premadePreview.relationBetween", { source, target }) : labelFor(relation.relationType, RELATION_LABEL_KEYS, t)}</p>
                  <span>{labelFor(relation.relationType, RELATION_LABEL_KEYS, t)} · {visibilityLabel(relation.visibility, t)}</span>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <section className="premade-preview-bottom-cta card">
        <div>
          <h2>{t("premadePreview.bottomCtaTitle")}</h2>
          <p>{t("premadePreview.bottomCtaDesc")}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setImportDialogOpen(true)} disabled={importing || loading}>
          <Wand2 size={16} />
          {importing ? t("premadePreview.importing") : t("premadePreview.createCopy")}
        </button>
      </section>

      <PremadeImportDialog
        template={importDialogOpen ? template : null}
        campaigns={campaigns}
        importing={importing}
        importProgress={premadeImportState}
        error={importError}
        onClose={() => { if (!importing) { setImportDialogOpen(false); clearPremadeImportState(); } }}
        onOpenExisting={(campaignId) => {
          setImportDialogOpen(false);
          clearPremadeImportState();
          runPremadePreviewAction(
            navigate({ to: `/campaigns/${campaignId}/overview` }),
            "No se pudo abrir la campaña existente.",
          );
        }}
        onConfirm={(options) => handleCreateCopy(options)}
      />
    </div>
  );
}
