import React, { useEffect, useMemo, useState } from "react";
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
  MapPin,
  MessageSquare,
  Network,
  Plus,
  RefreshCw,
  Search,
  Send,
  Shield,
  ShieldAlert,
  Sparkles,
  Sword,
  User,
  Users,
} from "lucide-react";
import type { Canvas } from "@core/domain/canvas/types.js";
import { CampaignCanvasFlow } from "./dm/canvas/components/CampaignCanvasFlow.js";
import type { InteractionMode } from "./dm/canvas/components/CanvasToolbar.js";
import { isDmOnlyCanvasVisibility } from "./dm/canvas/services/canvasVisibility.js";
import { fetchAuthStatus, logout } from "./shared/auth/authClient.js";
import type { AuthStatus } from "./shared/auth/authTypes.js";
import { RpgPortalBackground } from "./shared/components/RpgPortalBackground.js";
import { PortalTopBar } from "./shared/components/PortalTopBar.js";
import { useTranslation } from "./shared/i18n/useTranslation.js";
import { apiFetch } from "./shared/api/apiClient.js";
import {
  createPlayerNote,
  createPlayerProposal,
  getPlayerCampaigns,
  getPlayerCharacter,
  getPlayerConstellation,
  getPlayerHome,
  getPlayerMemory,
  getPlayerNotes,
  getPlayerObjectives,
  getPlayerProposals,
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
  | "notes"
  | "proposals";

const PORTAL_TABS: Array<{
  id: PortalTab;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
}> = [
  { id: "home", label: "Inicio", Icon: Home },
  { id: "recap", label: "Recap", Icon: BookOpen },
  { id: "character", label: "Personaje", Icon: User },
  { id: "memory", label: "Memoria", Icon: Shield },
  { id: "constellation", label: "Constelación", Icon: Network },
  { id: "objectives", label: "Objetivos", Icon: Flag },
  { id: "notes", label: "Notas", Icon: FileText },
  { id: "proposals", label: "Propuestas", Icon: Send },
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

function PlayerSearch({ campaignId }: { campaignId: string }) {
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
          <Search size={15} /> Buscar en lo que sabe tu personaje
        </span>
        <input
          id="player-memory-search"
          className="form-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="PNJ, pista, lugar, objetivo..."
        />
      </label>
      {error && <p role="alert" style={{ color: "var(--color-danger)", marginBottom: 0 }}>{error}</p>}
      {results.length > 0 && (
        <div role="listbox" aria-label="Resultados visibles" style={{ display: "grid", gap: 8, marginTop: 12 }}>
          {results.map((result) => (
            <button
              key={`${result.type}-${result.item.id}`}
              type="button"
              role="option"
              aria-selected={selectedResult?.item.id === result.item.id}
              className="card"
              style={{ padding: 10, textAlign: "left", color: "inherit", cursor: "pointer" }}
              onClick={() => setSelectedResult(result)}
            >
              <strong>{result.item.title ?? result.type}</strong>
              <span style={{ display: "block", marginTop: 4, color: "var(--text-muted)", fontSize: 13 }}>
                {result.item.summary ?? "Sin resumen visible."}
              </span>
            </button>
          ))}
        </div>
      )}
      {selectedResult && (
        <article style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border-color)" }}>
          <span className="badge badge-default">{selectedResult.type}</span>
          <h3>{selectedResult.item.title ?? selectedResult.item.id}</h3>
          <p style={{ color: "var(--text-muted)", whiteSpace: "pre-wrap" }}>
            {selectedResult.item.summary ?? "Sin contenido visible."}
          </p>
        </article>
      )}
    </Card>
  );
}

