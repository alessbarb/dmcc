import { Eye, EyeOff } from "lucide-react";
import { TypeMetadataForm } from "./TypeMetadataForm.js";
import { ImagePickerButton } from "../../shared/components/ImagePickerButton.js";
import type { Entity, PlayerProfile, CampaignStateStore } from "../../shared/stores/campaignStore.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { formatVisibility } from "@shared/i18n/index.js";
import type { VisibilityRule } from "@core/domain/visibility/visibility.js";
import "./entity-summary.css";
import "./entity-summary-character-sheet.css";

type CampaignState = NonNullable<CampaignStateStore["campaignState"]>;

function getMetadataLanguages(metadata: Record<string, unknown>): unknown {
  const languages = metadata.languages;
  return Array.isArray(languages) ? languages.join(", ") : languages;
}

export function ResumenTab({
  entity,
  campaignState,
  isEditingEntity,
  editEntityForm,
  setEditEntityForm,
  onVisibilityChange,
}: {
  entity: Entity;
  campaignState: CampaignState;
  isEditingEntity: boolean;
  editEntityForm: Partial<Entity>;
  setEditEntityForm: (v: Partial<Entity>) => void;
  onVisibilityChange: (entityId: string, visibility: VisibilityRule) => void;
}) {
  const { t, locale } = useTranslation();
  const visKind = entity.visibility?.kind ?? "dm_only";
  return (
    <div className="entity-summary">
      {/* Visibility badge + editor */}
      <div className="entity-summary__visibility">
        <span className="entity-summary__visibility-label">
          VISIBILIDAD
        </span>
        <span
          className={`badge entity-summary__visibility-badge ${
            visKind === "dm_only" ? "badge--danger" : "badge--success"
          }`}
        >
          {formatVisibility(visKind, locale)}
        </span>
        <div className="entity-summary__visibility-actions">
          {visKind === "dm_only" && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onVisibilityChange(entity.entityId, { kind: "party" })}
            >
              <Eye size={12} /> {t("entityDetail.revealToGroup")}
            </button>
          )}
          {visKind !== "dm_only" && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onVisibilityChange(entity.entityId, { kind: "dm_only" })}
            >
              <EyeOff size={12} /> {t("entityDetail.dmOnly")}
            </button>
          )}
        </div>
      </div>

      {entity.summary && (
        <div>
          <h4 className="entity-summary__section-title">
            Resumen
          </h4>
          <p className="entity-summary__text">{entity.summary}</p>
        </div>
      )}

      {entity.content && (
        <div>
          <h4 className="entity-summary__section-title">
            Notas y descripción
          </h4>
          <p className="entity-summary__text entity-summary__text--notes">
            {entity.content}
          </p>
        </div>
      )}

      {/* Metadata details — type-aware */}
      {entity.metadata && Object.keys(entity.metadata).length > 0 && (
        <div>
          <h4 className="entity-summary__section-title entity-summary__section-title--spaced">
            Detalles
          </h4>
          {(() => {
            const m = entity.metadata;
            const entityType = entity.entityType;
            const metaNum = (value: unknown): number | undefined =>
              typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : undefined;
            const metaStr = (value: unknown, fallback: string): string =>
              value === null || value === undefined || value === "" ? fallback : String(value);
            const Field = ({ label, value }: { label: string; value: unknown }) =>
              value != null && String(value).trim() !== "" ? (
                <div className="entity-summary__field">
                  <span className="entity-summary__field-label">{label}</span>
                  <span className="entity-summary__field-value">
                    {String(value)}
                  </span>
                </div>
              ) : null;
            return (
              <div className="entity-summary__details">
                {(entityType === "npc" || entityType === "player_character" || entityType === "creature") && (
                  entityType === "player_character" && campaignState?.campaign?.system === "dnd_5e" ? (
                    <div className="entity-summary__pc-stats">
                      <div className="entity-summary__stat-grid entity-summary__stat-grid--2col entity-summary__panel">
                        <Field label="Clase" value={m.className} />
                        <Field label="Subclase" value={m.subclass} />
                        <Field label="Nivel" value={m.level} />
                        <Field label="Experiencia (XP)" value={m.xp != null ? `${m.xp} XP` : null} />
                        <Field label="Especie / Raza" value={m.species} />
                        <Field label="Trasfondo" value={m.background} />
                        <Field label="Jugador" value={(() => {
                          if (!m.playerId) return null;
                          const p = campaignState?.players?.find((pl: PlayerProfile) => pl.playerId === m.playerId);
                          return p ? (p.displayName || p.name) : m.playerId;
                        })()} />
                      </div>

                      <div>
                        <h5 className="entity-summary__attr-heading">Atributos Principales</h5>
                        <div className="entity-summary__attr-grid">
                          {[
                            { label: "FUERZA", key: "strength", short: "STR" },
                            { label: "DESTREZA", key: "dexterity", short: "DEX" },
                            { label: "CONSTITUCION", key: "constitution", short: "CON" },
                            { label: "INTELIGENCIA", key: "intelligence", short: "INT" },
                            { label: "SABIDURIA", key: "wisdom", short: "WIS" },
                            { label: "CARISMA", key: "charisma", short: "CHA" }
                          ].map(attr => {
                            const numVal = metaNum(m[attr.key]);
                            const mod = numVal !== undefined ? Math.floor((numVal - 10) / 2) : null;
                            const modStr = mod !== null ? (mod >= 0 ? `+${mod}` : `${mod}`) : "--";
                            return (
                              <div key={attr.key} className="entity-summary__attr-card">
                                <div className="entity-summary__attr-short">{attr.short}</div>
                                <div className="entity-summary__attr-mod">{modStr}</div>
                                <div className="entity-summary__attr-value">{metaStr(m[attr.key], "--")}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="entity-summary__stat-grid entity-summary__stat-grid--3col entity-summary__panel">
                        <div>
                          <div className="entity-summary__stat-label">CLASE ARMADURA</div>
                          <div className="entity-summary__stat-value">🛡️ {metaStr(m.armorClass, "10")}</div>
                        </div>
                        <div>
                          <div className="entity-summary__stat-label">INICIATIVA</div>
                          <div className="entity-summary__stat-value">⚡ {(() => { const v = metaNum(m.initiative); return v !== undefined && v >= 0 ? `+${v}` : String(v ?? 0); })()}</div>
                        </div>
                        <div>
                          <div className="entity-summary__stat-label">VELOCIDAD</div>
                          <div className="entity-summary__stat-value">🏃‍♂️ {metaStr(m.speed, "30")} ft</div>
                        </div>
                        <div className="entity-summary__stat-cell--span3-tight">
                          <div className="entity-summary__stat-label">PUNTOS DE GOLPE (HP)</div>
                          <div className="entity-summary__stat-value--danger">
                            ❤️ {metaStr(m.hitPointsCurrent, "10")} / {metaStr(m.hitPointsMax, "10")}
                            {(metaNum(m.hitPointsTemp) ?? 0) > 0 && <span className="entity-summary__stat-temp">+{metaStr(m.hitPointsTemp, "0")} Temp</span>}
                          </div>
                        </div>
                        <div className="entity-summary__stat-cell--span3">
                          <div className="entity-summary__stat-label">DADOS DE GOLPE</div>
                          <div className="entity-summary__hit-dice-value">🎲 {metaStr(m.hitDice, "--")}</div>
                        </div>
                      </div>

                      <div className="entity-summary__stat-grid entity-summary__stat-grid--3col entity-summary__stat-grid--tight-gap entity-summary__panel entity-summary__panel--compact">
                        <div>
                          <div className="entity-summary__stat-label--sm">PERCEPCION PASIVA</div>
                          <div className="entity-summary__stat-value--sm">👁️ {metaStr(m.passivePerception, "10")}</div>
                        </div>
                        <div>
                          <div className="entity-summary__stat-label--sm">PERSPIACACIA PASIVA</div>
                          <div className="entity-summary__stat-value--sm">🧠 {metaStr(m.passiveInsight, "10")}</div>
                        </div>
                        <div>
                          <div className="entity-summary__stat-label--sm">INVESTIGACION PASIVA</div>
                          <div className="entity-summary__stat-value--sm">🔍 {metaStr(m.passiveInvestigation, "10")}</div>
                        </div>
                      </div>

                      <div className="entity-summary__stat-grid entity-summary__stat-grid--2col">
                        <div className="entity-summary__panel entity-summary__panel--compact">
                          <div className="entity-summary__pill-group-title">Salvaciones</div>
                          {Array.isArray(m.savingThrows) && m.savingThrows.length > 0 ? (
                            <div className="entity-summary__pill-row">
                              {m.savingThrows.map((s: string) => {
                                const trans: Record<string, string> = { str: "FUER", dex: "DEST", con: "CONS", int: "INTE", wis: "SABI", cha: "CARI" };
                                return (
                                  <span key={s} className="entity-summary__pill entity-summary__pill--upper">
                                    {trans[s] || s}
                                  </span>
                                );
                              })}
                            </div>
                          ) : <span className="entity-summary__pill-empty">Ninguna</span>}
                        </div>

                        <div className="entity-summary__panel entity-summary__panel--compact">
                          <div className="entity-summary__pill-group-title">Habilidades</div>
                          {Array.isArray(m.skills) && m.skills.length > 0 ? (
                            <div className="entity-summary__pill-row">
                              {m.skills.map((s: string) => {
                                const trans: Record<string, string> = {
                                  acrobatics: "Acrobacias", athletics: "Atletismo", stealth: "Sigilo", sleight_of_hand: "Juego de Manos",
                                  arcana: "Arcana", history: "Historia", investigation: t("entityDetail.skillInvestigation"), insight: "Perspicacia",
                                  medicine: "Medicina", nature: "Naturaleza", perception: t("entityDetail.skillPerception"), performance: t("entityDetail.skillPerformance"),
                                  persuasion: t("entityDetail.skillPersuasion"), religion: t("entityDetail.skillReligion"), animal_handling: "Trato Animal", intimidation: t("entityDetail.skillIntimidation"),
                                  survival: "Supervivencia"
                                };
                                return (
                                  <span key={s} className="entity-summary__pill">
                                    {trans[s] || s}
                                  </span>
                                );
                              })}
                            </div>
                          ) : <span className="entity-summary__pill-empty">Ninguna</span>}
                        </div>
                      </div>

                      <div className="entity-summary__panel entity-summary__panel--stack">
                        <Field label="Dotes" value={Array.isArray(m.feats) ? m.feats.join(", ") : m.feats} />
                        <Field label="Idiomas" value={getMetadataLanguages(m)} />
                      </div>

                      {(m.spellSaveDC != null || m.spellAttackBonus != null) && (
                        <div className="entity-summary__panel entity-summary__panel--stack entity-summary__panel--spell">
                          <div className="entity-summary__spell-title">✨ Magia y Conjuros</div>
                          <div className="entity-summary__spell-grid">
                            <Field label={t("entityDetail.spellSaveDc")} value={m.spellSaveDC} />
                            <Field label="Bono de Ataque" value={m.spellAttackBonus != null ? `+${m.spellAttackBonus}` : null} />
                          </div>
                        </div>
                      )}

                      {Boolean(m.note) && (
                        <div className="entity-summary__panel entity-summary__panel--stack-tight">
                          <div className="entity-summary__notes-title">Notas adicionales</div>
                          <div className="entity-summary__notes-text">{metaStr(m.note, "")}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <Field label="Rol" value={m.role} />
                      <Field label={t("entityDetail.faction")} value={m.factionId} />
                      <Field label={t("entityDetail.motivation")} value={m.motivation} />
                      <Field label="Objetivo" value={m.goal} />
                      <Field label="Actitud" value={m.attitude} />
                      {entityType === "player_character" && (
                        <>
                          <Field label="Jugador" value={(() => {
                            if (!m.playerId) return null;
                            const p = campaignState?.players?.find((pl: PlayerProfile) => pl.playerId === m.playerId);
                            return p ? (p.displayName || p.name) : m.playerId;
                          })()} />
                          <Field label="Clase" value={m.className} />
                          <Field label="Especie" value={m.species} />
                          <Field label="Nivel" value={m.level} />
                          <Field label="Trasfondo" value={m.background} />
                          <Field label="Clase de Armadura (CA)" value={m.armorClass} />
                          <Field label="PG actuales" value={m.hitPointsCurrent} />
                          <Field label={t("entityDetail.hitPointsMax")} value={m.hitPointsMax} />
                          <Field label={t("entityDetail.passivePerception")} value={m.passivePerception} />
                        </>
                      )}
                    </>
                  )
                )}
                {entityType === "location" && (
                  <>
                    <Field label={t("entityModal.regionLabel")} value={m.region} />
                    <Field label="Terreno" value={m.terrainType} />
                    <Field
                      label="Conocido por el grupo"
                      value={
                        m.isKnownToParty != null ? (m.isKnownToParty ? t("common.yes") : "No") : null
                      }
                    />
                  </>
                )}
                {entityType === "quest" && (
                  <>
                    <Field label={t("canvas.node.typeLocation")} value={m.locationId} />
                    <Field label="Recompensa" value={m.reward} />
                  </>
                )}
                {entityType === "clue" && (
                  <>
                    <Field
                      label="Encontrado"
                      value={m.found != null ? (m.found ? t("common.yes") : "No") : null}
                    />
                    <Field label="Significado" value={m.significance} />
                  </>
                )}
                {entityType === "secret" && (
                  <Field
                    label="Revelado a"
                    value={Array.isArray(m.revealedTo) ? m.revealedTo.join(", ") : m.revealedTo}
                  />
                )}
                {entityType === "faction" && (
                  <>
                    <Field label="Alineamiento" value={m.alignment} />
                    <Field label="Base" value={m.baseOfOperations} />
                  </>
                )}
                {entityType === "clock" && (
                  <>
                    <Field label="Tipo" value={m.clockType} />
                    <Field
                      label="Progreso"
                      value={
                        m.segmentsFilled != null && m.segmentsTotal != null
                          ? `${m.segmentsFilled} / ${m.segmentsTotal}`
                          : null
                      }
                    />
                  </>
                )}
                {entityType === "item" && (
                  <>
                    <Field label="Propietario" value={m.ownerId} />
                    <Field label="Rareza" value={m.rarity} />
                  </>
                )}
                {entityType === "encounter" && (
                  <>
                    <Field label="Dificultad" value={m.difficulty} />
                    <Field label={t("canvas.node.typeLocation")} value={m.locationId} />
                  </>
                )}
                {![
                  "npc",
                  "player_character",
                  "creature",
                  "location",
                  "quest",
                  "clue",
                  "secret",
                  "faction",
                  "clock",
                  "item",
                  "encounter",
                ].includes(entityType) &&
                  Object.entries(m).map(([key, val]) => (
                    <Field key={key} label={key} value={val} />
                  ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Inline edit form */}
      {isEditingEntity && (
        <div className="entity-summary__edit-panel">
          <h4 className="entity-summary__edit-heading">
            Editar entidad
          </h4>
          <div className="grid grid-cols-2">
            <div className="form-group form-group--flush">
              <label className="form-label">Título</label>
              <input
                className="form-input"
                value={editEntityForm.title ?? entity.title}
                onChange={(e) =>
                  setEditEntityForm({ ...editEntityForm, title: e.target.value })
                }
              />
            </div>
            <div className="form-group form-group--flush">
              <label className="form-label">Subtítulo</label>
              <input
                className="form-input"
                value={editEntityForm.subtitle ?? entity.subtitle ?? ""}
                onChange={(e) =>
                  setEditEntityForm({ ...editEntityForm, subtitle: e.target.value })
                }
              />
            </div>
          </div>
          <div className="form-group form-group--flush">
            <label className="form-label">Resumen</label>
            <input
              className="form-input"
              value={editEntityForm.summary ?? entity.summary ?? ""}
              onChange={(e) =>
                setEditEntityForm({ ...editEntityForm, summary: e.target.value })
              }
            />
          </div>
          <div className="form-group form-group--flush">
            <label className="form-label">Imagen</label>
            <ImagePickerButton
              value={
                typeof editEntityForm.metadata?.imageUrl === "string"
                  ? editEntityForm.metadata.imageUrl
                  : typeof entity.metadata?.imageUrl === "string"
                    ? entity.metadata.imageUrl
                    : ""
              }
              onChange={(path) =>
                setEditEntityForm({
                  ...editEntityForm,
                  metadata: {
                    ...(editEntityForm.metadata ?? entity.metadata ?? {}),
                    imageUrl: path || undefined,
                  },
                })
              }
              catalog="entities"
              shape="circle"
            />
          </div>
          <div className="form-group form-group--flush">
            <label className="form-label">Notas / Descripción</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={editEntityForm.content ?? entity.content ?? ""}
              onChange={(e) =>
                setEditEntityForm({ ...editEntityForm, content: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2">
            <div className="form-group form-group--flush">
              <label className="form-label">Estado</label>
              <input
                className="form-input"
                value={editEntityForm.status ?? entity.status}
                onChange={(e) =>
                  setEditEntityForm({ ...editEntityForm, status: e.target.value })
                }
              />
            </div>
            <div className="form-group form-group--flush">
              <label className="form-label">Importancia</label>
              <select
                className="form-select"
                value={editEntityForm.importance ?? entity.importance}
                onChange={(e) =>
                  setEditEntityForm({ ...editEntityForm, importance: e.target.value })
                }
              >
                <option value="low">Baja</option>
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
          </div>
          <TypeMetadataForm
            entityType={entity.entityType}
            metadata={editEntityForm.metadata ?? entity.metadata ?? {}}
            onChange={(field, value) =>
              setEditEntityForm({
                ...editEntityForm,
                metadata: {
                  ...(editEntityForm.metadata ?? entity.metadata ?? {}),
                  [field]: value,
                },
              })
            }
            players={campaignState?.players ?? []}
            entities={campaignState?.entities ?? []}
            campaignSystem={campaignState?.campaign?.system}
          />
        </div>
      )}
    </div>
  );
}
