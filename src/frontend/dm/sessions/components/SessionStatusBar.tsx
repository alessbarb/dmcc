import { Clock } from "lucide-react";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import type { Session } from "../../../shared/stores/campaignStore.js";
import { formatElapsed } from "../sessionTimeFormat.js";

export function SessionStatusBar({ activeSession }: { activeSession: Session }) {
  const { t, locale } = useTranslation();
  const elapsed = formatElapsed(activeSession.startedAt);

  return (
    <div className="session-status-bar">
      <div className="session-status-bar__identity">
        <div className="session-status-bar__indicator" aria-hidden="true" />
        <div>
          <div className="session-status-bar__title">{activeSession.title}</div>
          <div className="session-status-bar__meta">
            {t("sessionPage.activeSessionLabel", {
              sessionNumber: activeSession.number ? `#${activeSession.number}` : "",
            })}{" "}
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
      <div className="session-status-bar__elapsed">
        <Clock size={14} />
        {elapsed}
      </div>
    </div>
  );
}
