import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

const SYSTEMS = [
  { value: "generic_fantasy_d20", label: "D&D 5e / D20 Fantasy" },
  { value: "pathfinder2e", label: "Pathfinder 2e" },
  { value: "shadowdark", label: "Shadowdark" },
  { value: "generic", label: "Sistema personalizado" },
];

export function OnboardingPage() {
  const { t } = useTranslation();
  const { createCampaign } = useCampaignStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [title, setTitle] = useState("");
  const [system, setSystem] = useState("generic_fantasy_d20");
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
        navigate({ to: `/campaigns/${campaignId}/dashboard` });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("onboarding.createError"));
      setCreating(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-main)", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "480px" }}>
        {/* Step dots */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "32px", justifyContent: "center" }}>
          {([1, 2, 3] as const).map(n => (
            <div
              key={n}
              style={{
                width: "32px",
                height: "4px",
                borderRadius: "2px",
                background: n <= step ? "var(--primary)" : "var(--border-color)",
                transition: "background 0.2s"
              }}
            />
          ))}
        </div>

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "8px" }}>{t("onboarding.step1Title")}</h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{t("onboarding.step1Desc")}</p>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.9rem" }}>{t("onboarding.nameLabel")}</label>
              <input
                className="input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={t("onboarding.namePlaceholder")}
                onKeyDown={e => e.key === "Enter" && title.trim() && setStep(2)}
                autoFocus
                style={{ width: "100%", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.9rem" }}>{t("onboarding.systemLabel")}</label>
              <select
                className="input"
                value={system}
                onChange={e => setSystem(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box" }}
              >
                {SYSTEMS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <button
              className="btn btn-primary"
              disabled={!title.trim()}
              onClick={() => setStep(2)}
              style={{ width: "100%" }}
            >
              {t("onboarding.next")}
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "700" }}>{t("onboarding.step2Title")}</h1>
            {(["empty", "starter"] as const).map(tpl => (
              <button
                key={tpl}
                onClick={() => setTemplate(tpl)}
                style={{
                  textAlign: "left",
                  cursor: "pointer",
                  border: `2px solid ${template === tpl ? "var(--primary)" : "var(--border-color)"}`,
                  padding: "16px",
                  borderRadius: "8px",
                  background: template === tpl ? "var(--bg-elevated, var(--bg-main))" : "transparent",
                  transition: "border-color 0.15s"
                }}
              >
                <div style={{ fontWeight: "700", marginBottom: "4px" }}>
                  {t(tpl === "empty" ? "onboarding.templateEmpty" : "onboarding.templateStarter")}
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  {t(tpl === "empty" ? "onboarding.templateEmptyDesc" : "onboarding.templateStarterDesc")}
                </div>
              </button>
            ))}
            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>{t("onboarding.back")}</button>
              <button className="btn btn-primary" onClick={() => setStep(3)} style={{ flex: 1 }}>{t("onboarding.next")}</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "700" }}>{t("onboarding.step3Title")}</h1>
            <div className="card" style={{ padding: "16px", borderRadius: "8px" }}>
              <p style={{ fontSize: "0.9rem" }}>
                {t("onboarding.step3Summary", {
                  title,
                  system: SYSTEMS.find(s => s.value === system)?.label ?? system,
                  template
                })}
              </p>
            </div>
            {error && <p style={{ color: "var(--error, #ef4444)", fontSize: "0.85rem" }}>{error}</p>}
            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn btn-secondary" onClick={() => setStep(2)} style={{ flex: 1 }}>{t("onboarding.back")}</button>
              <button
                className="btn btn-primary"
                disabled={creating}
                onClick={() => void handleCreate()}
                style={{ flex: 1 }}
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
