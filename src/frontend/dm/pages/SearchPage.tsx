import React, { useState } from "react";
import Fuse from "fuse.js";
import { Search } from "lucide-react";
import type { Entity, Fact } from "../../shared/stores/campaignStore.js";
import { getEntityDefaultImage } from "../entities/entityVisuals.js";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useNavigate, useParams } from "@tanstack/react-router";
import { EntityDetailModal } from "../entities/EntityDetailModal.js";
import { useToast } from "../../shared/hooks/useToast.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { formatEntityType } from "@shared/i18n/index.js";

export interface SearchPageProps {
  campaignState?: any;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  searchTypeFilter?: string;
  setSearchTypeFilter?: (f: string) => void;
  setSelectedEntity?: (e: Entity | null) => void;
  setCurrentPage?: (page: string) => void;
}

export function SearchPage(props: SearchPageProps = {}) {
  const { campaignId } = useParams({ strict: false }) as any;
  const navigate = useNavigate();
  const store = useCampaignStore();
  const { updateEntity, archiveEntity } = store;
  const { addToast } = useToast();
  const { locale, t } = useTranslation();
  const campaignState = props.campaignState ?? store.campaignState;
  const [searchQueryLocal, setSearchQueryLocal] = useState("");
  const [searchTypeFilterLocal, setSearchTypeFilterLocal] = useState("all");
  const [selectedEntityLocal, setSelectedEntityLocal] = useState<Entity | null>(null);
  const searchQuery = props.searchQuery ?? searchQueryLocal;
  const setSearchQuery = props.setSearchQuery ?? setSearchQueryLocal;
  const searchTypeFilter = props.searchTypeFilter ?? searchTypeFilterLocal;
  const setSearchTypeFilter = props.setSearchTypeFilter ?? setSearchTypeFilterLocal;
  const setSelectedEntity = props.setSelectedEntity ?? setSelectedEntityLocal;
  const setCurrentPage = props.setCurrentPage ?? ((page: string) => {
    if (campaignId) navigate({ to: `/campaigns/${campaignId}/${page}` });
  });

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

  return (<>
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontWeight: "700", fontSize: "1.4rem", marginBottom: "16px" }}>{t("searchPage.title")}</h2>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
            <input
              className="form-input"
              style={{ paddingLeft: "36px" }}
              placeholder={t("searchPage.placeholder")}
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
            <option value="all">{t("searchPage.allTypes")}</option>
            <option value="entity">{t("searchPage.entities")}</option>
            <option value="fact">{t("searchPage.facts")}</option>
            <option value="npc">{formatEntityType("npc", locale)}</option>
            <option value="location">{formatEntityType("location", locale)}</option>
            <option value="quest">{formatEntityType("quest", locale)}</option>
            <option value="clue">{formatEntityType("clue", locale)}</option>
            <option value="secret">{formatEntityType("secret", locale)}</option>
            <option value="player_character">{formatEntityType("player_character", locale)}</option>
          </select>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "8px" }}>
          {searchQuery
            ? t("searchPage.resultsFor", { count: results.length, query: searchQuery })
            : t("searchPage.resultsFirst", { count: results.length })}
        </p>
      </div>

      {results.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
          <Search size={48} style={{ opacity: 0.3, marginBottom: "16px" }} />
          <p>{t("searchPage.noResults")}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {results.map(item => {
            const isEntity = item.kind === "entity" && item._entity;
            const imgUrl = isEntity ? (item._entity.metadata?.imageUrl || getEntityDefaultImage(item.entityType)) : null;
            return (
              <div
                key={item.id}
                className="card"
                style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px" }}
                onClick={() => {
                  if (isEntity) {
                    setSelectedEntity(item._entity);
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
                  flexShrink: 0
                }}>
                  {item.kind === "fact" ? t("searchPage.factBadge") : formatEntityType(item.entityType, locale)}
                </span>

                {imgUrl && (
                  <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid var(--border-color)", flexShrink: 0 }}>
                    <img src={imgUrl} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}

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
            );
          })}
        </div>
      )}
    </div>
    {selectedEntityLocal && campaignState && (
      <EntityDetailModal
        selectedEntity={selectedEntityLocal}
        campaignState={campaignState}
        onClose={() => setSelectedEntityLocal(null)}
        onEdit={async (entityId, updates) => {
          await updateEntity(entityId, updates);
          setSelectedEntityLocal(prev => prev ? { ...prev, ...updates } : null);
        }}
        onArchive={async (entityId) => {
          await archiveEntity(entityId);
          setSelectedEntityLocal(null);
        }}
        onVisibilityChange={async (entityId, visibility) => {
          await updateEntity(entityId, { visibility });
          setSelectedEntityLocal(prev => prev ? { ...prev, visibility } : null);
        }}
        addToast={addToast}
      />
    )}
  </>);
}
