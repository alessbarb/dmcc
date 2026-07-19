import { useEffect, useMemo, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { CheckCircle2, RefreshCw, Search, ShieldAlert } from "lucide-react";
import type { Canvas } from "@core/domain/canvas/types.js";
import type { TranslationKey } from "@shared/i18n/types.js";
import { CampaignCanvasFlow } from "../../dm/canvas/components/CampaignCanvasFlow.js";
import type { InteractionMode } from "../../dm/canvas/components/CanvasToolbar.js";
import { isDmOnlyCanvasVisibility } from "../../dm/canvas/services/canvasVisibility.js";
import { PlayerCharacterSelectionCard } from "../components/PlayerCharacterSelectionCard.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import {
  createPlayerNote,
  getPlayerCharacter,
  getPlayerConstellation,
  getPlayerHome,
  getPlayerMemory,
  getPlayerNotes,
  getPlayerObjectives,
  getPlayerRecap,
  searchPlayerCampaign,
  type CampaignSearchResult,
  type PlayerConstellationResponse,
  type PlayerPortalTabPayload,
  type PortalCanvas,
} from "../../shared/api/webProductClient.js";
import { useCampaignStore, type CampaignStateStore } from "../../shared/stores/campaignStore.js";

export type PlayerCampaignTab = "overview" | "recap" | "character" | "memory" | "constellation" | "objectives" | "notes";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`card player-campaign-card ${className}`}>{children}</section>;
}

function hasDmOnlyVisibility(value: unknown): boolean {
  return Boolean(value && typeof value === "object" && (value as { kind?: unknown }).kind === "dm_only");
}

function visibilityOf(item: unknown): unknown {
  return isRecord(item) ? item.visibility : undefined;
}

