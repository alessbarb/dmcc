import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { ReactFlowProvider } from "reactflow";
import { Network, RefreshCw, ShieldAlert } from "lucide-react";
import type { Canvas } from "@core/domain/canvas/types.js";
import { CampaignCanvasFlow } from "../../dm/canvas/components/CampaignCanvasFlow.js";
import type { InteractionMode } from "../../dm/canvas/components/CanvasToolbar.js";
import { isDmOnlyCanvasVisibility } from "../../dm/canvas/services/canvasVisibility.js";
import { getPlayerConstellation } from "../../shared/api/webProductClient.js";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";

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
      (canvas?.edges ?? []).some((edge: any) => edge?.style === "secret" || isDmOnlyCanvasVisibility(edge?.visibility))
    );
}

export function PlayerConstellationPage() {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };
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
        canvasesById: Object.fromEntries((data.canvases ?? []).map((canvas: Canvas) => [canvas.id, canvas])),
        activeCampaignId: campaignId,
        activeCampaignRole: "player",
      } as any);
      setPayload(data);
      setActiveCanvasId((data.canvases ?? [])[0]?.id ?? null);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [campaignId]);

  const canvases: Canvas[] = payload?.canvases ?? [];
  const activeCanvas = useMemo(
    () => canvases.find((canvas) => canvas.id === activeCanvasId) ?? canvases[0] ?? null,
    [activeCanvasId, canvases]
  );

  return (
    <main className="main-content" style={{ minHeight: "100vh", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
        <div>
          <Link to="/player/campaigns/$campaignId/home" params={{ campaignId }} style={{ color: "var(--text-muted)" }}>← Portal</Link>
          <h1 style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}><Network size={28} /> Constelación</h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>Mapa público de entidades, pistas descubiertas, objetivos activos, handouts, lugares visitados y teorías compartidas.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => void load()} disabled={loading}><RefreshCw size={16} /> Actualizar</button>
      </div>

      {error && <section className="card" style={{ padding: 16, color: "#fecaca" }}><ShieldAlert size={18} /> {error}</section>}
      {loading && <section className="card" style={{ padding: 16 }}>Cargando constelación…</section>}
      {!loading && !error && !activeCanvas && <section className="card" style={{ padding: 16 }}>No hay constelaciones públicas disponibles todavía.</section>}

      {activeCanvas && (
        <section className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 8, padding: 12, borderBottom: "1px solid var(--border-color)", overflowX: "auto" }}>
            {canvases.map((canvas) => <button key={canvas.id} className={`btn btn-sm ${canvas.id === activeCanvas.id ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveCanvasId(canvas.id)}>{canvas.title}</button>)}
          </div>
          <div style={{ height: "70vh" }}>
            <ReactFlowProvider key={`${campaignId}:${activeCanvas.id}`}>
              <CampaignCanvasFlow
                canvasId={activeCanvas.id}
                canvas={activeCanvas}
                selectedNodeId={selectedNodeId}
                selectedEdgeId={selectedEdgeId}
                onSelectNode={setSelectedNodeId}
                onSelectEdge={setSelectedEdgeId}
                onClearSelection={() => { setSelectedNodeId(null); setSelectedEdgeId(null); }}
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
    </main>
  );
}
