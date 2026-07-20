import React, { useEffect, useMemo, useState } from "react";
import { Activity, Heart, Pencil, Shield, Sparkles, UserRound, X } from "lucide-react";
import { getEntityDefaultImage } from "./entityVisuals.js";
import type { Entity, CampaignStateStore } from "../../shared/stores/campaignStore.js";
import type { ToastKind } from "../../shared/hooks/useToast.js";
import type { VisibilityRule } from "@core/domain/visibility/visibility.js";
import { useBodyDataAttribute } from "../../shared/hooks/useBodyDataAttribute.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import "./entity-detail-modal.css";
import "./entityDetailHeroActions.css";
import "./entityDetailDialog.css";
import "./entityDetailImageContinuation.css";
import "./playerCharacterDetail.css";

export type CampaignState = NonNullable<CampaignStateStore["campaignState"]>;

export type CharacterSheetResponse = {
  entityId: string;
  player: { playerId: string; displayName: string; pronouns?: string | null } | null;
  status: Record<string, unknown>;
  resources: Array<Record<string, unknown> & { resourceId: string; updatedAt?: string }>;
  updatedAt: string | null;
  source: "entity" | "player_portal";
};

export interface PlayerCharacterDetailModalProps {
  selectedEntity: Entity;
  campaignState: CampaignState;
  onClose: () => void;
  onEdit: (entityId: string, updates: Partial<Entity>) => Promise<void>;
  onArchive: (entityId: string) => Promise<void>;
  onVisibilityChange: (entityId: string, visibility: VisibilityRule) => Promise<void>;
  addToast: (msg: string, kind?: ToastKind) => void;
  onEditEntity: () => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function record(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function firstValue(...values: unknown[]): unknown {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function text(value: unknown, fallback = "—"): string {
  return value === undefined || value === null || value === "" ? fallback : String(value);
}

function Field({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="player-character-detail__field">
      <span>{label}</span>
      <strong>{text(value)}</strong>
    </div>
  );
}

export function PlayerCharacterDetailModal({ selectedEntity, campaignState, onClose, onEditEntity }: PlayerCharacterDetailModalProps) {
  useBodyDataAttribute("entityDetailDialogOpen", "true");
  const { t } = useTranslation();
  const [sheet, setSheet] = useState<CharacterSheetResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const metadata = record(selectedEntity.metadata);
  const campaignId = campaignState.campaign?.campaignId;

  const imgUrl =
    typeof selectedEntity.metadata?.imageUrl === "string" && selectedEntity.metadata.imageUrl
      ? selectedEntity.metadata.imageUrl
      : getEntityDefaultImage(selectedEntity.entityType);

  const isDmOnly =
    !selectedEntity.visibility?.kind ||
    selectedEntity.visibility.kind === "dm_only";

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!campaignId) {
      setLoading(false);
      setError("No se pudo identificar la campaña del personaje.");
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void fetch(`/api/campaigns/${encodeURIComponent(campaignId)}/characters/${encodeURIComponent(selectedEntity.entityId)}/sheet`, {
      credentials: "same-origin",
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) throw new Error(`Character sheet request failed (${response.status})`);
      // Trusting the server's response shape at the fetch boundary; no runtime schema here.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      setSheet(await response.json() as CharacterSheetResponse);
    }).catch((requestError: unknown) => {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return;
      console.error("Failed to load character sheet", requestError);
      setError("No se pudo cargar el estado actualizado del jugador.");
    }).finally(() => setLoading(false));
    return () => controller.abort();
  }, [campaignId, selectedEntity.entityId]);

  const live = sheet?.status ?? {};
  const basics = useMemo(() => ({
    className: firstValue(live.className, live.class, metadata.className, metadata.class),
    subclass: firstValue(live.subclass, metadata.subclass),
    level: firstValue(live.level, metadata.level),
    species: firstValue(live.species, live.race, metadata.species, metadata.race),
    background: firstValue(live.background, metadata.background),
    armorClass: firstValue(live.armorClass, live.ac, metadata.armorClass),
    hitPointsCurrent: firstValue(live.hitPointsCurrent, live.currentHp, live.hp, metadata.hitPointsCurrent),
    hitPointsMax: firstValue(live.hitPointsMax, live.maxHp, metadata.hitPointsMax),
    hitPointsTemp: firstValue(live.hitPointsTemp, live.tempHp, metadata.hitPointsTemp),
    initiative: firstValue(live.initiative, metadata.initiative),
    speed: firstValue(live.speed, metadata.speed),
  }), [live, metadata]);

