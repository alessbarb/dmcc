import React, { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Shield, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { fetchAuthStatus, setupDmAccount } from "../../shared/auth/authClient.js";
import type { AuthStatus } from "../../shared/auth/authTypes.js";
import { RpgPortalBackground } from "../../shared/components/RpgPortalBackground.js";
import { PortalTopBar } from "../../shared/components/PortalTopBar.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

export function DmSetupPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [confirmSecret, setConfirmSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAuthStatus()
      .then(setAuthStatus)
      .catch(() => setAuthStatus(null))
      .finally(() => setStatusLoading(false));
  }, []);

  const hasExistingDm = Boolean(authStatus?.accountConfigured);
  const addingAnotherDm = hasExistingDm;

  const handleBack = () => {
    if (authStatus?.sessionValid) {
      navigate({ to: "/portal" });
    } else if (hasExistingDm) {
      navigate({ to: "/dm/login" });
    } else {
      navigate({ to: "/" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { setError(t("dmSetup.errorInvalidEmail")); return; }
    if (secret !== confirmSecret) { setError(t("dmSetup.errorMismatch")); return; }
    if (secret.length < 12) { setError("Password must be at least 12 characters."); return; }
    setLoading(true);
    setError(null);
    try {
      await setupDmAccount({ email, secret, displayName });
      navigate({ to: "/portal" });
    } catch (err: any) {
      setError(err.message || t("dmSetup.errorCreateAccount"));
    } finally {
      setLoading(false);
    }
  };

  if (statusLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-main)", color: "var(--text-muted)" }}>
        {t("common.loading")}
      </div>
    );
  }

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
            <h1 className="join-portal-title" style={{ fontSize: "1.3rem" }}>
              {addingAnotherDm ? "Create another account" : "Create account"}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "4px 0 0" }}>
              A single account to run campaigns, play games, and manage your characters.
            </p>
          </div>

          {addingAnotherDm && (
            <div style={{ padding: "12px", border: "1px solid var(--border)", borderRadius: "12px", background: "rgba(255,255,255,0.03)", color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "14px" }}>
              This account will not have a global 'DM' or 'player' role. Permissions are resolved per campaign.
            </div>
          )}

          <form onSubmit={handleSubmit} className="join-portal-form">
            <div className="form-group">
              <label className="form-label" htmlFor="displayName">{t("dmSetup.displayNameLabel")}</label>
              <input
                id="displayName"
                type="text"
                className="form-input join-portal-input"
                placeholder={t("dmSetup.displayNamePlaceholder")}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">{t("dmSetup.emailLabel")}</label>
              <input
                id="email"
                type="email"
                className="form-input join-portal-input"
                placeholder={t("dmSetup.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="secret">{t("dmSetup.secretLabel")}</label>
              <div className="access-code-input-wrapper">
                <input
                  id="secret"
                  type={showSecret ? "text" : "password"}
                  className="form-input join-portal-input"
                  placeholder={t("dmSetup.secretPlaceholder")}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button type="button" className="input-icon" style={{ cursor: "pointer", background: "none", border: "none", padding: 0 }} onClick={() => setShowSecret((v) => !v)}>
                  {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmSecret">{t("dmSetup.confirmLabel")}</label>
              <input
                id="confirmSecret"
                type={showSecret ? "text" : "password"}
                className="form-input join-portal-input"
                placeholder={t("dmSetup.confirmPlaceholder")}
                value={confirmSecret}
                onChange={(e) => setConfirmSecret(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="join-portal-error">
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary join-portal-btn"
              disabled={loading || !email || !secret || !confirmSecret}
            >
              {loading
                ? t("dmSetup.settingUpBtn")
                : addingAnotherDm
                ? t("dmSetup.addExistingSubmitBtn")
                : t("dmSetup.submitBtn")}
            </button>
          </form>

          <button type="button" className="join-portal-back-btn" onClick={handleBack}>
            <ArrowLeft size={14} style={{ marginRight: "6px" }} /> {t("common.back")}
          </button>
        </div>
      </div>
    </div>
  );
}
