import { Eye, EyeOff } from "lucide-react";
import { TypeMetadataForm } from "./TypeMetadataForm.js";
import { ImagePickerButton } from "../../shared/components/ImagePickerButton.js";
import type { Entity, PlayerProfile, CampaignStateStore } from "../../shared/stores/campaignStore.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { formatVisibility } from "@shared/i18n/index.js";
import type { VisibilityRule } from "@core/domain/visibility/visibility.js";

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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Visibility badge + editor */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "10px 14px",
          backgroundColor: "var(--theme-surfaces-interactive)",
          borderRadius: "var(--theme-shapes-radius-small)",
        }}
      >
        <span style={{ fontSize: "0.8rem", color: "var(--theme-text-secondary)", fontWeight: "600" }}>
          VISIBILIDAD
        </span>
        <span
          style={{
            padding: "2px 10px",
            borderRadius: "var(--theme-shapes-radius-small)",
            fontSize: "0.8rem",
            fontWeight: "700",
            backgroundColor:
              visKind === "dm_only"
                ? "var(--theme-feedback-danger-background)"
                : "var(--theme-feedback-success-background)",
            color:
              visKind === "dm_only"
                ? "var(--theme-feedback-danger-foreground)"
                : "var(--theme-feedback-success-foreground)",
          }}
        >
          {formatVisibility(visKind, locale)}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
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
          <h4 style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--theme-text-secondary)" }}>
            Resumen
          </h4>
          <p style={{ marginTop: "4px" }}>{entity.summary}</p>
        </div>
      )}

      {entity.content && (
        <div>
          <h4 style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--theme-text-secondary)" }}>
            Notas y descripción
          </h4>
          <p style={{ marginTop: "4px", whiteSpace: "pre-line", fontSize: "0.95rem" }}>
            {entity.content}
          </p>
        </div>
      )}

      {/* Metadata details — type-aware */}
      {entity.metadata && Object.keys(entity.metadata).length > 0 && (
        <div>
          <h4
            style={{
              fontWeight: "700",
              fontSize: "0.9rem",
              color: "var(--theme-text-secondary)",
              marginBottom: "8px",
            }}
          >
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
                <div style={{ fontSize: "0.85rem", display: "flex", gap: "8px" }}>
                  <span style={{ color: "var(--theme-text-secondary)", minWidth: "100px" }}>{label}</span>
                  <span style={{ color: "var(--theme-text-primary)", fontWeight: "500" }}>
                    {String(value)}
                  </span>
                </div>
              ) : null;
            return (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  backgroundColor: "var(--theme-surfaces-canvas)",
                  padding: "12px",
                  borderRadius: "var(--theme-shapes-radius-medium)",
                }}
              >
                {(entityType === "npc" || entityType === "player_character" || entityType === "creature") && (
                  entityType === "player_character" && campaignState?.campaign?.system === "dnd_5e" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", backgroundColor: "var(--theme-surfaces-canvas)", padding: "12px", borderRadius: "var(--theme-shapes-radius-medium)" }}>
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
                        <h5 style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--theme-text-secondary)", marginBottom: "8px", textTransform: "uppercase" }}>Atributos Principales</h5>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "6px" }}>
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
                              <div key={attr.key} style={{ backgroundColor: "var(--theme-surfaces-canvas)", border: "1px solid var(--theme-borders-default)", borderRadius: "var(--theme-shapes-radius-medium)", padding: "6px 4px", textAlign: "center" }}>
                                <div style={{ fontSize: "0.6rem", fontWeight: "700", color: "var(--theme-text-secondary)" }}>{attr.short}</div>
                                <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--theme-accents-secondary-foreground)", margin: "2px 0" }}>{modStr}</div>
                                <div style={{ fontSize: "0.7rem", color: "var(--theme-text-primary)" }}>{metaStr(m[attr.key], "--")}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", backgroundColor: "var(--theme-surfaces-canvas)", padding: "12px", borderRadius: "var(--theme-shapes-radius-medium)" }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "0.65rem", color: "var(--theme-text-secondary)", fontWeight: "600" }}>CLASE ARMADURA</div>
                          <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--theme-text-primary)", marginTop: "4px" }}>🛡️ {metaStr(m.armorClass, "10")}</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "0.65rem", color: "var(--theme-text-secondary)", fontWeight: "600" }}>INICIATIVA</div>
                          <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--theme-text-primary)", marginTop: "4px" }}>⚡ {(() => { const v = metaNum(m.initiative); return v !== undefined && v >= 0 ? `+${v}` : String(v ?? 0); })()}</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "0.65rem", color: "var(--theme-text-secondary)", fontWeight: "600" }}>VELOCIDAD</div>
                          <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--theme-text-primary)", marginTop: "4px" }}>🏃‍♂️ {metaStr(m.speed, "30")} ft</div>
                        </div>
                        <div style={{ textAlign: "center", gridColumn: "span 3", borderTop: "1px solid var(--theme-borders-default)", paddingTop: "8px", marginTop: "4px" }}>
                          <div style={{ fontSize: "0.65rem", color: "var(--theme-text-secondary)", fontWeight: "600" }}>PUNTOS DE GOLPE (HP)</div>
                          <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--theme-feedback-danger-foreground)", marginTop: "4px" }}>
                            ❤️ {metaStr(m.hitPointsCurrent, "10")} / {metaStr(m.hitPointsMax, "10")}
                            {(metaNum(m.hitPointsTemp) ?? 0) > 0 && <span style={{ color: "var(--theme-feedback-warning-foreground)", fontSize: "0.85rem", marginLeft: "6px" }}>+{metaStr(m.hitPointsTemp, "0")} Temp</span>}
                          </div>
                        </div>
                        <div style={{ textAlign: "center", gridColumn: "span 3", borderTop: "1px solid var(--theme-borders-default)", paddingTop: "8px" }}>
                          <div style={{ fontSize: "0.65rem", color: "var(--theme-text-secondary)", fontWeight: "600" }}>DADOS DE GOLPE</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--theme-text-primary)", marginTop: "4px" }}>🎲 {metaStr(m.hitDice, "--")}</div>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", backgroundColor: "var(--theme-surfaces-canvas)", padding: "10px", borderRadius: "var(--theme-shapes-radius-medium)", textAlign: "center" }}>
                        <div>
                          <div style={{ fontSize: "0.6rem", color: "var(--theme-text-secondary)", fontWeight: "600" }}>PERCEPCION PASIVA</div>
                          <div style={{ fontSize: "1rem", fontWeight: "700", marginTop: "2px" }}>👁️ {metaStr(m.passivePerception, "10")}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.6rem", color: "var(--theme-text-secondary)", fontWeight: "600" }}>PERSPIACACIA PASIVA</div>
                          <div style={{ fontSize: "1rem", fontWeight: "700", marginTop: "2px" }}>🧠 {metaStr(m.passiveInsight, "10")}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.6rem", color: "var(--theme-text-secondary)", fontWeight: "600" }}>INVESTIGACION PASIVA</div>
                          <div style={{ fontSize: "1rem", fontWeight: "700", marginTop: "2px" }}>🔍 {metaStr(m.passiveInvestigation, "10")}</div>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                        <div style={{ backgroundColor: "var(--theme-surfaces-canvas)", padding: "10px", borderRadius: "var(--theme-shapes-radius-medium)" }}>
                          <div style={{ fontSize: "0.65rem", color: "var(--theme-text-secondary)", fontWeight: "700", marginBottom: "6px", textTransform: "uppercase" }}>Salvaciones</div>
                          {Array.isArray(m.savingThrows) && m.savingThrows.length > 0 ? (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                              {m.savingThrows.map((s: string) => {
                                const trans: Record<string, string> = { str: "FUER", dex: "DEST", con: "CONS", int: "INTE", wis: "SABI", cha: "CARI" };
                                return (
                                  <span key={s} style={{ fontSize: "0.65rem", padding: "2px 5px", backgroundColor: "var(--theme-accents-primary-background)", border: "1px solid color-mix(in srgb, var(--theme-accents-secondary-foreground) 30%, transparent)", borderRadius: "4px", color: "var(--theme-text-primary)", textTransform: "uppercase" }}>
                                    {trans[s] || s}
                                  </span>
                                );
                              })}
                            </div>
                          ) : <span style={{ fontSize: "0.7rem", color: "var(--theme-text-secondary)", fontStyle: "italic" }}>Ninguna</span>}
                        </div>

                        <div style={{ backgroundColor: "var(--theme-surfaces-canvas)", padding: "10px", borderRadius: "var(--theme-shapes-radius-medium)" }}>
                          <div style={{ fontSize: "0.65rem", color: "var(--theme-text-secondary)", fontWeight: "700", marginBottom: "6px", textTransform: "uppercase" }}>Habilidades</div>
                          {Array.isArray(m.skills) && m.skills.length > 0 ? (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                              {m.skills.map((s: string) => {
                                const trans: Record<string, string> = {
                                  acrobatics: "Acrobacias", athletics: "Atletismo", stealth: "Sigilo", sleight_of_hand: "Juego de Manos",
                                  arcana: "Arcana", history: "Historia", investigation: t("entityDetail.skillInvestigation"), insight: "Perspicacia",
                                  medicine: "Medicina", nature: "Naturaleza", perception: t("entityDetail.skillPerception"), performance: t("entityDetail.skillPerformance"),
                                  persuasion: t("entityDetail.skillPersuasion"), religion: t("entityDetail.skillReligion"), animal_handling: "Trato Animal", intimidation: t("entityDetail.skillIntimidation"),
                                  survival: "Supervivencia"
                                };
                                return (
                                  <span key={s} style={{ fontSize: "0.65rem", padding: "2px 5px", backgroundColor: "var(--theme-accents-primary-background)", border: "1px solid color-mix(in srgb, var(--theme-accents-secondary-foreground) 30%, transparent)", borderRadius: "4px", color: "var(--theme-text-primary)" }}>
                                    {trans[s] || s}
                                  </span>
                                );
                              })}
                            </div>
                          ) : <span style={{ fontSize: "0.7rem", color: "var(--theme-text-secondary)", fontStyle: "italic" }}>Ninguna</span>}
                        </div>
                      </div>

                      <div style={{ backgroundColor: "var(--theme-surfaces-canvas)", padding: "12px", borderRadius: "var(--theme-shapes-radius-medium)", display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Field label="Dotes" value={Array.isArray(m.feats) ? m.feats.join(", ") : m.feats} />
                        <Field label="Idiomas" value={getMetadataLanguages(m)} />
                      </div>

                      {(m.spellSaveDC != null || m.spellAttackBonus != null) && (
                        <div style={{ backgroundColor: "var(--theme-surfaces-canvas)", padding: "12px", borderRadius: "var(--theme-shapes-radius-medium)", display: "flex", flexDirection: "column", gap: "8px", border: "1px dashed var(--theme-accents-secondary-foreground)" }}>
                          <div style={{ fontSize: "0.7rem", color: "var(--theme-accents-secondary-foreground)", fontWeight: "700", textTransform: "uppercase" }}>✨ Magia y Conjuros</div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                            <Field label={t("entityDetail.spellSaveDc")} value={m.spellSaveDC} />
                            <Field label="Bono de Ataque" value={m.spellAttackBonus != null ? `+${m.spellAttackBonus}` : null} />
                          </div>
                        </div>
                      )}

                      {Boolean(m.note) && (
                        <div style={{ backgroundColor: "var(--theme-surfaces-canvas)", padding: "12px", borderRadius: "var(--theme-shapes-radius-medium)", display: "flex", flexDirection: "column", gap: "6px" }}>
                          <div style={{ fontSize: "0.65rem", color: "var(--theme-text-secondary)", fontWeight: "700", textTransform: "uppercase" }}>Notas adicionales</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--theme-text-primary)", whiteSpace: "pre-line" }}>{metaStr(m.note, "")}</div>
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
        <div
          style={{
            padding: "16px",
            borderTop: "1px solid var(--theme-borders-default)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            backgroundColor: "var(--theme-surfaces-interactive)",
            borderRadius: "var(--theme-shapes-radius-medium)",
          }}
        >
          <h4 style={{ fontWeight: "700", fontSize: "0.9rem", marginBottom: "4px" }}>
            Editar entidad
          </h4>
          <div className="grid grid-cols-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Título</label>
              <input
                className="form-input"
                value={editEntityForm.title ?? entity.title}
                onChange={(e) =>
                  setEditEntityForm({ ...editEntityForm, title: e.target.value })
                }
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
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
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Resumen</label>
            <input
              className="form-input"
              value={editEntityForm.summary ?? entity.summary ?? ""}
              onChange={(e) =>
                setEditEntityForm({ ...editEntityForm, summary: e.target.value })
              }
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
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
          <div className="form-group" style={{ marginBottom: 0 }}>
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
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Estado</label>
              <input
                className="form-input"
                value={editEntityForm.status ?? entity.status}
                onChange={(e) =>
                  setEditEntityForm({ ...editEntityForm, status: e.target.value })
                }
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
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
