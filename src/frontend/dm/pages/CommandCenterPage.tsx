import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Activity, AlertTriangle, BookOpen, CalendarDays, EyeOff, Flag, Lightbulb, MessageSquare, Play, RefreshCw, Search, Users } from "lucide-react";
import { getCommandCenter, getLiveTable } from "../../shared/api/webProductClient.js";
import { LiveTableModal } from "../components/LiveTableModal.js";

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <section className="card" style={{ padding: 18, ...style }}>{children}</section>;
}

function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "danger" | "warning" | "good" }) {
  const bg = tone === "danger" ? "rgba(239, 68, 68, .12)" : tone === "warning" ? "rgba(245, 158, 11, .14)" : tone === "good" ? "rgba(34, 197, 94, .12)" : "rgba(148, 163, 184, .12)";
  const border = tone === "danger" ? "rgba(239, 68, 68, .35)" : tone === "warning" ? "rgba(245, 158, 11, .35)" : tone === "good" ? "rgba(34, 197, 94, .3)" : "rgba(148, 163, 184, .24)";
  return <span style={{ border: `1px solid ${border}`, background: bg, borderRadius: 999, padding: "4px 9px", fontSize: 12, color: "var(--text-main)" }}>{children}</span>;
}

function ListBlock({ title, items, empty, render }: { title: string; items: any[]; empty: string; render: (item: any) => React.ReactNode }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <h3 style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>{title}</h3>
      {items.length === 0 ? <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>{empty}</p> : items.map((item, index) => <div key={item.id ?? item.objectiveId ?? item.clueId ?? item.proposalId ?? index} style={{ border: "1px solid var(--border-color)", borderRadius: 12, padding: 12, background: "rgba(255,255,255,.025)" }}>{render(item)}</div>)}
    </div>
  );
}

