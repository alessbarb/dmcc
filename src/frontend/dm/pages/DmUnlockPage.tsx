import React, { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Shield, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { unlockDm, fetchAuthStatus } from "../../shared/auth/authClient.js";
import { RpgPortalBackground } from "../../shared/components/RpgPortalBackground.js";
import { PortalTopBar } from "../../shared/components/PortalTopBar.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

export function DmUnlockPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAfterMs, setRetryAfterMs] = useState<number>(0);
  const [lanWarning, setLanWarning] = useState(false);

  useEffect(() => {
    fetchAuthStatus().then((status) => {
      if (!status.dmPinConfigured) navigate({ to: "/dm/setup" });
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
    if (!pin || retryAfterMs > 0) return;
    setLoading(true);
    setError(null);
    try {
      await unlockDm(pin);
      navigate({ to: "/dm" });
    } catch (err: any) {
      if (err.message?.includes("429") || err.message?.toLowerCase().includes("too many")) {
        setRetryAfterMs(30_000);
        setError(t("dmUnlock.errorTooMany"));
      } else {
        setError(t("dmUnlock.errorWrongPin"));
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

        <form onSubmit={handleSubmit} className="join-portal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="pin">{t("dmUnlock.pinLabel")}</label>
            <div className="access-code-input-wrapper">
              <input
                id="pin"
                type={showPin ? "text" : "password"}
                className="form-input join-portal-input"
                placeholder={t("dmUnlock.pinPlaceholder")}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                autoFocus
                autoComplete="current-password"
                disabled={isBlocked}
              />
              <button type="button" className="input-icon" style={{ cursor: "pointer", background: "none", border: "none", padding: 0 }} onClick={() => setShowPin((v) => !v)}>
                {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
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
            disabled={loading || !pin || isBlocked}
          >
            {loading
              ? t("dmUnlock.checkingBtn")
              : isBlocked
              ? t("dmUnlock.waitBtn", { seconds: String(secondsLeft) })
              : t("dmUnlock.unlockBtn")}
          </button>
        </form>

        <button type="button" className="join-portal-back-btn" onClick={() => navigate({ to: "/" })}>
          <ArrowLeft size={14} style={{ marginRight: "6px" }} /> {t("common.back")}
        </button>
      </div>
      </div>
    </div>
  );
}