function renderMemory(memory: any) {
  const groups = memory?.entities ?? {};
  const facts = memory?.facts ?? [];
  const relations = memory?.relations ?? [];
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Card>
        <h2 style={{ marginTop: 0 }}>Memoria conocida</h2>
        <p style={{ color: "var(--text-muted)" }}>
          Solo aparece información autorizada para tu personaje y tu mesa.
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
                  {item.summary ?? item.status ?? "Sin resumen visible."}
                </p>
              </article>
            )) : <p style={{ color: "var(--text-muted)" }}>Nada por ahora.</p>}
          </div>
        </Card>
      ))}
      <Card>
        <h3 style={{ marginTop: 0 }}>Hechos conocidos</h3>
        {facts.length > 0 ? facts.map((fact: any) => (
          <p key={fact.factId} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: 8 }}>
            {fact.statement}
          </p>
        )) : <p style={{ color: "var(--text-muted)" }}>No hay hechos visibles todavía.</p>}
      </Card>
      <Card>
        <h3 style={{ marginTop: 0 }}>Relaciones conocidas</h3>
        {relations.length > 0 ? relations.map((relation: any) => (
          <p key={relation.relationId} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: 8 }}>
            <strong>{relation.label}</strong>: {relation.description ?? "relación conocida"}
          </p>
        )) : <p style={{ color: "var(--text-muted)" }}>No hay relaciones visibles todavía.</p>}
      </Card>
    </div>
  );
}

