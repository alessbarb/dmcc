import React, { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, ArrowLeft, UserPlus } from "lucide-react";
import { fetchSession, registerAccount } from "../shared/auth/authClient.js";
import { consumeAuthReturnTo } from "../shared/auth/authReturnTo.js";
import { RpgPortalBackground } from "../shared/components/RpgPortalBackground.js";
import { PortalTopBar } from "../shared/components/PortalTopBar.js";
import { useTranslation } from "../shared/i18n/useTranslation.js";

const MIN_PASSWORD_LENGTH = 12;

export function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchSession()
      .then((session) => {
        if (session.sessionValid) window.location.assign(consumeAuthReturnTo());
      })
      .catch(() => undefined)
      .finally(() => setCheckingSession(false));
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void (async () => {
      if (!email.includes("@")) { setError(t("auth.register.errorInvalidEmail")); return; }
      if (password !== confirmPassword) { setError(t("auth.register.errorPasswordMismatch")); return; }
      if (password.length < MIN_PASSWORD_LENGTH) { setError(t("resetPassword.errorTooShort")); return; }
      setLoading(true);
      setError(null);
      try {
        await registerAccount({ email, password, displayName });
        window.location.assign(consumeAuthReturnTo());
      } catch (cause: unknown) {
        const message = cause instanceof Error ? cause.message : String(cause);
        setError(message === "ACCOUNT_ALREADY_EXISTS" ? t("auth.register.errorAlreadyExists") : message);
      } finally {
        setLoading(false);
      }
    })();
  };

  if (checkingSession) {
    return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--theme-surfaces-canvas)", color: "var(--theme-text-secondary)" }}>{t("common.loading")}</div>;
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--theme-surfaces-canvas)" }}>
      <PortalTopBar />
      <div className="join-portal-container" style={{ flex: 1 }}>
        <div className="join-portal-background"><RpgPortalBackground /><div className="join-portal-radial-glow" /></div>
        <div className="join-portal-card">
          <div className="join-portal-header">
            <div className="join-portal-icon-wrapper"><UserPlus className="join-portal-icon" size={32} /><div className="join-portal-icon-glow" /></div>
            <h1 className="join-portal-title" style={{ fontSize: "1.3rem" }}>{t("auth.register.title")}</h1>
            <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.85rem", margin: "4px 0 0" }}>{t("auth.register.subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="join-portal-form">
            <div className="form-group">
              <label className="form-label" htmlFor="displayName">{t("auth.register.displayNameLabel")}</label>
              <input id="displayName" type="text" className="form-input join-portal-input" value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="email">{t("auth.register.emailLabel")}</label>
              <input id="email" type="email" className="form-input join-portal-input" value={email} onChange={(event) => setEmail(event.target.value)} required autoFocus autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">{t("auth.register.passwordLabel")}</label>
              <div className="access-code-input-wrapper">
                <input id="password" type={showPassword ? "text" : "password"} className="form-input join-portal-input" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={MIN_PASSWORD_LENGTH} maxLength={128} autoComplete="new-password" />
                <button type="button" className="input-icon" aria-label={showPassword ? t("auth.login.hidePasswordLabel") : t("auth.login.showPasswordLabel")} style={{ cursor: "pointer", background: "none", border: "none", padding: 0 }} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={14} /> : <Eye size={14} />}</button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">{t("auth.register.confirmPasswordLabel")}</label>
              <input id="confirmPassword" type={showPassword ? "text" : "password"} className="form-input join-portal-input" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={MIN_PASSWORD_LENGTH} maxLength={128} autoComplete="new-password" />
            </div>
            {error && <div className="join-portal-error"><p role="alert">{error}</p></div>}
            <button type="submit" className="btn btn-primary join-portal-btn" disabled={loading || !email || !password || !confirmPassword}>{loading ? t("auth.register.submittingBtn") : t("auth.register.submitBtn")}</button>
          </form>

          <button type="button" className="join-portal-back-btn" onClick={() => void navigate({ to: "/auth/login" })}><ArrowLeft size={14} style={{ marginRight: 6 }} /> {t("auth.register.backToLoginBtn")}</button>
        </div>
      </div>
    </div>
  );
}
