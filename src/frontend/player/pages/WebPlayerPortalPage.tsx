import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouterState } from "@tanstack/react-router";
import { BookOpen, CheckCircle2, FileText, Flag, Home, MessageSquare, Network, RefreshCw, Search, Send, Shield, User } from "lucide-react";
import {
  createPlayerNote,
  createPlayerProposal,
  getPlayerCharacter,
  getPlayerHome,
  getPlayerMemory,
  getPlayerNotes,
  getPlayerObjectives,
  getPlayerProposals,
  getPlayerRecap,
  searchPlayerCampaign,
} from "../../shared/api/webProductClient.js";
import { logout } from "../../shared/auth/authClient.js";

type PortalTab = "home" | "recap" | "character" | "memory" | "objectives" | "notes" | "proposals" | "constellation";

function tabFromPath(pathname: string): PortalTab {
  const part = pathname.split("/").filter(Boolean).at(-1);
  if (["recap", "character", "memory", "objectives", "notes", "proposals"].includes(part ?? "")) return part as PortalTab;
  return "home";
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <section className="card" style={{ padding: 16, ...style }}>{children}</section>;
}

function PortalNav({ campaignId, active }: { campaignId: string; active: PortalTab }) {
  const items = [
    ["home", "Inicio", Home],
    ["recap", "Recap", BookOpen],
    ["character", "Personaje", User],
    ["memory", "Memoria", Shield],
    ["constellation", "Constelación", Network],
    ["objectives", "Objetivos", Flag],
    ["notes", "Notas", FileText],
    ["proposals", "Propuestas", Send],
  ] as const;
  return (
    <nav style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
      {items.map(([tab, label, Icon]) => (
        <a
          key={tab}
          href={`/player/campaigns/${campaignId}/${tab}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 12px",
            borderRadius: 999,
            border: "1px solid var(--border-color)",
            color: active === tab ? "var(--text-main)" : "var(--text-muted)",
            background: active === tab ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.025)",
            textDecoration: "none",
            whiteSpace: "nowrap",
            fontSize: 13,
          }}
        >
          <Icon size={15} /> {label}
        </a>
      ))}
    </nav>
  );
}

function SearchBox({ campaignId }: { campaignId: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setResults([]); setError(null); return; }
    const handle = window.setTimeout(async () => {
      try {
        const response = await searchPlayerCampaign(campaignId, q);
        setResults(response.results ?? []);
        setError(null);
      } catch (err: any) {
        setError(err?.message ?? String(err));
      }
    }, 220);
    return () => window.clearTimeout(handle);
  }, [campaignId, query]);

  return (
    <Card>
      <label style={{ display: "grid", gap: 8 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 13 }}><Search size={15} /> Buscar en lo que sabe tu personaje</span>
        <input className="form-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="PNJ, pista, lugar, objetivo..." />
      </label>
      {error && <p style={{ color: "var(--color-danger)", marginBottom: 0 }}>{error}</p>}
      {results.length > 0 && (
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          {results.map((result, index) => <div key={`${result.type}-${result.item?.id ?? index}`} style={{ borderTop: "1px solid var(--border-color)", paddingTop: 8 }}><strong>{result.item?.title ?? result.type}</strong><p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: 13 }}>{result.item?.summary ?? "Sin resumen visible."}</p></div>)}
        </div>
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
      <Card><h2 style={{ marginTop: 0 }}>Memoria conocida</h2><p style={{ color: "var(--text-muted)" }}>Solo aparece información filtrada por el backend. Nada de secretos del DM, nada de notas privadas de otros jugadores.</p></Card>
      {Object.entries(groups).map(([group, items]) => (
        <Card key={group}>
          <h3 style={{ marginTop: 0, textTransform: "capitalize" }}>{group}</h3>
          <div style={{ display: "grid", gap: 8 }}>{(items as any[]).length ? (items as any[]).map((item) => <div key={item.entityId} style={{ border: "1px solid var(--border-color)", borderRadius: 12, padding: 12 }}><strong>{item.title}</strong><p style={{ margin: "5px 0 0", color: "var(--text-muted)" }}>{item.summary ?? item.status ?? "Sin resumen visible."}</p></div>) : <p style={{ color: "var(--text-muted)" }}>Nada por ahora.</p>}</div>
        </Card>
      ))}
      <Card><h3 style={{ marginTop: 0 }}>Hechos conocidos</h3>{facts.length ? facts.map((fact: any) => <p key={fact.factId} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: 8 }}>{fact.statement}</p>) : <p style={{ color: "var(--text-muted)" }}>No hay hechos visibles todavía.</p>}</Card>
      <Card><h3 style={{ marginTop: 0 }}>Relaciones conocidas</h3>{relations.length ? relations.map((rel: any) => <p key={rel.relationId} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: 8 }}><strong>{rel.label}</strong>: {rel.description ?? "relación conocida"}</p>) : <p style={{ color: "var(--text-muted)" }}>No hay relaciones visibles todavía.</p>}</Card>
    </div>
  );
}

export function WebPlayerPortalPage() {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const activeTab = tabFromPath(pathname);
  const [home, setHome] = useState<any | null>(null);
  const [payload, setPayload] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState("");
  const [draftProposal, setDraftProposal] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const homeData = await getPlayerHome(campaignId);
      let body: any = homeData;
      if (activeTab === "memory") body = await getPlayerMemory(campaignId);
      if (activeTab === "character") body = await getPlayerCharacter(campaignId);
      if (activeTab === "objectives") body = await getPlayerObjectives(campaignId);
      if (activeTab === "recap") body = await getPlayerRecap(campaignId);
      if (activeTab === "notes") body = await getPlayerNotes(campaignId);
      if (activeTab === "proposals") body = await getPlayerProposals(campaignId);
      setHome(homeData);
      setPayload(body);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [campaignId, activeTab]);

  const title = home?.campaign?.title ?? "Campaña";
  const counts = home?.memoryCounts ?? {};

  const mainContent = useMemo(() => {
    if (!payload) return null;
    if (activeTab === "home") return (
      <div style={{ display: "grid", gap: 14 }}>
        <Card><h2 style={{ marginTop: 0 }}>Antes de jugar</h2><p style={{ fontSize: 17, lineHeight: 1.55 }}>{payload.recap ?? "Todavía no hay recap compartido."}</p></Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
          <Card><strong>{counts.visibleEntities ?? 0}</strong><br /><span style={{ color: "var(--text-muted)" }}>recuerdos</span></Card>
          <Card><strong>{counts.facts ?? 0}</strong><br /><span style={{ color: "var(--text-muted)" }}>hechos</span></Card>
          <Card><strong>{payload.objectives?.length ?? 0}</strong><br /><span style={{ color: "var(--text-muted)" }}>objetivos</span></Card>
        </div>
        <SearchBox campaignId={campaignId} />
      </div>
    );
    if (activeTab === "memory") return renderMemory(payload);
    if (activeTab === "character") return <Card><h2 style={{ marginTop: 0 }}>Personaje</h2>{payload.linkedCharacter ? <><strong>{payload.linkedCharacter.title}</strong><p style={{ color: "var(--text-muted)" }}>{payload.linkedCharacter.summary ?? "Sin resumen visible."}</p></> : <p style={{ color: "var(--text-muted)" }}>Todavía no hay personaje vinculado. Puedes enviar una propuesta al DM.</p>}</Card>;
    if (activeTab === "objectives") return <Card><h2 style={{ marginTop: 0 }}>Objetivos</h2>{payload.objectives?.length ? payload.objectives.map((objective: any) => <div key={objective.objectiveId} style={{ borderTop: "1px solid var(--border-color)", padding: "10px 0" }}><strong>{objective.title}</strong><p style={{ color: "var(--text-muted)", margin: "4px 0" }}>{objective.description ?? objective.kind}</p><span style={{ fontSize: 12 }}>{objective.status}</span></div>) : <p style={{ color: "var(--text-muted)" }}>No hay objetivos abiertos.</p>}</Card>;
    if (activeTab === "recap") return <Card><h2 style={{ marginTop: 0 }}>Recap</h2><p style={{ lineHeight: 1.6 }}>{payload.recap ?? "No hay recap compartido."}</p></Card>;
    if (activeTab === "notes") return <div style={{ display: "grid", gap: 14 }}><Card><h2 style={{ marginTop: 0 }}>Notas personales</h2><textarea className="form-input" rows={4} value={draftNote} onChange={(event) => setDraftNote(event.target.value)} placeholder="Apunta algo que quieras recordar..." /><button className="btn btn-primary" style={{ marginTop: 10 }} disabled={!draftNote.trim()} onClick={async () => { await createPlayerNote(campaignId, { content: draftNote, visibility: "private" }); setDraftNote(""); await load(); }}><CheckCircle2 size={16} /> Guardar nota</button></Card><Card>{payload.notes?.length ? payload.notes.map((note: any) => <p key={note.noteId} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: 8 }}>{note.content}</p>) : <p style={{ color: "var(--text-muted)" }}>Sin notas todavía.</p>}</Card></div>;
    if (activeTab === "proposals") return <div style={{ display: "grid", gap: 14 }}><Card><h2 style={{ marginTop: 0 }}>Proponer al DM</h2><textarea className="form-input" rows={4} value={draftProposal} onChange={(event) => setDraftProposal(event.target.value)} placeholder="Teoría, pregunta, corrección de recap o idea de personaje..." /><button className="btn btn-primary" style={{ marginTop: 10 }} disabled={!draftProposal.trim()} onClick={async () => { await createPlayerProposal(campaignId, { type: "player_note", text: draftProposal }); setDraftProposal(""); await load(); }}><MessageSquare size={16} /> Enviar propuesta</button></Card><Card>{payload.proposals?.length ? payload.proposals.map((proposal: any) => <div key={proposal.proposalId} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: 8 }}><strong>{proposal.type}</strong><p style={{ color: "var(--text-muted)" }}>{typeof proposal.content === "string" ? proposal.content : JSON.stringify(proposal.content)}</p><span style={{ fontSize: 12 }}>{proposal.status}</span></div>) : <p style={{ color: "var(--text-muted)" }}>Sin propuestas enviadas.</p>}</Card></div>;
    return null;
  }, [activeTab, campaignId, counts.facts, counts.visibleEntities, draftNote, draftProposal, payload]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", color: "var(--text-main)", padding: "max(16px, env(safe-area-inset-top)) 16px 32px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto", display: "grid", gap: 16 }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
          <div>
            <p style={{ margin: "0 0 4px", color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: ".12em" }}>Portal jugador</p>
            <h1 style={{ margin: 0, fontSize: "clamp(1.5rem, 7vw, 2.4rem)" }}>{title}</h1>
          </div>
          <button type="button" className="btn btn-secondary" onClick={async () => { await logout(); window.location.href = "/"; }}>Salir</button>
        </header>
        <PortalNav campaignId={campaignId} active={activeTab} />
        {error && <Card style={{ color: "var(--color-danger)" }}>{error}</Card>}
        {loading ? <Card><RefreshCw size={16} /> Cargando...</Card> : mainContent}
      </div>
    </div>
  );
}
