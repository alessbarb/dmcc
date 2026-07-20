import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, Lock, MessageCircle, RefreshCw, Send, Users } from "lucide-react";
import { apiFetch, readApiError } from "../api/apiClient.js";
import { useTranslation } from "../i18n/useTranslation.js";
import "../styles/features/campaign-messaging.css";

const MAX_MESSAGE_LENGTH = 4_000;
const NEAR_BOTTOM_THRESHOLD_PX = 96;
const SENDER_TONE_COUNT = 10;

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

function senderTone(index: number): number {
  return Math.abs(index) % SENDER_TONE_COUNT;
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
    // Trusting the server's response shape at the fetch boundary; no runtime schema here.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
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
    const refreshReads = (event: Event) => {
      if (!(event instanceof MessageEvent) || typeof event.data !== "string") return;
      const parsed: unknown = JSON.parse(event.data);
      const ids = isRecord(parsed) && Array.isArray(parsed.messageIds)
        ? parsed.messageIds.filter((id): id is string => typeof id === "string")
        : [];
      if (payloadRef.current.messages.some((message) => message.sentByMe && ids.includes(message.messageId))) refresh();
    };
    source.addEventListener("campaign.message.created", refresh);
    source.addEventListener("campaign.message.read", refreshReads);
    return () => {
      if (refreshTimer !== null) window.clearTimeout(refreshTimer);
      source.removeEventListener("campaign.message.created", refresh);
      source.removeEventListener("campaign.message.read", refreshReads);
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
    <section className="card campaign-messaging">
      <header className="campaign-messaging__header">
        <div className="campaign-messaging__icon"><MessageCircle size={21} /></div>
        <div><h2 className="campaign-messaging__title">{t("playerPortal.messaging.heading")}</h2><p className="campaign-messaging__subtitle">{t(dmMode ? "playerPortal.messaging.dmSubtitle" : "playerPortal.messaging.playerSubtitle")}</p></div>
      </header>

      <div className="campaign-messaging__content">
        <div ref={listRef} className="campaign-messaging__list" role="log" aria-live="polite" aria-relevant="additions text" onScroll={handleScroll}>
          {loading && <p className="campaign-messaging__muted">{t("playerPortal.messaging.loading")}</p>}
          {!loading && payload.pageInfo.hasMore && <button className="btn btn-secondary btn-sm campaign-messaging__load-older" type="button" disabled={loadingOlder} onClick={() => void loadOlder()}>{loadingOlder ? t("playerPortal.messaging.loading") : t("playerPortal.messaging.loadOlder")}</button>}
          {!loading && payload.messages.length === 0 && !pendingMessage && <div className="campaign-messaging__empty"><MessageCircle size={34} /><p>{t("playerPortal.messaging.empty")}</p></div>}
          {payload.messages.map((message) => {
            const tone = senderTone(message.senderColorIndex);
            return (
              <article key={message.messageId} className={`campaign-messaging__message ${message.sentByMe ? "campaign-messaging__message--mine" : "campaign-messaging__message--incoming"} campaign-messaging__message--tone-${tone}`}>
                <div className="campaign-messaging__message-meta"><strong>{message.senderName}</strong><span>{new Date(message.createdAt).toLocaleString()}</span></div>
                <div className="campaign-messaging__bubble">{message.content}</div>
                <div className="campaign-messaging__message-footer">{message.audience === "party" ? <Users size={11} /> : <Lock size={11} />}<span>{audienceLabel(message)}</span>{message.sentByMe && message.readByCount > 0 && <span>· {t("playerPortal.messaging.readBy")} {message.readByCount}</span>}</div>
              </article>
            );
          })}
          {pendingMessage && (
            <article key={pendingMessage.localId} className={`campaign-messaging__message campaign-messaging__message--mine campaign-messaging__pending campaign-messaging__pending--${pendingMessage.status}`} aria-busy={pendingMessage.status === "sending"}>
              <div className="campaign-messaging__message-meta campaign-messaging__message-meta--pending">{new Date(pendingMessage.createdAt).toLocaleString()}</div>
              <div className="campaign-messaging__bubble">{pendingMessage.content}</div>
              <div className="campaign-messaging__message-footer campaign-messaging__message-footer--pending">
                <span>{audienceLabel(pendingMessage)} · {pendingMessage.status === "sending" ? t("playerPortal.messaging.sending") : t("playerPortal.messaging.failed")}</span>
                {pendingMessage.status === "failed" && <button className="btn btn-secondary btn-sm" type="button" onClick={() => void submitMessage(pendingMessage)} aria-label={t("playerPortal.messaging.retry")}><RefreshCw size={12} /> {t("playerPortal.messaging.retry")}</button>}
              </div>
            </article>
          )}
          <div ref={endRef} />
        </div>
        {unseenCount > 0 && <button className="btn btn-primary btn-sm campaign-messaging__jump" type="button" onClick={() => scrollToLatest("smooth")} aria-label={`${t("playerPortal.messaging.jumpToLatest")}: ${unseenCount} ${t("playerPortal.messaging.newMessages")}`}><ArrowDown size={15} /> {unseenCount} {t("playerPortal.messaging.newMessages")}</button>}
      </div>

      <footer className="campaign-messaging__footer">
        {error && <p className="campaign-messaging__error" role="alert">{error}</p>}
        <div className="campaign-messaging__audience">
          <select className="form-select" value={audience} onChange={(event) => { if (isAudience(event.target.value)) setAudience(event.target.value); }} aria-label={t("playerPortal.messaging.channelParty")}><option value="party">{t("playerPortal.messaging.channelParty")}</option>{!dmMode && <option value="dm">{t("playerPortal.messaging.channelDm")}</option>}<option value="player">{t("playerPortal.messaging.channelPlayer")}</option></select>
          {audience === "player" && <select className="form-select" value={recipientPlayerId} onChange={(event) => setRecipientPlayerId(event.target.value)} aria-label={t("playerPortal.messaging.selectPlayer")}><option value="">{t("playerPortal.messaging.selectPlayer")}</option>{payload.participants.map((participant) => <option key={participant.playerId} value={participant.playerId}>{participant.displayName}</option>)}</select>}
        </div>
        <small className="campaign-messaging__description">{selectedAudienceDescription}</small>
        <div className="campaign-messaging__composer">
          <textarea className="form-textarea campaign-messaging__textarea" rows={3} value={content} maxLength={MAX_MESSAGE_LENGTH} aria-label={t("playerPortal.messaging.placeholder")} onChange={(event) => setContent(event.target.value)} placeholder={t("playerPortal.messaging.placeholder")} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} />
          <button className="btn btn-primary campaign-messaging__send" type="button" disabled={!content.trim() || content.trim().length > MAX_MESSAGE_LENGTH || pendingMessage?.status === "sending" || (audience === "player" && !recipientPlayerId)} onClick={() => void sendMessage()}><Send size={16} /> {t("playerPortal.messaging.send")}</button>
        </div>
      </footer>
    </section>
  );
}
