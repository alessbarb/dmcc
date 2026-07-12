import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Lock, MessageCircle, Send, Users } from "lucide-react";
import { apiFetch, readApiError } from "../api/apiClient.js";
import { useTranslation } from "../i18n/useTranslation.js";

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

export function CampaignMessagingPanel({ campaignId, dmMode = false }: CampaignMessagingPanelProps) {
  const { t } = useTranslation();
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
    if (!response.ok) throw new Error(await readApiError(response, t("playerPortal.messaging.loading")));
    setPayload(await response.json());
  }, [campaignId, t]);

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
    if (audience === "party") return t("playerPortal.messaging.partyDescription");
    if (audience === "dm") return t("playerPortal.messaging.dmDescription");
    return recipientPlayerId
      ? t("playerPortal.messaging.playerDescription")
      : t("playerPortal.messaging.selectPlayer");
  }, [audience, recipientPlayerId, t]);

  const audienceLabel = (message: CampaignMessage): string => {
    if (message.audience === "party") return t("playerPortal.messaging.channelParty");
    if (message.audience === "dm") return t("playerPortal.messaging.channelDm");
    const recipient = payload.participants.find((candidate) => candidate.playerId === message.recipientPlayerId);
    return recipient
      ? `${t("playerPortal.messaging.privateWith")} ${recipient.displayName}`
      : t("playerPortal.messaging.privateMessage");
  };

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
      if (!response.ok) throw new Error(await readApiError(response, t("playerPortal.messaging.send")));
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
          <h2 style={{ margin: 0 }}>{t("playerPortal.messaging.heading")}</h2>
          <p style={{ margin: "3px 0 0", color: "var(--text-muted)", fontSize: 13 }}>
            {t(dmMode ? "playerPortal.messaging.dmSubtitle" : "playerPortal.messaging.playerSubtitle")}
          </p>
        </div>
      </header>

      <div aria-live="polite" style={{ overflowY: "auto", padding: "18px 4px", display: "flex", flexDirection: "column", gap: 12 }}>
        {loading && <p style={{ color: "var(--text-muted)" }}>{t("playerPortal.messaging.loading")}</p>}
        {!loading && payload.messages.length === 0 && (
          <div style={{ margin: "auto", textAlign: "center", color: "var(--text-muted)", maxWidth: 360 }}>
            <MessageCircle size={34} style={{ opacity: .5 }} />
            <p>{t("playerPortal.messaging.empty")}</p>
          </div>
        )}
        {payload.messages.map((message) => (
          <article key={message.messageId} style={{ alignSelf: message.sentByMe ? "flex-end" : "flex-start", width: "min(82%, 620px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, margin: "0 6px 4px", fontSize: 11, color: "var(--text-muted)" }}>
              <span>{message.senderPlayerId ? message.senderName : t("playerPortal.messaging.directionName")}</span>
              <span>{new Date(message.createdAt).toLocaleString()}</span>
            </div>
            <div style={{ padding: "11px 14px", borderRadius: message.sentByMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: message.sentByMe ? "var(--accent-soft)" : "var(--surface-raised)", border: "1px solid var(--border-color)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
              {message.content}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, margin: "4px 6px 0", fontSize: 10, color: "var(--text-muted)" }}>
              {message.audience === "party" ? <Users size={11} /> : <Lock size={11} />}
              <span>{audienceLabel(message)}</span>
              {message.sentByMe && <span>· {t("playerPortal.messaging.readBy")} {message.readByCount}</span>}
            </div>
          </article>
        ))}
        <div ref={endRef} />
      </div>

      <footer style={{ borderTop: "1px solid var(--border-color)", paddingTop: 14, display: "grid", gap: 10 }}>
        {error && <p role="alert" style={{ margin: 0, color: "var(--danger)" }}>{error}</p>}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select className="form-select" value={audience} onChange={(event) => setAudience(event.target.value as typeof audience)} aria-label={t("playerPortal.messaging.channelParty")}>
            <option value="party">{t("playerPortal.messaging.channelParty")}</option>
            {!dmMode && <option value="dm">{t("playerPortal.messaging.channelDm")}</option>}
            <option value="player">{t("playerPortal.messaging.channelPlayer")}</option>
          </select>
          {audience === "player" && (
            <select className="form-select" value={recipientPlayerId} onChange={(event) => setRecipientPlayerId(event.target.value)} aria-label={t("playerPortal.messaging.selectPlayer")}>
              <option value="">{t("playerPortal.messaging.selectPlayer")}</option>
              {payload.participants.map((participant) => <option key={participant.playerId} value={participant.playerId}>{participant.displayName}</option>)}
            </select>
          )}
        </div>
        <small style={{ color: "var(--text-muted)" }}>{selectedAudienceDescription}</small>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "end" }}>
          <textarea className="form-textarea" rows={3} value={content} onChange={(event) => setContent(event.target.value)} placeholder={t("playerPortal.messaging.placeholder")} onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void sendMessage();
            }
          }} />
          <button className="btn btn-primary" type="button" disabled={!content.trim() || sending || (audience === "player" && !recipientPlayerId)} onClick={() => void sendMessage()}>
            <Send size={16} /> {t("playerPortal.messaging.send")}
          </button>
        </div>
      </footer>
    </section>
  );
}
