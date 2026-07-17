import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, Lock, MessageCircle, RefreshCw, Send, Users } from "lucide-react";
import { apiFetch, readApiError } from "../api/apiClient.js";
import { useTranslation } from "../i18n/useTranslation.js";

const MAX_MESSAGE_LENGTH = 4_000;
const NEAR_BOTTOM_THRESHOLD_PX = 96;
const SENDER_COLORS = [
  "#2563eb", "#7c3aed", "#db2777", "#dc2626", "#ea580c",
  "#ca8a04", "#16a34a", "#0d9488", "#0891b2", "#4f46e5",
] as const;

type Audience = "party" | "dm" | "player";

interface Participant { playerId: string; displayName: string }
interface CampaignMessage {
  messageId: string;
  content: string;
  audience: Audience;
  recipientPlayerId?: string | null;
  senderPlayerId?: string | null;
  senderName: string;
  senderColorIndex: number;
  sentByMe: boolean;
  createdAt: string;
  readByMe: boolean;
  readByCount: number;
}
interface MessagingPageInfo { hasMore: boolean; nextCursor: string | null }
interface MessagingPayload { participants: Participant[]; messages: CampaignMessage[]; pageInfo: MessagingPageInfo }
interface PendingMessage {
  localId: string;
  clientMessageId: string;
  content: string;
  audience: Audience;
  recipientPlayerId: string | null;
  createdAt: string;
  status: "sending" | "failed";
}
interface CampaignMessagingPanelProps { campaignId: string; dmMode?: boolean }

function mergeMessages(...collections: CampaignMessage[][]): CampaignMessage[] {
  const byId = new Map<string, CampaignMessage>();
  for (const messages of collections) for (const message of messages) byId.set(message.messageId, message);
  return [...byId.values()].sort((left, right) => {
    const dateDifference = new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
    return dateDifference || left.messageId.localeCompare(right.messageId);
  });
}

function isNearBottom(element: HTMLDivElement | null): boolean {
  if (!element) return true;
  return element.scrollHeight - element.scrollTop - element.clientHeight <= NEAR_BOTTOM_THRESHOLD_PX;
}

