import { useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import { getSessionNarrativeMap } from "../../../shared/api/campaignApi.js";
import { readApiError } from "../../../shared/api/apiClient.js";
import { SessionNarrativeMapCanvas } from "./SessionNarrativeMapCanvas.js";
import type { SessionProjection } from "@core/domain/session/projection/sessionProjectionTypes.js";
import "../session-workspace.css";

export function SessionNarrativeMapPage() {
  const { t } = useTranslation();
  const { campaignId, sessionId } = useParams({ strict: false }) as { campaignId?: string; sessionId?: string };
  const [projection, setProjection] = useState<SessionProjection | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId || !sessionId) return;
    let cancelled = false;
    setProjection(null);
    setError(null);
    void getSessionNarrativeMap(campaignId, sessionId)
      .then(async (response) => {
        if (!response.ok) throw new Error(await readApiError(response, "Failed to load narrative map"));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- trusting the server's response shape at the fetch boundary.
        const body = (await response.json()) as { narrativeMap: SessionProjection };
        if (!cancelled) setProjection(body.narrativeMap);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, [campaignId, sessionId]);

  if (error) {
    return (
      <div className="session-page">
        <p>{t("sessionPage.sessionNotFound")}</p>
      </div>
    );
  }

  if (!projection) {
    return (
      <div className="session-page">
        <p>{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="session-page session-narrative-map-page">
      <SessionNarrativeMapCanvas projection={projection} />
    </div>
  );
}
