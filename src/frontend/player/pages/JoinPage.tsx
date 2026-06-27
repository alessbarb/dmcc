import React, { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { RpgPortalBackground } from "../../shared/components/RpgPortalBackground.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { Shield, Key, Sparkles, ArrowLeft } from "lucide-react";

export function JoinPage() {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCampaignId = (id: string) => {
    if (!id) return "";
    const withoutPrefix = id.startsWith("cmp_") ? id.slice(4) : id;
    return withoutPrefix
      .split(/[_-]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const vaultId = useCampaignStore.getState().activeVaultId || "default";
      const res = await fetch(`/api/join/${campaignId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-vault-id": vaultId,
        },
        body: JSON.stringify({ accessCode: accessCode.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("playerPortal.join.fallbackJoinError"));
        setLoading(false);
        return;
      }

      const { playerToken, playerId } = data as { playerToken: string; playerId: string; campaignTitle: string };

      sessionStorage.setItem("dmcc_role", "player");
      sessionStorage.setItem("dmcc_playerId", playerId);
      sessionStorage.setItem("dmcc_accessCode", accessCode.trim());
      sessionStorage.setItem("dmcc_playerToken", playerToken);

      await useCampaignStore.getState().selectCampaign(campaignId);

      navigate({ to: `/campaigns/${campaignId}/player-portal` });
    } catch (err: any) {
      setError(err.message || t("playerPortal.join.connectionError"));
      setLoading(false);
    }
  };

  return (
    <div className="join-portal-container">
      {/* Background Interactive canvas preview */}
      <div className="join-portal-background">
        <RpgPortalBackground />
        <div className="join-portal-radial-glow" />
      </div>

      {/* Glassmorphic Portal Card */}
      <div className="join-portal-card">
        <div className="join-portal-header">
          <div className="join-portal-icon-wrapper">
            <Shield className="join-portal-icon" size={32} />
            <div className="join-portal-icon-glow" />
          </div>
          <span className="join-portal-badge">
            <Sparkles size={12} style={{ marginRight: "4px" }} />
            {t("playerPortal.title")}
          </span>
          <h1 className="join-portal-title">
            DM Campaign <span>Companion</span>
          </h1>
          <p className="join-portal-subtitle">
            {t("playerPortal.join.campaignLabel", { name: formatCampaignId(campaignId) })}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="join-portal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="accessCode">
              {t("playerPortal.join.accessCode")}
            </label>
            <div className="access-code-input-wrapper">
              <Key size={16} className="input-icon" />
              <input
                id="accessCode"
                type="text"
                className="form-input join-portal-input"
                placeholder={t("playerPortal.join.accessCodePlaceholder")}
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                required
                autoFocus
                autoComplete="off"
              />
            </div>
          </div>

          {error && (
            <div className="join-portal-error">
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary join-portal-btn"
            disabled={loading || !accessCode.trim()}
          >
            {loading ? t("playerPortal.join.openingPortal") : t("playerPortal.join.submit")}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="join-portal-back-btn"
        >
          <ArrowLeft size={14} style={{ marginRight: "6px" }} />
          {t("playerPortal.join.backHome")}
        </button>
      </div>
    </div>
  );
}