function senderColor(index: number): string {
  return SENDER_COLORS[Math.abs(index) % SENDER_COLORS.length] ?? SENDER_COLORS[0];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAudience(value: string): value is Audience {
  return value === "party" || value === "dm" || value === "player";
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export function CampaignMessagingPanel({ campaignId, dmMode = false }: CampaignMessagingPanelProps) {
  const { t } = useTranslation();
  const [payload, setPayload] = useState<MessagingPayload>({ participants: [], messages: [], pageInfo: { hasMore: false, nextCursor: null } });
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState<Audience>("party");
  const [recipientPlayerId, setRecipientPlayerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<PendingMessage | null>(null);
  const [unseenCount, setUnseenCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const initialLoadCompleteRef = useRef(false);
  const nearBottomRef = useRef(true);
  const loadedMessageIdsRef = useRef(new Set<string>());
  const payloadRef = useRef(payload);

  useEffect(() => { payloadRef.current = payload; }, [payload]);

  const markMessagesRead = useCallback(async (messages: CampaignMessage[]) => {
    if (document.visibilityState !== "visible") return;
    const messageIds = messages.filter((message) => !message.sentByMe && !message.readByMe).map((message) => message.messageId);
    if (messageIds.length === 0) return;
    const response = await apiFetch(`/api/campaigns/${encodeURIComponent(campaignId)}/messages/read`, {
      init: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messageIds }) },
    });
    if (!response.ok) throw new Error(await readApiError(response, t("playerPortal.messaging.loading")));
    setPayload((current) => ({
      ...current,
      messages: current.messages.map((message) => messageIds.includes(message.messageId) ? { ...message, readByMe: true } : message),
    }));
  }, [campaignId, t]);

  const scrollToLatest = useCallback((behavior: ScrollBehavior = "smooth") => {
    endRef.current?.scrollIntoView({ behavior, block: "end" });
    nearBottomRef.current = true;
    setUnseenCount(0);
    void markMessagesRead(payloadRef.current.messages).catch((cause) => setError(cause.message));
  }, [markMessagesRead]);

  const fetchPage = useCallback(async (before?: string): Promise<MessagingPayload> => {
    const response = await apiFetch(`/api/campaigns/${encodeURIComponent(campaignId)}/messages${before ? `?before=${encodeURIComponent(before)}` : ""}`);
    if (!response.ok) throw new Error(await readApiError(response, t("playerPortal.messaging.loading")));
    return response.json() as Promise<MessagingPayload>;
  }, [campaignId, t]);

  const loadLatest = useCallback(async () => {
    setError(null);
    const nextPayload = await fetchPage();
    const newMessages = nextPayload.messages.filter((message) => !loadedMessageIdsRef.current.has(message.messageId));
    for (const message of nextPayload.messages) loadedMessageIdsRef.current.add(message.messageId);
    setPayload((current) => ({
      participants: nextPayload.participants,
      messages: initialLoadCompleteRef.current ? mergeMessages(current.messages, nextPayload.messages) : nextPayload.messages,
      pageInfo: initialLoadCompleteRef.current && current.messages.length > nextPayload.messages.length ? current.pageInfo : nextPayload.pageInfo,
    }));
    if (!initialLoadCompleteRef.current) {
      initialLoadCompleteRef.current = true;
      await markMessagesRead(nextPayload.messages);
      window.requestAnimationFrame(() => scrollToLatest("auto"));
      return;
    }
    const incomingCount = newMessages.filter((message) => !message.sentByMe).length;
    if (newMessages.length > 0 && nearBottomRef.current) {
      await markMessagesRead(nextPayload.messages);
      window.requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }));
    } else if (incomingCount > 0) {
      setUnseenCount((current) => current + incomingCount);
    }
  }, [fetchPage, markMessagesRead, scrollToLatest]);

  const loadOlder = useCallback(async () => {
    if (loadingOlder || !payload.pageInfo.hasMore || !payload.pageInfo.nextCursor) return;
    setLoadingOlder(true);
    setError(null);
    const list = listRef.current;
    const previousScrollHeight = list?.scrollHeight ?? 0;
    try {
      const olderPayload = await fetchPage(payload.pageInfo.nextCursor);
      for (const message of olderPayload.messages) loadedMessageIdsRef.current.add(message.messageId);
      setPayload((current) => ({ participants: olderPayload.participants, messages: mergeMessages(olderPayload.messages, current.messages), pageInfo: olderPayload.pageInfo }));
      window.requestAnimationFrame(() => { if (list) list.scrollTop += list.scrollHeight - previousScrollHeight; });
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLoadingOlder(false);
    }
  }, [fetchPage, loadingOlder, payload.pageInfo]);

  useEffect(() => {
    initialLoadCompleteRef.current = false;
    nearBottomRef.current = true;
    loadedMessageIdsRef.current = new Set();
    setUnseenCount(0);
    setPendingMessage(null);
    setPayload({ participants: [], messages: [], pageInfo: { hasMore: false, nextCursor: null } });
    setLoading(true);
    void loadLatest().catch((cause) => setError(cause.message)).finally(() => setLoading(false));
  }, [loadLatest]);

  useEffect(() => {
    const source = new EventSource(`/api/campaigns/${encodeURIComponent(campaignId)}/events/stream`);
    let refreshTimer: number | null = null;
    const refresh = () => {
      if (refreshTimer !== null) return;
      refreshTimer = window.setTimeout(() => {
        refreshTimer = null;
        void loadLatest().catch((cause) => setError(cause.message));
      }, 120);
    };
    const refreshReads = (event: MessageEvent<string>) => {
      const parsed: unknown = JSON.parse(event.data);
      const ids = isRecord(parsed) && Array.isArray(parsed.messageIds)
        ? parsed.messageIds.filter((id): id is string => typeof id === "string")
        : [];
      if (payloadRef.current.messages.some((message) => message.sentByMe && ids.includes(message.messageId))) refresh();
    };
    source.addEventListener("campaign.message.created", refresh);
    source.addEventListener("campaign.message.read", refreshReads as EventListener);
    return () => {
      if (refreshTimer !== null) window.clearTimeout(refreshTimer);
      source.removeEventListener("campaign.message.created", refresh);
      source.removeEventListener("campaign.message.read", refreshReads as EventListener);
      source.close();
    };
  }, [campaignId, loadLatest]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && nearBottomRef.current) {
        void markMessagesRead(payloadRef.current.messages).catch((cause) => setError(cause.message));
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [markMessagesRead]);

  const selectedAudienceDescription = useMemo(() => {
    if (audience === "party") return t("playerPortal.messaging.partyDescription");
    if (audience === "dm") return t("playerPortal.messaging.dmDescription");
    return recipientPlayerId ? t("playerPortal.messaging.playerDescription") : t("playerPortal.messaging.selectPlayer");
  }, [audience, recipientPlayerId, t]);

  const audienceLabel = (message: Pick<CampaignMessage, "audience" | "recipientPlayerId">): string => {
    if (message.audience === "party") return t("playerPortal.messaging.channelParty");
    if (message.audience === "dm") return t("playerPortal.messaging.channelDm");
    const recipient = payload.participants.find((candidate) => candidate.playerId === message.recipientPlayerId);
    return recipient ? `${t("playerPortal.messaging.privateWith")} ${recipient.displayName}` : t("playerPortal.messaging.privateMessage");
  };

  const submitMessage = async (message: PendingMessage) => {
    setPendingMessage({ ...message, status: "sending" });
    setError(null);
    try {
      const response = await apiFetch(`/api/campaigns/${encodeURIComponent(campaignId)}/messages`, {
        init: {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: message.content, audience: message.audience, recipientPlayerId: message.recipientPlayerId, clientMessageId: message.clientMessageId }),
        },
      });
      if (!response.ok) throw new Error(await readApiError(response, t("playerPortal.messaging.send")));
      setPendingMessage(null);
      await loadLatest();
      window.requestAnimationFrame(() => scrollToLatest("smooth"));
    } catch (cause) {
      setPendingMessage({ ...message, status: "failed" });
      setError(errorMessage(cause));
    }
  };

  const sendMessage = async () => {
    const text = content.trim();
    if (!text || text.length > MAX_MESSAGE_LENGTH || pendingMessage?.status === "sending" || (audience === "player" && !recipientPlayerId)) return;
    const clientMessageId = crypto.randomUUID();
    const message: PendingMessage = {
      localId: `pending_${clientMessageId}`,
      clientMessageId,
      content: text,
      audience,
      recipientPlayerId: audience === "player" ? recipientPlayerId : null,
      createdAt: new Date().toISOString(),
      status: "sending",
    };
    setContent("");
    nearBottomRef.current = true;
    setUnseenCount(0);
    window.requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }));
    await submitMessage(message);
  };

  const handleScroll = () => {
    const nearBottom = isNearBottom(listRef.current);
    nearBottomRef.current = nearBottom;
    if (nearBottom) {
      setUnseenCount(0);
      void markMessagesRead(payloadRef.current.messages).catch((cause) => setError(cause.message));
    }
  };

  return (
    <section className="card" style={{ display: "grid", gridTemplateRows: "auto minmax(320px, 1fr) auto", minHeight: "min(720px, calc(100vh - 220px))", overflow: "hidden" }}>
      <header style={{ display: "flex", gap: 12, alignItems: "center", paddingBottom: 14, borderBottom: "1px solid var(--theme-borders-default)" }}>
        <div style={{ width: 42, height: 42, borderRadius: 14, display: "grid", placeItems: "center", background: "var(--theme-surfaces-raised)" }}><MessageCircle size={21} /></div>
        <div><h2 style={{ margin: 0 }}>{t("playerPortal.messaging.heading")}</h2><p style={{ margin: "3px 0 0", color: "var(--theme-text-secondary)", fontSize: 13 }}>{t(dmMode ? "playerPortal.messaging.dmSubtitle" : "playerPortal.messaging.playerSubtitle")}</p></div>
      </header>

      <div style={{ position: "relative", minHeight: 0 }}>
        <div ref={listRef} role="log" aria-live="polite" aria-relevant="additions text" onScroll={handleScroll} style={{ height: "100%", overflowY: "auto", padding: "18px 4px", display: "flex", flexDirection: "column", gap: 12 }}>
          {loading && <p style={{ color: "var(--theme-text-secondary)" }}>{t("playerPortal.messaging.loading")}</p>}
          {!loading && payload.pageInfo.hasMore && <button className="btn btn-secondary btn-sm" type="button" disabled={loadingOlder} onClick={() => void loadOlder()} style={{ alignSelf: "center" }}>{loadingOlder ? t("playerPortal.messaging.loading") : t("playerPortal.messaging.loadOlder")}</button>}
          {!loading && payload.messages.length === 0 && !pendingMessage && <div style={{ margin: "auto", textAlign: "center", color: "var(--theme-text-secondary)", maxWidth: 360 }}><MessageCircle size={34} style={{ opacity: .5 }} /><p>{t("playerPortal.messaging.empty")}</p></div>}
          {payload.messages.map((message) => {
            const color = senderColor(message.senderColorIndex);
            return (
              <article key={message.messageId} style={{ alignSelf: message.sentByMe ? "flex-end" : "flex-start", width: "min(88%, 620px)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, margin: "0 6px 4px", fontSize: 11 }}><strong style={{ color }}>{message.senderName}</strong><span style={{ color: "var(--theme-text-secondary)" }}>{new Date(message.createdAt).toLocaleString()}</span></div>
                <div style={{ padding: "11px 14px", borderRadius: message.sentByMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: `color-mix(in srgb, ${color} 14%, var(--theme-surfaces-raised))`, border: `1px solid color-mix(in srgb, ${color} 55%, var(--theme-borders-default))`, borderInlineStartWidth: 4, borderInlineStartColor: color, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{message.content}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, margin: "4px 6px 0", fontSize: 10, color: "var(--theme-text-secondary)" }}>{message.audience === "party" ? <Users size={11} /> : <Lock size={11} />}<span>{audienceLabel(message)}</span>{message.sentByMe && message.readByCount > 0 && <span>· {t("playerPortal.messaging.readBy")} {message.readByCount}</span>}</div>
              </article>
            );
          })}
          {pendingMessage && (
            <article key={pendingMessage.localId} aria-busy={pendingMessage.status === "sending"} style={{ alignSelf: "flex-end", width: "min(88%, 620px)", opacity: pendingMessage.status === "sending" ? .72 : 1 }}>
              <div style={{ display: "flex", justifyContent: "flex-end", margin: "0 6px 4px", fontSize: 11, color: "var(--theme-text-secondary)" }}>{new Date(pendingMessage.createdAt).toLocaleString()}</div>
              <div style={{ padding: "11px 14px", borderRadius: "16px 16px 4px 16px", background: "color-mix(in srgb, var(--theme-accents-primary-foreground) 14%, transparent)", border: `1px solid ${pendingMessage.status === "failed" ? "var(--theme-feedback-danger-foreground)" : "var(--theme-borders-default)"}`, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{pendingMessage.content}</div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, margin: "4px 6px 0", fontSize: 10, color: pendingMessage.status === "failed" ? "var(--theme-feedback-danger-foreground)" : "var(--theme-text-secondary)" }}>
                <span>{audienceLabel(pendingMessage)} · {pendingMessage.status === "sending" ? t("playerPortal.messaging.sending") : t("playerPortal.messaging.failed")}</span>
                {pendingMessage.status === "failed" && <button className="btn btn-secondary btn-sm" type="button" onClick={() => void submitMessage(pendingMessage)} aria-label={t("playerPortal.messaging.retry")}><RefreshCw size={12} /> {t("playerPortal.messaging.retry")}</button>}
              </div>
            </article>
          )}
          <div ref={endRef} />
        </div>
        {unseenCount > 0 && <button className="btn btn-primary btn-sm" type="button" onClick={() => scrollToLatest("smooth")} aria-label={`${t("playerPortal.messaging.jumpToLatest")}: ${unseenCount} ${t("playerPortal.messaging.newMessages")}`} style={{ position: "absolute", right: 12, bottom: 12, maxWidth: "calc(100% - 24px)", borderRadius: 999, boxShadow: "var(--theme-shadows-medium)" }}><ArrowDown size={15} /> {unseenCount} {t("playerPortal.messaging.newMessages")}</button>}
      </div>

      <footer style={{ borderTop: "1px solid var(--theme-borders-default)", paddingTop: 14, display: "grid", gap: 10 }}>
        {error && <p role="alert" style={{ margin: 0, color: "var(--theme-feedback-danger-foreground)" }}>{error}</p>}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select className="form-select" value={audience} onChange={(event) => { if (isAudience(event.target.value)) setAudience(event.target.value); }} aria-label={t("playerPortal.messaging.channelParty")}><option value="party">{t("playerPortal.messaging.channelParty")}</option>{!dmMode && <option value="dm">{t("playerPortal.messaging.channelDm")}</option>}<option value="player">{t("playerPortal.messaging.channelPlayer")}</option></select>
          {audience === "player" && <select className="form-select" value={recipientPlayerId} onChange={(event) => setRecipientPlayerId(event.target.value)} aria-label={t("playerPortal.messaging.selectPlayer")}><option value="">{t("playerPortal.messaging.selectPlayer")}</option>{payload.participants.map((participant) => <option key={participant.playerId} value={participant.playerId}>{participant.displayName}</option>)}</select>}
        </div>
        <small style={{ color: "var(--theme-text-secondary)" }}>{selectedAudienceDescription}</small>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "stretch" }}>
          <textarea className="form-textarea" rows={3} value={content} maxLength={MAX_MESSAGE_LENGTH} aria-label={t("playerPortal.messaging.placeholder")} onChange={(event) => setContent(event.target.value)} placeholder={t("playerPortal.messaging.placeholder")} style={{ flex: "1 1 260px", minWidth: 0 }} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} />
          <button className="btn btn-primary" type="button" style={{ flex: "1 0 auto", minHeight: 44 }} disabled={!content.trim() || content.trim().length > MAX_MESSAGE_LENGTH || pendingMessage?.status === "sending" || (audience === "player" && !recipientPlayerId)} onClick={() => void sendMessage()}><Send size={16} /> {t("playerPortal.messaging.send")}</button>
        </div>
      </footer>
    </section>
  );
}