// Defense-in-depth: verifies the server's sanitizeObject() actually stripped dm_only
// data before it reaches the player-facing constellation view. Checks the raw wire
// shape defensively rather than trusting a specific response interface.
function hasSecretLeak(payload: unknown): boolean {
  if (!isRecord(payload)) return false;
  const entities = Array.isArray(payload.entities) ? payload.entities : [];
  const relations = Array.isArray(payload.relations) ? payload.relations : [];
  const canvases = Array.isArray(payload.canvases) ? payload.canvases : [];
  return entities.some((entity) => hasDmOnlyVisibility(visibilityOf(entity))) ||
    relations.some((relation) => hasDmOnlyVisibility(visibilityOf(relation))) ||
    canvases.some((canvas) => {
      if (!isRecord(canvas)) return false;
      const nodes = Array.isArray(canvas.nodes) ? canvas.nodes : [];
      const edges = Array.isArray(canvas.edges) ? canvas.edges : [];
      return nodes.some((node) => isDmOnlyCanvasVisibility(visibilityOf(node))) ||
        edges.some(
          (edge) => isRecord(edge) && (edge.style === "secret" || isDmOnlyCanvasVisibility(edge.visibility)),
        );
    });
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
        .catch((searchError: unknown) => {
          const isAbort = searchError instanceof DOMException && searchError.name === "AbortError";
          if (!controller.signal.aborted && !isAbort) {
            setError(errorMessage(searchError));
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
      <label htmlFor="player-memory-search" className="player-search-label">
        <span className="player-search-label__text">
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
      {error && <p role="alert" className="player-campaign-error">{error}</p>}
      {results.length > 0 && (
        <section aria-label={t("playerPortal.search.resultsLabel")} className="player-search-results">
          {results.map((result) => (
            <button
              key={`${result.type}-${result.item.id}`}
              type="button"
              className="card player-search-result"
              onClick={() => setSelectedResult(result)}
            >
              <strong>{result.item.title ?? result.type}</strong>
              <span className="player-search-result__summary">
                {result.item.summary ?? t("playerPortal.empty.noVisibleSummary")}
              </span>
            </button>
          ))}
        </section>
      )}
      {selectedResult && (
        <article className="player-search-selection">
          <span className="badge badge-default">{selectedResult.type}</span>
          <h3>{selectedResult.item.title ?? selectedResult.item.id}</h3>
          <p className="player-search-selection__summary">
            {selectedResult.item.summary ?? t("playerPortal.empty.noVisibleContent")}
          </p>
        </article>
      )}
    </Card>
  );
}

function renderMemory(memory: PlayerPortalTabPayload, t: (key: TranslationKey) => string) {
  const groups = memory.entities ?? {};
  const facts = memory.facts ?? [];
  const relations = memory.relations ?? [];
  return (
    <div className="player-memory-layout">
      <Card>
        <h2 className="player-campaign-heading">{t("playerPortal.memory.knownMemory")}</h2>
        <p className="player-campaign-secondary">
          {t("playerPortal.memory.visibilityHint")}
        </p>
      </Card>
      {Object.entries(groups).map(([group, items]) => (
        <Card key={group}>
          <h3 className="player-campaign-heading player-campaign-heading--capitalize">{group}</h3>
          <div className="player-memory-items">
            {items.length > 0 ? items.map((item) => (
              <article key={item.entityId} className="player-memory-item">
                <strong>{item.title}</strong>
                <p className="player-campaign-secondary player-memory-item__summary">
                  {item.summary ?? item.status ?? t("playerPortal.empty.noVisibleSummary")}
                </p>
              </article>
            )) : <p className="player-campaign-secondary">{t("playerPortal.empty.nothingYet")}</p>}
          </div>
        </Card>
      ))}
      <Card>
        <h3 className="player-campaign-heading">{t("playerPortal.memory.knownFacts")}</h3>
        {facts.length > 0 ? facts.map((fact) => (
          <p key={fact.factId} className="player-memory-line">
            {fact.statement}
          </p>
        )) : <p className="player-campaign-secondary">{t("playerPortal.empty.noVisibleFacts")}</p>}
      </Card>
      <Card>
        <h3 className="player-campaign-heading">{t("playerPortal.memory.knownRelations")}</h3>
        {relations.length > 0 ? relations.map((relation) => (
          <p key={relation.relationId} className="player-memory-line">
            <strong>{relation.label}</strong>: {relation.description ?? t("playerPortal.memory.knownRelation")}
          </p>
        )) : <p className="player-campaign-secondary">{t("playerPortal.empty.noVisibleRelations")}</p>}
      </Card>
    </div>
  );
}

function PlayerConstellation({ campaignId, t }: { campaignId: string; t: (key: TranslationKey) => string }) {
  const [payload, setPayload] = useState<PlayerConstellationResponse | null>(null);
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
      // Read-only public portal projection (Portal* types) reused against the DM-editing
      // store shape (Entity/Relation/Fact/Canvas); pre-existing mismatch, not fixed here.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      useCampaignStore.setState({
        campaignState: {
          campaign: data.campaign,
          entities: data.entities ?? [],
          relations: data.relations ?? [],
          facts: data.facts ?? [],
          canvases: data.canvases ?? [],
        },
        canvasesById: Object.fromEntries(
          (data.canvases ?? []).map((canvas: PortalCanvas) => [canvas.canvasId, canvas]),
        ),
        activeCampaignId: campaignId,
        activeCampaignRole: "player",
      } as unknown as Partial<CampaignStateStore>);
      setPayload(data);
      setActiveCanvasId((data.canvases ?? [])[0]?.canvasId ?? null);
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [campaignId]);

  const canvases: PortalCanvas[] = payload?.canvases ?? [];
  const activeCanvas = useMemo(
    () => canvases.find((canvas) => canvas.canvasId === activeCanvasId) ?? canvases[0] ?? null,
    [activeCanvasId, canvases],
  );

  return (
    <div className="player-constellation">
      <div className="player-constellation__actions">
        <button className="btn btn-secondary" type="button" onClick={() => void load()} disabled={loading}>
          <RefreshCw size={16} /> {t("playerPortal.actions.refresh")}
        </button>
      </div>
      {error && <Card className="player-campaign-card--error"><p role="alert"><ShieldAlert size={18} /> {error}</p></Card>}
      {loading && <Card><p aria-live="polite">{t("playerPortal.loading.constellation")}</p></Card>}
      {!loading && !error && !activeCanvas && <Card>{t("playerPortal.empty.noPublicConstellations")}</Card>}
      {activeCanvas && (
        <section className="card player-constellation__canvas">
          <div className="player-constellation__tabs">
            {canvases.map((canvas) => (
              <button
                key={canvas.canvasId}
                type="button"
                className={`btn btn-sm ${canvas.canvasId === activeCanvas.canvasId ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setActiveCanvasId(canvas.canvasId)}
                aria-pressed={canvas.canvasId === activeCanvas.canvasId}
              >
                {canvas.title}
              </button>
            ))}
          </div>
          <div className="player-constellation__flow">
            <ReactFlowProvider key={`${campaignId}:${activeCanvas.canvasId}`}>
              <CampaignCanvasFlow
                canvasId={activeCanvas.canvasId}
                // Read-only public portal projection: a stripped-down canvas shape reused
                // against the editable domain Canvas prop; pre-existing mismatch, not fixed here.
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                canvas={activeCanvas as unknown as Canvas}
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

export function usePlayerCampaignHome(campaignId: string) {
  const [home, setHome] = useState<PlayerPortalTabPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setHome(await getPlayerHome(campaignId));
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [campaignId]);

  return { home, loading, error, reload: load };
}

export function PlayerCampaignTabContent({ campaignId, tab }: { campaignId: string; tab: PlayerCampaignTab }) {
  const { t } = useTranslation();
  const [home, setHome] = useState<PlayerPortalTabPayload | null>(null);
  const [payload, setPayload] = useState<PlayerPortalTabPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState("");

  const load = async () => {
    if (tab === "constellation") return;
    setLoading(true);
    setError(null);
    try {
      const homeData = await getPlayerHome(campaignId);
      let body: PlayerPortalTabPayload = homeData;
      if (tab === "memory") body = await getPlayerMemory(campaignId);
      if (tab === "character") body = await getPlayerCharacter(campaignId);
      if (tab === "objectives") body = await getPlayerObjectives(campaignId);
      if (tab === "recap") body = await getPlayerRecap(campaignId);
      if (tab === "notes") body = await getPlayerNotes(campaignId);
      setHome(homeData);
      setPayload(body);
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load().catch((loadError: unknown) => {
      setError(loadError instanceof Error ? loadError.message : String(loadError));
    });
  }, [campaignId, tab]);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible" && tab === "character") {
        void load().catch((loadError: unknown) => {
          setError(loadError instanceof Error ? loadError.message : String(loadError));
        });
      }
    };
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [campaignId, tab]);

  const counts = home?.memoryCounts ?? {};

  const content = useMemo(() => {
    if (tab === "constellation") return <PlayerConstellation campaignId={campaignId} t={t} />;
    if (!payload) return null;
    if (tab === "overview") return (
      <div className="player-campaign-home">
        <Card>
          <h2 className="player-campaign-heading">{t("playerPortal.home.beforePlay")}</h2>
          <p className="player-campaign-recap">{payload.recap ?? t("playerPortal.empty.noSharedRecapYet")}</p>
        </Card>
        <div className="player-campaign-metrics">
          <Card><strong>{counts.visibleEntities ?? 0}</strong><br /><span className="player-campaign-secondary">{t("playerPortal.metrics.memories")}</span></Card>
          <Card><strong>{counts.facts ?? 0}</strong><br /><span className="player-campaign-secondary">{t("playerPortal.metrics.facts")}</span></Card>
          <Card><strong>{payload.objectives?.length ?? 0}</strong><br /><span className="player-campaign-secondary">{t("playerPortal.metrics.objectives")}</span></Card>
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
        <h2 className="player-campaign-heading">{t("playerPortal.objectivesHeading")}</h2>
        {payload.objectives?.length ? payload.objectives.map((objective) => (
          <article key={objective.objectiveId} className="player-objective">
            <strong>{objective.title}</strong>
            <p className="player-campaign-secondary player-objective__description">{objective.description ?? objective.kind}</p>
            <span className="player-objective__status">{objective.status}</span>
          </article>
        )) : <p className="player-campaign-secondary">{t("playerPortal.empty.noOpenObjectives")}</p>}
      </Card>
    );
    if (tab === "recap") return <Card><h2 className="player-campaign-heading">{t("playerPortal.recap.heading")}</h2><p className="player-campaign-recap">{payload.recap ?? t("playerPortal.empty.noSharedRecap")}</p></Card>;
    if (tab === "notes") return (
      <div className="player-notes">
        <Card>
          <h2 className="player-campaign-heading">{t("playerPortal.notes.heading")}</h2>
          <label htmlFor="player-note-draft" className="player-portal-field">
            <span>{t("playerPortal.notes.label")}</span>
            <span id="player-note-help" className="player-portal-help">{t("playerPortal.notes.instructions")}</span>
            <textarea id="player-note-draft" aria-describedby="player-note-help" className="form-textarea" rows={4} value={draftNote} onChange={(event) => setDraftNote(event.target.value)} placeholder={t("playerPortal.notes.placeholder")} />
          </label>
          <button className="btn btn-primary player-notes__submit" type="button" disabled={!draftNote.trim()} onClick={() => {
            void (async () => {
              await createPlayerNote(campaignId, { content: draftNote, visibility: "private" });
              setDraftNote("");
              await load();
            })().catch((saveError: unknown) => {
              setError(saveError instanceof Error ? saveError.message : String(saveError));
            });
          }}><CheckCircle2 size={16} /> {t("playerPortal.notes.save")}</button>
        </Card>
        <Card>{payload.notes?.length ? payload.notes.map((note) => <p key={note.noteId} className="player-note">{note.content}</p>) : <p className="player-campaign-secondary">{t("playerPortal.empty.noNotesYet")}</p>}</Card>
      </div>
    );
    return null;
  }, [campaignId, counts.facts, counts.visibleEntities, draftNote, payload, tab, t]);

  return (
    <>
      {error && <Card className="player-campaign-card--error"><p role="alert">{error}</p></Card>}
      {tab !== "constellation" && loading ? <Card><p aria-live="polite"><RefreshCw size={16} /> {t("playerPortal.loading.generic")}</p></Card> : content}
    </>
  );
}
