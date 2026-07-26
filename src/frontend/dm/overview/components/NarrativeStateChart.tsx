import type { CommandCenterNarrativeState } from "../../../shared/api/webProductClient.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";

interface NarrativeStateChartProps {
  state: CommandCenterNarrativeState | undefined;
  label?: string;
}

export function NarrativeStateChart({ state, label }: NarrativeStateChartProps) {
  const { t } = useTranslation();
  const ariaLabel = label ?? t("dashboard.currentState");

  const rows = [
    {
      key: "secrets",
      label: t("dashboard.narrativeState.secrets"),
      values: state?.secrets ?? { hidden: 0, revealed: 0, archived: 0 },
      colors: ["hidden", "revealed", "archived"],
    },
    {
      key: "clues",
      label: t("dashboard.narrativeState.clues"),
      values: state?.clues ?? { unresolved: 0, revealed: 0, archived: 0 },
      colors: ["unresolved", "revealed", "archived"],
    },
    {
      key: "objectives",
      label: t("dashboard.narrativeState.objectives"),
      values: state?.objectives ?? { open: 0, blocked: 0, completed: 0 },
      colors: ["open", "blocked", "completed"],
    },
  ];

  return (
    <div className="dashboard-narrative-chart" role="list" aria-label={ariaLabel}>
      {rows.map((row) => {
        const total = row.colors.reduce((sum, key) => sum + (row.values as Record<string, number>)[key], 0);
        return (
          <div key={row.key} className="dashboard-narrative-chart__row" role="listitem">
            <div className="dashboard-narrative-chart__label">{row.label}</div>
            <div className="dashboard-narrative-chart__bar" aria-label={`${row.label}: ${total}`}>
              {row.colors.map((key) => {
                const value = (row.values as Record<string, number>)[key];
                const statusLabel = t(`dashboard.narrativeState.status.${key}`);
                return value > 0 ? <span key={key} className={`dashboard-narrative-chart__segment dashboard-narrative-chart__segment--${key}`} style={{ flexGrow: value }} title={`${statusLabel}: ${value}`} /> : null;
              })}
            </div>
            <div className="dashboard-narrative-chart__values">
              {row.colors
                .map((key) => `${t(`dashboard.narrativeState.status.${key}`)}: ${(row.values as Record<string, number>)[key]}`)
                .join(" · ")}
            </div>
          </div>
        );
      })}
    </div>
  );
}
