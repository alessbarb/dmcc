import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Shield, Ticket, Users } from "lucide-react";
import { apiFetch, readApiError } from "../../shared/api/apiClient.js";
import { fetchAuthStatus, login, setupDmAccount } from "../../shared/auth/authClient.js";
import { PortalTopBar } from "../../shared/components/PortalTopBar.js";
import { RpgPortalBackground } from "../../shared/components/RpgPortalBackground.js";

 type Membership = {
  campaignId: string;
  title: string;
  role: "dm" | "co_dm" | "player" | "viewer" | "observer";
  playerId?: string | null;
};

type InvitationPreview = {
  campaign: { campaignId: string; title: string; summary?: string | null };
  role: string;
};

function campaignPath(membership: Pick<Membership, "campaignId" | "role">): string {
  return membership.role === "player"
    ? `/portal?campaignId=${encodeURIComponent(membership.campaignId)}&tab=home`
    : `/campaigns/${membership.campaignId}/command-center`;
}

export function PlayerJoinPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { inviteToken?: string; campaignId?: string };
  const inviteToken = params.inviteToken ?? params.campaignId ?? null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [invitation, setInvitation] = useState<InvitationPreview | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasInvite = Boolean(inviteToken);
  const title = hasInvite ? "Unirte a una campaña" : "Entrar en tus campañas";
  const subtitle = useMemo(() => {
    if (invitation) return `Invitación para ${invitation.campaign.title}`;
    if (hasInvite) return "Inicia sesión o crea una cuenta para aceptar la invitación.";
    return "Accede a las campañas donde tienes permiso como DM o jugador.";
  }, [hasInvite, invitation]);

  const loadMemberships = async () => {
    const response = await apiFetch("/api/campaigns");
    if (!response.ok) {
      setAuthenticated(false);
      setMemberships([]);
      return;
    }
    const campaigns = await response.json();
    setAuthenticated(true);
    setMemberships((Array.isArray(campaigns) ? campaigns : []).map((campaign: any) => ({
      campaignId: campaign.campaignId,
      title: campaign.title,
      role: campaign.role,
      playerId: campaign.playerId,
    })));
  };

  const loadInvitation = async () => {
    if (!inviteToken) return;
    const response = await apiFetch(`/api/invitations/${encodeURIComponent(inviteToken)}`);
    if (!response.ok) {
      setInvitation(null);
      setError(await readApiError(response, "Invitación no válida o caducada"));
      return;
    }
    setInvitation(await response.json());
  };

  useEffect(() => {
    void fetchAuthStatus()
      .then((status) => {
        setAuthenticated(status.sessionValid);
        if (status.sessionValid) void loadMemberships();
      })
      .catch(() => undefined);
    void loadInvitation();
  }, [inviteToken]);

  const enterCampaign = (membership: Membership) => {
    navigate({ to: campaignPath(membership) as any });
  };

  const acceptInvite = async () => {
    if (!inviteToken) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch(`/api/invitations/${encodeURIComponent(inviteToken)}/accept`, {
        init: { method: "POST" },
      });
      if (!response.ok) throw new Error(await readApiError(response, "No se pudo aceptar la invitación"));
      const body = await response.json();
      const campaignId = body.campaignId ?? invitation?.campaign.campaignId;
      if (!campaignId) throw new Error("La invitación no devolvió campaña");
      navigate({ to: `/portal?campaignId=${encodeURIComponent(campaignId)}&tab=home` as any });
    } catch (cause: any) {
      setError(cause.message || "No se pudo aceptar la invitación");
    } finally {
      setLoading(false);
    }
  };

  const authenticate = async (register: boolean) => {
    setLoading(true);
    setError(null);
    try {
      if (register) await setupDmAccount({ email, secret: password, displayName });
      else await login(email, password);
      setAuthenticated(true);
      await loadMemberships();
      if (inviteToken) await acceptInvite();
    } catch (cause: any) {
      setError(cause.message || "No se pudo autenticar la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-main)" }}>
      <PortalTopBar />
      <div className="join-portal-container" style={{ flex: 1 }}>
        <div className="join-portal-background"><RpgPortalBackground /><div className="join-portal-radial-glow" /></div>
        <div className="join-portal-card" style={{ maxWidth: 620 }}>
          <div className="join-portal-header">
            <div className="join-portal-icon-wrapper">{hasInvite ? <Ticket className="join-portal-icon" size={32} /> : <Shield className="join-portal-icon" size={32} />}</div>
            <h1 className="join-portal-title">{title}</h1>
            <p style={{ color: "var(--text-muted)" }}>{subtitle}</p>
          </div>

          {error && <div className="join-portal-error"><p>{error}</p></div>}

          {invitation && (
            <section className="glass-card" style={{ marginBottom: 20, padding: 16 }}>
              <h2 style={{ marginTop: 0 }}>{invitation.campaign.title}</h2>
              {invitation.campaign.summary && <p style={{ color: "var(--text-muted)" }}>{invitation.campaign.summary}</p>}
              <p style={{ color: "var(--text-muted)" }}>Rol ofrecido: {invitation.role}</p>
            </section>
          )}

          {!authenticated ? (
            <form className="join-portal-form" onSubmit={(event) => { event.preventDefault(); void authenticate(false); }}>
              <label className="form-label">Nombre visible</label>
              <input className="form-input" value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" />
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
              <label className="form-label">Contraseña</label>
              <input className="form-input" type="password" minLength={12} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
              <button className="btn btn-primary" disabled={loading}>Entrar</button>
              <button type="button" className="btn btn-secondary" disabled={loading} onClick={() => void authenticate(true)}>Crear cuenta y continuar</button>
            </form>
          ) : (
            <>
              {hasInvite && (
                <button className="btn btn-primary btn-full" disabled={loading || !invitation} onClick={() => void acceptInvite()}>
                  Aceptar invitación
                </button>
              )}

              {!hasInvite && (
                <section style={{ display: "grid", gap: 8 }}>
                  <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}><Users size={18} /> Tus campañas</h2>
                  {memberships.length === 0 && <p style={{ color: "var(--text-muted)" }}>Todavía no tienes campañas asociadas.</p>}
                  {memberships.map((membership) => (
                    <button className="btn btn-secondary" key={membership.campaignId} onClick={() => enterCampaign(membership)}>
                      {membership.title} · {membership.role}
                    </button>
                  ))}
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
