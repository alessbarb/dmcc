import React from "react";
import Fuse from "fuse.js";
import { Search } from "lucide-react";
import type { Entity, Fact } from "../stores/campaignStore.js";

export interface SearchPageProps {
  campaignState: any;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchTypeFilter: string;
  setSearchTypeFilter: (f: string) => void;
  setSelectedEntity: (e: Entity | null) => void;
  setCurrentPage: (page: string) => void;
}

export function SearchPage(props: SearchPageProps) {
  const { campaignState, searchQuery, setSearchQuery, searchTypeFilter, setSearchTypeFilter, setSelectedEntity, setCurrentPage } = props;

  const searchItems = [
    ...(campaignState?.entities ?? [])
      .filter((e: Entity) => !e.archived)
      .map((e: Entity) => ({
        id: e.entityId,
        kind: "entity" as const,
        entityType: e.entityType,
        title: e.title,
        subtitle: e.subtitle ?? "",
        summary: e.summary ?? "",
        content: e.content ?? "",
        status: e.status,
        importance: e.importance,
        _entity: e,
      })),
    ...(campaignState?.facts ?? [])
      .filter((f: Fact) => !f.archived)
      .map((f: Fact) => ({
        id: f.factId,
        kind: "fact" as const,
        entityType: f.kind,
        title: f.statement.substring(0, 60) + (f.statement.length > 60 ? "..." : ""),
        subtitle: f.kind,
        summary: f.statement,
        content: "",
        status: f.kind,
        importance: "normal",
        _fact: f,
      })),
  ];

  const fuse = new Fuse(searchItems, {
    keys: [
      { name: "title", weight: 0.5 },
      { name: "subtitle", weight: 0.2 },
      { name: "summary", weight: 0.2 },
      { name: "content", weight: 0.1 },
    ],
    threshold: 0.35,
    includeScore: true,
  });

  const filtered = searchTypeFilter !== "all"
    ? searchItems.filter(i => i.kind === searchTypeFilter || i.entityType === searchTypeFilter)
    : searchItems;

  const results = searchQuery.trim()
    ? (searchTypeFilter !== "all"
      ? new Fuse(filtered, { keys: [{ name: "title", weight: 0.5 }, { name: "subtitle", weight: 0.2 }, { name: "summary", weight: 0.2 }, { name: "content", weight: 0.1 }], threshold: 0.35, includeScore: true }).search(searchQuery).map(r => r.item)
      : fuse.search(searchQuery).map(r => r.item).filter(i => searchTypeFilter === "all" || i.kind === searchTypeFilter || i.entityType === searchTypeFilter))
    : filtered.slice(0, 50);

  const entityTypeColors: Record<string, string> = {
    npc: "hsl(280, 70%, 65%)", location: "hsl(200, 70%, 60%)", quest: "var(--primary)",
    clue: "var(--secondary)", secret: "var(--color-danger)", clock: "var(--color-warning)",
    consequence: "hsl(30, 80%, 60%)", faction: "hsl(160, 60%, 55%)",
    player_character: "var(--color-success)", canon: "var(--color-success)",
    dm_secret: "var(--color-danger)", rumor: "var(--color-warning)",
  };

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontWeight: "700", fontSize: "1.4rem", marginBottom: "16px" }}>Search</h2>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
            <input
              className="form-input"
              style={{ paddingLeft: "36px" }}
              placeholder="Buscar en entidades y hechos..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <select
            className="form-input"
            style={{ width: "160px", flexShrink: 0 }}
            value={searchTypeFilter}
            onChange={e => setSearchTypeFilter(e.target.value)}
          >
            <option value="all">All types</option>
            <option value="entity">Entities</option>
            <option value="fact">Facts</option>
            <option value="npc">NPCs</option>
            <option value="location">Locations</option>
            <option value="quest">Quests</option>
            <option value="clue">Clues</option>
            <option value="secret">Secrets</option>
            <option value="player_character">Characters</option>
          </select>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "8px" }}>
          {results.length} result{results.length !== 1 ? "s" : ""}{searchQuery ? ` for "${searchQuery}"` : " (showing first 50)"}
        </p>
      </div>

      {results.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
          <Search size={48} style={{ opacity: 0.3, marginBottom: "16px" }} />
          <p>No results. Try a different search term or remove filters.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {results.map(item => (
            <div
              key={item.id}
              className="card"
              style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: "14px" }}
              onClick={() => {
                if (item.kind === "entity" && item._entity) {
                  setSelectedEntity(item._entity);
                  setCurrentPage("entities");
                }
              }}
            >
              <span style={{
                padding: "2px 8px",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.7rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                backgroundColor: "var(--surface-2)",
                color: entityTypeColors[item.entityType] ?? "var(--text-muted)",
                whiteSpace: "nowrap",
                flexShrink: 0,
                marginTop: "2px"
              }}>
                {item.kind === "fact" ? "fact" : item.entityType}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: "600", color: "var(--text-main)", marginBottom: "2px" }}>{item.title}</p>
                {item.subtitle && item.kind === "entity" && (
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{item.subtitle}</p>
                )}
                {item.summary && item.kind === "entity" && (
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>{item.summary.substring(0, 100)}{item.summary.length > 100 ? "..." : ""}</p>
                )}
              </div>
              {item.kind === "entity" && (
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap", flexShrink: 0 }}>
                  {item.status}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
