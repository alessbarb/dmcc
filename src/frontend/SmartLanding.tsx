import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ReactFlowProvider } from "@xyflow/react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  FileText,
  Flag,
  Home,
  LogOut,
  MessageCircle,
  Network,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  Sword,
  User,
} from "lucide-react";
import type { Canvas } from "@core/domain/canvas/types.js";
import type { TranslationKey } from "@shared/i18n/types.js";
import { CampaignCanvasFlow } from "./dm/canvas/components/CampaignCanvasFlow.js";
import type { InteractionMode } from "./dm/canvas/components/CanvasToolbar.js";
import { isDmOnlyCanvasVisibility } from "./dm/canvas/services/canvasVisibility.js";
import { PlayerCharacterSelectionCard } from "./player/components/PlayerCharacterSelectionCard.js";
import { fetchAuthStatus, logout } from "./shared/auth/authClient.js";
import type { AuthStatus } from "./shared/auth/authTypes.js";
import { RpgPortalBackground } from "./shared/components/RpgPortalBackground.js";
import { PortalTopBar } from "./shared/components/PortalTopBar.js";
import { MobileDock } from "./shared/components/MobileDock.js";
import { useTranslation } from "./shared/i18n/useTranslation.js";
import { apiFetch } from "./shared/api/apiClient.js";
import {
  createPlayerNote,
  getPlayerCampaigns,
  getPlayerCharacter,
  getPlayerConstellation,
  getPlayerHome,
  getPlayerMemory,
  getPlayerNotes,
  getPlayerObjectives,
  getPlayerRecap,
  searchPlayerCampaign,
  type CampaignSearchResult,
  type PlayerCampaignSummary,
} from "./shared/api/webProductClient.js";
import { useCampaignStore } from "./shared/stores/campaignStore.js";

type PortalTab =
  | "home"
  | "recap"
  | "character"
  | "memory"
  | "constellation"
  | "objectives"
  | "notes";

const PORTAL_TABS: Array<{
  id: PortalTab;
  labelKey: TranslationKey;
  Icon: React.ComponentType<{ size?: number }>;
}> = [
  { id: "home", labelKey: "playerPortal.tabs.home", Icon: Home },
  { id: "recap", labelKey: "playerPortal.tabs.recap", Icon: BookOpen },
  { id: "character", labelKey: "playerPortal.tabs.character", Icon: User },
  { id: "memory", labelKey: "playerPortal.tabs.memory", Icon: Shield },
  { id: "constellation", labelKey: "playerPortal.tabs.constellation", Icon: Network },
  { id: "objectives", labelKey: "playerPortal.tabs.objectives", Icon: Flag },
  { id: "notes", labelKey: "playerPortal.tabs.notes", Icon: FileText },
];

function readPortalLocation(): { campaignId: string | null; tab: PortalTab } {
  const parameters = new URLSearchParams(window.location.search);
  const requestedTab = parameters.get("tab") as PortalTab | null;
  return {
    campaignId: parameters.get("campaignId"),
    tab: PORTAL_TABS.some((tab) => tab.id === requestedTab) ? requestedTab! : "home",
  };
}

