import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Lock, MessageCircle, Send, Users } from "lucide-react";
import { apiFetch, readApiError } from "../api/apiClient.js";

interface Participant {
  playerId: string;
  displayName: string;
}

interface CampaignMessage {
  messageId: string;
  content: string;
  audience: "party" | "dm" | "player";
  recipientPlayerId?: string | null;
  senderPlayerId?: string | null;
  senderName: string;
  sentByMe: boolean;
  createdAt: string;
  readByCount: number;
}

interface MessagingPayload {
  participants: Participant[];
  messages: CampaignMessage[];
}

interface CampaignMessagingPanelProps {
  campaignId: string;
  dmMode?: boolean;
}

function audienceLabel(message: CampaignMessage, participants: Participant[]): string {
  if (message.audience === "party") return "Canal de campaña";
  if (message.audience === "dm") return "Privado con Dirección de juego";
  const recipient = participants.find((candidate) => candidate.playerId === message.recipientPlayerId);
  return recipient ? `Privado con ${recipient.displayName}` : "Mensaje privado";
}

export function CampaignMessagingPanel({ campaignId, dmMode = false }: CampaignMessagingPanelProps) {
  const [payload, setPayload] = useState<MessagingPayload>({ participants: [], messages: [] });
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState<"party" | "dm" | "player">("party");
  const [recipientPlayerId, setRecipientPlayerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const response = await apiFetch(`/api/campaigns/${encodeURIComponent(campaignId)}/messages`);
    if (!response.ok) throw new Error(await readApiError(response, "No se pudieron cargar los mensajes"));
    setPayload(await response.json());
  }, [campaignId]);

  useEffect(() => {
    setLoading(true);
    void load().catch((cause) => setError(cause.message)).finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    const source = new EventSource(`/api/campaigns/${encodeURIComponent(campaignId)}/events/stream`);
    let refreshTimer: number | null = null;
    const refresh = () => {
      if (refreshTimer !== null) return;
      refreshTimer = window.setTimeout(() => {
        refreshTimer = null;
        void load().catch((cause) => setError(cause.message));
      }, 120);
    };
    source.addEventListener("player.portal.updated", refresh);
    source.addEventListener("campaign.updated", refresh);
    return () => {
      if (refreshTimer !== null) window.clearTimeout(refreshTimer);
      source.removeEventListener("player.portal.updated", refresh);
      source.removeEventListener("campaign.updated", refresh);
      source.close();
    };
  }, [campaignId, load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [payload.messages.length]);

  const selectedAudienceDescription = useMemo(() => {
    if (audience === "party") return "Visible para Dirección de juego y todos los jugadores.";
    if (audience === "dm") return "Solo visible para ti y Dirección de juego.";
    const recipient = payload.participants.find((candidate) => candidate.playerId === recipientPlayerId);
    return recipient ? `Solo visible para Dirección de juego, tú y ${recipient.displayName}.` : "Selecciona un jugador.";
  }, [audience, payload.participants, recipientPlayerId]);

  const sendMessage = async () => {
    const text = content.trim();
    if (!text || sending || (audience === "player" && !recipientPlayerId)) return;
    setSending(true);
    setError(null);
    try {
      const response = await apiFetch(`/api/campaigns/${encodeURIComponent(campaignId)}/messages`, {
        init: {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: text,
            audience,
            recipientPlayerId: audience === "player" ? recipientPlayerId : null,
          }),
        },
      });
      if (!response.ok) throw new Error(await readApiError(response, "No se pudo enviar el mensaje"));
      setContent("");
      await load();
    } catch (cause: any) {
      setError(cause.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="card" style={{ display: "grid", gridTemplateRows: "auto minmax(320px, 1fr) auto", minHeight: "min(720px, calc(100vh - 220px))", overflow: "hidden" }}>
      <header style={{ display: "flex", gap: 12, alignItems: "center", paddingBottom: 14, borderBottom: "1px solid var(--border-color)" }}>
        <div style={{ width: 42, height: 42, borderRadius: 14, display: "grid", placeItems: "center", background: "var(--surface-raised)" }}>
          <MessageCircle size={21} />
        </div>
        <div>
          <h2 style={{ margin: 0 }}>Mensajes de campaña</h2>
          <p style={{ margin: "3px 0 0", color: "var(--text-muted)", fontSize: 13 }}>
            {dmMode ? "Canal compartido de Dirección de juego y jugadores." : "Habla con Dirección de juego y el resto del grupo."}
          </p>
        </div>
      </header>

      <div aria-live="polite" style={{ overflowY: "auto", padding: "18px 4px", display: "flex", flexDirection: "column", gap: 12 }}>
        {loading && <p style={{ color: "var(--text-muted)" }}>Cargando mensajes…</p>}
        {!loading && payload.messages.length === 0 && (
          <div style={{ margin: "auto", textAlign: "center", color: "var(--text-muted)", maxWidth: 360 }}>
            <MessageCircle size={34} style={{ opacity: .5 }} />
            <p>Todavía no hay mensajes. Abre la conversación con el grupo.</p>
          </div>
        )}
        {payload.messages.map((message) => (
          <article key={message.messageId} style={{ alignSelf: message.sentByMe ? "flex-end" : "flex-start", width: "min(82%, 620px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, margin: "0 6px 4px", fontSize: 11, color: "var(--text-muted)" }}>
              <span>{message.senderName}</span>
              <span>{new Date(message.createdAt).toLocaleString()}</span>
            </div>
            <div style={{ padding: "11px 14px", borderRadius: message.sentByMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: message.sentByMe ? "var(--accent-soft)" : "var(--surface-raised)", border: "1px solid var(--border-color)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
              {message.content}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, margin: "4px 6px 0", fontSize: 10, color: "var(--text-muted)" }}>
              {message.audience === "party" ? <Users size={11} /> : <Lock size={11} />}
              <span>{audienceLabel(message, payload.participants)}</span>
              {message.sentByMe && <span>· leído por {message.readByCount}</span>}
            </div>
          </article>
        ))}
        <div ref={endRef} />
      </div>

      <footer style={{ borderTop: "1px solid var(--border-color)", paddingTop: 14, display: "grid", gap: 10 }}>
        {error && <p role="alert" style={{ margin: 0, color: "var(--danger)" }}>{error}</p>}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select className="form-select" value={audience} onChange={(event) => setAudience(event.target.value as typeof audience)} aria-label="Privacidad del mensaje">
            <option value="party">Canal de campaña</option>
            {!dmMode && <option value="dm">Privado con Dirección de juego</option>}
            <option value="player">Privado con un jugador</option>
          </select>
          {audience === "player" && (
            <select className="form-select" value={recipientPlayerId} onChange={(event) => setRecipientPlayerId(event.target.value)} aria-label="Jugador destinatario">
              <option value="">Seleccionar jugador…</option>
              {payload.participants.map((participant) => <option key={participant.playerId} value={participant.playerId}>{participant.displayName}</option>)}
            </select>
          )}
        </div>
        <small style={{ color: "var(--text-muted)" }}>{selectedAudienceDescription}</small>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "end" }}>
          <textarea className="form-textarea" rows={3} value={content} onChange={(event) => setContent(event.target.value)} placeholder="Escribe un mensaje…" onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void sendMessage();
            }
          }} />
          <button className="btn btn-primary" type="button" disabled={!content.trim() || sending || (audience === "player" && !recipientPlayerId)} onClick={() => void sendMessage()}>
            <Send size={16} /> Enviar
          </button>
        </div>
      </footer>
    </section>
  );
}
