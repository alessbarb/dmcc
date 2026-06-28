import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Shield, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { setupPin, acquireLocalDmToken, fetchAuthStatus } from "../../shared/auth/authClient.js";
import { RpgPortalBackground } from "../../shared/components/RpgPortalBackground.js";
import { PortalTopBar } from "../../shared/components/PortalTopBar.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

export function DmSetupPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skipMode, setSkipMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin !== confirmPin) { setError(t("dmSetup.errorMismatch")); return; }
    if (pin.length < 4) { setError(t("dmSetup.errorTooShort")); return; }
    setLoading(true);
    setError(null);
    try {
      await acquireLocalDmToken();
      await setupPin(pin);
      navigate({ to: "/dm" });
    } catch (err: any) {
      setError(err.message || t("dmSetup.errorMismatch"));
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    setError(null);
    try {
      const status = await fetchAuthStatus();
      if (status.localRequest) {
        await acquireLocalDmToken();
        navigate({ to: "/dm" });
      } else {
        setError(t("dmSetup.errorLocalRequired"));
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-main)" }}>
      <PortalTopBar />
      <div className="join-portal-container" style={{ flex: 1 }}>
        <div className="join-portal-background">
          <RpgPortalBackground />
          <div className="join-portal-radial-glow" />
        </div>

      <div className="join-portal-card">
        <div className="join-portal-header">
          <div className="join-portal-icon-wrapper">
            <Shield className="join-portal-icon" size={32} />
            <div className="join-portal-icon-glow" />
          </div>
          <h1 className="join-portal-title" style={{ fontSize: "1.3rem" }}>{t("dmSetup.title")}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "4px 0 0" }}>
            {t("dmSetup.subtitle")}
          </p>
        </div>

        {!skipMode ? (
          <form onSubmit={handleSubmit} className="join-portal-form">
            <div className="form-group">
              <label className="form-label" htmlFor="pin">{t("dmSetup.pinLabel")}</label>
              <div className="access-code-input-wrapper">
                <input
                  id="pin"
                  type={showPin ? "text" : "password"}
                  className="form-input join-portal-input"
                  placeholder={t("dmSetup.pinPlaceholder")}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  autoFocus
                  autoComplete="new-password"
                />
                <button type="button" className="input-icon" style={{ cursor: "pointer", background: "none", border: "none", padding: 0 }} onClick={() => setShowPin((v) => !v)}>
                  {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPin">{t("dmSetup.confirmLabel")}</label>
              <div className="access-code-input-wrapper">
                <input
                  id="confirmPin"
                  type={showPin ? "text" : "password"}
                  className="form-input join-portal-input"
                  placeholder={t("dmSetup.confirmPlaceholder")}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            {error && <div className="join-portal-error"><p>{error}</p></div>}

            <button type="submit" className="btn btn-primary join-portal-btn" disabled={loading || !pin || !confirmPin}>
              {loading ? t("dmSetup.settingUpBtn") : t("dmSetup.submitBtn")}
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ marginTop: "8px", opacity: 0.6, width: "100%" }}
              onClick={() => setSkipMode(true)}
            >
              {t("dmSetup.skipBtn")}
            </button>
          </form>
        ) : (
          <div className="join-portal-form">
            <div style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.3)", borderRadius: "8px", padding: "12px 14px", marginBottom: "12px" }}>
              <p style={{ fontSize: "0.85rem", color: "#facc15", margin: 0 }}>
                {t("dmSetup.skipWarning")}
              </p>
            </div>
            {error && <div className="join-portal-error"><p>{error}</p></div>}
            <button className="btn btn-primary join-portal-btn" onClick={handleSkip} disabled={loading}>
              {loading ? t("dmSetup.settingUpBtn") : t("dmSetup.continueNoPin")}
            </button>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: "8px", width: "100%" }} onClick={() => setSkipMode(false)}>
              <ArrowLeft size={14} /> {t("dmSetup.back")}
            </button>
          </div>
        )}

        <button type="button" className="join-portal-back-btn" onClick={() => navigate({ to: "/" })}>
          <ArrowLeft size={14} style={{ marginRight: "6px" }} /> {t("dmSetup.backHome")}
        </button>
      </div>
      </div>
    </div>
  );
}