function PlayerConstellation({ campaignId }: { campaignId: string }) {
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
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-secondary" type="button" onClick={() => void load()} disabled={loading}>
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>
      {error && <Card style={{ color: "#fecaca" }}><ShieldAlert size={18} /> {error}</Card>}
      {loading && <Card>Cargando constelación…</Card>}
      {!loading && !error && !activeCanvas && <Card>No hay constelaciones públicas disponibles todavía.</Card>}
      {activeCanvas && (
        <section className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 8, padding: 12, borderBottom: "1px solid var(--border-color)", overflowX: "auto" }}>
            {canvases.map((canvas) => (
              <button
                key={canvas.id}
                type="button"
                className={`btn btn-sm ${canvas.id === activeCanvas.id ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setActiveCanvasId(canvas.id)}
              >
                {canvas.title}
              </button>
            ))}
          </div>
          <div style={{ height: "70dvh" }}>
            <ReactFlowProvider key={`${campaignId}:${activeCanvas.id}`}>
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
                onMinimapToggle={() => setShowMinimap((value) => !value)}
                publicOnly
                isPlayerView
                relationsFilter="public"
              />
            </ReactFlowProvider>
          </div>
        </section>
      )}
    </div>
  );
}

function PlayerWorkspace({
  campaignId,
  tab,
  campaigns,
  onTabChange,
  onCampaignChange,
  onBack,
}: {
  campaignId: string;
  tab: PortalTab;
  campaigns: PlayerCampaignSummary[];
  onTabChange: (tab: PortalTab) => void;
  onCampaignChange: (campaignId: string) => void;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const [home, setHome] = useState<any | null>(null);
  const [payload, setPayload] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState("");
  const [draftProposal, setDraftProposal] = useState("");

  const load = async () => {
    if (tab === "constellation") return;
    setLoading(true);
    setError(null);
    try {
      const homeData = await getPlayerHome(campaignId);
      let body: any = homeData;
      if (tab === "memory") body = await getPlayerMemory(campaignId);
      if (tab === "character") body = await getPlayerCharacter(campaignId);
      if (tab === "objectives") body = await getPlayerObjectives(campaignId);
      if (tab === "recap") body = await getPlayerRecap(campaignId);
      if (tab === "notes") body = await getPlayerNotes(campaignId);
      if (tab === "proposals") body = await getPlayerProposals(campaignId);
      setHome(homeData);
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

  const title = home?.campaign?.title ?? campaigns.find((campaign) => campaign.campaignId === campaignId)?.title ?? "Campaña";
  const counts = home?.memoryCounts ?? {};

  const content = useMemo(() => {
    if (tab === "constellation") return <PlayerConstellation campaignId={campaignId} />;
    if (!payload) return null;
    if (tab === "home") return (
      <div style={{ display: "grid", gap: 14 }}>
        <Card>
          <h2 style={{ marginTop: 0 }}>Antes de jugar</h2>
          <p style={{ fontSize: 17, lineHeight: 1.55 }}>{payload.recap ?? "Todavía no hay recap compartido."}</p>
        </Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
          <Card><strong>{counts.visibleEntities ?? 0}</strong><br /><span style={{ color: "var(--text-muted)" }}>recuerdos</span></Card>
          <Card><strong>{counts.facts ?? 0}</strong><br /><span style={{ color: "var(--text-muted)" }}>hechos</span></Card>
          <Card><strong>{payload.objectives?.length ?? 0}</strong><br /><span style={{ color: "var(--text-muted)" }}>objetivos</span></Card>
        </div>
        <PlayerSearch campaignId={campaignId} />
      </div>
    );
    if (tab === "memory") return renderMemory(payload);
    if (tab === "character") return (
      <Card>
        <h2 style={{ marginTop: 0 }}>Personaje</h2>
        {payload.linkedCharacter ? (
          <><strong>{payload.linkedCharacter.title}</strong><p style={{ color: "var(--text-muted)" }}>{payload.linkedCharacter.summary ?? "Sin resumen visible."}</p></>
        ) : <p style={{ color: "var(--text-muted)" }}>Todavía no hay personaje vinculado. Puedes enviar una propuesta al DM.</p>}
      </Card>
    );
    if (tab === "objectives") return (
      <Card>
        <h2 style={{ marginTop: 0 }}>Objetivos</h2>
        {payload.objectives?.length ? payload.objectives.map((objective: any) => (
          <article key={objective.objectiveId} style={{ borderTop: "1px solid var(--border-color)", padding: "10px 0" }}>
            <strong>{objective.title}</strong>
            <p style={{ color: "var(--text-muted)", margin: "4px 0" }}>{objective.description ?? objective.kind}</p>
            <span style={{ fontSize: 12 }}>{objective.status}</span>
          </article>
        )) : <p style={{ color: "var(--text-muted)" }}>No hay objetivos abiertos.</p>}
      </Card>
    );
    if (tab === "recap") return <Card><h2 style={{ marginTop: 0 }}>Recap</h2><p style={{ lineHeight: 1.6 }}>{payload.recap ?? "No hay recap compartido."}</p></Card>;
    if (tab === "notes") return (
      <div style={{ display: "grid", gap: 14 }}>
        <Card>
          <h2 style={{ marginTop: 0 }}>Notas personales</h2>
          <textarea className="form-textarea" rows={4} value={draftNote} onChange={(event) => setDraftNote(event.target.value)} placeholder="Apunta algo que quieras recordar..." />
          <button className="btn btn-primary" type="button" style={{ marginTop: 10 }} disabled={!draftNote.trim()} onClick={async () => {
            await createPlayerNote(campaignId, { content: draftNote, visibility: "private" });
            setDraftNote("");
            await load();
          }}><CheckCircle2 size={16} /> Guardar nota</button>
        </Card>
        <Card>{payload.notes?.length ? payload.notes.map((note: any) => <p key={note.noteId} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: 8 }}>{note.content}</p>) : <p style={{ color: "var(--text-muted)" }}>Sin notas todavía.</p>}</Card>
      </div>
    );
    if (tab === "proposals") return (
      <div style={{ display: "grid", gap: 14 }}>
        <Card>
          <h2 style={{ marginTop: 0 }}>Proponer al DM</h2>
          <textarea className="form-textarea" rows={4} value={draftProposal} onChange={(event) => setDraftProposal(event.target.value)} placeholder="Teoría, pregunta, corrección de recap o idea de personaje..." />
          <button className="btn btn-primary" type="button" style={{ marginTop: 10 }} disabled={!draftProposal.trim()} onClick={async () => {
            await createPlayerProposal(campaignId, { type: "player_note", text: draftProposal });
            setDraftProposal("");
            await load();
          }}><MessageSquare size={16} /> Enviar propuesta</button>
        </Card>
        <Card>{payload.proposals?.length ? payload.proposals.map((proposal: any) => <article key={proposal.proposalId} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: 8 }}><strong>{proposal.type}</strong><p style={{ color: "var(--text-muted)" }}>{typeof proposal.content === "string" ? proposal.content : JSON.stringify(proposal.content)}</p><span style={{ fontSize: 12 }}>{proposal.status}</span></article>) : <p style={{ color: "var(--text-muted)" }}>Sin propuestas enviadas.</p>}</Card>
      </div>
    );
    return null;
  }, [campaignId, counts.facts, counts.visibleEntities, draftNote, draftProposal, payload, tab]);

  return (
    <div className="player-portal-shell" style={{ minHeight: "100dvh", background: "var(--bg-main)", color: "var(--text-main)" }}>
      <header className="player-portal-header">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={15} /> Portal
        </button>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: "0 0 3px", color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>Portal jugador</p>
          <h1 style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</h1>
        </div>
        {campaigns.length > 1 && (
          <label>
            <span className="sr-only">Cambiar campaña</span>
            <select className="form-select" value={campaignId} onChange={(event) => onCampaignChange(event.target.value)}>
              {campaigns.map((campaign) => <option key={campaign.campaignId} value={campaign.campaignId}>{campaign.title}</option>)}
            </select>
          </label>
        )}
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate({ to: "/player/join" })}>
          <Plus size={15} /> Unirse
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={async () => {
          await logout();
          window.location.assign("/");
        }}>
          <LogOut size={15} /> Salir
        </button>
      </header>

      <nav className="player-portal-nav" aria-label="Secciones del portal jugador">
        {PORTAL_TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`player-portal-nav__item ${tab === id ? "active" : ""}`}
            aria-current={tab === id ? "page" : undefined}
            onClick={() => onTabChange(id)}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </nav>

      <main className="player-portal-main">
        {error && <Card style={{ color: "var(--color-danger)" }}>{error}</Card>}
        {tab !== "constellation" && loading ? <Card><RefreshCw size={16} /> Cargando...</Card> : content}
      </main>
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
            setCampaigns(Array.isArray(data) ? data : []);
          }
          setPlayerCampaigns(playerResponse.campaigns);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loading && portalLocation.campaignId && !playerCampaigns.some((campaign) => campaign.campaignId === portalLocation.campaignId)) {
      portalLocation.update(null, "home", true);
    }
  }, [loading, playerCampaigns, portalLocation.campaignId]);

  if (loading) {
    return <div className="smart-landing-loading"><div className="loading-spinner-glow" /><span>{t("common.loading")}</span></div>;
  }

  if (portalLocation.campaignId) {
    return (
      <PlayerWorkspace
        campaignId={portalLocation.campaignId}
        tab={portalLocation.tab}
        campaigns={playerCampaigns}
        onTabChange={(tab) => portalLocation.update(portalLocation.campaignId, tab)}
        onCampaignChange={(campaignId) => portalLocation.update(campaignId, "home")}
        onBack={() => portalLocation.update(null)}
      />
    );
  }

  const sortedCampaigns = [...campaigns].sort((left, right) =>
    String(right.updatedAt || right.createdAt || "").localeCompare(String(left.updatedAt || left.createdAt || "")),
  );

  return (
    <div className="smart-landing">
      <div className="smart-landing__background" aria-hidden="true"><RpgPortalBackground /></div>
      <div className="smart-landing__glow" aria-hidden="true" />
      <PortalTopBar />
      <main className="smart-landing__main">
        <section className="smart-landing__hero" aria-labelledby="portal-title">
          <span className="landing-badge smart-landing__badge"><Sparkles size={12} /> {t("landing.badge")}</span>
          <h1 id="portal-title" className="landing-hero__title smart-landing__title gold-gradient-text">{t("landing.narrativeHeading")}</h1>
          <p className="landing-hero__subtitle smart-landing__subtitle">{t("landing.subtitle")}</p>

          <div className="smart-landing__grid">
            <section className="smart-column-wrapper dm-theme" aria-labelledby="portal-dm-title">
              <div className="column-header"><Shield className="column-icon gold-glow" size={20} /><h2 id="portal-dm-title">{t("landing.dmTitle")}</h2></div>
              <div className="dm-archive-stack">
                {sortedCampaigns.length === 0 ? (
                  <div className="glass-card empty-campaigns-card"><div className="card-body centered"><Compass size={36} /><h3>{t("landing.noCampaignsTitle")}</h3><p>{t("landing.noCampaignsDesc")}</p><button type="button" className="btn btn-gold" onClick={() => navigate({ to: "/dm" })}>{t("landing.createCampaignBtn")}</button></div></div>
                ) : (
                  <div className="player-profiles-list">
                    {sortedCampaigns.map((campaign) => (
                      <button key={campaign.campaignId} type="button" className="glass-card player-profile-row-card" onClick={() => navigate({ to: `/campaigns/${campaign.campaignId}/command-center` })}>
                        <span className="card-body row-layout">
                          <span className="avatar-frame"><img src={campaign.coverUrl || "/assets/campaigns/default-campaign-cover.jpg"} alt="" /></span>
                          <span className="profile-details"><strong className="profile-name">{campaign.title}</strong><span className="campaign-link-name">{formatCampaignSystem(campaign.system)}</span></span>
                          <ArrowRight size={18} />
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                <button type="button" className="btn btn-gold btn-full" onClick={() => navigate({ to: "/dm" })}>{t("landing.viewAllCampaigns")}</button>
              </div>
            </section>

            <section className="smart-column-wrapper player-theme" aria-labelledby="portal-player-title">
              <div className="column-header"><Sword className="column-icon amethyst-glow" size={20} /><h2 id="portal-player-title">{t("landing.playerTitle")}</h2></div>
              {playerCampaigns.length === 0 ? (
                <div className="glass-card player-join-card"><div className="card-body"><p className="card-desc">{t("landing.playerDesc")}</p><div className="join-cta-box"><Compass size={24} /><p>{t("landing.charactersEmptyDesc")}</p></div><button type="button" className="btn btn-amethyst btn-full" onClick={() => navigate({ to: "/player/join" })}>{t("landing.joinWithCodeBtn")}<ArrowRight size={16} /></button></div></div>
              ) : (
                <div className="player-portal-stack">
                  <span className="section-label-amethyst">{t("landing.yourCharacters")}</span>
                  <div className="player-profiles-list">
                    {playerCampaigns.map((campaign) => (
                      <button key={`${campaign.campaignId}-${campaign.playerId ?? "player"}`} type="button" className="glass-card player-profile-row-card" onClick={() => portalLocation.update(campaign.campaignId, "home")}>
                        <span className="card-body row-layout">
                          <span className="avatar-frame"><img src={campaign.coverUrl || "/assets/avatars/default-avatar.png"} alt="" /></span>
                          <span className="profile-details"><strong className="profile-name">{campaign.title}</strong><span className="campaign-link-name">{t("landing.campaignLabel")}: {campaign.title}</span></span>
                          <ArrowRight size={18} className="amethyst-arrow" />
                        </span>
                      </button>
                    ))}
                  </div>
                  <button type="button" className="btn btn-amethyst-outline btn-full" onClick={() => navigate({ to: "/player/join" })}><Plus size={16} />{t("landing.joinAnother")}</button>
                </div>
              )}
            </section>
          </div>
        </section>
        <footer className="smart-landing__footer">{t("landing.footer")}</footer>
      </main>
    </div>
  );
}
