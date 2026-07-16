import React, { useState } from "react";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { GitCommit, X } from "lucide-react";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import { canvasVisibilityToVisibilityRule, type CanvasVisibility } from "../services/canvasVisibility.js";


export interface RelationshipEntity {
  entityId: string;
  entityType: string;
}

export interface RelationshipTypePopoverProps {
  canvasId: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceEntity?: RelationshipEntity;
  targetEntity?: RelationshipEntity;
  onSubmit: (data: {
    relationshipId?: string;
    label: string;
    status: "draft" | "domain";
    visibility?: "dm" | "public";
    style?: "solid" | "dashed" | "secret" | "weak" | "strong";
    description?: string;
  }) => void;
  onCancel: () => void;
}

export function RelationshipTypePopover({
  canvasId: _canvasId,
  sourceNodeId: _sourceNodeId,
  targetNodeId: _targetNodeId,
  sourceEntity,
  targetEntity,
  onSubmit,
  onCancel
}: RelationshipTypePopoverProps) {
  const { t } = useTranslation();
  const { createRelation } = useCampaignStore();
  const [relationType, setRelationType] = useState("");
  const [customType, setCustomType] = useState("");
  const [description, setDescription] = useState("");
  const [canvasVisibility, setCanvasVisibility] = useState<CanvasVisibility>("dm");
  const [edgeStyle, setEdgeStyle] = useState<"solid" | "dashed" | "secret" | "weak" | "strong">("solid");

  // Determine if it CAN be a domain relation (requires both ends to be campaign entities)
  const canBeDomainRelation = !!(sourceEntity && targetEntity);
  const [status, setStatus] = useState<"draft" | "domain">(canBeDomainRelation ? "domain" : "draft");

  // Tailored relation options
  const getRelationOptions = () => {
    if (!sourceEntity || !targetEntity) {
      return [{ value: "relacionado_con", label: t("domain.relationTypes.relacionado_con") }];
    }

    const srcType = sourceEntity.entityType;
    const tgtType = targetEntity.entityType;

    const formatOption = (value: string) => {
      if (value.startsWith("custom:")) {
        // Custom types are not translated, they are formatted as-is.
        return { value, label: value.slice(7).replace(/_/g, " ") };
      }
      return { value, label: t(`domain.relationTypes.${value}`) };
    };

    if (srcType === "npc" && tgtType === "location") {
      return [
        formatOption("lives_in"),
        formatOption("works_for"),
        formatOption("protects"),
        formatOption("located_in"),
        formatOption("hates"),
        formatOption("custom:guardian_of"),
      ];
    }

    if (srcType === "npc" && tgtType === "npc") {
      return [
        formatOption("custom:controls"),
        formatOption("custom:blackmails"),
        { value: "works_for", label: t("canvas.relationPopover.worksFor") },
        { value: "custom:hides_something", label: t("canvas.relationPopover.hidesAbout") },
        formatOption("ally_of"),
        formatOption("enemy_of"),
        formatOption("member_of"),
        formatOption("suspects"),
        formatOption("hates"),
        formatOption("fears"),
        formatOption("custom:reports_to"),
        formatOption("custom:subordinate_to"),
        formatOption("custom:seeks_audience"),
        formatOption("custom:allied_with"),
      ];
    }

    if (srcType === "npc" && tgtType === "faction") {
      return [
        formatOption("member_of"),
        formatOption("leader_of"),
        formatOption("custom:employs"),
        formatOption("works_for"),
      ];
    }

    if (srcType === "npc" && (tgtType === "clue" || tgtType === "location" || tgtType === "item")) {
      return [
        formatOption("custom:guards"),
        formatOption("located_in"),
      ];
    }

    if ((srcType === "clue" || srcType === "location") && tgtType === "faction") {
      return [
        formatOption("custom:belongs_to"),
        formatOption("located_in"),
      ];
    }

    if (srcType === "clue" && tgtType === "location") {
      return [
        formatOption("points_to"),
        formatOption("located_in"),
        { value: "reveals", label: t("canvas.relationPopover.revealsInfo") },
      ];
    }

    if (srcType === "clue" && tgtType === "npc") {
      return [
        formatOption("custom:owns"),
        formatOption("custom:revealed_by"),
        formatOption("points_to"),
      ];
    }

    if (srcType === "secret" && tgtType === "npc") {
      return [
        formatOption("custom:owns"),
        formatOption("points_to"),
      ];
    }

    // Generic defaults
    return [
      formatOption("relacionado_con"),
      formatOption("hides"),
      formatOption("unlocks"),
      formatOption("causes"),
      formatOption("contradicts"),
      formatOption("confirms"),
      { value: "located_in", label: t("canvas.relationPopover.memberOf") },
      formatOption("knows"),
    ];
  };

  const options = getRelationOptions();

  // Set default relationType to first option
  React.useEffect(() => {
    if (options.length > 0 && !relationType) {
      setRelationType(options[0].value);
    }
  }, [options]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const run = async () => {
      const selectedLabel = relationType === "custom" ? customType : (options.find(o => o.value === relationType)?.label || relationType);
      if (!selectedLabel.trim()) return;

      let relationshipId: string | undefined;

      if (status === "domain" && sourceEntity && targetEntity) {
        try {
          const relTypeVal = relationType === "custom" ? `custom:${customType}` : relationType;
          relationshipId = await createRelation({
            sourceEntityId: sourceEntity.entityId,
            targetEntityId: targetEntity.entityId,
            relationType: relTypeVal,
            description: description || undefined,
            visibility: canvasVisibilityToVisibilityRule(canvasVisibility)
          });
        } catch (err) {
          console.error("Failed to create domain relation", err);
          return;
        }
      }

      onSubmit({
        relationshipId,
        label: selectedLabel,
        status,
        visibility: canvasVisibility,
        style: edgeStyle,
        description: description || undefined,
      });
    };
    void run();
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "400px" }}>
        <div className="modal-header">
          <h2>
            <GitCommit size={18} style={{ color: "var(--theme-accents-primary-foreground)" }} />
            {t("canvas.relationPopover.createConnection")}
          </h2>
          <button onClick={onCancel} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-form">
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="form-group">
              <label>{t("canvas.relationPopover.connectionType")}</label>
              <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                <select
                  value={relationType}
                  onChange={(e) => setRelationType(e.target.value)}
                  className="form-select"
                >
                  {options.map(opt => (
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
              <label>{t("canvas.relationPopover.relationLevel")}</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                <label style={{ display: "flex", alignItems: "start", gap: "8px", fontWeight: "normal", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="relStatus"
                    value="domain"
                    disabled={!canBeDomainRelation}
                    checked={status === "domain"}
                    onChange={() => setStatus("domain")}
                    style={{ marginTop: "3px" }}
                  />
                  <div>
                    <strong>{t("canvas.relationPopover.realRelation")}</strong>
                    <div className="text-muted" style={{ fontSize: "11px" }}>
                      {t("canvas.relationPopover.realRelationDesc")}
                    </div>
                  </div>
                </label>
                
                <label style={{ display: "flex", alignItems: "start", gap: "8px", fontWeight: "normal", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="relStatus"
                    value="draft"
                    checked={status === "draft"}
                    onChange={() => setStatus("draft")}
                    style={{ marginTop: "3px" }}
                  />
                  <div>
                    <strong>{t("canvas.relationPopover.visualDraft")}</strong>
                    <div className="text-muted" style={{ fontSize: "11px" }}>
                      {t("canvas.relationPopover.visualDraftDesc")}
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>{t("canvas.relationPopover.lineStyle")}</label>
              <select
                value={edgeStyle}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "solid" || val === "dashed" || val === "secret" || val === "strong" || val === "weak") {
                    setEdgeStyle(val);
                  }
                }}
                className="form-select"
              >
                <option value="solid">{t("canvas.relationPopover.lineSolid")}</option>
                <option value="dashed">{t("canvas.relationPopover.lineDashed")}</option>
                <option value="secret">{t("canvas.relationPopover.lineSecret")}</option>
                <option value="strong">{t("canvas.relationPopover.lineStrong")}</option>
                <option value="weak">{t("canvas.relationPopover.lineWeak")}</option>
              </select>
            </div>

            {status === "domain" && (
              <>
                <div className="form-group">
                  <label>{t("canvas.relationPopover.relationDescription")}</label>
                  <input
                    type="text"
                    placeholder={t("canvas.relationPopover.detailsPlaceholder")}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>{t("canvas.relationPopover.relationVisibility")}</label>
                  <div style={{ display: "flex", gap: "16px", marginTop: "4px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "normal", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="relVisibility"
                        checked={canvasVisibility === "dm"}
                        onChange={() => setCanvasVisibility("dm")}
                      />
                      {t("canvas.relationPopover.dmOnly")}
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "normal", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="relVisibility"
                        checked={canvasVisibility === "public"}
                        onChange={() => setCanvasVisibility("public")}
                      />
                      {t("canvas.relationPopover.public")}
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              {t("relationModal.cancel")}
            </button>
            <button type="submit" className="btn btn-primary">
              {t("canvas.relationPopover.connect")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
