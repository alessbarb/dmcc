import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, RefreshCw, Search, User, Users } from "lucide-react";
import { apiFetch, readApiError } from "../../../shared/api/apiClient.js";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";

interface KnowledgeItem {
  targetType: "entity" | "fact" | "relation" | "clue" | "objective";
  targetId: string;
  title: string;
  subtitle?: string;
  visible: boolean;
  reason: "public" | "all_players" | "specific_player" | "specific_user" | "linked_character" | "hidden";
}

interface KnowledgePlayer {
  playerId: string;
  displayName: string;
  knowledge: KnowledgeItem[];
}

interface KnowledgeProjection {
  players: KnowledgePlayer[];
  targets: Array<Omit<KnowledgeItem, "visible" | "reason">>;
}

export function PlayerKnowledgeView() {
  const { t } = useTranslation();
  const activeCampaignId = useCampaignStore((state) => state.activeCampaignId);
  const [projection, setProjection] = useState<KnowledgeProjection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "visible" | "hidden">("all");

  const load = async () => {
    if (!activeCampaignId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch(`/api/campaigns/${encodeURIComponent(activeCampaignId)}/player-knowledge`);
      if (!response.ok) throw new Error(await readApiError(response, t("playerKnowledge.noPlayers")));
      // Trusting the server's response shape at the fetch boundary; no runtime schema here.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      setProjection(await response.json() as KnowledgeProjection);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : String(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [activeCampaignId]);

  const knowledgeByPlayer = useMemo(() => new Map(
    (projection?.players ?? []).map((player) => [
      player.playerId,
      new Map(player.knowledge.map((item) => [`${item.targetType}:${item.targetId}`, item])),
    ]),
  ), [projection]);

  const filteredTargets = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return (projection?.targets ?? []).filter((target) => {
      if (normalizedQuery && !`${target.title} ${target.subtitle ?? ""}`.toLocaleLowerCase().includes(normalizedQuery)) return false;
      if (visibilityFilter === "all") return true;
      const visibleToAnyPlayer = (projection?.players ?? []).some((player) =>
        Boolean(knowledgeByPlayer.get(player.playerId)?.get(`${target.targetType}:${target.targetId}`)?.visible),
      );
      return visibilityFilter === "visible" ? visibleToAnyPlayer : !visibleToAnyPlayer;
    });
  }, [knowledgeByPlayer, projection, query, visibilityFilter]);

  if (loading) {
    return <div className="people-loading-state" role="status">{t("common.loading")}</div>;
  }

  return (
    <div className="people-knowledge-view">
      <header className="people-knowledge-toolbar surface-panel">
        <div className="people-knowledge-toolbar__copy">
          <p className="people-section-eyebrow">{projection?.targets.length ?? 0}</p>
          <h2>{t("playerKnowledge.title")}</h2>
          <p>{t("playerKnowledge.subtitle")}</p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => void load()}>
          <RefreshCw size={15} /> {t("playerPortal.actions.refresh")}
        </button>
      </header>

      {error && <div className="people-inline-error surface-panel" role="alert">{error}</div>}

      {!error && (projection?.players.length ?? 0) === 0 ? (
        <section className="people-empty-state surface-panel">
          <Users size={34} aria-hidden="true" />
          <h3>{t("playerKnowledge.noPlayers")}</h3>
        </section>
      ) : !error && (
        <>
          <div className="people-knowledge-filters">
            <label className="people-search-field">
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("common.search")}
                aria-label={t("common.search")}
              />
            </label>
            <div className="people-filter-group" role="group" aria-label={t("playerKnowledge.visible")}>
              <button type="button" className={`btn btn-sm ${visibilityFilter === "all" ? "btn-primary" : "btn-secondary"}`} onClick={() => setVisibilityFilter("all")}>
                <Users size={14} /> {projection?.targets.length ?? 0}
              </button>
              <button type="button" className={`btn btn-sm ${visibilityFilter === "visible" ? "btn-primary" : "btn-secondary"}`} onClick={() => setVisibilityFilter("visible")}>
                <Eye size={14} /> {t("playerKnowledge.visible")}
              </button>
              <button type="button" className={`btn btn-sm ${visibilityFilter === "hidden" ? "btn-primary" : "btn-secondary"}`} onClick={() => setVisibilityFilter("hidden")}>
                <EyeOff size={14} /> {t("playerKnowledge.hidden")}
              </button>
            </div>
          </div>

          {filteredTargets.length === 0 ? (
            <section className="people-empty-state surface-panel">
              <Search size={32} aria-hidden="true" />
              <h3>{t("playerKnowledge.entityColumn")}: 0</h3>
            </section>
          ) : (
            <div className="people-knowledge-table-wrap surface-panel">
              <table className="people-knowledge-table">
                <thead>
                  <tr>
                    <th className="people-knowledge-table__target">{t("playerKnowledge.entityColumn")}</th>
                    {projection?.players.map((player) => (
                      <th key={player.playerId}>
                        <span className="people-player-column"><User size={14} aria-hidden="true" />{player.displayName}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTargets.map((target) => (
                    <tr key={`${target.targetType}:${target.targetId}`}>
                      <td className="people-knowledge-table__target">
                        <strong>{target.title}</strong>
                        {target.subtitle && <span>{target.subtitle}</span>}
                      </td>
                      {projection?.players.map((player) => {
                        const item = knowledgeByPlayer.get(player.playerId)?.get(`${target.targetType}:${target.targetId}`);
                        const visible = Boolean(item?.visible);
                        const label = visible ? t("playerKnowledge.visible") : t("playerKnowledge.hidden");
                        return (
                          <td key={player.playerId} title={label}>
                            <span className={`people-knowledge-cell ${visible ? "is-visible" : "is-hidden"}`}>
                              {visible ? <Eye size={17} aria-label={label} /> : <EyeOff size={17} aria-label={label} />}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
