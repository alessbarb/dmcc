import React, { useState } from "react";
import {
  X,
  Eye,
  EyeOff,
  Archive,
  Pencil,
  Clock,
  GitBranch,
  FileText,
  AlignLeft,
} from "lucide-react";
import { getEntityDefaultImage } from "./entityVisuals.js";
import { TypeMetadataForm } from "./TypeMetadataForm.js";
import { ImagePickerButton } from "../../shared/components/ImagePickerButton.js";
import type { Entity, Relation, Fact, Session, PlayerProfile, CampaignStateStore } from "../../shared/stores/campaignStore.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { formatRelationType, formatVisibility } from "@shared/i18n/index.js";
import type { SupportedLocale } from "@shared/i18n/types.js";
import type { VisibilityRule } from "@core/domain/visibility/visibility.js";
import type { ToastKind } from "../../shared/hooks/useToast.js";

type CampaignState = NonNullable<CampaignStateStore["campaignState"]>;

interface EntityDetailModalProps {
  selectedEntity: Entity;
  campaignState: CampaignState;
  onClose: () => void;
  onEdit: (entityId: string, updates: Partial<Entity>) => Promise<void>;
  onArchive: (entityId: string) => Promise<void>;
  onVisibilityChange: (entityId: string, visibility: VisibilityRule) => Promise<void>;
  addToast: (msg: string, kind?: ToastKind) => void;
}

type TabId = "resumen" | "relaciones" | "hechos" | "trazabilidad";

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
function getRelationsArray(relations: unknown): Relation[] {
  if (!relations) return [];
  if (Array.isArray(relations)) return relations;
  if (relations instanceof Map) return Array.from(relations.values());
  if (typeof relations === "object") return Object.values(relations);
  return [];
}

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

