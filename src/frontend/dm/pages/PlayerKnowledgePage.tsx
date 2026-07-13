import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, RefreshCw, User } from "lucide-react";
import { apiFetch, readApiError } from "../../shared/api/apiClient.js";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

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

const reasonLabel: Record<KnowledgeItem["reason"], string> = {
  public: "Público",
  all_players: "Todo el grupo",
  specific_player: "Concesión específica",
  specific_user: "Concesión al usuario",
  linked_character: "Personaje asignado",
  hidden: "Oculto",
};

export function PlayerKnowledgePage() {
  const { t } = useTranslation();
  const activeCampaignId = useCampaignStore((state) => state.activeCampaignId);
  const [projection, setProjection] = useState<KnowledgeProjection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!activeCampaignId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch(`/api/campaigns/${encodeURIComponent(activeCampaignId)}/player-knowledge`);
      if (!response.ok) throw new Error(await readApiError(response, "No se pudo cargar el conocimiento de los jugadores"));
      setProjection(await response.json());
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

  if (loading) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "var(--text-muted)" }}>{t("common.loading")}</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h2 style={{ fontWeight: 700 }}>{t("playerKnowledge.title")}</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: 4 }}>{t("playerKnowledge.subtitle")}</p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => void load()}>
          <RefreshCw size={15} /> {t("playerPortal.actions.refresh")}
        </button>
      </div>

      {error && <div className="card" role="alert" style={{ padding: 16, color: "var(--color-danger)" }}>{error}</div>}

      {!error && (projection?.players.length ?? 0) === 0 ? (
        <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>{t("playerKnowledge.noPlayers")}</div>
      ) : !error && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "2px solid var(--border-color)", color: "var(--text-muted)", position: "sticky", left: 0, background: "var(--bg-main)", minWidth: 240 }}>
                  {t("playerKnowledge.entityColumn")}
                </th>
                {projection?.players.map((player) => (
                  <th key={player.playerId} style={{ padding: "8px 12px", borderBottom: "2px solid var(--border-color)", textAlign: "center", minWidth: 110 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <User size={14} style={{ color: "var(--text-muted)" }} />
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{player.displayName}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projection?.targets.map((target) => (
                <tr key={`${target.targetType}:${target.targetId}`} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "8px 12px", position: "sticky", left: 0, background: "var(--bg-main)" }}>
                    <span style={{ color: "var(--primary)", fontWeight: 500 }}>{target.title}</span>
                    <span style={{ marginLeft: 6, fontSize: "0.75rem", color: "var(--text-muted)" }}>{target.subtitle ?? target.targetType}</span>
                  </td>
                  {projection.players.map((player) => {
                    const item = knowledgeByPlayer.get(player.playerId)?.get(`${target.targetType}:${target.targetId}`);
                    const visible = Boolean(item?.visible);
                    const label = item ? reasonLabel[item.reason] : reasonLabel.hidden;
                    return (
                      <td key={player.playerId} style={{ padding: "8px 12px", textAlign: "center" }} title={label}>
                        {visible
                          ? <Eye size={16} style={{ color: "var(--success, #22c55e)" }} aria-label={`${t("playerKnowledge.visible")}: ${label}`} />
                          : <EyeOff size={16} style={{ color: "var(--text-muted)", opacity: 0.35 }} aria-label={`${t("playerKnowledge.hidden")}: ${label}`} />}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
