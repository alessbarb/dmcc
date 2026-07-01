import React, { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { apiFetch, readApiError } from "../../shared/api/apiClient.js";
import { fetchAuthStatus, loginDm, setupDmAccount } from "../../shared/auth/authClient.js";
import { PortalTopBar } from "../../shared/components/PortalTopBar.js";
import { RpgPortalBackground } from "../../shared/components/RpgPortalBackground.js";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

type Membership = {
  campaignId: string;
  title: string;
  role: "dm" | "player" | "observer";
};

export function PlayerJoinPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const vaultId = useCampaignStore((state) => state.activeVaultId) || "default";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMemberships = async () => {
    const response = await apiFetch("/api/me/campaigns", { vaultId });
    if (!response.ok) {
      setAuthenticated(false);
      setMemberships([]);
      return;
    }
    const body = await response.json();
    setAuthenticated(true);
    setMemberships(body.campaigns ?? []);
  };

  useEffect(() => {
    void fetchAuthStatus().then((status) => {
      if (status.dmSessionValid) void loadMemberships();
    }).catch(() => undefined);
  }, [vaultId]);

  const enterCampaign = (membership: Membership) => {
    const store = useCampaignStore.getState();
    if (membership.role === "player") {
      store.enterPlayerCampaign(membership.campaignId);
      navigate({ to: `/campaigns/${membership.campaignId}/player-portal` });
    } else {
      store.selectCampaign(membership.campaignId);
      navigate({ to: `/campaigns/${membership.campaignId}/dashboard` });
    }
  };

  const authenticate = async (register: boolean) => {
    setLoading(true);
    setError(null);
    try {
      if (register) {
        await setupDmAccount({ email, secret: password, displayName });
      } else {
        await loginDm(email, password);
      }
      await loadMemberships();
    } catch (cause: any) {
      setError(cause.message || t("playerJoin.rejoinConnectionError"));
    } finally {
      setLoading(false);
    }
  };

  const joinCampaign = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch(`/api/campaigns/${campaignId.trim()}/join`, {
        vaultId,
        init: {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessCode: accessCode.trim() }),
        },
      });
      if (!response.ok) throw new Error(await readApiError(response, t("playerJoin.rejoinError")));
      await loadMemberships();
      const body = await response.json();
      enterCampaign({ ...body.membership, title: body.campaign?.title ?? campaignId });
    } catch (cause: any) {
      setError(cause.message || t("playerJoin.rejoinConnectionError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-main)" }}>
      <PortalTopBar />
      <div className="join-portal-container" style={{ flex: 1 }}>
        <div className="join-portal-background"><RpgPortalBackground /><div className="join-portal-radial-glow" /></div>
        <div className="join-portal-card" style={{ maxWidth: 560 }}>
          <div className="join-portal-header">
            <div className="join-portal-icon-wrapper"><Shield className="join-portal-icon" size={32} /></div>
            <h1 className="join-portal-title">Acceso a campañas</h1>
            <p style={{ color: "var(--text-muted)" }}>Tu cuenta identifica quién eres. Los códigos solo conceden acceso a una campaña.</p>
          </div>
          {error && <div className="join-portal-error"><p>{error}</p></div>}
          {!authenticated ? (
            <form className="join-portal-form" onSubmit={(event) => { event.preventDefault(); void authenticate(false); }}>
              <label className="form-label">Nombre visible (solo para registro)</label>
              <input className="form-input" value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" />
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
              <label className="form-label">Contraseña</label>
              <input className="form-input" type="password" minLength={12} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
              <button className="btn btn-primary" disabled={loading}>Entrar</button>
              <button type="button" className="btn btn-secondary" disabled={loading} onClick={() => void authenticate(true)}>Crear cuenta</button>
            </form>
          ) : (
            <>
              {memberships.length > 0 && (
                <section style={{ display: "grid", gap: 8, marginBottom: 24 }}>
                  <h2>Tus campañas</h2>
                  {memberships.map((membership) => (
                    <button className="btn btn-secondary" key={membership.campaignId} onClick={() => enterCampaign(membership)}>
                      {membership.title} · {membership.role}
                    </button>
                  ))}
                </section>
              )}
              <form className="join-portal-form" onSubmit={joinCampaign}>
                <h2>Unirse con código</h2>
                <label className="form-label">ID de campaña</label>
                <input className="form-input" value={campaignId} onChange={(event) => setCampaignId(event.target.value)} required />
                <label className="form-label">Código de acceso</label>
                <input className="form-input" value={accessCode} onChange={(event) => setAccessCode(event.target.value)} required autoComplete="off" />
                <button className="btn btn-primary" disabled={loading}>Unirse</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
