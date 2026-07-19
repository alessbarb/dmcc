import { useCallback, useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import { getSessionNarrativeMap, reviewSessionInference } from "../../../shared/api/campaignApi.js";
import { readApiError } from "../../../shared/api/apiClient.js";
import { useToast } from "../../../shared/hooks/useToast.js";
import { SessionNarrativeMapCanvas } from "./SessionNarrativeMapCanvas.js";
import type { SessionProjection, SessionProjectionNode } from "@core/domain/session/projection/sessionProjectionTypes.js";
import "../session-workspace.css";

export function SessionNarrativeMapPage() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { campaignId, sessionId } = useParams({ strict: false }) as { campaignId?: string; sessionId?: string };
  const [projection, setProjection] = useState<SessionProjection | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!campaignId || !sessionId) return;
    void getSessionNarrativeMap(campaignId, sessionId)
      .then(async (response) => {
        if (!response.ok) throw new Error(await readApiError(response, "Failed to load narrative map"));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- trusting the server's response shape at the fetch boundary.
        const body = (await response.json()) as { narrativeMap: SessionProjection };
        setProjection(body.narrativeMap);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err));
      });
  }, [campaignId, sessionId]);

  useEffect(() => {
    setProjection(null);
    setError(null);
    load();
  }, [load]);

  const handleReview = useCallback(
    (node: SessionProjectionNode, decision: "accepted" | "hidden") => {
      if (!campaignId || !sessionId) return;
      void reviewSessionInference(campaignId, sessionId, {
        perspective: "narrative_map",
        ruleId: node.provenance.ruleId,
        sourceRefs: node.provenance.sourceRefs,
        targetId: node.id,
        decision,
      })
        .then(async (response) => {
          if (!response.ok) throw new Error(await readApiError(response, "Failed to review inference"));
          addToast(t(decision === "accepted" ? "sessionNarrativeMap.reviewConfirmedToast" : "sessionNarrativeMap.reviewHiddenToast"), "success");
          load();
        })
        .catch((err: unknown) => {
          addToast(err instanceof Error ? err.message : String(err), "error");
        });
    },
    [campaignId, sessionId, addToast, t, load],
  );

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
      <SessionNarrativeMapCanvas projection={projection} onReview={handleReview} />
    </div>
  );
}
