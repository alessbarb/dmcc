import React, { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { Search, X } from "lucide-react";
import type { Entity } from "../../../shared/stores/campaignStore.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import { formatEntityType } from "@shared/i18n/index.js";
import { getEntityVisual } from "../../entities/entityVisuals.js";

export interface NetworkFilterBarProps {
  entities: Entity[];
  typeFilter: string[];
  onChangeTypeFilter: (types: string[]) => void;
  onSelectEntity: (entityId: string) => void;
}

interface SearchItem {
  entityId: string;
  title: string;
  type: string;
  summary?: string;
}

export function NetworkFilterBar({ entities, typeFilter, onChangeTypeFilter, onSelectEntity }: NetworkFilterBarProps) {
  const { t, locale } = useTranslation();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const availableTypes = useMemo(() => {
    const types = new Set(entities.map((entity) => entity.entityType));
    return Array.from(types).sort();
  }, [entities]);

  const searchItems = useMemo<SearchItem[]>(
    () =>
      entities.map((entity) => ({
        entityId: entity.entityId,
        title: entity.title,
        type: formatEntityType(entity.entityType, locale),
        summary: entity.summary,
      })),
    [entities, locale],
  );

  const fuse = useMemo(
    () =>
      new Fuse(searchItems, {
        threshold: 0.32,
        ignoreLocation: true,
        minMatchCharLength: 2,
        keys: [
          { name: "title", weight: 0.6 },
          { name: "type", weight: 0.15 },
          { name: "summary", weight: 0.25 },
        ],
      }),
    [searchItems],
  );

  const results = useMemo(() => {
    const normalized = query.trim();
    if (normalized.length < 2) return searchItems.slice(0, 8);
    return fuse.search(normalized).slice(0, 10).map((result) => result.item);
  }, [fuse, query, searchItems]);

  const toggleType = (type: string) => {
    if (typeFilter.includes(type)) {
      onChangeTypeFilter(typeFilter.filter((t2) => t2 !== type));
    } else {
      onChangeTypeFilter([...typeFilter, type]);
    }
  };

  return (
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
      <div className="graph-search" style={{ position: "relative", minWidth: "240px" }}>
        <Search size={15} className="graph-search__icon" aria-hidden="true" />
        <input
          className="form-input graph-search__input"
          type="search"
          placeholder={t("network.searchPlaceholder")}
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setQuery("");
              setIsOpen(false);
            }
          }}
        />
        {query && (
          <button
            type="button"
            className="graph-search__clear"
            aria-label={t("network.clearSearch")}
            onClick={() => setQuery("")}
          >
            <X size={14} />
          </button>
        )}
        {isOpen && results.length > 0 && (
          <div className="graph-search__results" role="listbox">
            {results.map((result) => (
              <button
                key={result.entityId}
                type="button"
                role="option"
                className="graph-search__result"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onSelectEntity(result.entityId);
                  setQuery("");
                  setIsOpen(false);
                }}
              >
                <span className="graph-search__result-title">{result.title}</span>
                <span className="graph-search__result-meta">{result.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginRight: "4px" }}>
          {t("network.filterLabel")}
        </span>
        <button
          type="button"
          className={`btn btn-sm ${typeFilter.length === 0 ? "btn-primary" : "btn-secondary"}`}
          onClick={() => onChangeTypeFilter([])}
        >
          {t("network.filterAllTypes")}
        </button>
        {availableTypes.map((type) => {
          const cfg = getEntityVisual(type);
          const active = typeFilter.includes(type);
          return (
            <button
              key={type}
              type="button"
              className={`btn btn-sm ${active ? "btn-primary" : "btn-secondary"}`}
              onClick={() => toggleType(type)}
              style={active ? { borderColor: cfg.accent } : undefined}
            >
              {t(cfg.labelKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
