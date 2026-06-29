import React, { useMemo } from "react";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { Eye, EyeOff, User } from "lucide-react";

export function PlayerKnowledgePage() {
  const { t } = useTranslation();
  const { campaignState } = useCampaignStore();

  const players = useMemo(
    () => (campaignState?.players ?? []).filter((p: any) => !p.archived),
    [campaignState]
  );

  const entities = useMemo(
    () => (campaignState?.entities ?? []).filter((e: any) => !e.archived),
    [campaignState]
  );

  const matrix = useMemo(() => {
    return entities.map((entity: any) => {
      const vis = entity.visibility;
      let visibleToPlayers: string[] = [];
      if (vis) {
        if (vis.kind === "public" || vis.kind === "party") {
          visibleToPlayers = players.map((p: any) => p.playerId ?? p.id);
        } else if (vis.kind === "players" && Array.isArray(vis.playerIds)) {
          visibleToPlayers = vis.playerIds as string[];
        }
        // "dm_only" → visibleToPlayers stays []
      }
      return { entity, visibleToPlayers };
    });
  }, [entities, players]);

  if (!campaignState) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", color: "var(--text-muted)" }}>
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ fontWeight: "700" }}>{t("playerKnowledge.title")}</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
          {t("playerKnowledge.subtitle")}
        </p>
      </div>

      {players.length === 0 ? (
        <div className="card" style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>
          {t("playerKnowledge.noPlayers")}
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr>
                <th style={{
                  textAlign: "left",
                  padding: "8px 12px",
                  borderBottom: "2px solid var(--border-color)",
                  fontWeight: "600",
                  color: "var(--text-muted)",
                  position: "sticky",
                  left: 0,
                  background: "var(--bg-main)"
                }}>
                  {t("playerKnowledge.entityColumn")}
                </th>
                {players.map((p: any) => (
                  <th key={p.playerId ?? p.id} style={{
                    padding: "8px 12px",
                    borderBottom: "2px solid var(--border-color)",
                    textAlign: "center",
                    minWidth: "90px",
                    fontWeight: "600"
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                      <User size={14} style={{ color: "var(--text-muted)" }} />
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{p.name ?? p.displayName}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map(({ entity, visibleToPlayers }: { entity: any; visibleToPlayers: string[] }) => (
                <tr
                  key={entity.entityId}
                  style={{ borderBottom: "1px solid var(--border-color)" }}
                >
                  <td
                    style={{
                      padding: "8px 12px",
                      position: "sticky",
                      left: 0,
                      background: "var(--bg-main)"
                    }}
                  >
                    <span style={{ color: "var(--primary)", fontWeight: "500" }}>{entity.title}</span>
                    <span style={{ marginLeft: "6px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {entity.entityType}
                    </span>
                  </td>
                  {players.map((p: any) => {
                    const pid = p.playerId ?? p.id;
                    const canSee = visibleToPlayers.includes(pid);
                    return (
                      <td key={pid} style={{ padding: "8px 12px", textAlign: "center" }}>
                        {canSee
                          ? <Eye size={16} style={{ color: "var(--success, #22c55e)" }} aria-label={t("playerKnowledge.visible")} />
                          : <EyeOff size={16} style={{ color: "var(--text-muted)", opacity: 0.35 }} aria-label={t("playerKnowledge.hidden")} />
                        }
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
