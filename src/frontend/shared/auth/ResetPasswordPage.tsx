import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, KeyRound } from "lucide-react";
import { resetPassword } from "./authClient.js";
import { PortalTopBar } from "../components/PortalTopBar.js";
import { RpgPortalBackground } from "../components/RpgPortalBackground.js";
import { useTranslation } from "../i18n/useTranslation.js";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const routeParams = useParams({ strict: false }) as { token?: string };
  const initialToken = useMemo(() => routeParams.token ?? "", [routeParams.token]);
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError(t("resetPassword.errorMismatch"));
      return;
    }
    if (password.length < 12) {
      setError(t("resetPassword.errorTooShort"));
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await resetPassword(token.trim(), password);
      setMessage(t("resetPassword.successMessage"));
    } catch (err: any) {
      setError(err.message || t("resetPassword.errorGeneric"));
    } finally {
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
              <KeyRound className="join-portal-icon" size={32} />
              <div className="join-portal-icon-glow" />
            </div>
            <h1 className="join-portal-title" style={{ fontSize: "1.3rem" }}>{t("resetPassword.title")}</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "4px 0 0" }}>
              {t("resetPassword.subtitle")}
            </p>
          </div>

          <form onSubmit={submit} className="join-portal-form">
            <div className="form-group">
              <label className="form-label" htmlFor="rp-token">{t("resetPassword.tokenLabel")}</label>
              <input
                id="rp-token"
                type="text"
                className="form-input join-portal-input"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder={t("resetPassword.tokenPlaceholder")}
                autoComplete="one-time-code"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rp-password">{t("resetPassword.passwordLabel")}</label>
              <div className="access-code-input-wrapper">
                <input
                  id="rp-password"
                  type={showPassword ? "text" : "password"}
                  className="form-input join-portal-input"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="input-icon"
                  style={{ cursor: "pointer", background: "none", border: "none", padding: 0 }}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rp-confirm">{t("resetPassword.confirmPasswordLabel")}</label>
              <input
                id="rp-confirm"
                type={showPassword ? "text" : "password"}
                className="form-input join-portal-input"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            {message && <div className="join-portal-success"><p>{message}</p></div>}
            {error && <div className="join-portal-error"><p>{error}</p></div>}

            <button
              type="submit"
              className="btn btn-primary join-portal-btn"
              disabled={loading || !token.trim() || !password || !confirmPassword}
            >
              {loading ? t("resetPassword.updatingBtn") : t("resetPassword.submitBtn")}
            </button>
          </form>

          <button type="button" className="join-portal-back-btn" onClick={() => navigate({ to: "/dm/login" })}>
            <ArrowLeft size={14} style={{ marginRight: "6px" }} />
            {t("resetPassword.backToLogin")}
          </button>
        </div>
      </div>
    </div>
  );
}