function usePortalLocation() {
  const [location, setLocation] = useState(readPortalLocation);

  useEffect(() => {
    const onPopState = () => setLocation(readPortalLocation());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const update = (campaignId: string | null, tab: PortalTab = "home", replace = false) => {
    const parameters = new URLSearchParams();
    if (campaignId) {
      parameters.set("campaignId", campaignId);
      parameters.set("tab", tab);
    }
    const url = parameters.size > 0 ? `/portal?${parameters.toString()}` : "/portal";
    window.history[replace ? "replaceState" : "pushState"](null, "", url);
    setLocation({ campaignId, tab });
  };

  return { ...location, update };
}

function formatCampaignSystem(system?: string) {
  if (system === "dnd_srd_5_2_1") return "D&D 5e";
  if (system === "generic_fantasy_d20") return "d20 Fantasy";
  return "Custom";
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <section className="card" style={{ padding: 16, ...style }}>{children}</section>;
}

function hasDmOnlyVisibility(value: unknown): boolean {
  return Boolean(value && typeof value === "object" && (value as { kind?: unknown }).kind === "dm_only");
}

function hasSecretLeak(payload: any): boolean {
  const entities = Array.isArray(payload?.entities) ? payload.entities : [];
  const relations = Array.isArray(payload?.relations) ? payload.relations : [];
  const canvases = Array.isArray(payload?.canvases) ? payload.canvases : [];
  return entities.some((entity: any) => hasDmOnlyVisibility(entity?.visibility)) ||
    relations.some((relation: any) => hasDmOnlyVisibility(relation?.visibility)) ||
    canvases.some((canvas: any) =>
      (canvas?.nodes ?? []).some((node: any) => isDmOnlyCanvasVisibility(node?.visibility)) ||
      (canvas?.edges ?? []).some(
        (edge: any) => edge?.style === "secret" || isDmOnlyCanvasVisibility(edge?.visibility),
      ),
    );
}

function PlayerSearch({ campaignId, t }: { campaignId: string; t: (key: TranslationKey) => string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CampaignSearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<CampaignSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      setResults([]);
      setSelectedResult(null);
      setError(null);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void searchPlayerCampaign(campaignId, normalizedQuery, controller.signal)
        .then((response) => {
          if (!controller.signal.aborted) {
            setResults(response.results ?? []);
            setError(null);
          }
        })
        .catch((searchError: any) => {
          if (!controller.signal.aborted && searchError?.name !== "AbortError") {
            setError(searchError?.message ?? String(searchError));
          }
        });
    }, 220);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [campaignId, query]);

  return (
    <Card>
      <label htmlFor="player-memory-search" style={{ display: "grid", gap: 8 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 13 }}>
          <Search size={15} /> {t("playerPortal.search.label")}
        </span>
        <input
          id="player-memory-search"
          className="form-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("playerPortal.search.placeholder")}
        />
      </label>
      {error && <p role="alert" style={{ color: "var(--color-danger)", marginBottom: 0 }}>{error}</p>}
      {results.length > 0 && (
        <section aria-label={t("playerPortal.search.resultsLabel")} style={{ display: "grid", gap: 8, marginTop: 12 }}>
          {results.map((result) => (
            <button
              key={`${result.type}-${result.item.id}`}
              type="button"
              className="card"
              style={{ padding: 10, textAlign: "left", color: "inherit", cursor: "pointer" }}
              onClick={() => setSelectedResult(result)}
            >
              <strong>{result.item.title ?? result.type}</strong>
              <span style={{ display: "block", marginTop: 4, color: "var(--text-muted)", fontSize: 13 }}>
                {result.item.summary ?? t("playerPortal.empty.noVisibleSummary")}
              </span>
            </button>
          ))}
        </section>
      )}
      {selectedResult && (
        <article style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border-color)" }}>
          <span className="badge badge-default">{selectedResult.type}</span>
          <h3>{selectedResult.item.title ?? selectedResult.item.id}</h3>
          <p style={{ color: "var(--text-muted)", whiteSpace: "pre-wrap" }}>
            {selectedResult.item.summary ?? t("playerPortal.empty.noVisibleContent")}
          </p>
        </article>
      )}
    </Card>
  );
}