export function CommandCenterPage() {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };
  const navigate = useNavigate();
  const [data, setData] = useState<any | null>(null);
  const [liveTable, setLiveTable] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveTableModalOpen, setLiveTableModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [center, live] = await Promise.all([getCommandCenter(campaignId), getLiveTable(campaignId).catch(() => ({ liveTable: null }))]);
      setData(center);
      setLiveTable(live.liveTable ?? null);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [campaignId]);

  const attentionTone = useMemo(() => {
    const count = data?.attention?.reduce?.((sum: number, item: any) => sum + Number(item.count ?? 0), 0) ?? 0;
    return count > 8 ? "danger" : count > 0 ? "warning" : "good";
  }, [data]);

  if (loading) return <div className="card" style={{ padding: 32 }}>Cargando Command Center...</div>;
  if (error) return <div className="card" style={{ padding: 32, color: "var(--color-danger)" }}>{error}</div>;
  if (!data) return null;

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <p style={{ margin: "0 0 6px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".12em", fontSize: 12 }}>Centro de mando narrativo</p>
          <h1 style={{ margin: 0, fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>{data.campaign?.title ?? "Campaña"}</h1>
          <p style={{ margin: "8px 0 0", color: "var(--text-muted)", maxWidth: 720 }}>{data.campaign?.summary ?? "Memoria, secretos, objetivos y preparación de la próxima sesión."}</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-secondary" type="button" onClick={() => void load()}><RefreshCw size={16} /> Actualizar</button>
          <button className="btn btn-secondary" type="button" onClick={() => navigate({ to: `/campaigns/${campaignId}/search` })}><Search size={16} /> Buscar</button>
          <button className="btn btn-primary" type="button" onClick={() => setLiveTableModalOpen(true)}><Play size={16} /> {liveTable ? "Ver modo mesa" : "Abrir modo mesa"}</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
        <Card><BookOpen size={18} /><p style={{ margin: "8px 0 0", color: "var(--text-muted)", fontSize: 12 }}>Entidades</p><strong style={{ fontSize: 28 }}>{data.counts?.entities ?? 0}</strong></Card>
        <Card><EyeOff size={18} /><p style={{ margin: "8px 0 0", color: "var(--text-muted)", fontSize: 12 }}>Secretos pendientes</p><strong style={{ fontSize: 28 }}>{data.counts?.hiddenSecrets ?? 0}</strong></Card>
        <Card><Lightbulb size={18} /><p style={{ margin: "8px 0 0", color: "var(--text-muted)", fontSize: 12 }}>Pistas preparadas</p><strong style={{ fontSize: 28 }}>{data.counts?.clues ?? 0}</strong></Card>
        <Card><Flag size={18} /><p style={{ margin: "8px 0 0", color: "var(--text-muted)", fontSize: 12 }}>Objetivos abiertos</p><strong style={{ fontSize: 28 }}>{data.openObjectives?.length ?? 0}</strong></Card>
      </div>

      <Card style={{ borderColor: attentionTone === "danger" ? "rgba(239,68,68,.4)" : attentionTone === "warning" ? "rgba(245,158,11,.35)" : "rgba(34,197,94,.3)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <AlertTriangle size={20} />
          <h2 style={{ margin: 0 }}>Qué necesita atención</h2>
          <Pill tone={attentionTone as any}>{data.attention?.length ? `${data.attention.length} bloques` : "Todo tranquilo"}</Pill>
        </div>
        {data.attention?.length ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{data.attention.map((item: any) => <Pill key={item.type} tone={item.type === "hidden_secrets" ? "danger" : "warning"}>{item.label}: {item.count}</Pill>)}</div>
        ) : <p style={{ margin: 0, color: "var(--text-muted)" }}>No hay propuestas, secretos o pistas urgentes ahora mismo.</p>}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.25fr) minmax(280px, .75fr)", gap: 18 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}><CalendarDays size={18} /><h2 style={{ margin: 0 }}>Recap y próxima sesión</h2></div>
          <p style={{ marginTop: 0, color: "var(--text-main)", lineHeight: 1.6 }}>{data.recap ?? "Todavía no hay recap público. Al cerrar una sesión, aparecerá aquí como punto de continuidad."}</p>
          {data.nextSession ? <Pill tone="good">Próxima: {data.nextSession.title}</Pill> : <Pill>Sin sesión preparada</Pill>}
          {liveTable && <div style={{ marginTop: 12 }}><Pill tone="good">Mesa activa: {liveTable.shortCode}</Pill></div>}
        </Card>

        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}><Activity size={18} /><h2 style={{ margin: 0 }}>Actividad reciente</h2></div>
          <div style={{ display: "grid", gap: 8 }}>
            {(data.recentActivity ?? []).slice(0, 6).map((item: any) => <div key={item.activityId} style={{ fontSize: 13, color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)", paddingBottom: 8 }}><strong style={{ color: "var(--text-main)" }}>{item.type}</strong><br />{new Date(item.occurredAt).toLocaleString()}</div>)}
            {!(data.recentActivity ?? []).length && <p style={{ margin: 0, color: "var(--text-muted)" }}>Sin actividad reciente.</p>}
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
        <Card><ListBlock title="Objetivos abiertos" items={data.openObjectives ?? []} empty="No hay objetivos abiertos." render={(item) => <><strong>{item.title}</strong><p style={{ margin: "6px 0 0", color: "var(--text-muted)" }}>{item.description ?? item.kind}</p></>} /></Card>
        <Card><ListBlock title="Pistas sin resolver" items={data.unresolvedClues ?? []} empty="No hay pistas pendientes." render={(item) => <><strong>{item.title}</strong><p style={{ margin: "6px 0 0", color: "var(--text-muted)" }}>{item.publicSummary ?? item.status}</p></>} /></Card>
        <Card><ListBlock title="Propuestas de jugadores" items={data.pendingProposals ?? []} empty="No hay propuestas pendientes." render={(item) => <><strong>{item.type}</strong><p style={{ margin: "6px 0 0", color: "var(--text-muted)" }}>{JSON.stringify(item.content).slice(0, 120)}</p></>} /></Card>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="btn btn-secondary" type="button" onClick={() => navigate({ to: `/campaigns/${campaignId}/session` })}><CalendarDays size={16} /> Preparar sesión</button>
        <button className="btn btn-secondary" type="button" onClick={() => navigate({ to: `/campaigns/${campaignId}/players` })}><Users size={16} /> Jugadores e invitaciones</button>
        <button className="btn btn-secondary" type="button" onClick={() => navigate({ to: `/campaigns/${campaignId}/entities` })}><MessageSquare size={16} /> Memoria</button>
      </div>

      <LiveTableModal
        campaignId={campaignId}
        isOpen={liveTableModalOpen}
        onClose={() => setLiveTableModalOpen(false)}
        activeSessionId={data?.nextSession?.sessionId ?? null}
        initialLiveTable={liveTable}
        onLiveTableChange={setLiveTable}
      />
    </div>
  );
}
