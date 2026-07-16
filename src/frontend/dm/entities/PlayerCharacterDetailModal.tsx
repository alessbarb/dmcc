import React, { useEffect, useMemo, useState } from "react";
import { Activity, Heart, Pencil, Shield, Sparkles, UserRound, X } from "lucide-react";
import type { Entity, CampaignStateStore } from "../../shared/stores/campaignStore.js";
import type { ToastKind } from "../../shared/hooks/useToast.js";

type CampaignState = NonNullable<CampaignStateStore["campaignState"]>;

type CharacterSheetResponse = {
  entityId: string;
  player: { playerId: string; displayName: string; pronouns?: string | null } | null;
  status: Record<string, unknown>;
  resources: Array<Record<string, unknown> & { resourceId: string; updatedAt?: string }>;
  updatedAt: string | null;
  source: "entity" | "player_portal";
};

interface Props {
  selectedEntity: Entity;
  campaignState: CampaignState;
  onClose: () => void;
  onEdit: (entityId: string, updates: Partial<Entity>) => Promise<void>;
  onArchive: (entityId: string) => Promise<void>;
  onVisibilityChange: (entityId: string, visibility: unknown) => Promise<void>;
  addToast: (msg: string, kind?: ToastKind) => void;
  onOpenLegacy: () => void;
}

function record(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
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

export function PlayerCharacterDetailModal({ selectedEntity, campaignState, onClose, onOpenLegacy }: Props) {
  const [sheet, setSheet] = useState<CharacterSheetResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const metadata = record(selectedEntity.metadata);
  const campaignId = campaignState.campaignId;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void fetch(`/api/campaigns/${encodeURIComponent(campaignId)}/characters/${encodeURIComponent(selectedEntity.entityId)}/sheet`, {
      credentials: "same-origin",
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) throw new Error(`Character sheet request failed (${response.status})`);
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
    <div className="entity-detail-overlay" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="player-character-detail" role="dialog" aria-modal="true" aria-labelledby="player-character-title">
        <header className="player-character-detail__header">
          <div>
            <span className="entity-type-badge">PERSONAJE JUGABLE</span>
            <h2 id="player-character-title">{selectedEntity.title}</h2>
            <p>{selectedEntity.subtitle || [basics.className, basics.species].filter(Boolean).join(" · ") || "Ficha de personaje"}</p>
          </div>
          <button type="button" className="btn btn-secondary btn-icon" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </header>

        <div className="player-character-detail__toolbar">
          <div className="player-character-detail__owner">
            <UserRound size={16} />
            <span>{sheet?.player?.displayName || "Sin jugador vinculado"}</span>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onOpenLegacy}>
            <Pencil size={14} /> Editar entidad
          </button>
        </div>

        <div className="player-character-detail__body">
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

          <footer className="player-character-detail__freshness">
            {loading
              ? "Cargando datos del jugador…"
              : sheet?.updatedAt
                ? `Actualizado ${new Date(sheet.updatedAt).toLocaleString()}`
                : "Sin cambios registrados por el jugador"}
          </footer>
        </div>
      </section>
    </div>
  );
}
