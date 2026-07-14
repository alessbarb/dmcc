import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, LogIn, Ticket, UserPlus } from "lucide-react";
import { apiFetch, readApiError } from "../shared/api/apiClient.js";
import { fetchSession } from "../shared/auth/authClient.js";
import { rememberAuthReturnTo } from "../shared/auth/authReturnTo.js";
import { PortalTopBar } from "../shared/components/PortalTopBar.js";
import { RpgPortalBackground } from "../shared/components/RpgPortalBackground.js";

type InvitationPreview = {
  campaign: { campaignId: string; title: string; summary?: string | null };
  role: "player" | "co_dm";
  expiresAt?: string;
};

export function InvitationPage() {
  const navigate = useNavigate();
  const { inviteToken } = useParams({ strict: false }) as { inviteToken: string };
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      apiFetch(`/api/invitations/${encodeURIComponent(inviteToken)}`),
      fetchSession(),
    ]).then(async ([previewResponse, session]) => {
      if (!previewResponse.ok) throw new Error(await readApiError(previewResponse, "Invitación no válida o caducada"));
      setPreview(await previewResponse.json());
      setAuthenticated(session.sessionValid);
    }).catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : String(cause));
    }).finally(() => setLoading(false));
  }, [inviteToken]);

  const authenticateAt = (destination: "/auth/login" | "/auth/register") => {
    rememberAuthReturnTo(`/invitations/${inviteToken}`);
    void navigate({ to: destination });
  };

  const accept = async () => {
    setAccepting(true);
    setError(null);
    try {
      const response = await apiFetch(`/api/invitations/${encodeURIComponent(inviteToken)}/accept`, { init: { method: "POST" } });
      if (!response.ok) throw new Error(await readApiError(response, "No se pudo aceptar la invitación"));
      const result = await response.json();
      const destination = result.portal === "dm" ? "/dm" : "/player";
      void navigate({ to: destination });
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-main)" }}>
      <PortalTopBar />
      <div className="join-portal-container" style={{ flex: 1 }}>
        <div className="join-portal-background"><RpgPortalBackground /><div className="join-portal-radial-glow" /></div>
        <div className="join-portal-card" style={{ maxWidth: 620 }}>
          <div className="join-portal-header">
            <div className="join-portal-icon-wrapper"><Ticket className="join-portal-icon" size={32} /></div>
            <h1 className="join-portal-title">Invitación a campaña</h1>
            {preview && <p style={{ color: "var(--text-muted)" }}>Te han invitado a <strong>{preview.campaign.title}</strong>.</p>}
          </div>

          {loading && <p aria-live="polite">Cargando invitación…</p>}
          {error && <div className="join-portal-error"><p role="alert">{error}</p></div>}

          {preview && (
            <section className="glass-card" style={{ marginBottom: 20, padding: 16 }}>
              <h2 style={{ marginTop: 0 }}>{preview.campaign.title}</h2>
              {preview.campaign.summary && <p style={{ color: "var(--text-muted)" }}>{preview.campaign.summary}</p>}
              <p style={{ color: "var(--text-muted)" }}>Acceso ofrecido: {preview.role === "player" ? "Jugador" : "Codirector de juego"}</p>
            </section>
          )}

          {preview && !authenticated && (
            <div style={{ display: "grid", gap: 10 }}>
              <button type="button" className="btn btn-primary btn-full" onClick={() => authenticateAt("/auth/login")}><LogIn size={16} /> Iniciar sesión para continuar</button>
              <button type="button" className="btn btn-secondary btn-full" onClick={() => authenticateAt("/auth/register")}><UserPlus size={16} /> Crear cuenta para continuar</button>
            </div>
          )}

          {preview && authenticated && (
            <button type="button" className="btn btn-primary btn-full" disabled={accepting} onClick={() => void accept()}>
              {accepting ? "Aceptando…" : "Aceptar invitación"}
            </button>
          )}

          <button type="button" className="join-portal-back-btn" onClick={() => void navigate({ to: authenticated ? "/home" : "/" })}><ArrowLeft size={14} style={{ marginRight: 6 }} /> Volver</button>
        </div>
      </div>
    </div>
  );
}
