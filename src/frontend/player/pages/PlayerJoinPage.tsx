import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Ticket } from "lucide-react";
import { PortalTopBar } from "../../shared/components/PortalTopBar.js";
import { RpgPortalBackground } from "../../shared/components/RpgPortalBackground.js";

function normalizeInvitationToken(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    const segments = url.pathname.split("/").filter(Boolean);
    return segments.at(-1) ?? "";
  } catch {
    return trimmed.replace(/^.*\/invitations\//, "").replace(/^.*\/join\//, "");
  }
}

export function PlayerJoinPage() {
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState("");
  const [error, setError] = useState<string | null>(null);

  const continueToInvitation = () => {
    const inviteToken = normalizeInvitationToken(invitation);
    if (!inviteToken) {
      setError("Introduce el enlace o el token de la invitación.");
      return;
    }
    void navigate({ to: "/invitations/$inviteToken", params: { inviteToken } });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-main)" }}>
      <PortalTopBar />
      <div className="join-portal-container" style={{ flex: 1 }}>
        <div className="join-portal-background"><RpgPortalBackground /><div className="join-portal-radial-glow" /></div>
        <div className="join-portal-card" style={{ maxWidth: 620 }}>
          <div className="join-portal-header">
            <div className="join-portal-icon-wrapper"><Ticket className="join-portal-icon" size={32} /></div>
            <h1 className="join-portal-title">Unirte a una campaña</h1>
            <p style={{ color: "var(--text-muted)" }}>Pega el enlace completo o el token que te ha enviado el director de juego.</p>
          </div>

          <form className="join-portal-form" onSubmit={(event) => { event.preventDefault(); continueToInvitation(); }}>
            <label className="form-label" htmlFor="invitation-token">Invitación</label>
            <input
              id="invitation-token"
              className="form-input"
              value={invitation}
              onChange={(event) => setInvitation(event.target.value)}
              placeholder="https://…/invitations/inv_…"
              autoComplete="off"
              autoFocus
            />
            {error && <div className="join-portal-error"><p role="alert">{error}</p></div>}
            <button type="submit" className="btn btn-primary btn-full" disabled={!invitation.trim()}>
              Continuar <ArrowRight size={16} />
            </button>
          </form>

          <button type="button" className="join-portal-back-btn" onClick={() => void navigate({ to: "/home" })}>
            <ArrowLeft size={14} style={{ marginRight: 6 }} /> Volver a portales
          </button>
        </div>
      </div>
    </div>
  );
}
