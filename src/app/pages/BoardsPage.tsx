import React from "react";
import type { Entity } from "../stores/campaignStore.js";

export interface BoardsPageProps {
  campaignState: any;
  setSelectedEntity: (e: Entity | null) => void;
  setCurrentPage: (page: string) => void;
}

export function BoardsPage(props: BoardsPageProps) {
  const { campaignState, setSelectedEntity, setCurrentPage } = props;

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontWeight: "700", fontSize: "1.4rem", marginBottom: "4px" }}>Boards</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Campaign state at a glance, grouped by status.</p>
      </div>

      {/* Quests Board */}
      <section style={{ marginBottom: "32px" }}>
        <h3 style={{ fontWeight: "700", fontSize: "1.1rem", marginBottom: "16px", color: "var(--primary)" }}>Quests</h3>
        {(() => {
          const quests = (campaignState?.entities ?? []).filter((e: Entity) => e.entityType === "quest" && !e.archived);
          const byStatus: Record<string, Entity[]> = { active: [], completed: [], failed: [], other: [] };
          quests.forEach((q: Entity) => {
            const s = q.status in byStatus ? q.status : "other";
            byStatus[s].push(q);
          });
          return (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              {(["active", "completed", "failed"] as const).map(status => (
                <div key={status} style={{ backgroundColor: "var(--surface-2)", borderRadius: "var(--radius-md)", padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <span style={{
                      width: "10px", height: "10px", borderRadius: "50%",
                      backgroundColor: status === "active" ? "var(--color-success)" : status === "completed" ? "var(--primary)" : "var(--color-danger)"
                    }} />
                    <span style={{ fontWeight: "700", textTransform: "capitalize", fontSize: "0.9rem" }}>{status}</span>
                    <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "var(--text-muted)" }}>{byStatus[status].length}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {byStatus[status].length === 0 ? (
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>None</p>
                    ) : byStatus[status].map((q: Entity) => (
                      <div key={q.entityId} className="card" style={{ padding: "10px 12px", cursor: "pointer" }} onClick={() => { setSelectedEntity(q); setCurrentPage("entities"); }}>
                        <p style={{ fontWeight: "600", fontSize: "0.9rem" }}>{q.title}</p>
                        {q.summary && <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>{q.summary.substring(0, 60)}{q.summary.length > 60 ? "..." : ""}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </section>

      {/* Clues Board */}
      <section style={{ marginBottom: "32px" }}>
        <h3 style={{ fontWeight: "700", fontSize: "1.1rem", marginBottom: "16px", color: "var(--secondary)" }}>Clues</h3>
        {(() => {
          const clues = (campaignState?.entities ?? []).filter((e: Entity) => e.entityType === "clue" && !e.archived);
          const byStatus: Record<string, Entity[]> = { prepared: [], revealed: [], buried: [], other: [] };
          clues.forEach((c: Entity) => {
            const s = c.status in byStatus ? c.status : "other";
            byStatus[s].push(c);
          });
          return (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              {(["prepared", "revealed", "buried"] as const).map(status => (
                <div key={status} style={{ backgroundColor: "var(--surface-2)", borderRadius: "var(--radius-md)", padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <span style={{
                      width: "10px", height: "10px", borderRadius: "50%",
                      backgroundColor: status === "revealed" ? "var(--color-success)" : status === "prepared" ? "var(--color-warning)" : "var(--text-muted)"
                    }} />
                    <span style={{ fontWeight: "700", textTransform: "capitalize", fontSize: "0.9rem" }}>{status}</span>
                    <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "var(--text-muted)" }}>{byStatus[status].length}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {byStatus[status].length === 0 ? (
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>None</p>
                    ) : byStatus[status].map((c: Entity) => (
                      <div key={c.entityId} className="card" style={{ padding: "10px 12px", cursor: "pointer" }} onClick={() => { setSelectedEntity(c); setCurrentPage("entities"); }}>
                        <p style={{ fontWeight: "600", fontSize: "0.9rem" }}>{c.title}</p>
                        {c.summary && <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>{c.summary.substring(0, 60)}{c.summary.length > 60 ? "..." : ""}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </section>

      {/* Consequences Board */}
      <section style={{ marginBottom: "32px" }}>
        <h3 style={{ fontWeight: "700", fontSize: "1.1rem", marginBottom: "16px", color: "var(--color-warning)" }}>Consequences</h3>
        {(() => {
          const items = (campaignState?.entities ?? []).filter((e: Entity) => e.entityType === "consequence" && !e.archived);
          const byStatus: Record<string, Entity[]> = { pending: [], triggered: [], resolved: [], other: [] };
          items.forEach((c: Entity) => {
            const s = c.status in byStatus ? c.status : "other";
            byStatus[s].push(c);
          });
          return (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              {(["pending", "triggered", "resolved"] as const).map(status => (
                <div key={status} style={{ backgroundColor: "var(--surface-2)", borderRadius: "var(--radius-md)", padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <span style={{
                      width: "10px", height: "10px", borderRadius: "50%",
                      backgroundColor: status === "triggered" ? "var(--color-danger)" : status === "pending" ? "var(--color-warning)" : "var(--color-success)"
                    }} />
                    <span style={{ fontWeight: "700", textTransform: "capitalize", fontSize: "0.9rem" }}>{status}</span>
                    <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "var(--text-muted)" }}>{byStatus[status].length}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {byStatus[status].length === 0 ? (
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>None</p>
                    ) : byStatus[status].map((c: Entity) => (
                      <div key={c.entityId} className="card" style={{ padding: "10px 12px", cursor: "pointer" }} onClick={() => { setSelectedEntity(c); setCurrentPage("entities"); }}>
                        <p style={{ fontWeight: "600", fontSize: "0.9rem" }}>{c.title}</p>
                        {c.summary && <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>{c.summary.substring(0, 60)}{c.summary.length > 60 ? "..." : ""}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </section>

      {/* NPCs Board */}
      <section style={{ marginBottom: "32px" }}>
        <h3 style={{ fontWeight: "700", fontSize: "1.1rem", marginBottom: "16px", color: "hsl(280, 70%, 65%)" }}>NPCs by Attitude</h3>
        {(() => {
          const npcs = (campaignState?.entities ?? []).filter((e: Entity) => e.entityType === "npc" && !e.archived);
          const byAttitude: Record<string, Entity[]> = { friendly: [], neutral: [], hostile: [], other: [] };
          npcs.forEach((n: Entity) => {
            const attitude = n.metadata?.attitudeToParty ?? "other";
            const key = attitude in byAttitude ? attitude : "other";
            byAttitude[key].push(n);
          });
          return (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
              {(["friendly", "neutral", "hostile", "other"] as const).map(attitude => (
                <div key={attitude} style={{ backgroundColor: "var(--surface-2)", borderRadius: "var(--radius-md)", padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <span style={{
                      width: "10px", height: "10px", borderRadius: "50%",
                      backgroundColor: attitude === "friendly" ? "var(--color-success)" : attitude === "hostile" ? "var(--color-danger)" : attitude === "neutral" ? "var(--color-warning)" : "var(--text-muted)"
                    }} />
                    <span style={{ fontWeight: "700", textTransform: "capitalize", fontSize: "0.9rem" }}>{attitude}</span>
                    <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "var(--text-muted)" }}>{byAttitude[attitude].length}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {byAttitude[attitude].length === 0 ? (
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>None</p>
                    ) : byAttitude[attitude].map((n: Entity) => (
                      <div key={n.entityId} className="card" style={{ padding: "10px 12px", cursor: "pointer" }} onClick={() => { setSelectedEntity(n); setCurrentPage("entities"); }}>
                        <p style={{ fontWeight: "600", fontSize: "0.9rem" }}>{n.title}</p>
                        {n.subtitle && <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>{n.subtitle}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </section>

      {/* Secrets Board */}
      <section>
        <h3 style={{ fontWeight: "700", fontSize: "1.1rem", marginBottom: "16px", color: "var(--color-danger)" }}>Secrets</h3>
        {(() => {
          const secrets = (campaignState?.entities ?? []).filter((e: Entity) => e.entityType === "secret" && !e.archived);
          const hidden = secrets.filter((s: Entity) => s.visibility?.kind === "dm_only" || s.status === "dm_only");
          const revealed = secrets.filter((s: Entity) => s.visibility?.kind !== "dm_only" && s.status !== "dm_only");
          return (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
              {[{ label: "Hidden (DM only)", items: hidden, color: "var(--color-danger)" }, { label: "Revealed", items: revealed, color: "var(--color-success)" }].map(group => (
                <div key={group.label} style={{ backgroundColor: "var(--surface-2)", borderRadius: "var(--radius-md)", padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: group.color }} />
                    <span style={{ fontWeight: "700", fontSize: "0.9rem" }}>{group.label}</span>
                    <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "var(--text-muted)" }}>{group.items.length}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {group.items.length === 0 ? (
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>None</p>
                    ) : group.items.map((s: Entity) => (
                      <div key={s.entityId} className="card" style={{ padding: "10px 12px", cursor: "pointer" }} onClick={() => { setSelectedEntity(s); setCurrentPage("entities"); }}>
                        <p style={{ fontWeight: "600", fontSize: "0.9rem" }}>{s.title}</p>
                        {s.metadata?.truth && <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>{s.metadata.truth.substring(0, 60)}{s.metadata.truth.length > 60 ? "..." : ""}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </section>
    </div>
  );
}
