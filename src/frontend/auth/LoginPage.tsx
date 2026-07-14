import React, { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, ArrowLeft, Plus, UserRound } from "lucide-react";
import { login, fetchSession } from "../shared/auth/authClient.js";
import { consumeAuthReturnTo } from "../shared/auth/authReturnTo.js";
import { RpgPortalBackground } from "../shared/components/RpgPortalBackground.js";
import { PortalTopBar } from "../shared/components/PortalTopBar.js";
import { useTranslation } from "../shared/i18n/useTranslation.js";

export function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAfterMs, setRetryAfterMs] = useState(0);

  useEffect(() => {
    void fetchSession().then((session) => {
      if (session.sessionValid) window.location.assign(consumeAuthReturnTo());
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (retryAfterMs <= 0) return;
    const interval = window.setInterval(() => {
      setRetryAfterMs((previous) => Math.max(0, previous - 1000));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [retryAfterMs]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void (async () => {
      if (!email || !password || retryAfterMs > 0) return;
      setLoading(true);
      setError(null);
      try {
        await login(email, password);
        window.location.assign(consumeAuthReturnTo());
      } catch (cause: unknown) {
        const message = cause instanceof Error ? cause.message : String(cause);
        if (message.toLowerCase().includes("too many")) {
          const match = message.match(/\((\d+)s\)/);
          setRetryAfterMs(match ? Number(match[1]) * 1000 : 30_000);
          setError(t("auth.login.errorTooMany"));
        } else {
          setError(t("auth.login.errorInvalidCredentials"));
        }
      } finally {
        setLoading(false);
      }
    })();
  };

  const isBlocked = retryAfterMs > 0;
  const secondsLeft = Math.ceil(retryAfterMs / 1000);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-main)" }}>
      <PortalTopBar />
      <div className="join-portal-container" style={{ flex: 1 }}>
        <div className="join-portal-background"><RpgPortalBackground /><div className="join-portal-radial-glow" /></div>
        <div className="join-portal-card">
          <div className="join-portal-header">
            <div className="join-portal-icon-wrapper"><UserRound className="join-portal-icon" size={32} /><div className="join-portal-icon-glow" /></div>
            <h1 className="join-portal-title" style={{ fontSize: "1.3rem" }}>{t("auth.login.title")}</h1>
            <p style={{ color: "var(--text-muted)", margin: "4px 0 0" }}>{t("auth.login.subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="join-portal-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email">{t("auth.login.emailLabel")}</label>
              <input id="email" type="email" className="form-input join-portal-input" value={email} onChange={(event) => setEmail(event.target.value)} required autoFocus autoComplete="email" disabled={isBlocked} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">{t("auth.login.passwordLabel")}</label>
              <div className="access-code-input-wrapper">
                <input id="password" type={showPassword ? "text" : "password"} className="form-input join-portal-input" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" disabled={isBlocked} />
                <button type="button" className="input-icon" aria-label={showPassword ? t("auth.login.hidePasswordLabel") : t("auth.login.showPasswordLabel")} style={{ cursor: "pointer", background: "none", border: "none", padding: 0 }} onClick={() => setShowPassword((value) => !value)}>
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            {error && <div className="join-portal-error"><p role="alert">{error}{isBlocked && ` (${secondsLeft}s)`}</p></div>}
            <button type="submit" className="btn btn-primary join-portal-btn" disabled={loading || !email || !password || isBlocked}>
              {loading ? t("auth.login.submittingBtn") : isBlocked ? t("auth.login.waitBtn", { seconds: secondsLeft }) : t("auth.login.submitBtn")}
            </button>
          </form>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            <button type="button" className="btn btn-secondary" style={{ width: "100%" }} onClick={() => void navigate({ to: "/auth/register" })}><Plus size={14} /> {t("auth.login.createAccountBtn")}</button>
            <button type="button" className="btn btn-secondary" style={{ width: "100%" }} onClick={() => void navigate({ to: "/" })}><ArrowLeft size={14} /> {t("auth.login.backBtn")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
