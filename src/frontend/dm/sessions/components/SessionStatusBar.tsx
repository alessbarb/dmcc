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
        backgroundColor: "var(--theme-surfaces-base)",
        border: "1px solid var(--theme-borders-default)",
        borderRadius: "var(--theme-shapes-radius-large)",
        borderLeft: "3px solid var(--theme-feedback-success-foreground)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: "var(--theme-feedback-success-foreground)",
            boxShadow: "0 0 8px var(--theme-feedback-success-foreground)",
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
              color: "var(--theme-text-primary)",
            }}
          >
            {activeSession.title}
          </div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--theme-text-secondary)",
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
          backgroundColor: "var(--theme-surfaces-interactive)",
          border: "1px solid var(--theme-borders-default)",
          borderRadius: "var(--theme-shapes-radius-medium)",
          padding: "8px 14px",
          fontSize: "0.88rem",
          fontWeight: "700",
          color: "var(--theme-text-secondary)",
          flexShrink: 0,
        }}
      >
        <Clock size={14} />
        {elapsed}
      </div>
    </div>
  );
}