function renderMemory(memory: any, t: (key: TranslationKey) => string) {
  const groups = memory?.entities ?? {};
  const facts = memory?.facts ?? [];
  const relations = memory?.relations ?? [];
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Card>
        <h2 style={{ marginTop: 0 }}>{t("playerPortal.memory.knownMemory")}</h2>
        <p style={{ color: "var(--text-muted)" }}>
          {t("playerPortal.memory.visibilityHint")}
        </p>
      </Card>
      {Object.entries(groups).map(([group, items]) => (
        <Card key={group}>
          <h3 style={{ marginTop: 0, textTransform: "capitalize" }}>{group}</h3>
          <div style={{ display: "grid", gap: 8 }}>
            {(items as any[]).length > 0 ? (items as any[]).map((item) => (
              <article key={item.entityId} style={{ border: "1px solid var(--border-color)", borderRadius: 12, padding: 12 }}>
                <strong>{item.title}</strong>
                <p style={{ margin: "5px 0 0", color: "var(--text-muted)" }}>
                  {item.summary ?? item.status ?? t("playerPortal.empty.noVisibleSummary")}
                </p>
              </article>
            )) : <p style={{ color: "var(--text-muted)" }}>{t("playerPortal.empty.nothingYet")}</p>}
          </div>
        </Card>
      ))}
      <Card>
        <h3 style={{ marginTop: 0 }}>{t("playerPortal.memory.knownFacts")}</h3>
        {facts.length > 0 ? facts.map((fact: any) => (
          <p key={fact.factId} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: 8 }}>
            {fact.statement}
          </p>
        )) : <p style={{ color: "var(--text-muted)" }}>{t("playerPortal.empty.noVisibleFacts")}</p>}
      </Card>
      <Card>
        <h3 style={{ marginTop: 0 }}>{t("playerPortal.memory.knownRelations")}</h3>
        {relations.length > 0 ? relations.map((relation: any) => (
          <p key={relation.relationId} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: 8 }}>
            <strong>{relation.label}</strong>: {relation.description ?? t("playerPortal.memory.knownRelation")}
          </p>
        )) : <p style={{ color: "var(--text-muted)" }}>{t("playerPortal.empty.noVisibleRelations")}</p>}
      </Card>
    </div>
  );
}

function PlayerConstellation({ campaignId, t }: { campaignId: string; t: (key: TranslationKey) => string }) {
  const [payload, setPayload] = useState<any | null>(null);
  const [activeCanvasId, setActiveCanvasId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>("select");
  const [locked, setLocked] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlayerConstellation(campaignId);
      if (hasSecretLeak(data)) throw new Error("SECURITY_PLAYER_CONSTELLATION_CONTAINS_SECRET_DATA");
      useCampaignStore.setState({
        campaignState: {
          campaign: data.campaign,
          entities: data.entities ?? [],
          relations: data.relations ?? [],
          facts: data.facts ?? [],
          canvases: data.canvases ?? [],
        },
        canvasesById: Object.fromEntries(
          (data.canvases ?? []).map((canvas: Canvas) => [canvas.id, canvas]),
        ),
        activeCampaignId: campaignId,
        activeCampaignRole: "player",
      } as any);
      setPayload(data);
      setActiveCanvasId((data.canvases ?? [])[0]?.id ?? null);
    } catch (loadError: any) {
      setError(loadError?.message ?? String(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [campaignId]);

  const canvases: Canvas[] = payload?.canvases ?? [];
  const activeCanvas = useMemo(
    () => canvases.find((canvas) => canvas.id === activeCanvasId) ?? canvases[0] ?? null,
    [activeCanvasId, canvases],
  );

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Card style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0 }}>{t("playerPortal.tabs.constellation")}</h2>
          </div>
          {canvases.length > 1 && (
            <select className="form-select" value={activeCanvas?.id ?? ""} onChange={(event) => setActiveCanvasId(event.target.value)}>
              {canvases.map((canvas) => <option key={canvas.id} value={canvas.id}>{canvas.title}</option>)}
            </select>
          )}
        </div>
      </Card>
      {loading ? <Card><p>{t("playerPortal.loading.constellation")}</p></Card> : error ? <Card><p role="alert" style={{ color: "var(--color-danger)" }}>{error}</p></Card> : !activeCanvas ? <Card><p>{t("playerPortal.empty.noVisibleContent")}</p></Card> : (
        <div style={{ height: "min(70vh, 760px)", minHeight: 440, borderRadius: 16, overflow: "hidden", border: "1px solid var(--border-color)", background: "var(--bg-main)" }}>
          <ReactFlowProvider>
            <CampaignCanvasFlow
              canvasId={activeCanvas.id}
              canvas={activeCanvas}
              selectedNodeId={selectedNodeId}
              selectedEdgeId={selectedEdgeId}
              onSelectNode={setSelectedNodeId}
              onSelectEdge={setSelectedEdgeId}
              onClearSelection={() => {
                setSelectedNodeId(null);
                setSelectedEdgeId(null);
              }}
              interactionMode={interactionMode}
              isLocked={locked}
              showMinimap={showMinimap}
              onModeChange={setInteractionMode}
              onLockChange={setLocked}
              onMinimapToggle={() => setShowMinimap((visible) => !visible)}
              publicOnly
              isPlayerView
            />
          </ReactFlowProvider>
        </div>
      )}
    </div>
  );
}

