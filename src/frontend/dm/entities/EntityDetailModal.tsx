import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  EyeOff,
  Archive,
  Pencil,
  Clock,
  GitBranch,
  FileText,
  AlignLeft,
  Bookmark,
  BookmarkCheck,
  Expand,
  Focus,
} from "lucide-react";
import { getEntityDefaultImage } from "./entityVisuals.js";
import { ResumenTab } from "./ResumenTab.js";
import { EntityRelationsTab } from "./relations/EntityRelationsTab.js";
import { useEntityRelationshipNavigation } from "./relations/useEntityRelationshipNavigation.js";
import { HechosTab } from "./HechosTab.js";
import { TrazabilidadTab } from "./TrazabilidadTab.js";
import { EntityImageReframeDialog } from "../../shared/components/EntityImageReframeDialog.js";
import {
  DEFAULT_IMAGE_FOCAL_POINT,
  parseImageFocalPoint,
  withImageFocalPoint,
} from "../../shared/images/imageFocalPoint.js";
import { PlayerCharacterDetailModal } from "./PlayerCharacterDetailModal.js";
import "./entity-detail-modal.css";
import "./entityDetailHeroActions.css";
import "./entityDetailDialog.css";
import "./entityDetailImageContinuation.css";
import { useCampaignShortcuts } from "../shortcuts/useCampaignShortcuts.js";
import type { Entity, Relation, Fact, Session, CampaignStateStore } from "../../shared/stores/campaignStore.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import type { VisibilityRule } from "@core/domain/visibility/visibility.js";
import type { ToastKind } from "../../shared/hooks/useToast.js";
import { useBodyDataAttribute } from "../../shared/hooks/useBodyDataAttribute.js";

type CampaignState = NonNullable<CampaignStateStore["campaignState"]>;

interface EntityDetailModalProps {
  selectedEntity: Entity;
  campaignState: CampaignState;
  onClose: () => void;
  /** Navigates the modal to another entity by id, without closing it. */
  onSelectEntity: (entityId: string) => void;
  onEdit: (entityId: string, updates: Partial<Entity>) => Promise<void>;
  onArchive: (entityId: string) => Promise<void>;
  onVisibilityChange: (entityId: string, visibility: VisibilityRule) => Promise<void>;
  addToast: (msg: string, kind?: ToastKind) => void;
  heroActions?: React.ReactNode;
  /** Set by the wrapper so the relations history survives a switch to PlayerCharacterDetailModal and back. */
  relationsHistory?: { canGoBack: boolean; onBack: () => void };
}

type TabId = "resumen" | "relaciones" | "hechos" | "trazabilidad";

function getRelationsArray(relations: Relation[] | undefined): Relation[] {
  return Array.isArray(relations) ? relations : [];
}

const TABS: { id: TabId; labelKey: string; icon: React.ReactNode }[] = [
  { id: "resumen", labelKey: "entityDetail.tabsSummary", icon: <AlignLeft size={13} /> },
  { id: "relaciones", labelKey: "entityDetail.tabsRelations", icon: <GitBranch size={13} /> },
  { id: "hechos", labelKey: "entityDetail.tabsFacts", icon: <FileText size={13} /> },
  { id: "trazabilidad", labelKey: "entityDetail.tabsTrace", icon: <Clock size={13} /> },
];

function runEntityDetailAction(operation: Promise<unknown>, errorMessage: string): void {
  void operation.catch((error: unknown) => {
    console.error(errorMessage, error);
  });
}

// Safely get values from Maps or plain objects/arrays
function getFactsArray(facts: unknown): Fact[] {
  if (!facts) return [];
  if (Array.isArray(facts)) return facts;
  if (facts instanceof Map) return Array.from(facts.values());
  if (typeof facts === "object") return Object.values(facts);
  return [];
}

function getSessionsArray(sessions: unknown): Session[] {
  if (!sessions) return [];
  if (Array.isArray(sessions)) return sessions;
  if (sessions instanceof Map) return Array.from(sessions.values());
  if (typeof sessions === "object") return Object.values(sessions);
  return [];
}

// ─── Sub-tab renderers ────────────────────────────────────────────────────────

// ─── Main component ───────────────────────────────────────────────────────────

