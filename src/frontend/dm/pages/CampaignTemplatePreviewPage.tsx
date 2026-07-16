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
import { CampaignTemplateImportDialog, type CampaignTemplateImportMode } from "../../shared/components/CampaignTemplateImportDialog.js";

function runPremadePreviewAction(operation: Promise<unknown>, errorMessage: string): void {
  void operation.catch((error: unknown) => {
    console.error(errorMessage, error);
  });
}

type TranslateFn = (key: string, vars?: Record<string, string>) => string;

const ENTITY_TYPE_LABEL_KEYS: Record<string, string> = {
  player_character: "campaignTemplatePreview.entityType.playerCharacter",
  npc: "campaignTemplatePreview.entityType.npc",
  location: "campaignTemplatePreview.entityType.location",
  faction: "campaignTemplatePreview.entityType.faction",
  quest: "campaignTemplatePreview.entityType.quest",
  clue: "campaignTemplatePreview.entityType.clue",
  secret: "campaignTemplatePreview.entityType.secret",
  item: "campaignTemplatePreview.entityType.item",
  creature: "campaignTemplatePreview.entityType.creature",
  encounter: "campaignTemplatePreview.entityType.encounter",
  scene: "campaignTemplatePreview.entityType.scene",
  front: "campaignTemplatePreview.entityType.front",
  clock: "campaignTemplatePreview.entityType.clock",
  decision: "campaignTemplatePreview.entityType.decision",
  consequence: "campaignTemplatePreview.entityType.consequence",
  rumor: "campaignTemplatePreview.entityType.rumor",
  rule_reference: "campaignTemplatePreview.entityType.ruleReference",
  handout: "campaignTemplatePreview.entityType.handout",
  note: "campaignTemplatePreview.entityType.note",
};

const RELATION_LABEL_KEYS: Record<string, string> = {
  ally_of: "campaignTemplatePreview.relationType.allyOf",
  blocks: "campaignTemplatePreview.relationType.blocks",
  causes: "campaignTemplatePreview.relationType.causes",
  contains: "campaignTemplatePreview.relationType.contains",
  depends_on: "campaignTemplatePreview.relationType.dependsOn",
  enemy_of: "campaignTemplatePreview.relationType.enemyOf",
  hides: "campaignTemplatePreview.relationType.hides",
  knows: "campaignTemplatePreview.relationType.knows",
  leader_of: "campaignTemplatePreview.relationType.leaderOf",
  located_in: "campaignTemplatePreview.relationType.locatedIn",
  points_to: "campaignTemplatePreview.relationType.pointsTo",
  protects: "campaignTemplatePreview.relationType.protects",
  reveals: "campaignTemplatePreview.relationType.reveals",
  threatens: "campaignTemplatePreview.relationType.threatens",
  unlocks: "campaignTemplatePreview.relationType.unlocks",
};

const FACT_KIND_LABEL_KEYS: Record<string, string> = {
  canon: "campaignTemplatePreview.factKind.canon",
  dm_secret: "campaignTemplatePreview.factKind.dmSecret",
  rumor: "campaignTemplatePreview.factKind.rumor",
  lie: "campaignTemplatePreview.factKind.lie",
  player_theory: "campaignTemplatePreview.factKind.playerTheory",
  mistake: "campaignTemplatePreview.factKind.mistake",
  retcon: "campaignTemplatePreview.factKind.retcon",
  unknown: "campaignTemplatePreview.factKind.unknown",
};

const CONFIDENCE_LABEL_KEYS: Record<string, string> = {
  unconfirmed: "campaignTemplatePreview.confidence.unconfirmed",
  suspected: "campaignTemplatePreview.confidence.suspected",
  likely: "campaignTemplatePreview.confidence.likely",
  confirmed: "campaignTemplatePreview.confidence.confirmed",
  false: "campaignTemplatePreview.confidence.false",
};

const SYSTEM_LABEL_KEYS: Record<string, string> = {
  dnd_5e: "campaignTemplatePreview.system.dndSrd521",
  pathfinder_2e: "campaignTemplatePreview.system.custom",
  shadowdark: "campaignTemplatePreview.system.custom",
  custom: "campaignTemplatePreview.system.custom",
};

const DIFFICULTY_LABEL_KEYS: Record<string, string> = {
  starter: "campaignTemplatePreview.difficulty.starter",
  medium: "campaignTemplatePreview.difficulty.medium",
  advanced: "campaignTemplatePreview.difficulty.advanced",
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
      return t("campaignTemplatePreview.visibilityPublic");
    case "party":
      return t("campaignTemplatePreview.visibilityParty");
    case "dm_only":
      return t("campaignTemplatePreview.visibilityDmOnly");
    default:
      return tokenFallback(kind);
  }
}

function isGuideEntity(entity: { entityType: string; metadata?: Record<string, unknown> }): boolean {
  return entity.entityType === "note" || entity.metadata?.previewRole === "guide";
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
  const [authChecked, setAuthChecked] = useState(false);
  const importing = campaignTemplateImportState.status === "running";
  const importError = campaignTemplateImportState.error ? t(campaignTemplateImportState.error) : null;

  useEffect(() => {
    const init = async () => {
      const session = await fetchSession().catch(() => null);
      if (!session?.sessionValid) {
        await navigate({ to: "/auth/login" });
        return;
      }
      await Promise.all([fetchCampaignTemplate(templateId), fetchCampaigns().catch(() => {})]);
      setAuthChecked(true);
    };

    runPremadePreviewAction(init(), "No se pudo inicializar la vista previa de aventura preparada.");
  }, [fetchCampaigns, fetchCampaignTemplate, navigate, templateId]);

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

  if (!authChecked || (loading && !template)) {
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
            onClick={() => {
              runPremadePreviewAction(navigate({ to: "/dm" }), "No se pudo volver a campañas.");
            }}
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
            runPremadePreviewAction(navigate({ to: "/dm" }), "No se pudo volver a campañas.");
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
          <button type="button" className="btn btn-primary" onClick={() => setImportDialogOpen(true)} disabled={importing || loading}>
            <Wand2 size={16} />
            {importing ? t("campaignTemplatePreview.importing") : t("campaignTemplatePreview.createCopy")}
          </button>
        </div>
      </header>

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
            {template.sessions.map((session) => (
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
            {featuredFacts.map((fact) => (
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
        <button type="button" className="btn btn-primary" onClick={() => setImportDialogOpen(true)} disabled={importing || loading}>
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
