import React, { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Shield, Eye, EyeOff, ArrowLeft, Plus } from "lucide-react";
import { loginDm, fetchAuthStatus } from "../../shared/auth/authClient.js";
import { RpgPortalBackground } from "../../shared/components/RpgPortalBackground.js";
import { PortalTopBar } from "../../shared/components/PortalTopBar.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

export function DmLoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAfterMs, setRetryAfterMs] = useState<number>(0);
  useEffect(() => {
    fetchAuthStatus().then((status) => {
      if (!status.accountConfigured) navigate({ to: "/dm/setup" });
    }).catch(() => {});
  }, [navigate]);

  useEffect(() => {
    if (retryAfterMs <= 0) return;
    const interval = setInterval(() => {
      setRetryAfterMs((prev) => {
        const next = prev - 1000;
        if (next <= 0) { clearInterval(interval); return 0; }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [retryAfterMs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !secret || retryAfterMs > 0) return;
    setLoading(true);
    setError(null);
    try {
      await loginDm(email, secret);
      navigate({ to: "/portal" });
    } catch (err: any) {
      if (err.message?.toLowerCase().includes("too many")) {
        const match = err.message.match(/\((\d+)s\)/);
        setRetryAfterMs(match ? Number(match[1]) * 1000 : 30_000);
        setError(t("dmLogin.errorTooMany"));
      } else {
        setError(t("dmLogin.errorWrongSecret"));
      }
    } finally {
      setLoading(false);
    }
  };

  const isBlocked = retryAfterMs > 0;
  const secondsLeft = Math.ceil(retryAfterMs / 1000);

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
            <h1 className="join-portal-title" style={{ fontSize: "1.3rem" }}>{t("dmLogin.title")}</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "4px 0 0" }}>
              {t("dmLogin.subtitle")}
            </p>
          </div>


          <form onSubmit={handleSubmit} className="join-portal-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email">{t("dmLogin.emailLabel")}</label>
              <input
                id="email"
                type="email"
                className="form-input join-portal-input"
                placeholder={t("dmLogin.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus={!email}
                autoComplete="email"
                disabled={isBlocked}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="secret">{t("dmLogin.secretLabel")}</label>
              <div className="access-code-input-wrapper">
                <input
                  id="secret"
                  type={showSecret ? "text" : "password"}
                  className="form-input join-portal-input"
                  placeholder={t("dmLogin.secretPlaceholder")}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  required
                  autoFocus={!!email}
                  autoComplete="current-password"
                  disabled={isBlocked}
                />
                <button type="button" className="input-icon" style={{ cursor: "pointer", background: "none", border: "none", padding: 0 }} onClick={() => setShowSecret((v) => !v)}>
                  {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="join-portal-error">
                <p>{error}{isBlocked && ` (${secondsLeft}s)`}</p>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary join-portal-btn"
              disabled={loading || !email || !secret || isBlocked}
            >
              {loading
                ? t("dmLogin.checkingBtn")
                : isBlocked
                ? t("dmLogin.waitBtn", { seconds: String(secondsLeft) })
                : t("dmLogin.loginBtn")}
            </button>
          </form>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
            <button type="button" className="btn btn-secondary" style={{ width: "100%" }} onClick={() => navigate({ to: "/dm/setup" })}>
              <Plus size={14} style={{ marginRight: "6px" }} />
              {t("dmLogin.createAccount")}
            </button>
            <button type="button" className="btn btn-secondary" style={{ width: "100%" }} onClick={() => navigate({ to: "/forgot-password" })}>
              Recuperar contraseña
            </button>
            <button type="button" className="join-portal-back-btn" onClick={() => navigate({ to: "/" })}>
              <ArrowLeft size={14} style={{ marginRight: "6px" }} /> {t("common.back")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
