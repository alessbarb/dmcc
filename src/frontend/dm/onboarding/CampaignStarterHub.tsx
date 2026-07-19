import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Eye,
  Flag,
  HelpCircle,
  MapPin,
  Network,
  Play,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useToast } from "../../shared/hooks/useToast.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import "./campaign-starter-hub.css";
import {
  computeStarterProgress,
  type StarterProgressCampaignState,
  type StarterStepId,
  type StarterStepProgress,
} from "./starterProgress.js";
import {
  isStarterHubCompact,
  isStarterHubHidden,
  readGuidedStartPreferences,
  setGuidedHelpLevel,
  setStarterHubCompact,
  setStarterHubHidden,
  type GuidedHelpLevel,
} from "./guidedStartStorage.js";

type EntityTemplateType = "location" | "npc" | "front" | "quest" | "clue" | "secret" | "faction" | "consequence" | "scene" | "rumor";

interface CampaignStarterHubProps {
  campaignId: string;
  campaignState: StarterProgressCampaignState;
  setCurrentPage: (page: string) => void;
}

interface GuidedEntityTemplateDetail {
  entityType: EntityTemplateType;
  title?: string;
  subtitle?: string;
  summary?: string;
  content?: string;
  importance?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}

function dispatchEntityTemplate(detail: GuidedEntityTemplateDetail): void {
  window.dispatchEvent(new CustomEvent("dmcc:open-entity-template", { detail }));
}

function iconForStep(stepId: StarterStepId): React.ReactNode {
  switch (stepId) {
    case "premise": return <BookOpen size={16} />;
    case "place": return <MapPin size={16} />;
    case "cast": return <Users size={16} />;
    case "tension": return <Zap size={16} />;
    case "session": return <Play size={16} />;
    case "relations": return <Network size={16} />;
    case "visibility": return <Eye size={16} />;
  }
}

function helpLevelLabelKey(level: GuidedHelpLevel): string {
  return `guidedStart.helpLevels.${level}`;
}

function HelpLevelSelect({ value, onChange }: { value: GuidedHelpLevel; onChange: (value: GuidedHelpLevel) => void }) {
  const { t } = useTranslation();
  return (
    <div className="guided-start__level">
      <label>
        <span>{t("guidedStart.helpLevelLabel")}</span>
        <select
          className="form-select"
          value={value}
          onChange={(event) => {
            const value = event.target.value;
            if (value === "guided" || value === "normal" || value === "minimal") {
              onChange(value);
            }
          }}
        >
          <option value="guided">{t(helpLevelLabelKey("guided"))}</option>
          <option value="normal">{t(helpLevelLabelKey("normal"))}</option>
          <option value="minimal">{t(helpLevelLabelKey("minimal"))}</option>
        </select>
      </label>
      <small>{t(`guidedStart.helpLevelDescriptions.${value}`)}</small>
    </div>
  );
}

function StarterStepRow({ step, onAction }: { step: StarterStepProgress; onAction: (stepId: StarterStepId) => void }) {
  const { t } = useTranslation();
  return (
    <div className={`guided-start-step ${step.completed ? "guided-start-step--done" : ""}`}>
      <div className="guided-start-step__status" aria-hidden="true">
        {step.completed ? <CheckCircle2 size={16} /> : iconForStep(step.id)}
      </div>
      <div className="guided-start-step__copy">
        <strong>{t(`guidedStart.steps.${step.id}.title`)}</strong>
        <span>{t(`guidedStart.steps.${step.id}.description`)}</span>
      </div>
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => onAction(step.id)}>
        {t(`guidedStart.steps.${step.id}.action`)}
      </button>
    </div>
  );
}

function RecipeCard({
  icon,
  title,
  description,
  cta,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="guided-start-recipe" onClick={onClick}>
      <span className="guided-start-recipe__icon" aria-hidden="true">{icon}</span>
      <span className="guided-start-recipe__copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </span>
      <span className="guided-start-recipe__cta">
        {cta} <ChevronRight size={14} />
      </span>
    </button>
  );
}

