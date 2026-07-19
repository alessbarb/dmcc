import { useState, useEffect } from "react";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { useCanvasHistoryStore } from "../../../shared/stores/canvasHistoryStore.js";
import { X, Trash2, ArrowUpRight } from "lucide-react";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import { ImagePickerButton } from "../../../shared/components/ImagePickerButton.js";
import type { Canvas, CanvasEdge, CanvasNode } from "@core/domain/canvas/types.js";
import { isDmOnlyVisibility, type VisibilityRule } from "@core/domain/visibility/visibility.js";
import { canvasVisibilityToVisibilityRule, visibilityRuleToCanvasVisibility, type CanvasVisibility } from "../services/canvasVisibility.js";
import type { Entity, Relation, Fact, PlayerProfile, CanvasEdgeUpdate, CanvasNodeUpdate } from "../../../shared/stores/campaignStore.js";

/** Reads a metadata string field, falling back when missing/empty; avoids unsafe `as string` casts on `unknown`. */
function metaStr(value: unknown, fallback: string): string {
  return value === null || value === undefined || value === "" ? fallback : String(value);
}

const isCanvasNodeColor = (value: string): value is NonNullable<CanvasNode["color"]> =>
  value === "yellow" || value === "blue" || value === "green" || value === "pink" || value === "purple";

const isCanvasEdgeStyle = (value: string): value is NonNullable<CanvasEdge["style"]> =>
  value === "solid" || value === "dashed" || value === "secret" || value === "weak" || value === "strong";

const isCanvasVisibility = (value: string): value is CanvasVisibility => value === "dm" || value === "public";

/** Only "dm_only"/"public" are offered by the entity visibility select's non-"players" options. */
const asSimpleVisibilityKind = (value: string): "dm_only" | "public" => (value === "public" ? "public" : "dm_only");


export interface CanvasInspectorProps {
  canvasId: string;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  onClose: () => void;
  onOpenDetail?: (entityId: string) => void;
  addToast?: (message: string, kind: "success" | "error" | "info" | "warning") => void;
  className?: string;
}

