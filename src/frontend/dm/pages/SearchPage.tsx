import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  BookOpen,
  EyeOff,
  FileText,
  Flag,
  GitFork,
  Lightbulb,
  Search,
} from "lucide-react";
import {
  searchCampaign,
  searchRules,
  type CampaignSearchResult,
} from "../../shared/api/webProductClient.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

export interface SearchPageProps {
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

function runSearchAction(operation: Promise<unknown>, errorMessage: string): void {
  void operation.catch((error: unknown) => {
    console.error(errorMessage, error);
  });
}

function iconFor(type: CampaignSearchResult["type"]) {
  if (type === "fact") return <BookOpen size={17} />;
  if (type === "relation") return <GitFork size={17} />;
  if (type === "clue") return <Lightbulb size={17} />;
  if (type === "objective") return <Flag size={17} />;
  if (type === "rule") return <FileText size={17} />;
  return <EyeOff size={17} />;
}

function resultDestination(campaignId: string, result: CampaignSearchResult): string {
  const item = result.item;
  const query = new URLSearchParams();

  if (result.type === "entity") {
    query.set("entityId", item.entityId ?? item.id);
    return `/campaigns/${campaignId}/entities?${query.toString()}`;
  }

  if (result.type === "fact") {
    if (item.entityId) query.set("entityId", item.entityId);
    query.set("factId", item.id);
    return `/campaigns/${campaignId}/entities?${query.toString()}`;
  }

  if (result.type === "relation") {
    query.set("relationId", item.id);
    if (item.sourceEntityId) query.set("sourceEntityId", item.sourceEntityId);
    if (item.targetEntityId) query.set("targetEntityId", item.targetEntityId);
    return `/campaigns/${campaignId}/graph?${query.toString()}`;
  }

  if (result.type === "clue" && item.entityId) {
    query.set("entityId", item.entityId);
    query.set("clueId", item.id);
    return `/campaigns/${campaignId}/entities?${query.toString()}`;
  }

  if (result.type === "rule") {
    query.set("ruleId", item.id);
    if (item.category) query.set("category", item.category);
    return `/campaigns/${campaignId}/rules?${query.toString()}`;
  }

  query.set("itemId", item.id);
  query.set("itemType", result.type);
  for (const entityId of item.linkedEntityIds ?? []) {
    query.append("entityId", entityId);
  }
  return `/campaigns/${campaignId}/boards?${query.toString()}`;
}

export function SearchPage(props: SearchPageProps = {}) {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [queryLocal, setQueryLocal] = useState("");
  const [results, setResults] = useState<CampaignSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const query = props.searchQuery ?? queryLocal;
  const setQuery = props.setSearchQuery ?? setQueryLocal;

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const handle = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const [campaignResponse, rulesResponse] = await Promise.all([
          searchCampaign(campaignId, normalizedQuery, controller.signal),
          searchRules(normalizedQuery, controller.signal),
        ]);
        if (controller.signal.aborted) return;
        setResults([...campaignResponse.results, ...rulesResponse.results]);
      } catch (searchError: any) {
        if (controller.signal.aborted || searchError?.name === "AbortError") return;
        setError(searchError?.message ?? String(searchError));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 220);

    return () => {
      window.clearTimeout(handle);
      controller.abort();
    };
  }, [campaignId, query]);

  const groupedResults = useMemo(() => {
    const groups = new Map<CampaignSearchResult["type"], CampaignSearchResult[]>();
    for (const result of results) {
      const current = groups.get(result.type) ?? [];
      current.push(result);
      groups.set(result.type, current);
    }
    return Array.from(groups.entries());
  }, [results]);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="card" style={{ padding: 18 }}>
        <label htmlFor="campaign-search-input" style={{ display: "grid", gap: 8 }}>
          <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
            {t("searchPage.placeholder")}
          </span>
          <div style={{ position: "relative" }}>
            <Search
              size={17}
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              id="campaign-search-input"
              className="form-input"
              style={{ paddingLeft: 38 }}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoFocus
              autoComplete="off"
              placeholder={t("searchPage.placeholder")}
              aria-describedby="campaign-search-help"
            />
          </div>
        </label>
        <p id="campaign-search-help" style={{ margin: "10px 0 0", color: "var(--text-muted)", fontSize: 13 }}>
          {t("campaignShell.meta.searchDescription")}
        </p>
      </div>

      <div aria-live="polite" aria-atomic="true">
        {loading && <div className="card" style={{ padding: 16 }}>{t("common.loading")}</div>}
        {error && (
          <div role="alert" className="card" style={{ padding: 16, color: "var(--color-danger)" }}>
            {error}
          </div>
        )}
        {!loading && query.trim().length >= 2 && results.length === 0 && !error && (
          <div className="card" style={{ padding: 24, color: "var(--text-muted)" }}>
            {t("searchPage.noResults")}
          </div>
        )}
      </div>

      {groupedResults.map(([type, group]) => {
        const typeLabel = t(`searchPage.resultTypes.${type}`);
        return (
          <section key={type} aria-labelledby={`search-group-${type}`} style={{ display: "grid", gap: 10 }}>
            <h2
              id={`search-group-${type}`}
              style={{
                margin: "8px 0 0",
                fontSize: 13,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: ".09em",
              }}
            >
              {typeLabel} · {group.length}
            </h2>
            {group.map((result) => {
              const item = result.item;
              const resultTypeLabel = t(`searchPage.resultTypes.${result.type}`);
              return (
                <button
                  key={`${result.type}-${item.id}`}
                  type="button"
                  className="card"
                  onClick={() => {
                    runSearchAction(
                      navigate({ to: resultDestination(campaignId, result) as any }),
                      "No se pudo abrir el resultado de búsqueda.",
                    );
                  }}
                  style={{
                    width: "100%",
                    padding: 16,
                    display: "grid",
                    gap: 6,
                    textAlign: "left",
                    cursor: "pointer",
                    color: "inherit",
                  }}
                  aria-label={`${item.title ?? item.id}. ${resultTypeLabel}`}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: "var(--text-muted)",
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: ".08em",
                    }}
                  >
                    {iconFor(result.type)}
                    {resultTypeLabel}
                    {item.visibility ? ` · ${item.visibility}` : ""}
                  </span>
                  <strong style={{ fontSize: 17 }}>{item.title ?? item.id}</strong>
                  {item.subtitle && (
                    <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{item.subtitle}</span>
                  )}
                  {item.summary && (
                    <span style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>
                      {item.summary.length > 280 ? `${item.summary.slice(0, 280)}…` : item.summary}
                    </span>
                  )}
                  {item.dmSummary && (
                    <span style={{ color: "var(--color-warning)", lineHeight: 1.5 }}>
                      {item.dmSummary.length > 280
                        ? `${item.dmSummary.slice(0, 280)}…`
                        : item.dmSummary}
                    </span>
                  )}
                </button>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
