import React, { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useCampaignStore } from "./shared/stores/campaignStore.js";
import {
  Plus,
  X,
  RotateCcw,
  Search,
  AlertTriangle,
  FolderOpen,
  Layers,
  Sparkles,
  Lock,
  Play,
  Activity,
} from "lucide-react";
import { lockDm } from "./shared/auth/authClient.js";
import { LandingCampaignCard } from "./shared/components/LandingCampaignCard.js";
import { AppFooter } from "./shared/components/AppFooter.js";
import { PortalTopBar } from "./shared/components/PortalTopBar.js";
import { RpgPortalBackground } from "./shared/components/RpgPortalBackground.js";
import { useTranslation } from "./shared/i18n/useTranslation.js";

export function App() {
  const { t } = useTranslation();
  const {
    campaigns,
    activeCampaignId,
    loading,
    error,
    fetchVaults,
    fetchCampaigns,
    selectCampaign,
    createCampaign,
    restoreBackup,
  } = useCampaignStore();

  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const navigate = useNavigate();

  // Forms & Modals state
  const [campaignsFetched, setCampaignsFetched] = useState(false);
  const [newCampaignTitle, setNewCampaignTitle] = useState("");
  const [newCampaignSystem, setNewCampaignSystem] = useState("generic_fantasy_d20");
  const [newCampaignTemplate, setNewCampaignTemplate] = useState("empty");
  const [landingSearchQuery, setLandingSearchQuery] = useState("");
  const [backupRestorePath, setBackupRestorePath] = useState("");

  const [mysticalTransitionId, setMysticalTransitionId] = useState<string | null>(null);

  const triggerMysticalTransition = (campaignId: string) => {
    setMysticalTransitionId(campaignId);
    setTimeout(async () => {
      try {
        await selectCampaign(campaignId);
        navigate({ to: `/campaigns/${campaignId}/canvas` });
      } catch (e) {
        console.error(e);
        setMysticalTransitionId(null);
      }
    }, 850);
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { acquireLocalDmToken, fetchAuthStatus, getDmSessionToken } = await import("./shared/auth/authClient.js");
        const status = await fetchAuthStatus();
        // On /dm: ensure we have a DM session
        if (!status.dmSessionValid && status.localRequest && !status.dmPinConfigured) {
          await acquireLocalDmToken(); // also calls setDmLastUnlocked internally
        } else if (!status.dmSessionValid && !getDmSessionToken()) {
          // No valid session and not local/no PIN — SmartLanding will handle routing
        }
      } catch {
        // Non-fatal: server may not have new auth endpoints yet
        const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        if (isLocalhost) {
          try {
            const resToken = await fetch("/api/auth/local-token");
            if (resToken.ok) {
              const { token } = await resToken.json();
              sessionStorage.setItem("dmcc_dmSessionToken", token);
            }
          } catch { /* ignore */ }
        }
      }
      fetchVaults();
      await fetchCampaigns().catch(() => {});
      setCampaignsFetched(true);
    };
    initAuth();
  }, []);

  // When user lands on /dm with an active campaign, redirect to campaign shell
  useEffect(() => {
    if (activeCampaignId && pathname === "/dm") {
      navigate({ to: `/campaigns/${activeCampaignId}/dashboard` });
    }
  }, [activeCampaignId, pathname]);

  const handleCreateCampaignSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!newCampaignTitle.trim()) return;
    try {
      if (newCampaignTemplate && newCampaignTemplate !== "empty") {
        sessionStorage.setItem("dmcc_pending_seed_template", newCampaignTemplate);
      }
      const campaignId = await createCampaign(newCampaignTitle.trim(), newCampaignSystem);
      setNewCampaignTitle("");
      setNewCampaignTemplate("empty");
      if (campaignId) {
        triggerMysticalTransition(campaignId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestoreBackupSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!backupRestorePath.trim()) return;
    restoreBackup(backupRestorePath.trim());
    setBackupRestorePath("");
  };

  const handleLockDm = async () => {
    await lockDm();
    await navigate({ to: "/" });
  };

  const filteredCampaigns = campaigns.filter(
    (c) =>
      c.title.toLowerCase().includes(landingSearchQuery.toLowerCase()) ||
      c.campaignId.toLowerCase().includes(landingSearchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <PortalTopBar actions={
        <button
          type="button"
          onClick={() => void handleLockDm()}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px", padding: "5px 12px", color: "var(--text-muted)", fontSize: "0.8rem", cursor: "pointer", transition: "border-color 0.2s, color 0.2s" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.3)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-main)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; }}
        >
          <Lock size={13} />
          {t("nav.lockWorkspace")}
        </button>
      } />
    <div className="landing-shell">
      {/* Animated Hero Header */}
      <header className="landing-hero">
        <RpgPortalBackground />

        <div className="landing-hero__content">
          <span className="landing-badge">
            <Sparkles size={12} style={{ marginRight: "4px" }} />
            {t("landing.badge")}
          </span>
          <h1 className="landing-hero__title">
            {t("landing.title1")} <span>{t("landing.title2")}</span>
          </h1>
          <p className="landing-hero__subtitle">
            {t("landing.heroSubtitle")}
          </p>
        </div>
      </header>

      {/* Feature Highlights Tour */}
      <section className="landing-features-grid">
        <div className="feature-item-card">
          <div className="feature-icon-wrapper">
            <Layers size={20} />
          </div>
          <h4>{t("landing.featureCanvasTitle")}</h4>
          <p>{t("landing.featureCanvasDesc")}</p>
        </div>

        <div className="feature-item-card">
          <div className="feature-icon-wrapper">
            <Play size={20} />
          </div>
          <h4>{t("landing.featureLanTitle")}</h4>
          <p>{t("landing.featureLanDesc")}</p>
        </div>

        <div className="feature-item-card">
          <div className="feature-icon-wrapper">
            <Activity size={20} />
          </div>
          <h4>{t("landing.featureMemoryTitle")}</h4>
          <p>{t("landing.featureMemoryDesc")}</p>
        </div>
      </section>

      {/* Main Grid: Campaigns & Creator */}
      <div className="landing-grid">
        <section className="card landing-card campaigns-archive-section">
          <div className="campaigns-archive-header">
            <div className="archive-title-group">
              <FolderOpen size={18} />
              <h2>{t("landing.archiveTitle")}</h2>
            </div>

            {/* Instant Search Bar */}
            <div className="archive-search-wrapper">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                className="archive-search-input"
                {...{placeholder: t("landing.searchPlaceholder")}}
                value={landingSearchQuery}
                onChange={(e) => setLandingSearchQuery(e.target.value)}
              />
              {landingSearchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setLandingSearchQuery("")}
                  aria-label={t("landing.searchClearAriaLabel")}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <p className="landing-muted">{t("landing.loadingCampaigns")}</p>
          ) : error ? (
            <div className="landing-empty landing-error-container">
              <AlertTriangle size={24} className="icon-critical" />
              <p>{t("landing.errorTitle")}</p>
              <span>{error}</span>
              <button className="btn btn-secondary" type="button" onClick={() => fetchCampaigns()}>
                {t("landing.retryButton")}
              </button>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="landing-empty landing-empty--campaigns">
              <img
                src="/assets/empty_campaigns_list.png"
                alt=""
                aria-hidden="true"
                className="landing-empty__emblem"
              />
              <div className="landing-empty__copy">
                {landingSearchQuery ? (
                  <>
                    <p>{t("landing.searchEmptyTitle")}</p>
                    <span>{t("landing.searchEmptyDesc", { query: landingSearchQuery })}</span>
                  </>
                ) : (
                  <>
                    <p>{t("landing.emptyTitle")}</p>
                    <span>{t("landing.emptyDesc")}</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="campaign-grid-list">
              {filteredCampaigns.map((c) => (
                <LandingCampaignCard
                  key={c.campaignId}
                  campaign={c}
                  onSelect={(campaignId) => {
                    triggerMysticalTransition(campaignId);
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <div className="landing-side-stack">
          {/* New Campaign Creator Card */}
          <section className="card landing-card landing-create-card">
            <div className="landing-section-header">
              <h2>
                <Plus size={18} />
                {t("landing.createTitle")}
              </h2>
            </div>

            <form onSubmit={handleCreateCampaignSubmit} className="landing-creator-form">
              <div className="form-group">
                <label className="form-label">{t("landing.campaignTitleLabel")}</label>
                <input
                  type="text"
                  className="form-input"
                  {...{placeholder: t("landing.campaignTitlePlaceholder")}}
                  value={newCampaignTitle}
                  onChange={(e) => setNewCampaignTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t("landing.systemLabel")}</label>
                <select
                  className="form-select"
                  value={newCampaignSystem}
                  onChange={(e) => setNewCampaignSystem(e.target.value)}
                >
                  <option value="generic_fantasy_d20">{t("landing.systemFantasyD20Generic")}</option>
                  <option value="dnd_srd_5_2_1">{t("landing.systemDnD")}</option>
                  <option value="custom">{t("landing.systemCustom")}</option>
                </select>
              </div>

              {/* Stepped Template Selection */}
              <div className="form-group">
                <label className="form-label">{t("landing.templateLabel")}</label>
                <div className="template-options-grid">
                  <label className={`template-option ${newCampaignTemplate === "empty" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="campaignTemplate"
                      value="empty"
                      checked={newCampaignTemplate === "empty"}
                      onChange={(e) => setNewCampaignTemplate(e.target.value)}
                      className="hidden-radio"
                    />
                    <span className="template-label">{t("landing.templateEmpty")}</span>
                    <span className="template-desc">{t("landing.templateEmptyDesc")}</span>
                  </label>
                  <label className={`template-option ${newCampaignTemplate === "mystery" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="campaignTemplate"
                      value="mystery"
                      checked={newCampaignTemplate === "mystery"}
                      onChange={(e) => setNewCampaignTemplate(e.target.value)}
                      className="hidden-radio"
                    />
                    <span className="template-label">{t("landing.templateMystery")}</span>
                    <span className="template-desc">{t("landing.templateMysteryDesc")}</span>
                  </label>
                  <label className={`template-option ${newCampaignTemplate === "faction" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="campaignTemplate"
                      value="faction"
                      checked={newCampaignTemplate === "faction"}
                      onChange={(e) => setNewCampaignTemplate(e.target.value)}
                      className="hidden-radio"
                    />
                    <span className="template-label">{t("landing.templateFaction")}</span>
                    <span className="template-desc">{t("landing.templateFactionDesc")}</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="btn btn-primary landing-primary-action">
                {t("landing.createButton")}
              </button>
            </form>
          </section>

          {/* Backup Restore Card */}
          <section className="card landing-card landing-restore-card">
            <details>
              <summary>
                <span>
                  <RotateCcw size={17} />
                  {t("landing.restoreTitle")}
                </span>
              </summary>

              <form onSubmit={handleRestoreBackupSubmit} className="landing-restore-form">
                <div className="form-group">
                  <label className="form-label">{t("landing.backupNameLabel")}</label>
                  <input
                    type="text"
                    className="form-input"
                    {...{placeholder: t("landing.backupNamePlaceholder")}}
                    value={backupRestorePath}
                    onChange={(e) => setBackupRestorePath(e.target.value)}
                    required
                  />
                  <small className="form-help">
                    {t("landing.backupHelp")}
                  </small>
                </div>

                <button type="submit" className="btn btn-secondary landing-secondary-action">
                  {t("landing.restoreButton")}
                </button>
              </form>
            </details>
          </section>
        </div>
      </div>

      <AppFooter variant="landing" />

      {mysticalTransitionId && (
        <div className="mystical-portal-overlay mystical-portal-overlay--in" aria-live="assertive">
          <div className="mystical-portal-glow"></div>
          <div className="mystical-portal-text">{t("landing.enteringCampaign")}</div>
        </div>
      )}
    </div>
  </div>
  );
}
