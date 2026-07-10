import React, { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { apiFetch, readApiError } from "../../shared/api/apiClient.js";
import { login, setupDmAccount } from "../../shared/auth/authClient.js";
import { RpgPortalBackground } from "../../shared/components/RpgPortalBackground.js";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

export function RegisterPage() {
  const { campaignId, inviteToken } = useParams({ strict: false }) as { campaignId: string; inviteToken: string };
  const navigate = useNavigate();
  const { t } = useTranslation();
  const token = inviteToken || campaignId;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent, register: boolean) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (register) await setupDmAccount({ email, secret: password, displayName });
      else await login(email, password);
      const response = await apiFetch(`/api/invitations/${encodeURIComponent(token)}/accept`, {
        init: { method: "POST" },
      });
      if (!response.ok) throw new Error(await readApiError(response, t("playerJoin.rejoinError")));
      const body = await response.json().catch(() => ({}));
      const nextCampaignId = body.campaignId ?? campaignId;
      useCampaignStore.getState().enterPlayerCampaign(nextCampaignId);
      navigate({ to: body.playerPortalPath ?? `/player/campaigns/${nextCampaignId}` });
    } catch (cause: any) {
      setError(cause.message || t("playerJoin.rejoinConnectionError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-portal-container">
      <div className="join-portal-background"><RpgPortalBackground /><div className="join-portal-radial-glow" /></div>
      <div className="join-portal-card" style={{ maxWidth: 440 }}>
        <div className="join-portal-header">
          <div className="join-portal-icon-wrapper"><Shield className="join-portal-icon" size={32} /></div>
          <h1 className="join-portal-title">{t("playerJoin.claimTitle")}</h1>
          <p style={{ color: "var(--text-muted)" }}>{t("playerJoin.claimHint")}</p>
        </div>
        {error && <div className="join-portal-error"><p>{error}</p></div>}
        <form className="join-portal-form" onSubmit={(event) => void submit(event, false)}>
          <label className="form-label">{t("playerJoin.displayNameRegisterLabel")}</label>
          <input className="form-input" value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" />
          <label className="form-label">{t("playerJoin.emailLabel")}</label>
          <input className="form-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
          <label className="form-label">{t("playerJoin.passwordLabel")}</label>
          <input className="form-input" type="password" minLength={12} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
          <button className="btn btn-primary" disabled={loading}>{t("playerJoin.signInClaimBtn")}</button>
          <button type="button" className="btn btn-secondary" disabled={loading} onClick={(event) => void submit(event as any, true)}>{t("playerJoin.createClaimBtn")}</button>
        </form>
      </div>
    </div>
  );
}