function PlayerWorkspace({
  campaignId,
  campaigns,
  tab,
  onTabChange,
  onCampaignChange,
  onBack,
}: {
  campaignId: string;
  campaigns: PlayerCampaignSummary[];
  tab: PortalTab;
  onTabChange: (tab: PortalTab) => void;
  onCampaignChange: (campaignId: string) => void;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [payload, setPayload] = useState<any | null>(null);
  const [home, setHome] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState("");
  const tabRefs = useRef<Partial<Record<PortalTab, HTMLButtonElement | null>>>({});
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [homePayload, body] = await Promise.all([
        getPlayerHome(campaignId),
        tab === "home" ? getPlayerHome(campaignId)
          : tab === "recap" ? getPlayerRecap(campaignId)
            : tab === "character" ? getPlayerCharacter(campaignId)
              : tab === "memory" ? getPlayerMemory(campaignId)
                : tab === "constellation" ? getPlayerConstellation(campaignId)
                  : tab === "objectives" ? getPlayerObjectives(campaignId)
                    : getPlayerNotes(campaignId),
      ]);
      setHome(homePayload);
      setPayload(body);
    } catch (loadError: any) {
      setError(loadError?.message ?? String(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [campaignId, tab]);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [campaignId, tab]);

  const title = home?.campaign?.title ?? campaigns.find((campaign) => campaign.campaignId === campaignId)?.title ?? t("playerPortal.campaignFallback");
  const counts = home?.memoryCounts ?? {};
  const activeTab = PORTAL_TABS.find((item) => item.id === tab) ?? PORTAL_TABS[0];
  const panelId = `player-portal-panel-${tab}`;
  const tabId = `player-portal-tab-${tab}`;

  useEffect(() => {
    headingRef.current?.focus();
  }, [campaignId]);

  const changeTabFromKeyboard = (event: React.KeyboardEvent<HTMLButtonElement>, currentTab: PortalTab) => {
    const currentIndex = PORTAL_TABS.findIndex((item) => item.id === currentTab);
    let nextIndex = currentIndex;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % PORTAL_TABS.length;
    else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + PORTAL_TABS.length) % PORTAL_TABS.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = PORTAL_TABS.length - 1;
    else return;
    event.preventDefault();
    const nextTab = PORTAL_TABS[nextIndex].id;
    onTabChange(nextTab);
    window.setTimeout(() => tabRefs.current[nextTab]?.focus(), 0);
  };

  const playerDockItems = [
    { id: "home", label: t("playerPortal.tabs.home"), Icon: Home, onSelect: () => onTabChange("home") },
    { id: "character", label: t("playerPortal.tabs.character"), Icon: User, onSelect: () => onTabChange("character") },
    { id: "messages", label: t("playerPortal.messaging.heading"), Icon: MessageCircle, onSelect: () => navigate({ to: "/portal/messages/$campaignId", params: { campaignId } }) },
    { id: "recap", label: t("playerPortal.tabs.recap"), Icon: BookOpen, onSelect: () => onTabChange("recap") },
    { id: "memory", label: t("playerPortal.tabs.memory"), Icon: Shield, onSelect: () => onTabChange("memory") },
    { id: "constellation", label: t("playerPortal.tabs.constellation"), Icon: Network, onSelect: () => onTabChange("constellation") },
    { id: "objectives", label: t("playerPortal.tabs.objectives"), Icon: Flag, onSelect: () => onTabChange("objectives") },
    { id: "notes", label: t("playerPortal.tabs.notes"), Icon: FileText, onSelect: () => onTabChange("notes") },
  ];

  const content = useMemo(() => {
    if (tab === "constellation") return <PlayerConstellation campaignId={campaignId} t={t} />;
    if (!payload) return null;
    if (tab === "home") return (
      <div style={{ display: "grid", gap: 14 }}>
        <Card>
          <h2 style={{ marginTop: 0 }}>{t("playerPortal.home.beforePlay")}</h2>
          <p style={{ fontSize: 17, lineHeight: 1.55 }}>{payload.recap ?? t("playerPortal.empty.noSharedRecapYet")}</p>
        </Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
          <Card><strong>{counts.visibleEntities ?? 0}</strong><br /><span style={{ color: "var(--text-muted)" }}>{t("playerPortal.metrics.memories")}</span></Card>
          <Card><strong>{counts.facts ?? 0}</strong><br /><span style={{ color: "var(--text-muted)" }}>{t("playerPortal.metrics.facts")}</span></Card>
          <Card><strong>{payload.objectives?.length ?? 0}</strong><br /><span style={{ color: "var(--text-muted)" }}>{t("playerPortal.metrics.objectives")}</span></Card>
        </div>
        <PlayerSearch campaignId={campaignId} t={t} />
      </div>
    );
    if (tab === "memory") return renderMemory(payload, t);
    if (tab === "character") return (
      <PlayerCharacterSelectionCard campaignId={campaignId} payload={payload} reload={load} t={t} />
    );
    if (tab === "objectives") return (
      <Card>
        <h2 style={{ marginTop: 0 }}>{t("playerPortal.objectivesHeading")}</h2>
        {payload.objectives?.length ? payload.objectives.map((objective: any) => (
          <article key={objective.objectiveId} style={{ borderTop: "1px solid var(--border-color)", padding: "10px 0" }}>
            <strong>{objective.title}</strong>
            <p style={{ color: "var(--text-muted)", margin: "4px 0" }}>{objective.description ?? objective.kind}</p>
            <span style={{ fontSize: 12 }}>{objective.status}</span>
          </article>
        )) : <p style={{ color: "var(--text-muted)" }}>{t("playerPortal.empty.noOpenObjectives")}</p>}
      </Card>
    );
    if (tab === "recap") return <Card><h2 style={{ marginTop: 0 }}>{t("playerPortal.recap.heading")}</h2><p style={{ lineHeight: 1.6 }}>{payload.recap ?? t("playerPortal.empty.noSharedRecap")}</p></Card>;
    if (tab === "notes") return (
      <div style={{ display: "grid", gap: 14 }}>
        <Card>
          <h2 style={{ marginTop: 0 }}>{t("playerPortal.notes.heading")}</h2>
          <label htmlFor="player-note-draft" className="player-portal-field">
            <span>{t("playerPortal.notes.label")}</span>
            <span id="player-note-help" className="player-portal-help">{t("playerPortal.notes.instructions")}</span>
            <textarea id="player-note-draft" aria-describedby="player-note-help" className="form-textarea" rows={4} value={draftNote} onChange={(event) => setDraftNote(event.target.value)} placeholder={t("playerPortal.notes.placeholder")} />
          </label>
          <button className="btn btn-primary" type="button" style={{ marginTop: 10 }} disabled={!draftNote.trim()} onClick={async () => {
            await createPlayerNote(campaignId, { content: draftNote, visibility: "private" });
            setDraftNote("");
            await load();
          }}><CheckCircle2 size={16} /> {t("playerPortal.notes.save")}</button>
        </Card>
        <Card>{payload.notes?.length ? payload.notes.map((note: any) => <p key={note.noteId} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: 8 }}>{note.content}</p>) : <p style={{ color: "var(--text-muted)" }}>{t("playerPortal.empty.noNotesYet")}</p>}</Card>
      </div>
    );
    return null;
  }, [campaignId, counts.facts, counts.visibleEntities, draftNote, payload, tab, t]);

  return (
    <div className="player-portal-shell">
      <header className="player-portal-header">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={15} /> {t("playerPortal.actions.portal")}
        </button>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: "0 0 3px", color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>{t("playerPortal.title")}</p>
          <h1 ref={headingRef} tabIndex={-1} style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</h1>
        </div>
        {campaigns.length > 1 && (
          <label>
            <span className="sr-only">{t("playerPortal.actions.changeCampaign")}</span>
            <select className="form-select" value={campaignId} onChange={(event) => onCampaignChange(event.target.value)}>
              {campaigns.map((campaign) => <option key={campaign.campaignId} value={campaign.campaignId}>{campaign.title}</option>)}
            </select>
          </label>
        )}
        <button
          type="button"
          className="btn btn-primary btn-sm player-portal-header__messages"
          onClick={() => navigate({ to: "/portal/messages/$campaignId", params: { campaignId } })}
        >
          <MessageCircle size={15} /> Mensajes
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate({ to: "/player/join" })}>
          <Plus size={15} /> {t("playerPortal.actions.join")}
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={async () => {
          await logout();
          window.location.assign("/");
        }}>
          <LogOut size={15} /> {t("playerPortal.actions.signOut")}
        </button>
      </header>

      <div className="player-portal-nav" role="tablist" aria-label={t("playerPortal.tabs.ariaLabel")}>
        {PORTAL_TABS.map(({ id, labelKey, Icon }) => (
          <button
            key={id}
            ref={(element) => { tabRefs.current[id] = element; }}
            type="button"
            className={`player-portal-nav__item ${tab === id ? "active" : ""}`}
            role="tab"
            aria-selected={tab === id}
            aria-controls={`player-portal-panel-${id}`}
            id={`player-portal-tab-${id}`}
            tabIndex={tab === id ? 0 : -1}
            onKeyDown={(event) => changeTabFromKeyboard(event, id)}
            onClick={() => onTabChange(id)}
          >
            <Icon size={16} /> {t(labelKey)}
          </button>
        ))}
      </div>

      <main className="player-portal-main" aria-labelledby={tabId}>
        <section role="tabpanel" id={panelId} aria-labelledby={tabId} tabIndex={0}>
          <h2 className="sr-only">{t(activeTab.labelKey)}</h2>
          {error && <Card style={{ color: "var(--color-danger)" }}><p role="alert">{error}</p></Card>}
          {tab !== "constellation" && loading ? <Card><p aria-live="polite"><RefreshCw size={16} /> {t("playerPortal.loading.generic")}</p></Card> : content}
        </section>
      </main>
      <MobileDock
        items={playerDockItems}
        activeId={tab}
        ariaLabel={t("playerPortal.tabs.ariaLabel")}
        moreLabel={t("campaignShell.mobileMore")}
        sheetLabel={t("playerPortal.title")}
      />
    </div>
  );
}

