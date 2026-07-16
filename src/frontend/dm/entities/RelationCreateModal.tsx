import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import { themeCss } from "@frontend/shared/theme/themeCssVariables.js";

interface RelationCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function runRelationModalAction(operation: Promise<unknown>, errorMessage: string): void {
  void operation.catch((error: unknown) => {
    console.error(errorMessage, error);
  });
}

const BUILT_IN_RELATION_TYPES = [
  "located_in",
  "lives_in",
  "member_of",
  "ally_of",
  "enemy_of",
  "hides",
  "points_to",
  "causes",
  "contradicts",
  "confirms",
  "works_for",
  "appears_in",
  "contains",
  "leader_of",
  "family_of",
  "owes_debt_to",
  "protects",
  "threatens",
  "hates",
  "loves",
  "fears",
  "trusts",
  "suspects",
  "knows",
  "knows_partially",
  "lies_about",
  "reveals",
  "unlocks",
  "depends_on",
  "blocks",
  "foreshadows",
  "transforms_into",
  "affected_by",
  "created_by",
  "relacionado_con"
];

export function RelationCreateModal({ isOpen, onClose }: RelationCreateModalProps) {
  const { t } = useTranslation();
  const { campaignState, createRelation, error } = useCampaignStore();

  const [sourceEntityId, setSourceEntityId] = useState("");
  const [targetEntityId, setTargetEntityId] = useState("");
  const [relationType, setRelationType] = useState("located_in");
  const [customType, setCustomType] = useState("");

  const builtInOptions = BUILT_IN_RELATION_TYPES.map(type => ({
    value: type,
    label: t(`domain.relationTypes.${type}`)
  })).sort((a, b) => a.label.localeCompare(b.label));

  const handleCreateRelationSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!sourceEntityId || !targetEntityId) return;

    const finalRelationType = relationType === "custom" ? `custom:${customType}` : relationType;
    await createRelation({
      sourceEntityId,
      targetEntityId,
      relationType: finalRelationType
    });

    const storeError = useCampaignStore.getState().error;
    if (!storeError) {
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setSourceEntityId("");
    setTargetEntityId("");
    setRelationType("located_in");
    setCustomType("");
  };

  if (!isOpen) return null;
  if (!campaignState) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 style={{ fontWeight: "700" }}>{t("relationModal.createRelation")}</h2>
          <button className="btn btn-icon btn-secondary" onClick={() => {
            useCampaignStore.setState({ error: null });
            onClose();
          }}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={(event) => {
          runRelationModalAction(handleCreateRelationSubmit(event), "No se pudo crear la relación.");
        }}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">{t("relationModal.sourceEntity")}</label>
              <select
                className="form-select"
                value={sourceEntityId}
                onChange={(e) => setSourceEntityId(e.target.value)}
                required
              >
                <option value="">{t("relationModal.selectSource")}</option>
                {campaignState.entities.filter(e => !e.archived).map(e => (
                  <option key={e.entityId} value={e.entityId}>[{e.entityType}] {e.title}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t("relationModal.relationType")}</label>
              <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                <select
                  className="form-select"
                  value={relationType}
                  onChange={(e) => setRelationType(e.target.value)}
                >
                  {builtInOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                  <option value="custom">{t("canvas.relationPopover.customOption")}</option>
                </select>

                {relationType === "custom" && (
                  <input
                    type="text"
                    placeholder={t("canvas.relationPopover.customPlaceholder")}
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    className="form-input"
                    required
                    autoFocus
                  />
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t("relationModal.targetEntity")}</label>
              <select
                className="form-select"
                value={targetEntityId}
                onChange={(e) => setTargetEntityId(e.target.value)}
                required
              >
                <option value="">{t("relationModal.selectTarget")}</option>
                {campaignState.entities.filter(e => !e.archived).map(e => (
                  <option key={e.entityId} value={e.entityId}>[{e.entityType}] {e.title}</option>
                ))}
              </select>
            </div>
          </div>
          {error?.includes("Duplicate relation") && (
            <div
              style={{
                padding: "10px 16px",
                backgroundColor: themeCss.feedback.warning.background,
                borderTop: `1px solid ${themeCss.feedback.warning.border}`,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "0.85rem",
              }}
            >
              <AlertTriangle
                size={14}
                style={{ color: themeCss.feedback.warning.foreground, flexShrink: 0 }}
              />
              <span style={{ color: themeCss.feedback.warning.foreground }}>
                {t("relationModal.duplicateWarning")}
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ marginLeft: "auto", flexShrink: 0 }}
                onClick={() => {
                  useCampaignStore.setState({ error: null });
                  const finalRelationType = relationType === "custom" ? `custom:${customType}` : relationType;
                  runRelationModalAction((async () => {
                    await createRelation({
                      sourceEntityId,
                      targetEntityId,
                      relationType: finalRelationType,
                      force: true
                    } as any);
                    onClose();
                    resetForm();
                  })(), "No se pudo crear la relación duplicada.");
                }}
              >
                {t("relationModal.createAnyway")}
              </button>
            </div>
          )}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => {
              useCampaignStore.setState({ error: null });
              onClose();
            }}>
              {t("relationModal.cancel")}
            </button>
            <button type="submit" className="btn btn-primary">
              {t("relationModal.registerRelation")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
