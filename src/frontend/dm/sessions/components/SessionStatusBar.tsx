import { Clock } from "lucide-react";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import type { Session } from "../../../shared/stores/campaignStore.js";
import { formatElapsed } from "../sessionTimeFormat.js";

export function SessionStatusBar({ activeSession }: { activeSession: Session }) {
  const { t, locale } = useTranslation();
  const elapsed = formatElapsed(activeSession.startedAt);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        padding: "16px 20px",
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-lg)",
        borderLeft: "3px solid var(--color-success)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: "var(--color-success)",
            boxShadow: "0 0 8px var(--color-success)",
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
        <div>
          <div
            style={{
              fontWeight: "800",
              fontSize: "1.1rem",
              letterSpacing: "-0.01em",
              color: "var(--text-main)",
            }}
          >
            {activeSession.title}
          </div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              marginTop: "2px",
            }}
          >
            {t("sessionPage.activeSessionLabel", { sessionNumber: activeSession.number ? `#${activeSession.number}` : "" })}{" "}
            · {t("sessionPage.sessionActiveSince", {
              time: activeSession.startedAt
                ? new Date(activeSession.startedAt).toLocaleTimeString(locale, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—",
            })}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          backgroundColor: "var(--bg-input)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          padding: "8px 14px",
          fontSize: "0.88rem",
          fontWeight: "700",
          color: "var(--text-muted)",
          flexShrink: 0,
        }}
      >
        <Clock size={14} />
        {elapsed}
      </div>
    </div>
  );
}