export function CanvasInspector({
  canvasId,
  selectedNodeId,
  selectedEdgeId,
  onClose,
  onOpenDetail,
  addToast,
  className,
}: CanvasInspectorProps) {
  const { t } = useTranslation();
  const {
    campaignState,
    canvasesById,
    updateEntity,
    archiveEntity,
    removeNodeFromCanvas,
    updateCanvasNode,
    updateCanvasEdge,
    removeEdgeFromCanvas,
    updateRelation,
    archiveRelation,
    recordSessionEvent,
    updateCanvasNodesLayout,
    updateFact,
  } = useCampaignStore();

  const canvas = canvasesById[canvasId];

  const reportCanvasActionError = (message: string) => (error: unknown) => {
    console.error(message, error);
    addToast?.(message, "error");
  };

  const runCanvasAction = (operation: Promise<unknown>, errorMessage: string) => {
    void operation.catch(reportCanvasActionError(errorMessage));
  };

  // Selected Node data
  const selectedNode = selectedNodeId ? canvas?.nodes?.find((n: CanvasNode) => n.id === selectedNodeId) : null;
  const entity = selectedNode?.entityId ? campaignState?.entities?.find((e: Entity) => e.entityId === selectedNode.entityId) : null;
  const fact = selectedNode?.factId
    ? (campaignState?.facts instanceof Map
        ? campaignState.facts.get(selectedNode.factId)
        : Array.isArray(campaignState?.facts)
          ? (campaignState!.facts as Fact[]).find((f: Fact) => f.factId === selectedNode.factId)
          : undefined)
    : undefined;

  // Selected Edge data
  const selectedEdge = selectedEdgeId ? canvas?.edges?.find((e: CanvasEdge) => e.id === selectedEdgeId) : null;
  const relation = selectedEdge?.relationshipId ? campaignState?.relations?.find((r: Relation) => r.relationId === selectedEdge.relationshipId) : null;

  // Local form state for selected Node (Entity or Note)
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [noteText, setNoteText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [dramaticObjective, setDramaticObjective] = useState("");
  const [complications, setComplications] = useState("");
  const [consequences, setConsequences] = useState("");

  // Local form state for Fact node
  const [factStatement, setFactStatement] = useState("");
  const [factKind, setFactKind] = useState("canon");
  const [factConfidence, setFactConfidence] = useState("suspected");

  // Local form state for selected Edge
  const [edgeLabel, setEdgeLabel] = useState("");
  const [edgeDesc, setEdgeDesc] = useState("");

  // Sync node data
  useEffect(() => {
    if (selectedNode) {
      if (selectedNode.kind === "entity" && entity) {
        setTitle(entity.title || "");
        setSubtitle(entity.subtitle || "");
        setSummary(entity.summary || "");
        setContent(entity.content || "");
        setImageUrl(metaStr(entity.metadata?.imageUrl, ""));
        setDramaticObjective(metaStr(entity.metadata?.dramaticObjective, ""));
        setComplications(metaStr(entity.metadata?.complications, ""));
        setConsequences(metaStr(entity.metadata?.consequences, ""));
      } else if (selectedNode.kind === "note") {
        setNoteText(selectedNode.text || "");
        setTitle(selectedNode.title || "");
      } else if (selectedNode.kind === "group") {
        setTitle(selectedNode.title || "");
      } else if (selectedNode.kind === "fact" && fact) {
        setFactStatement(fact.statement || "");
        setFactKind(fact.kind || "canon");
        setFactConfidence(fact.confidence || "suspected");
      }
    }
  }, [selectedNodeId, selectedNode, entity, fact]);

  // Sync edge data
  useEffect(() => {
    if (selectedEdge) {
      setEdgeLabel(selectedEdge.label || "");
      setEdgeDesc(relation?.description || "");
    }
  }, [selectedEdgeId, selectedEdge, relation]);

  // Save Node handlers
  const handleNodeTitleBlur = async () => {
    if (selectedNode?.kind === "entity" && entity && title !== entity.title) {
      await updateEntity(entity.entityId, { title });
    } else if (selectedNode?.kind === "note" && title !== selectedNode.title) {
      await updateCanvasNode(canvasId, selectedNode.id, { title });
    } else if (selectedNode?.kind === "group" && title !== selectedNode.title) {
      await updateCanvasNode(canvasId, selectedNode.id, { title });
    }
  };

  const handleNodeSubtitleBlur = async () => {
    if (selectedNode?.kind === "entity" && entity && subtitle !== entity.subtitle) {
      await updateEntity(entity.entityId, { subtitle });
    }
  };

  const handleNodeSummaryBlur = async () => {
    if (selectedNode?.kind === "entity" && entity && summary !== entity.summary) {
      await updateEntity(entity.entityId, { summary });
    }
  };

  const handleNodeContentBlur = async () => {
    if (selectedNode?.kind === "entity" && entity && content !== entity.content) {
      await updateEntity(entity.entityId, { content });
    }
  };

  const handleDramaticObjectiveBlur = async () => {
    if (selectedNode?.kind === "entity" && entity && dramaticObjective !== (entity.metadata?.dramaticObjective || "")) {
      await updateEntity(entity.entityId, {
        metadata: { ...entity.metadata, dramaticObjective }
      });
    }
  };

  const handleComplicationsBlur = async () => {
    if (selectedNode?.kind === "entity" && entity && complications !== (entity.metadata?.complications || "")) {
      await updateEntity(entity.entityId, {
        metadata: { ...entity.metadata, complications }
      });
    }
  };

  const handleConsequencesBlur = async () => {
    if (selectedNode?.kind === "entity" && entity && consequences !== (entity.metadata?.consequences || "")) {
      await updateEntity(entity.entityId, {
        metadata: { ...entity.metadata, consequences }
      });
    }
  };

  const handleNoteTextBlur = async () => {
    if (selectedNode?.kind === "note" && noteText !== selectedNode.text) {
      await updateCanvasNode(canvasId, selectedNode.id, { text: noteText });
    }
  };

  const handleNodeSelectChange = async (field: string, value: string | VisibilityRule) => {
    if (selectedNode?.kind === "entity" && entity) {
      if (field === "visibility_full" && typeof value !== "string") {
        await updateEntity(entity.entityId, { visibility: value });
      } else if (field === "importance" && typeof value === "string") {
        await updateEntity(entity.entityId, { importance: value });
      } else if (field === "status" && typeof value === "string") {
        await updateEntity(entity.entityId, { status: value });

        // --- Revelation Anchors Trigger Check ---
        const activeSession = campaignState?.sessions?.find((s) => s.status === "active");
        if (activeSession && campaignState) {
          const isTriggerStatus = value === "found" || value === "visited" || value === "dead" || value === "completed";
          if (isTriggerStatus) {
            const secrets = campaignState.entities.filter(
              (e: Entity) =>
                e.entityType === "secret" &&
                !e.archived &&
                isDmOnlyVisibility(e.visibility) &&
                Array.isArray(e.metadata?.revelationAnchors) &&
                e.metadata.revelationAnchors.includes(entity.entityId)
            );
            for (const secret of secrets) {
              const confirmReveal = window.confirm(
                t("canvas.node.secretAnchorRevealPrompt", { anchor: entity.title, secret: secret.title })
              );
              if (confirmReveal) {
                await updateEntity(secret.entityId, { visibility: { kind: "public" } });
                await recordSessionEvent(activeSession.sessionId, {
                  type: "reveal",
                  title: `Revelado: ${secret.title}`,
                  description: t("toasts.secretAutoRevealed", { secret: secret.title, anchor: entity.title }),
                  relatedEntityIds: [secret.entityId],
                });
                if (addToast) {
                  addToast(t("toasts.secretRevealed", { title: secret.title }), "success");
                }
              }
            }
          }
        }
      }
    } else if (selectedNode?.kind === "note" || selectedNode?.kind === "group") {
      if (field === "color" && typeof value === "string" && isCanvasNodeColor(value)) {
        await updateCanvasNode(canvasId, selectedNode.id, { color: value });
      }
    }
  };

  // Save Edge handlers
  const handleEdgeLabelBlur = async () => {
    if (selectedEdge && edgeLabel !== selectedEdge.label) {
      await updateCanvasEdge(canvasId, selectedEdge.id, { label: edgeLabel });
    }
  };

  const handleEdgeDescBlur = async () => {
    if (selectedEdge) {
      if (relation) {
        await updateRelation(relation.relationId, { description: edgeDesc });
      } else {
        // Non-domain edges have no schema field for freeform description; pre-existing quirk, not fixed here.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        await updateCanvasEdge(canvasId, selectedEdge.id, { description: edgeDesc } as unknown as CanvasEdgeUpdate);
      }
    }
  };

  const handleEdgeSelectChange = async (field: string, value: string) => {
    if (selectedEdge) {
      if (field === "style" && isCanvasEdgeStyle(value)) {
        await updateCanvasEdge(canvasId, selectedEdge.id, { style: value });
      } else if (field === "visibility" && relation && isCanvasVisibility(value)) {
        await updateRelation(relation.relationId, { visibility: canvasVisibilityToVisibilityRule(value) });
      }
    }
  };

  const handleArchiveEntity = async () => {
    if (entity && window.confirm(t("canvas.node.archiveEntityConfirm", { title: entity.title }))) {
      // 1. Remove from canvas first
      await removeNodeFromCanvas(canvasId, selectedNodeId!);
      // 2. Archive campaign entity
      await archiveEntity(entity.entityId);
      onClose();
    }
  };

  const handleRemoveNode = async () => {
    if (window.confirm(t("canvas.node.removeFromCanvasConfirm"))) {
      const entityId = entity?.entityId;
      const entityTitle = entity?.title;
      await removeNodeFromCanvas(canvasId, selectedNodeId!);
      onClose();

      if (entityId && addToast) {
        const { canvasesById: updatedCanvases } = useCampaignStore.getState();
        const isOnAnyCanvas = Object.values(updatedCanvases).some(
          (c: Canvas) => !c.archived && c.nodes?.some((n: CanvasNode) => n.entityId === entityId)
        );
        if (!isOnAnyCanvas) {
          addToast(
            t("canvas.node.entityNotOnBoard", { title: entityTitle ?? "" }),
            "warning"
          );
        }
      }
    }
  };

  const handleRemoveEdge = async () => {
    if (window.confirm(t("canvas.node.removeRelationFromCanvasConfirm"))) {
      const relationshipId = selectedEdge?.relationshipId;
      const edgeLabel = selectedEdge?.label;
      await removeEdgeFromCanvas(canvasId, selectedEdgeId!);
      onClose();

      if (relationshipId && addToast) {
        const { canvasesById: updatedCanvases } = useCampaignStore.getState();
        const isInAnyCanvas = Object.values(updatedCanvases).some(
          (c: Canvas) => !c.archived && c.edges?.some((e: CanvasEdge) => e.relationshipId === relationshipId)
        );
        if (!isInAnyCanvas) {
          addToast(
            t("canvas.node.relationNotOnBoard", { title: edgeLabel ?? "" }),
            "warning"
          );
        }
      }
    }
  };

  const handleArchiveRelation = async () => {
    if (selectedEdge?.relationshipId && window.confirm(t("canvas.node.archiveRelationConfirm"))) {
      await archiveRelation(selectedEdge.relationshipId);
      await removeEdgeFromCanvas(canvasId, selectedEdgeId!);
      onClose();
    }
  };

  const triggerOpenDetail = () => {
    if (entity && onOpenDetail) {
      onOpenDetail(entity.entityId);
    } else if (entity) {
      // Fallback: search for page details triggers or use store modals
      useCampaignStore.setState({ isEntityModalOpen: false }); // close creation
      // Actually we will trigger dispatch event or open detail modal using Zustand triggers if added,
      // but the callback prop is the primary way
    }
  };

  return (
    <div className={["canvas-inspector", className].filter(Boolean).join(" ")}>
      <div className="inspector-header">
        <h2>Detalle del elemento</h2>
        <button onClick={onClose} className="inspector-close-btn">
          <X size={16} />
        </button>
      </div>

      <div className="inspector-content">
        {selectedNode && (
          <div className="inspector-node-details">
            {/* Note Node Info */}
            {selectedNode.kind === "note" && (
              <>
                <div className="inspector-badge-row">
                  <span className="badge badge-secondary">Nota rápida</span>
                </div>

                <div className="form-group">
                  <label>Título de la nota (opcional)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => {
                      runCanvasAction(handleNodeTitleBlur(), "No se pudo guardar el título del nodo.");
                    }}
                    placeholder={t("canvas.node.quickTitlePlaceholder")}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Contenido</label>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onBlur={() => {
                      runCanvasAction(handleNoteTextBlur(), "No se pudo guardar la nota.");
                    }}
                    rows={8}
                    className="form-textarea font-mono note-inspector-textarea"
                    placeholder="Escribe tu nota adhesiva..."
                  />
                </div>

                <div className="form-group">
                  <label>Color de fondo</label>
                  <select
                    value={selectedNode.color || "yellow"}
                    onChange={(e) => {
                      runCanvasAction(handleNodeSelectChange("color", e.target.value), "No se pudo actualizar el color.");
                    }}
                    className="form-select"
                  >
                    <option value="yellow">Amarillo cálido</option>
                    <option value="blue">Azul claro</option>
                    <option value="green">Verde suave</option>
                    <option value="pink">Rosa pastel</option>
                    <option value="purple">Lila / Lavanda</option>
                  </select>
                </div>

                <div className="inspector-actions">
                  <button
                    onClick={() => {
                      runCanvasAction(handleRemoveNode(), "No se pudo quitar el nodo del canvas.");
                    }}
                    className="btn btn-secondary btn-sm text-critical btn-block"
                  >
                    <Trash2 size={14} /> Eliminar nota
                  </button>
                </div>
              </>
            )}

            {/* Group Node Info */}
            {selectedNode.kind === "group" && (
              <>
                <div className="inspector-badge-row">
                  <span className="badge badge-secondary">Grupo visual</span>
                </div>

                <div className="form-group">
                  <label>Nombre del grupo</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => {
                      runCanvasAction(handleNodeTitleBlur(), "No se pudo guardar el título del nodo.");
                    }}
                    placeholder={t("canvas.groupNode.titlePlaceholder")}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Tipo de Grupo Inteligente</label>
                  <select
                    // groupType is a frontend-only convention not in the canvasNodeSchema; pre-existing quirk, not fixed here.
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                    value={(selectedNode as unknown as { groupType?: string }).groupType || "custom"}
                    onChange={(e) => {
                      runCanvasAction(
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                        updateCanvasNode(canvasId, selectedNode.id, { groupType: e.target.value } as unknown as CanvasNodeUpdate),
                        "No se pudo actualizar el tipo de grupo."
                      );
                    }}
                    className="form-select"
                  >
                    <option value="custom">Personalizado (Sólo visual)</option>
                    <option value="location">📍 Ubicación (Zona, Región, Ciudad)</option>
                    <option value="faction">🛡️ Facción / Organización</option>
                    <option value="arc">🎭 Arco Narrativo / Acto</option>
                    <option value="session">🚀 Sesión de Juego</option>
                    <option value="mystery">🔍 Conspiración / Misterio</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Color del marco</label>
                  <select
                    value={selectedNode.color || "purple"}
                    onChange={(e) => {
                      runCanvasAction(handleNodeSelectChange("color", e.target.value), "No se pudo actualizar el color.");
                    }}
                    className="form-select"
                  >
                    <option value="purple">Lila</option>
                    <option value="blue">Azul</option>
                    <option value="green">Verde</option>
                    <option value="yellow">Amarillo</option>
                    <option value="pink">Rosa</option>
                  </select>
                </div>

                <div className="inspector-actions">
                  <button
                    onClick={() => {
                      runCanvasAction(handleRemoveNode(), "No se pudo quitar el nodo del canvas.");
                    }}
                    className="btn btn-secondary btn-sm text-critical btn-block"
                  >
                    <Trash2 size={14} /> Eliminar grupo
                  </button>
                </div>
              </>
            )}

            {/* Fact Node Info */}
            {selectedNode.kind === "fact" && (
              <>
                <div className="inspector-badge-row">
                  <span className="badge badge-secondary">Hecho narrativo</span>
                  {!fact && <span className="badge badge-warning">Sin resolver</span>}
                </div>

                <div className="form-group">
                  <label>Declaración</label>
                  <textarea
                    value={factStatement}
                    onChange={(e) => setFactStatement(e.target.value)}
                    onBlur={() => {
                      runCanvasAction(
                        (async () => {
                          if (fact && factStatement !== fact.statement) {
                            await updateFact(fact.factId, { statement: factStatement });
                            if (addToast) addToast("Hecho actualizado.", "success");
                          }
                        })(),
                        "No se pudo actualizar el hecho."
                      );
                    }}
                    rows={4}
                    className="form-textarea"
                    placeholder={t("canvas.factNode.statementPlaceholder")}
                  />
                </div>

                <div className="form-group">
                  <label>Tipo epistémico</label>
                  <select
                    value={factKind}
                    onChange={(e) => {
                      setFactKind(e.target.value);
                      if (fact) {
                        runCanvasAction(updateFact(fact.factId, { kind: e.target.value }), "No se pudo actualizar el tipo del hecho.");
                      }
                    }}
                    className="form-select"
                  >
                    <option value="canon">Canon</option>
                    <option value="dm_secret">Secreto DM</option>
                    <option value="rumor">Rumor</option>
                    <option value="lie">Mentira</option>
                    <option value="player_theory">Teoría de jugador</option>
                    <option value="mistake">Error</option>
                    <option value="retcon">Retcon</option>
                    <option value="unknown">Desconocido</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Confianza</label>
                  <select
                    value={factConfidence}
                    onChange={(e) => {
                      setFactConfidence(e.target.value);
                      if (fact) {
                        runCanvasAction(updateFact(fact.factId, { confidence: e.target.value }), "No se pudo actualizar la confianza del hecho.");
                      }
                    }}
                    className="form-select"
                  >
                    <option value="unconfirmed">Sin confirmar</option>
                    <option value="suspected">Sospechado</option>
                    <option value="likely">Probable</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="false">Falso</option>
                  </select>
                </div>

                <div className="inspector-actions">
                  <button
                    onClick={() => {
                      if (!selectedNodeId) return;
                      runCanvasAction(
                        removeNodeFromCanvas(canvasId, selectedNodeId).then(onClose),
                        "No se pudo quitar el hecho del canvas."
                      );
                    }}
                    className="btn btn-secondary btn-sm text-critical btn-block"
                  >
                    <Trash2 size={14} /> Quitar del canvas
                  </button>
                </div>
              </>
            )}

            {/* Entity Node Info */}
            {selectedNode.kind === "entity" && entity && (
              <>
                <div className="inspector-badge-row">
                  <span className="badge badge-primary">{entity.entityType.toUpperCase()}</span>
                  {entity.importance === "critical" && (
                    <span className="badge badge-warning">CRÍTICO 🔍</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Título</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => {
                      runCanvasAction(handleNodeTitleBlur(), "No se pudo guardar el título del nodo.");
                    }}
                    className="form-input font-bold"
                  />
                </div>

                <div className="form-group">
                  <label>Subtítulo / Rol corto</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    onBlur={() => {
                      runCanvasAction(handleNodeSubtitleBlur(), "No se pudo guardar el subtítulo.");
                    }}
                    className="form-input"
                    placeholder={t("canvas.node.rolePlaceholder")}
                  />
                </div>

                <div className="form-group">
                  <label>Imagen / Retrato</label>
                  <ImagePickerButton
                    value={imageUrl}
                    onChange={(path) => {
                      setImageUrl(path);
                      // save immediately on picker selection
                      const current = metaStr(entity.metadata?.imageUrl, "");
                      if (path !== current) {
                        runCanvasAction(
                          updateEntity(entity.entityId, {
                            metadata: { ...entity.metadata, imageUrl: path || undefined },
                          }),
                          "No se pudo guardar la imagen de la entidad."
                        );
                      }
                    }}
                    catalog="entities"
                    shape="circle"
                  />
                </div>

                <div className="form-group">
                  <label>Resumen / Lore público</label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    onBlur={() => {
                      runCanvasAction(handleNodeSummaryBlur(), "No se pudo guardar el resumen.");
                    }}
                    rows={4}
                    className="form-textarea"
                    placeholder="Lore general conocido..."
                  />
                </div>

                <div className="form-group">
                  <label>Notas del DM (Secretos / Preparación)</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onBlur={() => {
                      runCanvasAction(handleNodeContentBlur(), "No se pudo guardar las notas del DM.");
                    }}
                    rows={6}
                    className="form-textarea inspector-dm-notes"
                    placeholder={t("canvas.node.notesPlaceholder")}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group col">
                    <label>Visibilidad</label>
                    <select
                      value={entity.visibility?.kind || "dm_only"}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "players") {
                          const firstPlayerId = campaignState?.players?.[0]?.playerId;
                          const playerIds = firstPlayerId ? [firstPlayerId] : [];
                          runCanvasAction(
                            handleNodeSelectChange("visibility_full", { kind: "players", playerIds }),
                            "No se pudo actualizar la visibilidad."
                          );
                        } else {
                          runCanvasAction(
                            handleNodeSelectChange("visibility_full", { kind: asSimpleVisibilityKind(val) }),
                            "No se pudo actualizar la visibilidad."
                          );
                        }
                      }}
                      className="form-select"
                    >
                      <option value="dm_only">🔒 Solo DM (Secreto)</option>
                      <option value="public">👁 Público (Revelado)</option>
                      <option value="players">🕯 Parcial (Jugadores)</option>
                    </select>
                  </div>
                  <div className="form-group col">
                    <label>Importancia</label>
                    <select
                      value={entity.importance || "normal"}
                      onChange={(e) => {
                        runCanvasAction(handleNodeSelectChange("importance", e.target.value), "No se pudo actualizar la importancia.");
                      }}
                      className="form-select"
                    >
                      <option value="low">Baja</option>
                      <option value="normal">Normal</option>
                      <option value="high">Alta</option>
                      <option value="critical">Crítica</option>
                    </select>
                  </div>
                </div>

                {entity.visibility?.kind === "players" && campaignState?.players && (
                  <div className="form-group inspector-players-visibility">
                    <label className="canvas-inspector__subheading">
                      Revelado a los jugadores:
                    </label>
                    <div className="canvas-inspector__player-list">
                      {campaignState.players.map((p: PlayerProfile) => {
                        const currentIds = entity.visibility.kind === "players" ? entity.visibility.playerIds : [];
                        const isChecked = currentIds.includes(p.playerId);
                        return (
                          <label key={p.playerId} className="canvas-inspector__check-row">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                runCanvasAction(
                                  (async () => {
                                    let newIds = [...currentIds];
                                    if (e.target.checked) {
                                      if (!newIds.includes(p.playerId)) {
                                        newIds.push(p.playerId);
                                      }
                                    } else {
                                      newIds = newIds.filter((id: string) => id !== p.playerId);
                                    }
                                    await updateEntity(entity.entityId, {
                                      visibility: { kind: "players", playerIds: newIds }
                                    });
                                  })(),
                                  "No se pudo actualizar la visibilidad del jugador."
                                );
                              }}
                            />
                            {p.displayName || p.name}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Estado Narrativo</label>
                  <select
                    value={entity.status || "ready"}
                    onChange={(e) => {
                      runCanvasAction(handleNodeSelectChange("status", e.target.value), "No se pudo actualizar el estado narrativo.");
                    }}
                    className="form-select"
                  >
                    {entity.entityType === "npc" && (
                      <>
                        <option value="alive">👤 Vivo</option>
                        <option value="dead">💀 Muerto</option>
                        <option value="missing">❓ Desaparecido</option>
                      </>
                    )}
                    {entity.entityType === "location" && (
                      <>
                        <option value="unvisited">🗺️ No Visitado</option>
                        <option value="visited">👁️ Visitado</option>
                        <option value="destroyed">💥 Destruido</option>
                      </>
                    )}
                    {entity.entityType === "clue" && (
                      <>
                        <option value="unfound">🔍 No Encontrada</option>
                        <option value="found">🕯️ Encontrada</option>
                        <option value="interpreted">🧠 Interpretada</option>
                      </>
                    )}
                    {entity.entityType === "quest" && (
                      <>
                        <option value="active">⚔️ Activa</option>
                        <option value="completed">🏆 Completada</option>
                        <option value="failed">❌ Fallida</option>
                      </>
                    )}
                    {entity.entityType === "secret" && (
                      <>
                        <option value="hidden">🔒 Oculto</option>
                        <option value="hinted">💡 Insinuado</option>
                        <option value="revealed">👁️ Revelado</option>
                      </>
                    )}
                    {!["npc", "location", "clue", "quest", "secret"].includes(entity.entityType) && (
                      <>
                        <option value="ready">Disponible / Activo</option>
                        <option value="blocked">Bloqueado / Pendiente</option>
                        <option value="resolved">Resuelto / Completado</option>
                      </>
                    )}
                  </select>
                </div>

                {entity.entityType === "scene" && (
                  <div className="canvas-inspector__scene-prep">
                    <h3 className="canvas-inspector__subheading canvas-inspector__subheading--flush">
                      Preparación de Escena:
                    </h3>
                    <div className="form-group">
                      <label>Objetivo Dramático</label>
                      <input
                        type="text"
                        value={dramaticObjective}
                        onChange={(e) => setDramaticObjective(e.target.value)}
                        onBlur={() => {
                          runCanvasAction(handleDramaticObjectiveBlur(), "No se pudo guardar el objetivo dramático.");
                        }}
                        className="form-input"
                        placeholder="Ej. Descubrir la entrada secreta..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Complicaciones</label>
                      <textarea
                        value={complications}
                        onChange={(e) => setComplications(e.target.value)}
                        onBlur={() => {
                          runCanvasAction(handleComplicationsBlur(), "No se pudo guardar las complicaciones.");
                        }}
                        rows={2}
                        className="form-textarea"
                        placeholder="Ej. El nivel del agua sube, los guardias patrullan..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Consecuencias</label>
                      <textarea
                        value={consequences}
                        onChange={(e) => setConsequences(e.target.value)}
                        onBlur={() => {
                          runCanvasAction(handleConsequencesBlur(), "No se pudo guardar las consecuencias.");
                        }}
                        rows={2}
                        className="form-textarea"
                        placeholder={t("canvas.node.consequencePlaceholder")}
                      />
                    </div>
                  </div>
                )}

                {entity.entityType === "secret" && campaignState?.entities && (
                  <div className="form-group canvas-inspector__secret-anchors">
                    <label className="canvas-inspector__subheading">
                      Anclas de Revelación:
                    </label>
                    <div className="text-muted canvas-inspector__hint">
                      Elige qué elementos de la campaña disparan la revelación de este secreto.
                    </div>
                    <div className="canvas-inspector__anchor-list">
                      {campaignState.entities
                        .filter((e: Entity) => !e.archived && e.entityId !== entity.entityId && ["clue", "location", "npc"].includes(e.entityType))
                        .map((e: Entity) => {
                          const currentAnchors = Array.isArray(entity.metadata?.revelationAnchors)
                            ? entity.metadata.revelationAnchors
                            : [];
                          const isChecked = currentAnchors.includes(e.entityId);
                          return (
                            <label key={e.entityId} className="canvas-inspector__check-row">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(event) => {
                                  runCanvasAction(
                                    (async () => {
                                      let newAnchors = [...currentAnchors];
                                      if (event.target.checked) {
                                        if (!newAnchors.includes(e.entityId)) {
                                          newAnchors.push(e.entityId);
                                        }
                                      } else {
                                        newAnchors = newAnchors.filter((id: string) => id !== e.entityId);
                                      }
                                      const metadata = { ...entity.metadata, revelationAnchors: newAnchors };
                                      await updateEntity(entity.entityId, { metadata });
                                    })(),
                                    "No se pudo actualizar el ancla de revelación."
                                  );
                                }}
                              />
                              <span className="canvas-inspector__anchor-icon">
                                {e.entityType === "npc" ? "👤" : e.entityType === "location" ? "🗺️" : "🔎"}
                              </span>
                              {e.title}
                            </label>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Group assignment */}
                {(() => {
                  const groups = canvas?.nodes?.filter((n: CanvasNode) => n.kind === "group") ?? [];
                  if (groups.length === 0) return null;
                  const currentGroupId = selectedNode?.groupId ?? selectedNode?.parentId ?? "";
                  return (
                    <div className="form-group canvas-inspector__group-field">
                      <label>Grupo</label>
                      <select
                        className="form-select"
                        value={currentGroupId}
                        onChange={(e) => {
                          const newGroupId = e.target.value || null;
                          const originalNode = canvas.nodes.find(sn => sn.id === selectedNode!.id)!;
                          const beforeLayout = [{
                            nodeId: selectedNode!.id,
                            x: selectedNode!.x ?? 0,
                            y: selectedNode!.y ?? 0,
                            width: originalNode.width,
                            height: originalNode.height,
                            groupId: originalNode.groupId ?? originalNode.parentId ?? null,
                            parentId: originalNode.parentId ?? null,
                          }];
                          const afterLayout = [{
                            nodeId: selectedNode!.id,
                            x: selectedNode!.x ?? 0,
                            y: selectedNode!.y ?? 0,
                            width: originalNode.width,
                            height: originalNode.height,
                            groupId: newGroupId,
                            parentId: null,
                          }];
                          useCanvasHistoryStore.getState().pushEntry(canvasId, {
                            kind: "group-assignment",
                            label: newGroupId ? `Asignar a grupo` : "Quitar del grupo",
                            before: beforeLayout,
                            after: afterLayout,
                          });

                          runCanvasAction(
                            updateCanvasNodesLayout(canvasId, [{
                              nodeId: selectedNode!.id,
                              x: selectedNode!.x ?? 0,
                              y: selectedNode!.y ?? 0,
                              groupId: newGroupId,
                              parentId: null,
                            }]),
                            "No se pudo actualizar el grupo del nodo."
                          );
                        }}
                      >
                        <option value="">Sin grupo</option>
                        {groups.map((g: CanvasNode) => (
                          <option key={g.id} value={g.id}>{g.title || "Grupo"}</option>
                        ))}
                      </select>
                    </div>
                  );
                })()}

                <div className="inspector-actions">
                  {onOpenDetail && (
                    <button
                      onClick={triggerOpenDetail}
                      className="btn btn-primary btn-sm btn-block canvas-inspector__open-detail"
                    >
                      Editar Ficha Completa <ArrowUpRight size={14} />
                    </button>
                  )}

                  <div className="canvas-inspector__entity-actions">
                    <button
                      onClick={() => {
                        runCanvasAction(handleRemoveNode(), "No se pudo quitar el nodo del canvas.");
                      }}
                      className="btn btn-secondary btn-sm text-warning canvas-inspector__entity-action"
                      title={t("canvas.node.removeFromCanvasTooltip")}
                    >
                      Quitar del canvas
                    </button>
                    <button
                      onClick={() => {
                        runCanvasAction(handleArchiveEntity(), "No se pudo archivar la entidad.");
                      }}
                      className="btn btn-secondary btn-sm text-critical canvas-inspector__entity-action"
                      title={t("canvas.node.archiveEntityTooltip")}
                    >
                      Archivar
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {selectedEdge && (
          <div className="inspector-edge-details">
            <div className="inspector-badge-row">
              <span className="badge badge-secondary">
                {selectedEdge.status === "domain" ? t("canvas.node.relationLore") : t("canvas.node.connectionVisual")}
              </span>
            </div>

            <div className="form-group">
              <label>Etiqueta / Relación</label>
              <input
                type="text"
                value={edgeLabel}
                onChange={(e) => setEdgeLabel(e.target.value)}
                onBlur={() => {
                  runCanvasAction(handleEdgeLabelBlur(), "No se pudo guardar la etiqueta de la relación.");
                }}
                className="form-input font-bold"
                placeholder="Ej. vive en, odia a, apunta a..."
              />
            </div>

            <div className="form-group">
              <label>Estilo de línea</label>
              <select
                value={selectedEdge.style || "solid"}
                onChange={(e) => {
                  runCanvasAction(handleEdgeSelectChange("style", e.target.value), "No se pudo actualizar el estilo de línea.");
                }}
                className="form-select"
              >
                <option value="solid">Línea sólida (normal)</option>
                <option value="dashed">Línea discontinua (débil/borrador)</option>
                <option value="secret">Línea de secreto (roja/discontinua)</option>
                <option value="strong">Línea gruesa (fuerte)</option>
                <option value="weak">Línea fina (tenue)</option>
              </select>
            </div>

            {selectedEdge.status === "domain" && relation && (
              <>
                <div className="form-group">
                  <label>Descripción detallada</label>
                  <input
                    type="text"
                    value={edgeDesc}
                    onChange={(e) => setEdgeDesc(e.target.value)}
                    onBlur={() => {
                      runCanvasAction(handleEdgeDescBlur(), "No se pudo guardar la descripción de la relación.");
                    }}
                    className="form-input"
                    placeholder={t("canvas.node.relationDetailPlaceholder")}
                  />
                </div>

                <div className="form-group">
                  <label>Visibilidad de la relación</label>
                  <select
                    value={visibilityRuleToCanvasVisibility(relation.visibility ?? { kind: "dm_only" })}
                    onChange={(e) => {
                      runCanvasAction(handleEdgeSelectChange("visibility", e.target.value), "No se pudo actualizar la visibilidad de la relación.");
                    }}
                    className="form-select"
                  >
                    <option value="dm">Solo DM (Oculto)</option>
                    <option value="public">Público (Revelado)</option>
                  </select>
                </div>
              </>
            )}

            <div className="inspector-actions">
              <button
                onClick={() => {
                  runCanvasAction(handleRemoveEdge(), "No se pudo quitar la relación del canvas.");
                }}
                className="btn btn-secondary btn-sm text-warning btn-block"
              >
                <Trash2 size={14} /> Quitar del canvas
              </button>
              {selectedEdge?.relationshipId && (
                <button
                  onClick={() => {
                    runCanvasAction(handleArchiveRelation(), "No se pudo archivar la relación.");
                  }}
                  className="btn btn-secondary btn-sm text-critical btn-block"
                  title={t("canvas.node.archiveRelationTooltip")}
                >
                  <Trash2 size={14} /> Archivar relación del lore
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