function GuidanceModal({
  campaignState,
  onClose,
  onNavigate,
  onOpenRelation,
}: {
  campaignState: StarterProgressCampaignState;
  onClose: () => void;
  onNavigate: (page: string) => void;
  onOpenRelation: () => void;
}) {
  const store = useCampaignStore();
  const { addToast } = useToast();
  const { t } = useTranslation();
  const [busyRecipe, setBusyRecipe] = useState<string | null>(null);

  const createFirstSessionScaffold = async () => {
    setBusyRecipe("session");
    try {
      const nextNumber = (campaignState?.sessions?.length ?? 0) + 1;
      const title = t("guidedStart.recipes.session.defaultTitle", { number: nextNumber });
      await store.createPreparedSession(title, {
        state: "draft",
        summary: t("guidedStart.recipes.session.summary"),
        goals: [
          t("guidedStart.recipes.session.goal1"),
          t("guidedStart.recipes.session.goal2"),
          t("guidedStart.recipes.session.goal3"),
        ],
        sceneIds: [],
        involvedEntityIds: [],
        availableClueIds: [],
        secretsAtRiskIds: [],
        expectedConsequenceIds: [],
        checklist: [
          { id: "opening", label: t("guidedStart.recipes.session.checklistOpening"), done: false },
          { id: "clue", label: t("guidedStart.recipes.session.checklistClue"), done: false },
          { id: "decision", label: t("guidedStart.recipes.session.checklistDecision"), done: false },
          { id: "consequence", label: t("guidedStart.recipes.session.checklistConsequence"), done: false },
        ],
        notes: t("guidedStart.recipes.session.notes"),
      });
      addToast(t("guidedStart.toasts.sessionScaffoldCreated"), "success");
      onClose();
      onNavigate("sessions");
    } catch (err: unknown) {
      addToast(t("guidedStart.toasts.recipeError", { error: err instanceof Error ? err.message : String(err) }), "error");
    } finally {
      setBusyRecipe(null);
    }
  };

  const openTemplate = (detail: GuidedEntityTemplateDetail) => {
    dispatchEntityTemplate(detail);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content guided-start-modal" role="dialog" aria-modal="true" aria-labelledby="guided-start-modal-title">
        <div className="modal-header">
          <div>
            <span className="guided-start__eyebrow">{t("guidedStart.helpModal.eyebrow")}</span>
            <h2 id="guided-start-modal-title" className="guided-start__modal-title">{t("guidedStart.helpModal.title")}</h2>
          </div>
          <button type="button" className="btn btn-icon btn-secondary" onClick={onClose} aria-label={t("common.close")}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body guided-start-modal__body">
          <p className="guided-start-modal__intro">{t("guidedStart.helpModal.description")}</p>
          <div className="guided-start-recipes">
            <RecipeCard
              icon={<MapPin size={18} />}
              title={t("guidedStart.recipes.place.title")}
              description={t("guidedStart.recipes.place.description")}
              cta={t("guidedStart.recipes.openTemplate")}
              onClick={() => openTemplate({
                entityType: "location",
                content: t("guidedStart.templates.location.content"),
                metadata: { locationType: "settlement", atmosphere: "" },
              })}
            />
            <RecipeCard
              icon={<Users size={18} />}
              title={t("guidedStart.recipes.npc.title")}
              description={t("guidedStart.recipes.npc.description")}
              cta={t("guidedStart.recipes.openTemplate")}
              onClick={() => openTemplate({
                entityType: "npc",
                content: t("guidedStart.templates.npc.content"),
                metadata: { role: "", attitudeToParty: "neutral", goal: "" },
              })}
            />
            <RecipeCard
              icon={<Zap size={18} />}
              title={t("guidedStart.recipes.threat.title")}
              description={t("guidedStart.recipes.threat.description")}
              cta={t("guidedStart.recipes.openTemplate")}
              onClick={() => openTemplate({
                entityType: "front",
                importance: "high",
                status: "active",
                content: t("guidedStart.templates.threat.content"),
                metadata: { stakes: "", countdown: "" },
              })}
            />
            <RecipeCard
              icon={<Flag size={18} />}
              title={t("guidedStart.recipes.quest.title")}
              description={t("guidedStart.recipes.quest.description")}
              cta={t("guidedStart.recipes.openTemplate")}
              onClick={() => openTemplate({
                entityType: "quest",
                importance: "high",
                status: "active",
                content: t("guidedStart.templates.quest.content"),
                metadata: { priority: "main", rewardPromised: "" },
              })}
            />
            <RecipeCard
              icon={<Play size={18} />}
              title={t("guidedStart.recipes.session.title")}
              description={t("guidedStart.recipes.session.description")}
              cta={busyRecipe === "session" ? t("common.saving") : t("guidedStart.recipes.createScaffold")}
              onClick={() => void createFirstSessionScaffold()}
            />
            <RecipeCard
              icon={<Network size={18} />}
              title={t("guidedStart.recipes.relations.title")}
              description={t("guidedStart.recipes.relations.description")}
              cta={t("guidedStart.recipes.openRelation")}
              onClick={() => {
                onClose();
                onOpenRelation();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CampaignPremiseModal({
  campaignId,
  campaign,
  onClose,
}: {
  campaignId: string;
  campaign?: { summary?: string; description?: string } | null;
  onClose: () => void;
}) {
  const store = useCampaignStore();
  const { addToast } = useToast();
  const { t } = useTranslation();
  const [summary, setSummary] = useState(campaign?.summary ?? campaign?.description ?? "");
  const [saving, setSaving] = useState(false);

  const savePremise = async () => {
    setSaving(true);
    try {
      await store.updateCampaign(campaignId, { summary: summary.trim() });
      addToast(t("guidedStart.toasts.premiseSaved"), "success");
      onClose();
    } catch (err: unknown) {
      addToast(t("guidedStart.toasts.premiseError", { error: err instanceof Error ? err.message : String(err) }), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content guided-start-premise-modal" role="dialog" aria-modal="true" aria-labelledby="guided-start-premise-title">
        <div className="modal-header">
          <div>
            <span className="guided-start__eyebrow">{t("guidedStart.premiseModal.eyebrow")}</span>
            <h2 id="guided-start-premise-title" className="guided-start__modal-title">{t("guidedStart.premiseModal.title")}</h2>
          </div>
          <button type="button" className="btn btn-icon btn-secondary" onClick={onClose} aria-label={t("common.close")} disabled={saving}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body guided-start-premise-modal__body">
          <p className="guided-start-modal__intro">{t("guidedStart.premiseModal.description")}</p>
          <label className="form-label" htmlFor="guided-start-premise-summary">{t("guidedStart.premiseModal.label")}</label>
          <textarea
            id="guided-start-premise-summary"
            className="form-textarea"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder={t("guidedStart.premiseModal.placeholder")}
            rows={5}
          />
          <p className="guided-start-premise-modal__hint">{t("guidedStart.premiseModal.emptyHint")}</p>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>{t("common.cancel")}</button>
          <button type="button" className="btn btn-primary" onClick={() => void savePremise()} disabled={saving}>
            {saving ? t("common.saving") : t("guidedStart.premiseModal.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CampaignStarterHub({ campaignId, campaignState, setCurrentPage }: CampaignStarterHubProps) {
  const store = useCampaignStore();
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState(() => readGuidedStartPreferences());
  const [helpOpen, setHelpOpen] = useState(false);
  const [premiseOpen, setPremiseOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const sync = () => setPrefs(readGuidedStartPreferences());
    window.addEventListener("dmcc:guided-start-preferences-changed", sync);
    return () => window.removeEventListener("dmcc:guided-start-preferences-changed", sync);
  }, []);

  const progress = useMemo(() => computeStarterProgress(campaignState), [campaignState]);
  const hidden = isStarterHubHidden(campaignId) || prefs.helpLevel === "minimal";
  const compact = !showAll && (prefs.helpLevel === "normal" || isStarterHubCompact(campaignId) || progress.isReadyForFirstSession);
  const visibleSteps = showAll || prefs.helpLevel === "guided"
    ? progress.steps
    : progress.steps.filter((step) => !step.completed).slice(0, 3);
  const recommended = progress.recommendedStep;

  const openRelation = () => {
    setCurrentPage("graph");
    window.setTimeout(() => store.setIsRelationModalOpen(true), 100);
  };

  const runStepAction = (stepId: StarterStepId) => {
    switch (stepId) {
      case "premise":
        setPremiseOpen(true);
        break;
      case "place":
        dispatchEntityTemplate({ entityType: "location", content: t("guidedStart.templates.location.content"), metadata: { locationType: "settlement", atmosphere: "" } });
        break;
      case "cast":
        dispatchEntityTemplate({ entityType: "npc", content: t("guidedStart.templates.npc.content"), metadata: { role: "", attitudeToParty: "neutral", goal: "" } });
        break;
      case "tension":
        dispatchEntityTemplate({ entityType: "front", importance: "high", status: "active", content: t("guidedStart.templates.threat.content"), metadata: { stakes: "", countdown: "" } });
        break;
      case "session":
        setCurrentPage("sessions");
        break;
      case "relations":
        openRelation();
        break;
      case "visibility":
        setCurrentPage("knowledge");
        break;
    }
  };

  const changeHelpLevel = (level: GuidedHelpLevel) => {
    setGuidedHelpLevel(level);
    setShowAll(false);
    setPrefs(readGuidedStartPreferences());
  };

  if (hidden) {
    return (
      <div className="guided-start-reopen">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => {
            setStarterHubHidden(campaignId, false);
            if (prefs.helpLevel === "minimal") setGuidedHelpLevel("normal");
            setPrefs(readGuidedStartPreferences());
          }}
        >
          <HelpCircle size={14} /> {t("guidedStart.showAgain")}
        </button>
      </div>
    );
  }

  if (compact) {
    return (
      <section className="guided-start guided-start--compact" aria-labelledby="guided-start-title">
        <div className="guided-start__summary">
          <span className="guided-start__icon" aria-hidden="true"><Sparkles size={18} /></span>
          <div>
            <span className="guided-start__eyebrow">{t("guidedStart.eyebrow")}</span>
            <h2 id="guided-start-title">{progress.isReadyForFirstSession ? t("guidedStart.readyTitle") : prefs.helpLevel === "normal" ? t("guidedStart.normalTitle") : t("guidedStart.compactTitle")}</h2>
            <p>{progress.isReadyForFirstSession ? t("guidedStart.readyDescription") : prefs.helpLevel === "normal" ? t("guidedStart.normalDescription") : t("guidedStart.compactDescription")}</p>
          </div>
        </div>
        <div className="guided-start__compact-side">
          <div className="guided-start__compact-actions">
            {recommended ? (
              <button type="button" className="btn btn-primary btn-sm" onClick={() => runStepAction(recommended.id)}>
                {t(`guidedStart.steps.${recommended.id}.action`)}
              </button>
            ) : null}
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setHelpOpen(true)}>
              <HelpCircle size={14} /> {t("guidedStart.needHelp")}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setStarterHubCompact(campaignId, false);
                setShowAll(true);
                setPrefs(readGuidedStartPreferences());
              }}
            >
              <ChevronDown size={14} /> {t("guidedStart.expand")}
            </button>
          </div>
          <HelpLevelSelect value={prefs.helpLevel} onChange={changeHelpLevel} />
        </div>
        {helpOpen && <GuidanceModal campaignState={campaignState} onClose={() => setHelpOpen(false)} onNavigate={setCurrentPage} onOpenRelation={openRelation} />}
        {premiseOpen && <CampaignPremiseModal campaignId={campaignId} campaign={campaignState?.campaign} onClose={() => setPremiseOpen(false)} />}
      </section>
    );
  }

  return (
    <section className="guided-start" aria-labelledby="guided-start-title">
      <div className="guided-start__top">
        <div className="guided-start__summary">
          <span className="guided-start__icon" aria-hidden="true"><Sparkles size={20} /></span>
          <div>
            <span className="guided-start__eyebrow">{t("guidedStart.eyebrow")}</span>
            <h2 id="guided-start-title">{t("guidedStart.title")}</h2>
            <p>{t("guidedStart.description")}</p>
          </div>
        </div>
        <button
          type="button"
          className="guided-start__close"
          onClick={() => {
            setStarterHubHidden(campaignId, true);
            setPrefs(readGuidedStartPreferences());
          }}
          aria-label={t("guidedStart.hide")}
        >
          <X size={16} />
        </button>
      </div>

      <div className="guided-start__progress-row">
        <div className="guided-start__progress-copy">
          <strong>{t("guidedStart.progress", { completed: progress.completedCount, total: progress.totalCount })}</strong>
          <span>{recommended ? t("guidedStart.recommended", { step: t(`guidedStart.steps.${recommended.id}.title`) }) : t("guidedStart.allDone")}</span>
        </div>
        <div className="guided-start__bar" aria-hidden="true">
          <span style={{ width: `${Math.round((progress.completedCount / progress.totalCount) * 100)}%` }} />
        </div>
      </div>

      <div className="guided-start__steps">
        {visibleSteps.map((step) => <StarterStepRow key={step.id} step={step} onAction={runStepAction} />)}
      </div>

      <div className="guided-start__footer">
        <div className="guided-start__footer-actions">
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setHelpOpen(true)}>
            <HelpCircle size={14} /> {t("guidedStart.needHelp")}
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowAll((value) => !value)}
          >
            {showAll ? t("guidedStart.showLess") : t("guidedStart.showAll")}
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setStarterHubCompact(campaignId, true);
              setPrefs(readGuidedStartPreferences());
            }}
          >
            {t("guidedStart.collapse")}
          </button>
        </div>
        <HelpLevelSelect value={prefs.helpLevel} onChange={changeHelpLevel} />
      </div>

      {helpOpen && <GuidanceModal campaignState={campaignState} onClose={() => setHelpOpen(false)} onNavigate={setCurrentPage} onOpenRelation={openRelation} />}
      {premiseOpen && <CampaignPremiseModal campaignId={campaignId} campaign={campaignState?.campaign} onClose={() => setPremiseOpen(false)} />}
    </section>
  );
}

export function GuidedEmptyState({
  icon,
  title,
  description,
  actions,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actions: Array<{ label: string; icon?: React.ReactNode; onClick: () => void; primary?: boolean }>;
}) {
  return (
    <div className="guided-empty card">
      <div className="guided-empty__icon" aria-hidden="true">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="guided-empty__actions">
        {actions.map((action) => (
          <button key={action.label} type="button" className={`btn btn-sm ${action.primary ? "btn-primary" : "btn-secondary"}`} onClick={action.onClick}>
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
