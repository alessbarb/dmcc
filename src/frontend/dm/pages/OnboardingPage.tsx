import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import "../../shared/styles/features/dm-onboarding.css";

const SYSTEMS = [
  { value: "dnd_5e", label: "D&D 5e / D20 Fantasy" },
  { value: "pathfinder_2e", label: "Pathfinder 2e" },
  { value: "shadowdark", label: "Shadowdark" },
  { value: "custom", label: "Sistema personalizado" },
];

export function OnboardingPage() {
  const { t } = useTranslation();
  const { createCampaign } = useCampaignStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [title, setTitle] = useState("");
  const [system, setSystem] = useState("dnd_5e");
  const [template, setTemplate] = useState<"empty" | "starter">("empty");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    setError(null);
    try {
      // Store template selection so App.tsx seed logic can pick it up
      if (template !== "empty") {
        sessionStorage.setItem("dmcc_pending_seed_template", template);
      }
      const campaignId = await createCampaign(title.trim(), system);
      if (campaignId) {
        await navigate({ to: `/campaigns/${campaignId}/overview` });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("onboarding.createError"));
      setCreating(false);
    }
  };

  return (
    <div className="dm-onboarding">
      <div className="dm-onboarding__content">
        {/* Step dots */}
        <div className="dm-onboarding__steps">
          {([1, 2, 3] as const).map(n => (
            <div
              key={n}
              className={`dm-onboarding__step ${n <= step ? "is-complete" : ""}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="dm-onboarding__panel">
            <div>
              <h1 className="dm-onboarding__title">{t("onboarding.step1Title")}</h1>
              <p className="dm-onboarding__description">{t("onboarding.step1Desc")}</p>
            </div>
            <div>
              <label className="dm-onboarding__label">{t("onboarding.nameLabel")}</label>
              <input
                className="input dm-onboarding__input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={t("onboarding.namePlaceholder")}
                onKeyDown={e => e.key === "Enter" && title.trim() && setStep(2)}
                autoFocus
              />
            </div>
            <div>
              <label className="dm-onboarding__label">{t("onboarding.systemLabel")}</label>
              <select
                className="input dm-onboarding__input"
                value={system}
                onChange={e => setSystem(e.target.value)}
              >
                {SYSTEMS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <button
              disabled={!title.trim()}
              onClick={() => setStep(2)}
              className="btn btn-primary dm-onboarding__full-button"
            >
              {t("onboarding.next")}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="dm-onboarding__panel">
            <h1 className="dm-onboarding__title">{t("onboarding.step2Title")}</h1>
            {(["empty", "starter"] as const).map(tpl => (
              <button
                key={tpl}
                onClick={() => setTemplate(tpl)}
                className={`dm-onboarding__template ${template === tpl ? "is-selected" : ""}`}
              >
                <div className="dm-onboarding__template-title">
                  {t(tpl === "empty" ? "onboarding.templateEmpty" : "onboarding.templateStarter")}
                </div>
                <div className="dm-onboarding__template-description">
                  {t(tpl === "empty" ? "onboarding.templateEmptyDesc" : "onboarding.templateStarterDesc")}
                </div>
              </button>
            ))}
            <div className="dm-onboarding__navigation">
              <button className="btn btn-secondary dm-onboarding__navigation-button" onClick={() => setStep(1)}>{t("onboarding.back")}</button>
              <button className="btn btn-primary dm-onboarding__navigation-button" onClick={() => setStep(3)}>{t("onboarding.next")}</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="dm-onboarding__panel">
            <h1 className="dm-onboarding__title">{t("onboarding.step3Title")}</h1>
            <div className="card dm-onboarding__summary">
              <p className="dm-onboarding__summary-text">
                {t("onboarding.step3Summary", {
                  title,
                  system: SYSTEMS.find(s => s.value === system)?.label ?? system,
                  template
                })}
              </p>
            </div>
            {error && <p className="dm-onboarding__error">{error}</p>}
            <div className="dm-onboarding__navigation">
              <button className="btn btn-secondary dm-onboarding__navigation-button" onClick={() => setStep(2)}>{t("onboarding.back")}</button>
              <button
              disabled={creating}
                onClick={() => void handleCreate()}
                className="btn btn-primary dm-onboarding__navigation-button"
              >
                {creating ? "…" : t("onboarding.createBtn")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