function StandardEntityDetailModal({
  selectedEntity,
  campaignState,
  onClose,
  onSelectEntity,
  onEdit,
  onArchive,
  onVisibilityChange,
  addToast,
  heroActions,
  relationsHistory,
}: EntityDetailModalProps) {
  useBodyDataAttribute("entityDetailDialogOpen", "true");
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>("resumen");
  const [isRelationsExpanded, setIsRelationsExpanded] = useState(false);
  const [relationsToolbarSlot, setRelationsToolbarSlot] = useState<React.ReactNode>(null);
  const [isEditingEntity, setIsEditingEntity] = useState(false);
  const [editEntityForm, setEditEntityForm] = useState<Partial<Entity>>({});
  const [isConfirmingArchive, setIsConfirmingArchive] = useState(false);
  const { shortcuts, addShortcut, removeShortcut } = useCampaignShortcuts(campaignState.campaign?.campaignId);
  const existingShortcut = shortcuts.find(
    (shortcut) => shortcut.targetType === "entity" && shortcut.targetId === selectedEntity.entityId,
  );
  const handleToggleShortcut = () => {
    if (existingShortcut) {
      void removeShortcut(existingShortcut.shortcutId);
    } else {
      void addShortcut("entity", selectedEntity.entityId);
    }
  };

  const imgUrl =
    typeof selectedEntity.metadata?.imageUrl === "string" && selectedEntity.metadata.imageUrl
      ? selectedEntity.metadata.imageUrl
      : getEntityDefaultImage(selectedEntity.entityType);

  const isDmOnly =
    !selectedEntity.visibility?.kind ||
    selectedEntity.visibility.kind === "dm_only";

  const handleVisibilityChange = (entityId: string, visibility: VisibilityRule) => {
    runEntityDetailAction(onVisibilityChange(entityId, visibility), "No se pudo cambiar la visibilidad de la entidad.");
  };

  const handleArchive = () => {
    if (!isConfirmingArchive) {
      setIsConfirmingArchive(true);
      return;
    }
    runEntityDetailAction((async () => {
      setIsConfirmingArchive(false);
      await onArchive(selectedEntity.entityId);
      addToast(t("entityDetail.archivedToast", { title: selectedEntity.title }), "info");
      onClose();
      setIsEditingEntity(false);
      setEditEntityForm({});
    })(), "No se pudo archivar la entidad.");
  };

  const handleToggleEdit = () => {
    if (!isEditingEntity) {
      setEditEntityForm({
        title: selectedEntity.title,
        subtitle: selectedEntity.subtitle,
        summary: selectedEntity.summary,
        content: selectedEntity.content,
        status: selectedEntity.status,
        importance: selectedEntity.importance,
        metadata: selectedEntity.metadata ? { ...selectedEntity.metadata } : {},
      });
      setActiveTab("resumen");
    } else {
      setEditEntityForm({});
    }
    setIsEditingEntity(!isEditingEntity);
  };

  const handleSaveEdit = () => {
    runEntityDetailAction((async () => {
      await onEdit(selectedEntity.entityId, editEntityForm);
      setIsEditingEntity(false);
      setEditEntityForm({});
    })(), "No se pudieron guardar los cambios de la entidad.");
  };

  return (
    <div className={`modal-overlay entity-detail-dialog${isEditingEntity ? " entity-detail-dialog--editing" : ""}`} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={`modal-content entity-detail-dialog${isRelationsExpanded ? " entity-detail-dialog--relations-expanded" : ""}${isEditingEntity ? " entity-detail-dialog--editing" : ""}${isRelationsExpanded ? "" : " entity-detail-dialog--compact"}`}
      >
        {/* Hero image */}
        <div className="entity-detail-hero">
          <img
            src={imgUrl}
            alt={isDmOnly ? "" : selectedEntity.title}
            className="entity-detail-hero__image"
            style={{
              "--entity-detail-hero-filter": isDmOnly ? "grayscale(70%) brightness(35%)" : "none",
              "--entity-detail-hero-opacity": selectedEntity.metadata?.imageUrl ? 1 : 0.6,
            } as React.CSSProperties & Record<`--${string}`, string | number>}
          />
          {isDmOnly && (
            <div className="entity-detail-hero__dm-overlay">
              <EyeOff size={20} />
              <span>Secreto / Solo DM</span>
            </div>
          )}
          <div className="entity-detail-hero__gradient" />
        </div>

        {/* Header */}
        <div className="modal-header entity-detail-modal__header">
          <div>
            <span className="badge badge-primary">{selectedEntity.entityType}</span>
            <h2 className="entity-detail-modal__title">
              {selectedEntity.title}
            </h2>
            {selectedEntity.subtitle && (
              <h4 className="card-subtitle">{selectedEntity.subtitle}</h4>
            )}
          </div>
        </div>

        {/* Tab bar */}
        <div className="entity-detail-tab-bar">
          <div
            className="entity-detail-tabs"
            role="tablist"
            aria-label={t("entityExtra.sectionsAriaLabel")}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`entity-detail-modal__tab-btn${isActive ? " entity-detail-modal__tab-btn--active" : ""}`}
                >
                  {tab.icon}
                  {t(tab.labelKey)}
                </button>
              );
            })}
          </div>

          <div className="entity-detail-tab-actions">
            {isRelationsExpanded ? relationsToolbarSlot : heroActions}

            <button
              type="button"
              className="btn btn-secondary btn-icon"
              onClick={onClose}
              aria-label="Cerrar"
              title="Cerrar"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Tab body */}
        <div className="modal-body entity-detail-modal__body">
          {activeTab === "resumen" && (
            <ResumenTab
              entity={selectedEntity}
              campaignState={campaignState}
              isEditingEntity={isEditingEntity}
              editEntityForm={editEntityForm}
              setEditEntityForm={setEditEntityForm}
              onVisibilityChange={handleVisibilityChange}
            />
          )}
          {activeTab === "relaciones" && (
            <EntityRelationsTab
              entity={selectedEntity}
              campaignState={campaignState}
              onNavigateEntity={onSelectEntity}
              canGoBack={relationsHistory?.canGoBack}
              onBack={relationsHistory?.onBack}
              onExpandedChange={setIsRelationsExpanded}
              onToolbarSlotChange={setRelationsToolbarSlot}
            />
          )}
          {activeTab === "hechos" && (
            <HechosTab
              entityId={selectedEntity.entityId}
              facts={getFactsArray(campaignState.facts)}
              sessions={getSessionsArray(campaignState.sessions)}
            />
          )}
          {activeTab === "trazabilidad" && (
            <TrazabilidadTab
              entity={selectedEntity}
              relations={getRelationsArray(campaignState.relations)}
              facts={getFactsArray(campaignState.facts)}
              sessions={getSessionsArray(campaignState.sessions)}
            />
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer entity-detail-modal__footer">
          <div className="entity-detail-modal__footer-group entity-detail-modal__footer-group--actions">
            <button
              type="button"
              className={`btn btn-sm ${isConfirmingArchive ? "btn-danger" : "btn-secondary"}`}
              onClick={handleArchive}
              onBlur={() => setIsConfirmingArchive(false)}
            >
              <Archive size={14} /> {isConfirmingArchive ? t("entityModal.confirmArchive") : t("entityModal.archive")}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={handleToggleShortcut}
              title={existingShortcut ? t("shortcuts.remove") : t("shortcuts.add")}
            >
              {existingShortcut ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
              {" "}
              {existingShortcut ? t("shortcuts.remove") : t("shortcuts.add")}
            </button>
          </div>
          <div className="entity-detail-modal__footer-group">
            <span className="entity-detail-modal__updated-label">
              Actualizado: {new Date(selectedEntity.updatedAt).toLocaleString()}
            </span>
            {activeTab === "resumen" && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleToggleEdit}
              >
                <Pencil size={13} />{" "}
                {isEditingEntity ? t("entityModal.cancelEdit") : t("common.edit")}
              </button>
            )}
            {isEditingEntity && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSaveEdit}
              >
                Guardar cambios
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                onClose();
                setIsEditingEntity(false);
                setEditEntityForm({});
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


function resolveEntityImage(entity: Entity): string | null {
  const metadata = entity.metadata ?? {};
  const candidates = [metadata.imageUrl, metadata.avatarUrl, metadata.portraitUrl, metadata.coverUrl];
  return candidates.find((value): value is string => typeof value === "string" && value.trim().length > 0)?.trim() ?? null;
}

function FullImageDialog({ imageUrl, title, onClose }: { imageUrl: string; title: string; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="entity-image-lightbox"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="entity-image-lightbox__stage"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <img src={imageUrl} alt={title} />

        <button
          type="button"
          className="btn btn-secondary btn-icon entity-image-lightbox__close"
          onClick={onClose}
          aria-label="Cerrar imagen"
          title="Cerrar imagen"
        >
          <X size={20} />
        </button>
      </div>
    </div>,
    document.body,
  );
}

function StandardEntityDetailWithImageFocus(props: EntityDetailModalProps) {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const metadata = props.selectedEntity.metadata ?? {};
  const imageUrl = useMemo(
    () => resolveEntityImage(props.selectedEntity),
    [props.selectedEntity],
  );
  const storedFocus = useMemo(
    () => parseImageFocalPoint(imageUrl ?? undefined) ?? DEFAULT_IMAGE_FOCAL_POINT,
    [imageUrl],
  );
  const [focusX, setFocusX] = useState(() => storedFocus.x * 100);
  const [focusY, setFocusY] = useState(() => storedFocus.y * 100);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setFocusX(storedFocus.x * 100);
    setFocusY(storedFocus.y * 100);
  }, [
    storedFocus.x,
    storedFocus.y,
    props.selectedEntity.entityId,
  ]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const image = root.querySelector<HTMLImageElement>(
      ".modal-content > .entity-detail-hero > img",
    );
    if (!image) return undefined;

    image.style.setProperty(
      "--entity-detail-image-position",
      `${focusX}% ${focusY}%`,
    );
    image.classList.add("entity-detail-hero-image");

    const openImage = () => {
      if (imageUrl) setIsExpanded(true);
    };
    image.addEventListener("click", openImage);
    return () => image.removeEventListener("click", openImage);
  }, [focusX, focusY, imageUrl]);

  const saveFocus = async (nextX: number, nextY: number) => {
    if (!imageUrl) return;

    const {
      imageFocusX,
      imageFocusY,
      ...metadataWithoutLegacyFocus
    } = metadata;

    // These fields belong to the legacy system. Read only to
    // omit them when saving normalized metadata.
    void imageFocusX;
    void imageFocusY;

    await props.onEdit(props.selectedEntity.entityId, {
      metadata: {
        ...metadataWithoutLegacyFocus,
        imageUrl: withImageFocalPoint(imageUrl, {
          x: nextX / 100,
          y: nextY / 100,
        }),
      },
    });

    setFocusX(nextX);
    setFocusY(nextY);
    setIsAdjusting(false);
  };

  return (
    <div ref={rootRef} className="entity-detail-focus-shell">
      <StandardEntityDetailModal
        {...props}
        heroActions={imageUrl ? (
          <>
            <button
              type="button"
              className="btn btn-secondary btn-icon"
              onPointerDown={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsAdjusting(true);
              }}
              aria-label={t("entityExtra.fitFrame")}
              title={t("entityExtra.fitFrame")}
            >
              <Focus size={16} />
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-icon"
              onPointerDown={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsExpanded(true);
              }}
              aria-label="Ver imagen completa"
              title="Ver imagen completa"
            >
              <Expand size={16} />
            </button>
          </>
        ) : null}
      />
      {isAdjusting && imageUrl && (
        <EntityImageReframeDialog
          imageUrl={imageUrl}
          title={props.selectedEntity.title}
          initialX={focusX}
          initialY={focusY}
          onCancel={() => setIsAdjusting(false)}
          onSave={(nextX, nextY) => void saveFocus(nextX, nextY)}
        />
      )}
      {isExpanded && imageUrl && (
        <FullImageDialog imageUrl={imageUrl} title={props.selectedEntity.title} onClose={() => setIsExpanded(false)} />
      )}
    </div>
  );
}

export function EntityDetailModal(props: EntityDetailModalProps) {
  const [showEntityEditor, setShowEntityEditor] = useState(false);
  const navigation = useEntityRelationshipNavigation({
    currentEntityId: props.selectedEntity.entityId,
    onSelectEntity: props.onSelectEntity,
  });
  const navigatedProps: EntityDetailModalProps = {
    ...props,
    onSelectEntity: navigation.navigateToEntity,
    relationsHistory: { canGoBack: navigation.canGoBack, onBack: navigation.goBack },
  };

  if (props.selectedEntity.entityType !== "player_character" || showEntityEditor) {
    return <StandardEntityDetailWithImageFocus {...navigatedProps} />;
  }

  return (
    <PlayerCharacterDetailModal
      {...navigatedProps}
      onEditEntity={() => setShowEntityEditor(true)}
    />
  );
}
