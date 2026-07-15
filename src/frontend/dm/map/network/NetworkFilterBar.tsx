import React, { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { Check, Filter, Search, X } from "lucide-react";
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const availableTypes = useMemo(() => {
    const types = new Set(entities.filter((entity) => !entity.archived).map((entity) => entity.entityType));
    return Array.from(types).sort((left, right) => formatEntityType(left, locale).localeCompare(formatEntityType(right, locale)));
  }, [entities, locale]);

  const searchItems = useMemo<SearchItem[]>(
    () =>
      entities
        .filter((entity) => !entity.archived)
        .map((entity) => ({
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
    onChangeTypeFilter(
      typeFilter.includes(type)
        ? typeFilter.filter((candidate) => candidate !== type)
        : [...typeFilter, type],
    );
  };

  return (
    <div className="network-explorer-toolbar">
      <div className="graph-search">
        <Search size={16} className="graph-search__icon" aria-hidden="true" />
        <input
          className="form-input graph-search__input"
          type="search"
          placeholder={t("network.searchPlaceholder")}
          value={query}
          onFocus={() => setSearchOpen(true)}
          onBlur={() => window.setTimeout(() => setSearchOpen(false), 120)}
          onChange={(event) => {
            setQuery(event.target.value);
            setSearchOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setQuery("");
              setSearchOpen(false);
            }
          }}
        />
        {query && (
          <button type="button" className="graph-search__clear" aria-label={t("network.clearSearch")} onClick={() => setQuery("")}>
            <X size={14} />
          </button>
        )}
        {searchOpen && results.length > 0 && (
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
                  setSearchOpen(false);
                }}
              >
                <span className="graph-search__result-title">{result.title}</span>
                <span className="graph-search__result-meta">{result.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="network-filter-menu">
        <button
          type="button"
          className={`btn btn-sm ${typeFilter.length > 0 ? "btn-primary" : "btn-secondary"}`}
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen((current) => !current)}
        >
          <Filter size={15} />
          {t("network.filterLabel")}
          {typeFilter.length > 0 && <span className="network-filter-count">{typeFilter.length}</span>}
        </button>

        {filtersOpen && (
          <div className="network-filter-popover">
            <div className="network-filter-popover__header">
              <strong>{t("network.filterLabel")}</strong>
              <button type="button" className="btn btn-sm btn-link" onClick={() => setFiltersOpen(false)}>
                <X size={15} />
              </button>
            </div>
            <button
              type="button"
              className={`network-filter-option ${typeFilter.length === 0 ? "is-active" : ""}`}
              onClick={() => onChangeTypeFilter([])}
            >
              <span>{t("network.filterAllTypes")}</span>
              {typeFilter.length === 0 && <Check size={15} />}
            </button>
            <div className="network-filter-options">
              {availableTypes.map((type) => {
                const config = getEntityVisual(type);
                const active = typeFilter.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    className={`network-filter-option ${active ? "is-active" : ""}`}
                    onClick={() => toggleType(type)}
                  >
                    <span className="network-filter-option__dot" style={{ background: config.accent }} />
                    <span>{t(config.labelKey)}</span>
                    {active && <Check size={15} />}
                  </button>
                );
              })}
            </div>
            {typeFilter.length > 0 && (
              <button type="button" className="btn btn-secondary btn-sm network-filter-clear" onClick={() => onChangeTypeFilter([])}>
                {t("network.filterAllTypes")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
