import { useCallback, useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import { createRelation, getSessionConsequenceChain, reviewSessionInference } from "../../../shared/api/campaignApi.js";
import { readApiError } from "../../../shared/api/apiClient.js";
import { useToast } from "../../../shared/hooks/useToast.js";
import { SessionConsequenceChainCanvas } from "./SessionConsequenceChainCanvas.js";
import { relationTypeForPromotion } from "./promotableInferenceRules.js";
import type { SessionProjection, SessionProjectionEdge, SessionProjectionNode } from "@core/domain/session/projection/sessionProjectionTypes.js";
import "../session-workspace.css";

export function SessionConsequenceChainPage() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { campaignId, sessionId } = useParams({ strict: false }) as { campaignId?: string; sessionId?: string };
  const [projection, setProjection] = useState<SessionProjection | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!campaignId || !sessionId) return;
    void getSessionConsequenceChain(campaignId, sessionId)
      .then(async (response) => {
        if (!response.ok) throw new Error(await readApiError(response, "Failed to load consequence chain"));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- trusting the server's response shape at the fetch boundary.
        const body = (await response.json()) as { consequenceChain: SessionProjection };
        setProjection(body.consequenceChain);
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
    (target: { kind: "node"; node: SessionProjectionNode } | { kind: "edge"; edge: SessionProjectionEdge }, decision: "accepted" | "hidden") => {
      if (!campaignId || !sessionId) return;
      const provenance = target.kind === "node" ? target.node.provenance : target.edge.provenance;
      const targetId = target.kind === "node" ? target.node.id : target.edge.id;
      void reviewSessionInference(campaignId, sessionId, {
        perspective: "consequence_chain",
        ruleId: provenance.ruleId,
        sourceRefs: provenance.sourceRefs,
        targetId,
        decision,
      })
        .then(async (response) => {
          if (!response.ok) throw new Error(await readApiError(response, "Failed to review inference"));
          addToast(t(decision === "accepted" ? "sessionConsequenceChain.reviewConfirmedToast" : "sessionConsequenceChain.reviewHiddenToast"), "success");
          load();
        })
        .catch((err: unknown) => {
          addToast(err instanceof Error ? err.message : String(err), "error");
        });
    },
    [campaignId, sessionId, addToast, t, load],
  );

  const handlePromote = useCallback(
    (edge: SessionProjectionEdge) => {
      if (!campaignId || !projection) return;
      const relationType = relationTypeForPromotion(edge.provenance.ruleId);
      const sourceNode = projection.nodes.find((node) => node.id === edge.sourceId);
      const targetNode = projection.nodes.find((node) => node.id === edge.targetId);
      if (!relationType || sourceNode?.reference.type !== "entity" || targetNode?.reference.type !== "entity") {
        addToast(t("sessionConsequenceChain.reviewPromoteFailed"), "error");
        return;
      }
      void createRelation(campaignId, {
        sourceEntityId: sourceNode.reference.entityId,
        targetEntityId: targetNode.reference.entityId,
        relationType,
      })
        .then(async (response) => {
          if (!response.ok) throw new Error(await readApiError(response, "Failed to promote inference to a relation"));
          addToast(t("sessionConsequenceChain.reviewPromotedToast"), "success");
        })
        .catch((err: unknown) => {
          addToast(err instanceof Error ? err.message : String(err), "error");
        });
    },
    [campaignId, projection, addToast, t],
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
    <div className="session-page session-consequence-chain-page">
      <SessionConsequenceChainCanvas projection={projection} onReview={handleReview} onPromote={handlePromote} />
    </div>
  );
}
