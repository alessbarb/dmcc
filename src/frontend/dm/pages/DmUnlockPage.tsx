import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Shield, Eye, EyeOff, ArrowLeft, Plus, UserRound } from "lucide-react";
import { loginDm, fetchAuthStatus } from "../../shared/auth/authClient.js";
import { readIdentity } from "../../shared/auth/localIdentity.js";
import { RpgPortalBackground } from "../../shared/components/RpgPortalBackground.js";
import { PortalTopBar } from "../../shared/components/PortalTopBar.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

export function DmUnlockPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const rememberedProfiles = useMemo(
    () => [...readIdentity().dmProfiles].sort((a, b) => b.lastAccessed.localeCompare(a.lastAccessed)),
    []
  );
  const rememberedEmail = rememberedProfiles[0]?.email ?? "";
  const [email, setEmail] = useState(rememberedEmail);
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAfterMs, setRetryAfterMs] = useState<number>(0);
  const [lanWarning, setLanWarning] = useState(false);

  useEffect(() => {
    fetchAuthStatus().then((status) => {
      if (!status.dmAccountConfigured) navigate({ to: "/dm/setup" });
      if (status.lanExposed) setLanWarning(true);
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
      navigate({ to: "/dm" });
    } catch (err: any) {
      if (err.message?.toLowerCase().includes("too many")) {
        const match = err.message.match(/\((\d+)s\)/);
        setRetryAfterMs(match ? Number(match[1]) * 1000 : 30_000);
        setError(t("dmUnlock.errorTooMany"));
      } else {
        setError(t("dmUnlock.errorWrongSecret"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfile = (profileEmail: string) => {
    setEmail(profileEmail);
    setSecret("");
    setError(null);
  };

  const handleUseAnotherEmail = () => {
    setEmail("");
    setSecret("");
    setError(null);
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
            <h1 className="join-portal-title" style={{ fontSize: "1.3rem" }}>{t("dmUnlock.title")}</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "4px 0 0" }}>
              {t("dmUnlock.subtitle")}
            </p>
          </div>

          {lanWarning && (
            <div style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)", borderRadius: "8px", padding: "10px 12px", marginBottom: "12px", fontSize: "0.8rem", color: "#facc15" }}>
              {t("dmUnlock.lanWarning")}
            </div>
          )}

          {rememberedProfiles.length > 0 && (
            <section style={{ marginBottom: "14px", padding: "12px", border: "1px solid var(--border)", borderRadius: "12px", background: "rgba(255,255,255,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start", marginBottom: "10px" }}>
                <div>
                  <p style={{ margin: 0, color: "var(--text-main)", fontWeight: 700, fontSize: "0.86rem" }}>{t("dmUnlock.savedAccountsTitle")}</p>
                  <p style={{ margin: "2px 0 0", color: "var(--text-muted)", fontSize: "0.76rem" }}>{t("dmUnlock.savedAccountsHint")}</p>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleUseAnotherEmail}
                  style={{ whiteSpace: "nowrap" }}
                >
                  {t("dmUnlock.useAnotherEmail")}
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {rememberedProfiles.map((profile) => {
                  const selected = profile.email === email;
                  return (
                    <button
                      key={profile.dmId}
                      type="button"
                      onClick={() => handleSelectProfile(profile.email)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        width: "100%",
                        padding: "9px 10px",
                        borderRadius: "10px",
                        border: selected ? "1px solid var(--accent)" : "1px solid var(--border)",
                        background: selected ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.03)",
                        color: "var(--text-main)",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <UserRound size={15} />
                      <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                        <strong style={{ fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.displayName || profile.email}</strong>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.email}</span>
                      </span>
                      {selected && (
                        <span style={{ marginLeft: "auto", color: "var(--accent)", fontSize: "0.72rem", fontWeight: 700 }}>{t("dmUnlock.selectedAccount")}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <form onSubmit={handleSubmit} className="join-portal-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email">{t("dmUnlock.emailLabel")}</label>
              <input
                id="email"
                type="email"
                className="form-input join-portal-input"
                placeholder={t("dmUnlock.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus={!email}
                autoComplete="email"
                disabled={isBlocked}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="secret">{t("dmUnlock.secretLabel")}</label>
              <div className="access-code-input-wrapper">
                <input
                  id="secret"
                  type={showSecret ? "text" : "password"}
                  className="form-input join-portal-input"
                  placeholder={t("dmUnlock.secretPlaceholder")}
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
                ? t("dmUnlock.checkingBtn")
                : isBlocked
                ? t("dmUnlock.waitBtn", { seconds: String(secondsLeft) })
                : t("dmUnlock.unlockBtn")}
            </button>
          </form>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
            <button type="button" className="join-portal-back-btn" onClick={() => navigate({ to: "/dm/setup" })}>
              <Plus size={14} style={{ marginRight: "6px" }} /> {t("dmUnlock.addAnotherDm")}
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
