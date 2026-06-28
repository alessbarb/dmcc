import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Shield, ArrowLeft, Link2 } from "lucide-react";
import { RpgPortalBackground } from "../../shared/components/RpgPortalBackground.js";
import { PortalTopBar } from "../../shared/components/PortalTopBar.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

export function PlayerJoinPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [inviteUrl, setInviteUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLinkRedirect = () => {
    if (!inviteUrl.trim()) return;
    setError(null);
    try {
      const url = new URL(inviteUrl.trim());
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "register" && parts.length >= 3) {
        navigate({ to: `/register/${parts[1]}/${parts[2]}` });
      } else {
        setError(t("playerJoin.errorInvalidFormat"));
      }
    } catch {
      setError(t("playerJoin.errorInvalidUrl"));
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
            <h1 className="join-portal-title" style={{ fontSize: "1.3rem" }}>{t("playerJoin.title")}</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
              {t("playerJoin.inviteLinkHint")}
            </p>
          </div>

          <div className="join-portal-form">
            <div className="form-group">
              <label className="form-label" htmlFor="inviteUrl">
                <Link2 size={13} style={{ marginRight: "5px", verticalAlign: "middle" }} />
                {t("playerJoin.linkLabel")}
              </label>
              <input
                id="inviteUrl"
                type="text"
                className="form-input join-portal-input"
                placeholder={t("playerJoin.linkPlaceholder")}
                value={inviteUrl}
                onChange={(e) => setInviteUrl(e.target.value)}
                autoFocus
                autoComplete="off"
                onKeyDown={(e) => { if (e.key === "Enter") handleLinkRedirect(); }}
              />
            </div>
            {error && <div className="join-portal-error"><p>{error}</p></div>}
            <button
              type="button"
              className="btn btn-primary join-portal-btn"
              disabled={!inviteUrl.trim()}
              onClick={handleLinkRedirect}
            >
              {t("playerJoin.continueBtn")}
            </button>
          </div>

          <button type="button" className="join-portal-back-btn" onClick={() => navigate({ to: "/" })}>
            <ArrowLeft size={14} style={{ marginRight: "6px" }} /> {t("playerJoin.backHome")}
          </button>
        </div>
      </div>
    </div>
  );
}
