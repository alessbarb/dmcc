import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, KeyRound } from "lucide-react";
import { requestPasswordReset } from "./authClient.js";
import { PortalTopBar } from "../components/PortalTopBar.js";
import { RpgPortalBackground } from "../components/RpgPortalBackground.js";
import { useTranslation } from "../i18n/useTranslation.js";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const run = async () => {
      if (!email.trim()) return;
      setLoading(true);
      setError(null);
      setMessage(null);
      try {
        const result = await requestPasswordReset(email.trim());
        if (result.resetToken) {
          // Local/dev mode: token is returned directly, skip email step.
          await navigate({ to: "/reset-password/$token", params: { token: result.resetToken } });
          return;
        }
        setMessage(t("forgotPassword.successMessage"));
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        setError(errMsg || t("forgotPassword.errorGeneric"));
      } finally {
        setLoading(false);
      }
    };
    void run();
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
              <KeyRound className="join-portal-icon" size={32} />
              <div className="join-portal-icon-glow" />
            </div>
            <h1 className="join-portal-title" style={{ fontSize: "1.3rem" }}>{t("forgotPassword.title")}</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "4px 0 0" }}>
              {t("forgotPassword.subtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="join-portal-form">
            <div className="form-group">
              <label className="form-label" htmlFor="fp-email">{t("forgotPassword.emailLabel")}</label>
              <input
                id="fp-email"
                type="email"
                className="form-input join-portal-input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t("forgotPassword.emailPlaceholder")}
                autoComplete="email"
                required
                autoFocus
              />
            </div>

            {message && <div className="join-portal-success"><p>{message}</p></div>}
            {error && <div className="join-portal-error"><p>{error}</p></div>}

            <button
              type="submit"
              className="btn btn-primary join-portal-btn"
              disabled={loading || !email.trim()}
            >
              {loading ? t("forgotPassword.sendingBtn") : t("forgotPassword.submitBtn")}
            </button>
          </form>

          <button type="button" className="join-portal-back-btn" onClick={() => { void navigate({ to: "/auth/login" }); }}>
            <ArrowLeft size={14} style={{ marginRight: "6px" }} />
            {t("forgotPassword.backToLogin")}
          </button>
        </div>
      </div>
    </div>
  );
}