  const abilities = [
    ["FUE", firstValue(live.strength, metadata.strength)],
    ["DES", firstValue(live.dexterity, metadata.dexterity)],
    ["CON", firstValue(live.constitution, metadata.constitution)],
    ["INT", firstValue(live.intelligence, metadata.intelligence)],
    ["SAB", firstValue(live.wisdom, metadata.wisdom)],
    ["CAR", firstValue(live.charisma, metadata.charisma)],
  ] as const;
  const hasAbilities = abilities.some(([, value]) => value !== undefined && value !== null && value !== "");
  const hasBasics = Object.values(basics).some((value) => value !== undefined && value !== null && value !== "");

  return (
    <div className="modal-overlay entity-detail-dialog" onClick={onClose}>
      <div className="modal-content entity-detail-dialog" onClick={(event) => event.stopPropagation()}>
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
              <span>Secreto / Solo DM</span>
            </div>
          )}
          <div className="entity-detail-hero__gradient" />
        </div>

        <div className="modal-header entity-detail-modal__header">
          <div>
            <span className="badge badge-primary">PERSONAJE JUGABLE</span>
            <h2 className="entity-detail-modal__title">{selectedEntity.title}</h2>
            <h4 className="card-subtitle">
              {selectedEntity.subtitle || [basics.className, basics.species].filter(Boolean).join(" · ") || "Ficha de personaje"}
            </h4>
          </div>
        </div>

        <div className="entity-detail-tab-bar">
          <div className="entity-detail-tab-actions">
            <button type="button" className="btn btn-secondary btn-icon" onClick={onEditEntity} aria-label={t("entityExtra.editEntity")} title={t("entityExtra.editEntity")}>
              <Pencil size={16} />
            </button>
            <button type="button" className="btn btn-secondary btn-icon" onClick={onClose} aria-label={t("common.close")} title={t("common.close")}>
              <X size={17} />
            </button>
          </div>
        </div>

        <div className="modal-body entity-detail-modal__body">
          {selectedEntity.summary && <p className="player-character-detail__summary">{selectedEntity.summary}</p>}
          {error && <div className="alert alert-warning">{error}</div>}

          <section className="player-character-detail__section">
            <h3><Sparkles size={16} /> Datos básicos</h3>
            {hasBasics ? (
              <div className="player-character-detail__grid">
                <Field label="Clase" value={basics.className} />
                <Field label="Subclase" value={basics.subclass} />
                <Field label="Nivel" value={basics.level} />
                <Field label="Especie" value={basics.species} />
                <Field label="Trasfondo" value={basics.background} />
                <Field label="Velocidad" value={basics.speed} />
              </div>
            ) : (
              <div className="player-character-detail__empty">La ficha todavía no tiene datos básicos. El jugador puede completarlos desde su portal.</div>
            )}
          </section>

          <section className="player-character-detail__section">
            <h3><Activity size={16} /> Estado actual</h3>
            <div className="player-character-detail__vitals">
              <div><Shield size={18} /><span>CA</span><strong>{text(basics.armorClass)}</strong></div>
              <div><Heart size={18} /><span>PG</span><strong>{text(basics.hitPointsCurrent)} / {text(basics.hitPointsMax)}</strong>{basics.hitPointsTemp ? <small>+{text(basics.hitPointsTemp)} temporales</small> : null}</div>
              <div><Activity size={18} /><span>Iniciativa</span><strong>{text(basics.initiative)}</strong></div>
            </div>
          </section>

          {hasAbilities && (
            <section className="player-character-detail__section">
              <h3>Atributos</h3>
              <div className="player-character-detail__abilities">
                {abilities.map(([label, value]) => <div key={label}><span>{label}</span><strong>{text(value)}</strong></div>)}
              </div>
            </section>
          )}

          {sheet?.resources.length ? (
            <section className="player-character-detail__section">
              <h3>Recursos del jugador</h3>
              <div className="player-character-detail__resources">
                {sheet.resources.map((resource) => (
                  <div key={resource.resourceId}>
                    <strong>{text(firstValue(resource.label, resource.name, resource.title), "Recurso")}</strong>
                    <span>{text(firstValue(resource.current, resource.value, resource.amount))}{resource.max != null ? ` / ${text(resource.max)}` : ""}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <div className="modal-footer entity-detail-modal__footer">
          <div className="entity-detail-modal__footer-group">
            <span className="player-character-detail__owner">
              <UserRound size={16} />
              <span>{sheet?.player?.displayName || "Sin jugador vinculado"}</span>
            </span>
          </div>
          <div className="entity-detail-modal__footer-group">
            <span className="entity-detail-modal__updated-label player-character-detail__freshness">
              {loading
                ? "Cargando datos del jugador…"
                : sheet?.updatedAt
                  ? `Actualizado ${new Date(sheet.updatedAt).toLocaleString()}`
                  : "Sin cambios registrados por el jugador"}
            </span>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