function formatDate(iso: string | undefined, locale?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// ─── Trazabilidad types ───────────────────────────────────────────────────────

interface TraceEntry {
  at: string; // ISO string — used for sorting
  kind: "creacion" | "visibilidad" | "relacion" | "hecho";
  label: string;
  detail?: string;
}

function buildTrazabilidad(
  entity: Entity,
  relations: Relation[],
  facts: Fact[],
  sessions: Session[],
  t: (key: string, values?: Record<string, string | number>) => string,
  locale: SupportedLocale
): TraceEntry[] {
  const entries: TraceEntry[] = [];

  // 1. Creación
  const createdInSessionId = entity.createdInSessionId ?? entity.metadata?.createdInSessionId;
  const createdSession = createdInSessionId
    ? sessions.find((s: Session) => s.sessionId === createdInSessionId)
    : null;

  entries.push({
    at: entity.createdAt ?? new Date(0).toISOString(),
    kind: "creacion",
    label: t("entityDetail.entityCreated"),
    detail: createdSession
      ? t("entityDetail.sessionTrace", { number: createdSession.number ?? "?", title: createdSession.title || createdSession.sessionId })
      : undefined,
  });

  // 2. Cambios de visibilidad (from timeline events if available)
  // Not available in campaignState directly — derive from entity.visibility history if ever present
  // No-op for now (events are in timeline store, not campaignState)

  // 3. Relaciones que involucran esta entidad
  const entityRelations = relations.filter(
    (r: Relation) =>
      !r.archived &&
      (r.sourceEntityId === entity.entityId || r.targetEntityId === entity.entityId)
  );

  for (const r of entityRelations) {
    const isSource = r.sourceEntityId === entity.entityId;
    const otherId = isSource ? r.targetEntityId : r.sourceEntityId;
    entries.push({
      at: r.createdAt ?? entity.createdAt ?? new Date(0).toISOString(),
      kind: "relacion",
      label: isSource
        ? t("entityDetail.outgoingRelation", { type: formatRelationType(r.relationType, locale), target: otherId })
        : t("entityDetail.incomingRelation", { source: otherId, type: formatRelationType(r.relationType, locale) }),
      detail: r.description,
    });
  }

  // 4. Hechos asociados
  const entityFacts = facts.filter(
    (f: Fact) =>
      !f.archived &&
      Array.isArray(f.relatedEntityIds) &&
      f.relatedEntityIds.includes(entity.entityId)
  );

  for (const f of entityFacts) {
    entries.push({
      at: f.createdAt ?? entity.createdAt ?? new Date(0).toISOString(),
      kind: "hecho",
      label: `Hecho (${f.kind}): ${f.statement.length > 60 ? f.statement.slice(0, 60) + "…" : f.statement}`,
      detail: f.confidence !== "confirmed" ? `Confianza: ${f.confidence}` : undefined,
    });
  }

  // Sort chronologically
  entries.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  return entries;
}

// ─── Sub-tab renderers ────────────────────────────────────────────────────────

function ResumenTab({
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
          backgroundColor: "var(--bg-input)",
          borderRadius: "var(--radius-sm)",
        }}
      >
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>
          VISIBILIDAD
        </span>
        <span
          style={{
            padding: "2px 10px",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.8rem",
            fontWeight: "700",
            backgroundColor:
              visKind === "dm_only"
                ? "hsl(0, 60%, 25%)"
                : "hsl(120, 60%, 20%)",
            color:
              visKind === "dm_only"
                ? "hsl(0, 80%, 65%)"
                : "hsl(120, 70%, 60%)",
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
          <h4 style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Resumen
          </h4>
          <p style={{ marginTop: "4px" }}>{entity.summary}</p>
        </div>
      )}

      {entity.content && (
        <div>
          <h4 style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--text-muted)" }}>
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
              color: "var(--text-muted)",
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
                  <span style={{ color: "var(--text-muted)", minWidth: "100px" }}>{label}</span>
                  <span style={{ color: "var(--text-main)", fontWeight: "500" }}>
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
                  backgroundColor: "#06070e",
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                }}
              >
                {(entityType === "npc" || entityType === "player_character" || entityType === "creature") && (
                  entityType === "player_character" && campaignState?.campaign?.system === "dnd_5e" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", backgroundColor: "#06070e", padding: "12px", borderRadius: "var(--radius-md)" }}>
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
                        <h5 style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase" }}>Atributos Principales</h5>
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
                              <div key={attr.key} style={{ backgroundColor: "#06070e", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "6px 4px", textAlign: "center" }}>
                                <div style={{ fontSize: "0.6rem", fontWeight: "700", color: "var(--text-muted)" }}>{attr.short}</div>
                                <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--secondary)", margin: "2px 0" }}>{modStr}</div>
                                <div style={{ fontSize: "0.7rem", color: "var(--text-main)" }}>{metaStr(m[attr.key], "--")}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", backgroundColor: "#06070e", padding: "12px", borderRadius: "var(--radius-md)" }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: "600" }}>CLASE ARMADURA</div>
                          <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-main)", marginTop: "4px" }}>🛡️ {metaStr(m.armorClass, "10")}</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: "600" }}>INICIATIVA</div>
                          <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-main)", marginTop: "4px" }}>⚡ {(() => { const v = metaNum(m.initiative); return v !== undefined && v >= 0 ? `+${v}` : String(v ?? 0); })()}</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: "600" }}>VELOCIDAD</div>
                          <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-main)", marginTop: "4px" }}>🏃‍♂️ {metaStr(m.speed, "30")} ft</div>
                        </div>
                        <div style={{ textAlign: "center", gridColumn: "span 3", borderTop: "1px solid var(--border-color)", paddingTop: "8px", marginTop: "4px" }}>
                          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: "600" }}>PUNTOS DE GOLPE (HP)</div>
                          <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--color-critical)", marginTop: "4px" }}>
                            ❤️ {metaStr(m.hitPointsCurrent, "10")} / {metaStr(m.hitPointsMax, "10")}
                            {(metaNum(m.hitPointsTemp) ?? 0) > 0 && <span style={{ color: "var(--color-warning)", fontSize: "0.85rem", marginLeft: "6px" }}>+{metaStr(m.hitPointsTemp, "0")} Temp</span>}
                          </div>
                        </div>
                        <div style={{ textAlign: "center", gridColumn: "span 3", borderTop: "1px solid var(--border-color)", paddingTop: "8px" }}>
                          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: "600" }}>DADOS DE GOLPE</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--text-main)", marginTop: "4px" }}>🎲 {metaStr(m.hitDice, "--")}</div>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", backgroundColor: "#06070e", padding: "10px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                        <div>
                          <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontWeight: "600" }}>PERCEPCION PASIVA</div>
                          <div style={{ fontSize: "1rem", fontWeight: "700", marginTop: "2px" }}>👁️ {metaStr(m.passivePerception, "10")}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontWeight: "600" }}>PERSPIACACIA PASIVA</div>
                          <div style={{ fontSize: "1rem", fontWeight: "700", marginTop: "2px" }}>🧠 {metaStr(m.passiveInsight, "10")}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontWeight: "600" }}>INVESTIGACION PASIVA</div>
                          <div style={{ fontSize: "1rem", fontWeight: "700", marginTop: "2px" }}>🔍 {metaStr(m.passiveInvestigation, "10")}</div>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                        <div style={{ backgroundColor: "#06070e", padding: "10px", borderRadius: "var(--radius-md)" }}>
                          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: "700", marginBottom: "6px", textTransform: "uppercase" }}>Salvaciones</div>
                          {Array.isArray(m.savingThrows) && m.savingThrows.length > 0 ? (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                              {m.savingThrows.map((s: string) => {
                                const trans: Record<string, string> = { str: "FUER", dex: "DEST", con: "CONS", int: "INTE", wis: "SABI", cha: "CARI" };
                                return (
                                  <span key={s} style={{ fontSize: "0.65rem", padding: "2px 5px", backgroundColor: "var(--primary-light)", border: "1px solid hsla(255, 85%, 65%, 0.3)", borderRadius: "4px", color: "var(--text-main)", textTransform: "uppercase" }}>
                                    {trans[s] || s}
                                  </span>
                                );
                              })}
                            </div>
                          ) : <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontStyle: "italic" }}>Ninguna</span>}
                        </div>

                        <div style={{ backgroundColor: "#06070e", padding: "10px", borderRadius: "var(--radius-md)" }}>
                          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: "700", marginBottom: "6px", textTransform: "uppercase" }}>Habilidades</div>
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
                                  <span key={s} style={{ fontSize: "0.65rem", padding: "2px 5px", backgroundColor: "var(--primary-light)", border: "1px solid hsla(255, 85%, 65%, 0.3)", borderRadius: "4px", color: "var(--text-main)" }}>
                                    {trans[s] || s}
                                  </span>
                                );
                              })}
                            </div>
                          ) : <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontStyle: "italic" }}>Ninguna</span>}
                        </div>
                      </div>

                      <div style={{ backgroundColor: "#06070e", padding: "12px", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Field label="Dotes" value={Array.isArray(m.feats) ? m.feats.join(", ") : m.feats} />
                        <Field label="Idiomas" value={getMetadataLanguages(m)} />
                      </div>

                      {(m.spellSaveDC != null || m.spellAttackBonus != null) && (
                        <div style={{ backgroundColor: "#06070e", padding: "12px", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", gap: "8px", border: "1px dashed var(--secondary)" }}>
                          <div style={{ fontSize: "0.7rem", color: "var(--secondary)", fontWeight: "700", textTransform: "uppercase" }}>✨ Magia y Conjuros</div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                            <Field label={t("entityDetail.spellSaveDc")} value={m.spellSaveDC} />
                            <Field label="Bono de Ataque" value={m.spellAttackBonus != null ? `+${m.spellAttackBonus}` : null} />
                          </div>
                        </div>
                      )}

                      {Boolean(m.note) && (
                        <div style={{ backgroundColor: "#06070e", padding: "12px", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", gap: "6px" }}>
                          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase" }}>Notas adicionales</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-main)", whiteSpace: "pre-line" }}>{metaStr(m.note, "")}</div>
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
            borderTop: "1px solid var(--border-color)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            backgroundColor: "var(--bg-input)",
            borderRadius: "var(--radius-md)",
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

function RelacionesTab({
  entity,
  campaignState,
}: {
  entity: Entity;
  campaignState: CampaignState;
}) {
  const relations = getRelationsArray(campaignState?.relations).filter(
    (r) =>
      !r.archived &&
      (r.sourceEntityId === entity.entityId || r.targetEntityId === entity.entityId)
  );

  if (relations.length === 0) {
    return (
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", padding: "8px 0" }}>
        Esta entidad no tiene relaciones registradas.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {relations.map((r) => {
        const isSource = r.sourceEntityId === entity.entityId;
        const otherId = isSource ? r.targetEntityId : r.sourceEntityId;
        const other = campaignState?.entities?.find(
          (e: Entity) => e.entityId === otherId
        );
        return (
          <div
            key={r.relationId}
            style={{
              fontSize: "0.85rem",
              padding: "10px 12px",
              backgroundColor: "var(--bg-input)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div>
              {isSource ? (
                <>
                  <strong>Esta entidad</strong>{" "}
                  <span
                    style={{
                      padding: "1px 7px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "hsl(210, 60%, 20%)",
                      color: "hsl(210, 80%, 70%)",
                      fontSize: "0.78rem",
                      fontWeight: "600",
                    }}
                  >
                    {r.relationType}
                  </span>{" "}
                  <strong>{other?.title ?? otherId}</strong>
                </>
              ) : (
                <>
                  <strong>{other?.title ?? otherId}</strong>{" "}
                  <span
                    style={{
                      padding: "1px 7px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "hsl(210, 60%, 20%)",
                      color: "hsl(210, 80%, 70%)",
                      fontSize: "0.78rem",
                      fontWeight: "600",
                    }}
                  >
                    {r.relationType}
                  </span>{" "}
                  <strong>esta entidad</strong>
                </>
              )}
            </div>
            {r.description && (
              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: 0 }}>
                {r.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatFactSource(
  source: { kind: string; sessionId?: string; note?: string; playerId?: string; importId?: string } | null | undefined,
  sessions: Array<{ sessionId: string; number?: number; title?: string }>,
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  if (!source) return "";
  switch (source.kind) {
    case "session": {
      const s = sessions.find(sess => sess.sessionId === source.sessionId);
      return s
        ? t("factSource.session", { number: s.number ?? "?", title: s.title || "" })
        : t("factSource.sessionUnknown");
    }
    case "preparation": return t("factSource.preparation");
    case "manual": return source.note
      ? t("factSource.manualWithNote", { note: source.note })
      : t("factSource.manual");
    case "player": return t("factSource.player");
    case "import": return t("factSource.import");
    default: return "";
  }
}

function HechosTab({
  entity,
  campaignState,
}: {
  entity: Entity;
  campaignState: CampaignState;
}) {
  const { t } = useTranslation();
  const kindColors: Record<string, { bg: string; fg: string }> = {
    canon: { bg: "hsl(120, 50%, 18%)", fg: "hsl(120, 70%, 60%)" },
    dm_secret: { bg: "hsl(0, 50%, 20%)", fg: "hsl(0, 80%, 65%)" },
    rumor: { bg: "hsl(40, 60%, 18%)", fg: "hsl(40, 80%, 60%)" },
    lie: { bg: "hsl(0, 70%, 22%)", fg: "hsl(0, 90%, 70%)" },
    player_theory: { bg: "hsl(210, 50%, 18%)", fg: "hsl(210, 80%, 65%)" },
    mistake: { bg: "hsl(30, 60%, 18%)", fg: "hsl(30, 80%, 60%)" },
    retcon: { bg: "hsl(280, 50%, 18%)", fg: "hsl(280, 70%, 65%)" },
    unknown: { bg: "hsl(0, 0%, 15%)", fg: "hsl(0, 0%, 60%)" },
  };

  const facts = getFactsArray(campaignState?.facts).filter(
    (f) =>
      !f.archived &&
      Array.isArray(f.relatedEntityIds) &&
      f.relatedEntityIds.includes(entity.entityId)
  );

  if (facts.length === 0) {
    return (
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", padding: "8px 0" }}>
        No hay hechos registrados para esta entidad.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {facts.map((f) => {
        const color = kindColors[f.kind] ?? kindColors.unknown;
        return (
          <div
            key={f.factId}
            style={{
              padding: "10px 12px",
              backgroundColor: "var(--bg-input)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  padding: "1px 8px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: color.bg,
                  color: color.fg,
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {f.kind}
              </span>
              {f.confidence !== "confirmed" && (
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Confianza: {f.confidence}
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: "0.88rem", lineHeight: "1.5" }}>
              {f.statement}
            </p>
            {f.source && formatFactSource(f.source, getSessionsArray(campaignState?.sessions), t) && (
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "3px", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ opacity: 0.5 }}>↳</span>
                {formatFactSource(f.source, getSessionsArray(campaignState?.sessions), t)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TrazabilidadTab({
  entity,
  campaignState,
}: {
  entity: Entity;
  campaignState: CampaignState;
}) {
  const relations = getRelationsArray(campaignState?.relations);
  const facts = getFactsArray(campaignState?.facts);
  const sessions = getSessionsArray(campaignState?.sessions);

  const { locale, t } = useTranslation();
  const entries = buildTrazabilidad(entity, relations, facts, sessions, t, locale);

  const kindStyles: Record<
    TraceEntry["kind"],
    { accentColor: string; label: string }
  > = {
    creacion: { accentColor: "var(--color-primary, hsl(210, 80%, 55%))", label: t("entityModal.tabCreation") },
    visibilidad: { accentColor: "hsl(40, 80%, 55%)", label: t("entityModal.tabVisibility") },
    relacion: { accentColor: "hsl(210, 60%, 50%)", label: t("entityModal.tabRelation") },
    hecho: { accentColor: "hsl(280, 60%, 60%)", label: "Hecho" },
  };

  if (entries.length === 0) {
    return (
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", padding: "8px 0" }}>
        Sin datos de trazabilidad disponibles.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      {/* Timeline vertical line container */}
      {entries.map((entry, idx) => {
        const style = kindStyles[entry.kind];
        const isLast = idx === entries.length - 1;
        return (
          <div
            key={idx}
            style={{ display: "flex", gap: "12px", position: "relative" }}
          >
            {/* Dot + vertical line */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flexShrink: 0,
                width: "20px",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: style.accentColor,
                  marginTop: "14px",
                  flexShrink: 0,
                }}
              />
              {!isLast && (
                <div
                  style={{
                    width: "2px",
                    flex: "1",
                    minHeight: "16px",
                    backgroundColor: "var(--border-color)",
                    marginTop: "2px",
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div
              style={{
                padding: "10px 0",
                paddingBottom: isLast ? "0" : "14px",
                flex: 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: style.accentColor,
                  }}
                >
                  {style.label}
                </span>
                <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                  {formatDate(entry.at, locale)}
                </span>
              </div>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "0.87rem",
                  color: "var(--text-main)",
                  lineHeight: "1.4",
                }}
              >
                {entry.label}
              </p>
              {entry.detail && (
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                  }}
                >
                  {entry.detail}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function getMetadataLanguages(metadata: Record<string, unknown>): unknown {
  const languages = metadata.languages;
  return Array.isArray(languages) ? languages.join(", ") : languages;
}

export function EntityDetailModal({
  selectedEntity,
  campaignState,
  onClose,
  onEdit,
  onArchive,
  onVisibilityChange,
  addToast,
}: EntityDetailModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>("resumen");
  const [isEditingEntity, setIsEditingEntity] = useState(false);
  const [editEntityForm, setEditEntityForm] = useState<Partial<Entity>>({});
  const [isConfirmingArchive, setIsConfirmingArchive] = useState(false);

  const imgUrl =
    typeof selectedEntity.metadata?.imageUrl === "string" && selectedEntity.metadata.imageUrl
      ? selectedEntity.metadata.imageUrl
      : getEntityDefaultImage(selectedEntity.entityType);

  const isDmOnly =
    !selectedEntity.visibility?.kind ||
    selectedEntity.visibility.kind === "dm_only";

  const handleVisibilityChange = (entityId: string, visibility: any) => {
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
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "700px" }}
      >
        {/* Hero image */}
        <div
          style={{
            width: "100%",
            height: "240px",
            overflow: "hidden",
            position: "relative",
            borderTopLeftRadius: "inherit",
            borderTopRightRadius: "inherit",
          }}
        >
          <img
            src={imgUrl}
            alt={isDmOnly ? "" : selectedEntity.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: isDmOnly ? "grayscale(70%) brightness(35%)" : "none",
              opacity: selectedEntity.metadata?.imageUrl ? 1 : 0.6,
            }}
          />
          {isDmOnly && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                backgroundColor: "rgba(6, 7, 14, 0.4)",
                color: "var(--color-critical)",
                fontSize: "0.95rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <EyeOff size={20} />
              <span>Secreto / Solo DM</span>
            </div>
          )}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "80px",
              background: "linear-gradient(to top, var(--bg-card), transparent)",
            }}
          />
        </div>

        {/* Header */}
        <div
          className="modal-header"
          style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
        >
          <div>
            <span className="badge badge-primary">{selectedEntity.entityType}</span>
            <h2 style={{ fontWeight: "800", fontSize: "1.5rem", marginTop: "6px" }}>
              {selectedEntity.title}
            </h2>
            {selectedEntity.subtitle && (
              <h4 className="card-subtitle">{selectedEntity.subtitle}</h4>
            )}
          </div>
          <button className="btn btn-icon btn-secondary" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            gap: "2px",
            padding: "0 24px",
            borderBottom: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-card)",
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "10px 14px",
                  background: "none",
                  border: "none",
                  borderBottom: isActive
                    ? "2px solid var(--color-primary, hsl(210, 80%, 55%))"
                    : "2px solid transparent",
                  cursor: "pointer",
                  fontSize: "0.83rem",
                  fontWeight: isActive ? "700" : "500",
                  color: isActive
                    ? "var(--color-primary, hsl(210, 80%, 55%))"
                    : "var(--text-muted)",
                  transition: "color 0.15s, border-color 0.15s",
                  marginBottom: "-1px",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.icon}
                {t(tab.labelKey)}
              </button>
            );
          })}
        </div>

        {/* Tab body */}
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
            <RelacionesTab entity={selectedEntity} campaignState={campaignState} />
          )}
          {activeTab === "hechos" && (
            <HechosTab entity={selectedEntity} campaignState={campaignState} />
          )}
          {activeTab === "trazabilidad" && (
            <TrazabilidadTab entity={selectedEntity} campaignState={campaignState} />
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: "space-between" }}>
          <button
            type="button"
            className={`btn btn-sm ${isConfirmingArchive ? "btn-danger" : "btn-secondary"}`}
            onClick={handleArchive}
            onBlur={() => setIsConfirmingArchive(false)}
          >
            <Archive size={14} /> {isConfirmingArchive ? t("entityModal.confirmArchive") : t("entityModal.archive")}
          </button>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
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