export function SmartLanding() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const portalLocation = usePortalLocation();
  const [status, setStatus] = useState<AuthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [playerCampaigns, setPlayerCampaigns] = useState<PlayerCampaignSummary[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const authStatus = await fetchAuthStatus();
        setStatus(authStatus);
        if (authStatus.sessionValid) {
          const [campaignResponse, playerResponse] = await Promise.all([
            apiFetch("/api/campaigns"),
            getPlayerCampaigns().catch(() => ({ campaigns: [] })),
          ]);
          if (campaignResponse.ok) {
            const data = await campaignResponse.json();
            setCampaigns(data.campaigns ?? []);
          }
          setPlayerCampaigns(playerResponse.campaigns ?? []);
        }
      } catch {
        setStatus({ accountConfigured: false, sessionValid: false, user: null });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !status) {
    return (
      <div style={{ minHeight: "100vh", position: "relative", display: "grid", placeItems: "center" }}>
        <RpgPortalBackground />
        <p style={{ position: "relative", zIndex: 1, color: "var(--text-muted)" }}>{t("playerPortal.loading.access")}</p>
      </div>
    );
  }

  if (!status.sessionValid) {
    return (
      <div style={{ minHeight: "100vh", position: "relative", display: "grid", placeItems: "center", padding: 20 }}>
        <RpgPortalBackground />
        <div style={{ position: "relative", zIndex: 1 }}>
          <Card style={{ maxWidth: 560 }}>
            <ShieldAlert size={30} />
            <h1>{t("playerPortal.signInRequired.title")}</h1>
            <p style={{ color: "var(--text-muted)" }}>{t("playerPortal.signInRequired.description")}</p>
            <button className="btn btn-primary" type="button" onClick={() => navigate({ to: "/" })}>{t("playerPortal.signInRequired.goHome")}</button>
          </Card>
        </div>
      </div>
    );
  }

  if (portalLocation.campaignId) {
    return (
      <PlayerWorkspace
        campaignId={portalLocation.campaignId}
        campaigns={playerCampaigns}
        tab={portalLocation.tab}
        onTabChange={(tab) => portalLocation.update(portalLocation.campaignId, tab)}
        onCampaignChange={(campaignId) => portalLocation.update(campaignId, "home")}
        onBack={() => portalLocation.update(null)}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <RpgPortalBackground />
      <div style={{ position: "relative", zIndex: 1 }}>
      <PortalTopBar actions={(
        <button className="btn btn-secondary btn-sm" type="button" onClick={async () => {
          await logout();
          window.location.assign("/");
        }}>
          <LogOut size={15} /> {t("playerPortal.actions.signOut")}
        </button>
      )} />
      <main style={{ width: "min(1180px, calc(100% - 24px))", margin: "0 auto", padding: "34px 0 72px" }}>
        <section style={{ display: "grid", gap: 14, marginBottom: 22 }}>
          <span style={{ color: "var(--secondary)", textTransform: "uppercase", letterSpacing: ".14em", fontWeight: 800, fontSize: 11 }}>{t("playerPortal.accessHub.eyebrow")}</span>
          <h1 style={{ margin: 0, fontSize: "clamp(2rem, 6vw, 4.6rem)", maxWidth: 820 }}>{t("playerPortal.accessHub.heading")}</h1>
          <p style={{ color: "var(--text-muted)", maxWidth: 720, fontSize: 17 }}>{t("playerPortal.accessHub.description")}</p>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {campaigns.map((campaign) => (
            <Card key={`dm-${campaign.campaignId}`}>
              <span className="badge badge-default">{t("playerPortal.roles.direction")}</span>
              <h2>{campaign.title}</h2>
              <p style={{ color: "var(--text-muted)" }}>{formatCampaignSystem(campaign.system)}</p>
              <button className="btn btn-primary" type="button" onClick={() => navigate({ to: "/campaigns/$campaignId/command-center", params: { campaignId: campaign.campaignId } })}>
                <Sword size={16} /> {t("playerPortal.actions.openAsDm")}
              </button>
            </Card>
          ))}
          {playerCampaigns.map((campaign) => (
            <Card key={`player-${campaign.campaignId}`}>
              <span className="badge badge-success">{t("playerPortal.roles.player")}</span>
              <h2>{campaign.title}</h2>
              <p style={{ color: "var(--text-muted)" }}>{t("playerPortal.accessHub.sharedMemory")}</p>
              <button className="btn btn-primary" type="button" onClick={() => portalLocation.update(campaign.campaignId, "home")}>
                <Compass size={16} /> {t("playerPortal.actions.openPlayerPortal")}
              </button>
            </Card>
          ))}
        </div>

        {campaigns.length === 0 && playerCampaigns.length === 0 && (
          <Card style={{ marginTop: 20 }}>
            <Sparkles size={28} />
            <h2>{t("playerPortal.empty.noCampaigns")}</h2>
            <p style={{ color: "var(--text-muted)" }}>{t("playerPortal.empty.useInvite")}</p>
            <button className="btn btn-primary" type="button" onClick={() => navigate({ to: "/player/join" })}><ArrowRight size={16} /> {t("playerPortal.actions.goToJoin")}</button>
          </Card>
        )}
      </main>
      </div>
    </div>
  );
}
