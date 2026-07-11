import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import {
  User,
  Shield,
  BookOpen,
  Plus,
  Trash2,
  FileText,
  Target,
  Clock,
  CheckSquare,
  RefreshCw,
  HeartPulse,
  MapPinned,
  MessageSquare,
  Eye,
  Compass,
  Sparkles,
  Users,
} from "lucide-react";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import { logout } from "@frontend/shared/auth/authClient.js";
import { AccountModal } from "../../account/AccountModal.js"; // to: "/account"


type PortalTab = "session" | "summary" | "character" | "knowledge" | "resources" | "diary" | "objectives" | "history";
type PlayerPortalMode = "family" | "advanced";
type QuickActionKind = "question" | "note" | "objective";


function getMetadataLanguages(metadata: Record<string, any>): unknown {
  return Array.isArray(metadata.languages) ? metadata.languages : metadata.networkguages;
}

const PLAYER_PORTAL_COPY = {
  en: {
    modes: { family: "Family mode", advanced: "Advanced mode" },
    modeHintFamily: "Big buttons, table-first actions and fewer sections.",
    modeHintAdvanced: "Full character sheet, resources, memory and history.",
    attentionTitle: "Before the next scene",
    attentionSubtitle: "A short checklist so you can play without hunting through menus.",
    attentionCharacterMissing: "Choose or propose a character",
    attentionCharacterReady: "Character linked",
    attentionHpMissing: "Set current hit points",
    attentionHpReady: "Hit points ready",
    attentionObjectiveMissing: "Pick one goal for today",
    attentionObjectiveReady: "Open goal ready",
    attentionQuestionMissing: "Ask the DM if something matters",
    attentionQuestionReady: "Question sent to the DM",
    quickActions: "Quick actions",
    quickAsk: "Ask the DM",
    quickNote: "Private note",
    quickObjective: "Goal for today",
    quickModalTitleQuestion: "Ask the DM without interrupting the table",
    quickModalTitleNote: "Write a quick note",
    quickModalTitleObjective: "Set a goal for today",
    quickTitleLabel: "Title",
    quickDetailsLabel: "Details",
    quickVisibleToDm: "Visible to the DM",
    quickPrivate: "Only me",
    quickSubmitQuestion: "Send question",
    quickSubmitNote: "Save note",
    quickSubmitObjective: "Save goal",
    quickCancel: "Cancel",
    quickQuestionPlaceholder: "Can my character recognize this symbol?",
    quickNotePlaceholder: "I think Halia is hiding something...",
    quickObjectivePlaceholder: "Talk to Sildar before leaving town",
    noRecapYet: "No shared recap yet.",
    recapTitle: "Last shared recap",
    tableMemory: "Useful memory for the table",
    openMemory: "Open memory",
    openDiary: "Open diary",
    openObjectives: "Open goals",
  },
  es: {
    modes: { family: "Modo familiar", advanced: "Modo avanzado" },
    modeHintFamily: "Botones grandes, acciones de mesa y menos secciones.",
    modeHintAdvanced: "Ficha completa, recursos, memoria e historia.",
    attentionTitle: "Antes de la siguiente escena",
    attentionSubtitle: "Lista corta para jugar sin perderse por menús.",
    attentionCharacterMissing: "Elige o propón un personaje",
    attentionCharacterReady: "Personaje vinculado",
    attentionHpMissing: "Ajusta los PG actuales",
    attentionHpReady: "PG listos",
    attentionObjectiveMissing: "Elige un objetivo para hoy",
    attentionObjectiveReady: "Objetivo abierto listo",
    attentionQuestionMissing: "Pregunta al DM si algo importa",
    attentionQuestionReady: "Pregunta enviada al DM",
    quickActions: "Acciones rápidas",
    quickAsk: "Preguntar al DM",
    quickNote: "Nota privada",
    quickObjective: "Objetivo de hoy",
    quickModalTitleQuestion: "Pregunta al DM sin cortar la mesa",
    quickModalTitleNote: "Apuntar una nota rápida",
    quickModalTitleObjective: "Crear un objetivo para hoy",
    quickTitleLabel: "Título",
    quickDetailsLabel: "Detalle",
    quickVisibleToDm: "Visible para el DM",
    quickPrivate: "Solo yo",
    quickSubmitQuestion: "Enviar pregunta",
    quickSubmitNote: "Guardar nota",
    quickSubmitObjective: "Guardar objetivo",
    quickCancel: "Cancelar",
    quickQuestionPlaceholder: "¿Mi personaje reconoce este símbolo?",
    quickNotePlaceholder: "Creo que Halia oculta algo...",
    quickObjectivePlaceholder: "Hablar con Sildar antes de salir del pueblo",
    noRecapYet: "Todavía no hay recap compartido.",
    recapTitle: "Último recap compartido",
    tableMemory: "Memoria útil en mesa",
    openMemory: "Abrir memoria",
    openDiary: "Abrir diario",
    openObjectives: "Abrir objetivos",
  },
} as const;

function playerCopy(locale: string) {
  return locale === "es" ? PLAYER_PORTAL_COPY.es : PLAYER_PORTAL_COPY.en;
}

type CharacterMetadata = Record<string, any>;

type EffectiveStatus = {
  hitPointsCurrent?: number;
  hitPointsMax?: number;
  armorClass?: number;
  inspiration?: boolean;
  conditions: string[];
};


type PortalMemoryEntity = {
  entityId: string;
  entityType: string;
  typeLabel?: string;
  title: string;
  subtitle?: string;
  summary?: string;
  content?: string;
  status?: string;
  importance?: string;
};

type PortalMemory = {
  entities?: Record<string, PortalMemoryEntity[]>;
  activeThreads?: { quests?: PortalMemoryEntity[]; cluesAndRumors?: PortalMemoryEntity[] };
  facts?: Array<{ factId: string; statement: string; kind?: string; confidence?: string; relatedEntities?: PortalMemoryEntity[] }>;
  relations?: Array<{ relationId: string; label: string; description?: string; status?: string; source?: PortalMemoryEntity; target?: PortalMemoryEntity }>;
  history?: Array<{
    sessionId: string;
    number?: number;
    title: string;
    status?: string;
    playerSummary?: string;
    events?: Array<{ eventId: string; title: string; description?: string; type?: string; relatedEntities?: PortalMemoryEntity[] }>;
  }>;
  counts?: { visibleEntities?: number; facts?: number; relations?: number; historyEntries?: number };
};

const CONDITION_OPTIONS = [
  "Cegado",
  "Ensordecido",
  "Asustado",
  "Apresado",
  "Incapacitado",
  "Invisible",
  "Paralizado",
  "Petrificado",
  "Envenenado",
  "Derribado",
  "Sujeto",
  "Aturdido",
  "Inconsciente",
];

const ABILITIES: Array<{ key: string; label: string; short: string }> = [
  { key: "strength", label: "Fuerza", short: "FUE" },
  { key: "dexterity", label: "Destreza", short: "DES" },
  { key: "constitution", label: "Constitución", short: "CON" },
  { key: "intelligence", label: "Inteligencia", short: "INT" },
  { key: "wisdom", label: "Sabiduría", short: "SAB" },
  { key: "charisma", label: "Carisma", short: "CAR" },
];

const KNOWN_LABELS: Record<string, string> = {
  str: "Fuerza",
  strength: "Fuerza",
  dex: "Destreza",
  dexterity: "Destreza",
  con: "Constitución",
  constitution: "Constitución",
  int: "Inteligencia",
  intelligence: "Inteligencia",
  wis: "Sabiduría",
  wisdom: "Sabiduría",
  cha: "Carisma",
  charisma: "Carisma",
  acrobatics: "Acrobacias",
  animal_handling: "Trato con animales",
  arcana: "Arcano",
  athletics: "Atletismo",
  deception: "Engaño",
  history: "Historia",
  insight: "Perspicacia",
  intimidation: "Intimidación",
  investigation: "Investigación",
  medicine: "Medicina",
  nature: "Naturaleza",
  perception: "Percepción",
  performance: "Interpretación",
  persuasion: "Persuasión",
  religion: "Religión",
  sleight_of_hand: "Juego de manos",
  stealth: "Sigilo",
  survival: "Supervivencia",
  comun: "Común",
  común: "Común",
  elfico: "Élfico",
  enano: "Enano",
  mediano: "Mediano",
  celestial: "Celestial",
};

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function asList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}


function normalizeListKey(value: string): string {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function parseConditionText(value: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of asList(value)) {
    const key = normalizeListKey(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(labelValue(item));
  }
  return result;
}

function clamp(value: number, min: number, max?: number): number {
  const lower = Math.max(min, value);
  return max === undefined ? lower : Math.min(lower, max);
}

function recoveryLabel(value: string | undefined): string {
  if (value === "short_rest") return "Descanso corto";
  if (value === "long_rest") return "Descanso largo";
  return "Manual";
}

function statusLabel(value: string | undefined): string {
  if (!value) return "Sin estado";
  const labels: Record<string, string> = {
    active: "Activo",
    open: "Abierto",
    done: "Completado",
    completed: "Completado",
    closed: "Cerrado",
    pnetworkned: "Preparado",
    suspected: "Sospecha",
    confirmed: "Confirmado",
    unconfirmed: "Sin confirmar",
  };
  return labels[value] ?? labelValue(value);
}

function labelValue(value: string): string {
  const key = value.trim().toLowerCase();
  return KNOWN_LABELS[key] ?? value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function abilityModifier(score: number | undefined): string {
  if (score === undefined) return "—";
  const modifier = Math.floor((score - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : String(modifier);
}

function signedNumber(value: unknown): string {
  const parsed = asNumber(value);
  if (parsed === undefined) return "—";
  return parsed >= 0 ? `+${parsed}` : String(parsed);
}

function buildEffectiveStatus(status: any, metadata: CharacterMetadata): EffectiveStatus {
  return {
    hitPointsCurrent: asNumber(status?.hitPointsCurrent) ?? asNumber(metadata.hitPointsCurrent),
    hitPointsMax: asNumber(status?.hitPointsMax) ?? asNumber(metadata.hitPointsMax),
    armorClass: asNumber(status?.armorClass) ?? asNumber(metadata.armorClass),
    inspiration: Boolean(status?.inspiration),
    conditions: asList(status?.conditions),
  };
}

function CharacterFact({ label, value }: { label: string; value: React.ReactNode }) {
  const empty = value === undefined || value === null || value === "";
  return (
    <div className="card" style={{ padding: "14px", minHeight: "74px" }}>
      <div style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", fontWeight: 800 }}>
        {label}
      </div>
      <div style={{ marginTop: "6px", fontSize: "1rem", fontWeight: 750, color: "var(--text-main)" }}>
        {empty ? "—" : value}
      </div>
    </div>
  );
}

function PillList({ items, empty = "—" }: { items: string[]; empty?: string }) {
  if (items.length === 0) {
    return <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{empty}</span>;
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {items.map((item) => (
        <span key={item} className="badge badge-default" style={{ fontSize: "0.72rem" }}>
          {labelValue(item)}
        </span>
      ))}
    </div>
  );
}

function CharacterInfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: "18px" }}>
      <h4 style={{ fontWeight: 800, marginBottom: "14px" }}>{title}</h4>
      {children}
    </div>
  );
}


function EmptyPortalState({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: "20px", borderStyle: "dashed", color: "var(--text-muted)" }}>
      <h4 style={{ color: "var(--text-main)", fontWeight: 800, marginBottom: "6px" }}>{title}</h4>
      <div style={{ fontSize: "0.9rem", lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

function PortalSection({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="card player-portal-section">
      <div className="player-portal-section-header">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function MemoryEntityCard({ entity, compact = false }: { entity: PortalMemoryEntity; compact?: boolean }) {
  return (
    <div className="player-memory-card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 800 }}>{entity.title}</div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.74rem", marginTop: "2px" }}>
            {entity.typeLabel ?? labelValue(entity.entityType)}
            {entity.subtitle ? ` · ${entity.subtitle}` : ""}
          </div>
        </div>
        {entity.status && <span className="badge badge-default" style={{ fontSize: "0.66rem" }}>{statusLabel(entity.status)}</span>}
      </div>
      {!compact && (entity.summary || entity.content) && (
        <p style={{ color: "var(--text-muted)", fontSize: "0.84rem", lineHeight: 1.55, marginTop: "10px" }}>
          {entity.summary ?? entity.content}
        </p>
      )}
    </div>
  );
}

function ResourceMeter({ current, max }: { current: number; max: number }) {
  const percent = max > 0 ? clamp((current / max) * 100, 0, 100) : 0;
  return (
    <div className="player-resource-meter" aria-label={`${current} de ${max}`}>
      <div style={{ width: `${percent}%` }} />
    </div>
  );
}

export function PlayerPortalView({ campaignId }: { campaignId: string }) {
  const { t, locale } = useTranslation();
  const copy = playerCopy(locale);
  const navigate = useNavigate();
  const {
    campaignState,
    playerPortalState,
    loadPlayerPortalState,
    updatePlayerPortalStatus,
    upsertPlayerPortalResource,
    createPlayerPortalNote,
    updatePlayerPortalNote,
    createPlayerPortalObjective,
    updatePlayerPortalObjective,
    createPlayerCharacterProposal,
    error,
  } = useCampaignStore();

  const [activeTab, setActiveTab] = useState<PortalTab>("session");
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [portalMode, setPortalMode] = useState<PlayerPortalMode>(() => {
    try {
      return localStorage.getItem("dmcc_player_portal_mode") === "advanced" ? "advanced" : "family";
    } catch {
      return "family";
    }
  });
  const [quickAction, setQuickAction] = useState<QuickActionKind | null>(null);
  const [quickActionForm, setQuickActionForm] = useState({ title: "", details: "", visibility: "dm_visible" as "private" | "dm_visible" });

  // Character/State form
  const [charForm, setCharForm] = useState({
    hitPointsCurrent: "",
    hitPointsMax: "",
    armorClass: "",
    inspiration: false,
    conditions: "",
  });

  // Resource create form
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [resourceForm, setResourceForm] = useState({
    label: "",
    current: "",
    max: "",
    recovery: "manual" as "manual" | "short_rest" | "long_rest",
  });

  // Resource inline edits: resourceId -> { current, max }
  const [resourceEdits, setResourceEdits] = useState<Record<string, { current: string; max: string }>>({});

  // Diary create form
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteForm, setNoteForm] = useState({
    title: "",
    content: "",
    visibility: "private" as "private" | "dm_visible",
  });

  // Objectives create form
  const [showObjectiveForm, setShowObjectiveForm] = useState(false);
  const [objectiveForm, setObjectiveForm] = useState({
    title: "",
    description: "",
    kind: "personal" as "personal" | "session" | "question_for_dm",
    status: "open" as "open" | "done" | "archived",
    visibility: "private" as "private" | "dm_visible",
  });

  // Character creation / selection form
  const [showCreateCharForm, setShowCreateCharForm] = useState(false);
  const [createCharForm, setCreateCharForm] = useState({
    name: "",
    className: "",
    species: "",
    background: "",
    level: "1",
    armorClass: "10",
    hitPointsMax: "10",
    description: "",
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(
    () => typeof document === "undefined" || !document.hidden,
  );

  // Diary inline edit state
  const [noteEditId, setNoteEditId] = useState<string | null>(null);
  const [noteEditForm, setNoteEditForm] = useState({
    title: "",
    content: "",
    visibility: "private" as "private" | "dm_visible",
  });

  const playerId = playerPortalState?.playerId;

  useEffect(() => {
    useCampaignStore.getState().enterPlayerCampaign(campaignId);
    void loadPlayerPortalState(campaignId);
  }, [campaignId, loadPlayerPortalState]);

  useEffect(() => {
    const updateVisibility = () => setIsTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("dmcc_player_portal_mode", portalMode);
    } catch {}
  }, [portalMode]);

  useEffect(() => {
    if (portalMode === "family" && ["character", "resources"].includes(activeTab)) {
      setActiveTab("session");
    }
  }, [activeTab, portalMode]);

  // Derived linked character info. Player portal must not require the protected DM campaign snapshot.
  const linkedCharacter: { entityId: string; title: string; metadata?: any; status?: string; subtitle?: string; summary?: string; content?: string } | null =
    playerPortalState?.linkedCharacter ?? null;
  const availableCharacters: Array<{ entityId: string; title: string; metadata?: any; status?: string; subtitle?: string; summary?: string }> =
    playerPortalState?.availableCharacters ?? [];
  const player =
    playerPortalState?.player ??
    campaignState?.players?.find((p) => p.playerId === playerId) ??
    null;
  const myCharacter =
    linkedCharacter ??
    campaignState?.entities?.find(
      (e) => e.entityType === "player_character" && e.metadata?.playerId === playerId
    );
  const characterMetadata: CharacterMetadata = (myCharacter?.metadata ?? linkedCharacter?.metadata ?? {}) as CharacterMetadata;

  // Derive portal data with safe defaults. Live state overrides static sheet data, but premade metadata fills gaps.
  const sheet = playerPortalState?.sheet;
  const status = buildEffectiveStatus(sheet?.status, characterMetadata);
  const resources: any[] = sheet?.resources ?? [];
  const notes: any[] = playerPortalState?.notes ?? [];
  const objectives: any[] = playerPortalState?.objectives ?? [];
  const summaryText = myCharacter?.summary ?? linkedCharacter?.summary ?? characterMetadata.note ?? "";
  const characterContent = (myCharacter as any)?.content ?? linkedCharacter?.content ?? characterMetadata.note ?? "";
  const savingThrows = asList(characterMetadata.savingThrows);
  const skills = asList(characterMetadata.skills);
  const languages = asList(getMetadataLanguages(characterMetadata));
  const feats = asList(characterMetadata.feats);
  const keyTraits = asList(characterMetadata.keyTraits);
  const personalGoals = asList(characterMetadata.personalGoals);
  const importantItems = asList(characterMetadata.importantItems);
  const characterEntityId = myCharacter?.entityId ?? playerPortalState?.link?.characterEntityId;
  const memory: PortalMemory = (playerPortalState?.memory ?? {}) as PortalMemory;
  const memoryEntities = memory.entities ?? {};
  const historyEntries = memory.history ?? [];
  const openObjectives = objectives.filter((o: any) => o.status === "open");
  const dmQuestions = objectives.filter((o: any) => o.kind === "question_for_dm" && o.status === "open");
  const recentFacts = memory.facts ?? [];
  const knownNpcs = memoryEntities.npcs ?? [];
  const knownLocations = memoryEntities.locations ?? [];
  const knownQuests = memoryEntities.quests ?? [];
  const knownClues = [...(memoryEntities.clues ?? []), ...(memoryEntities.rumors ?? [])];
  const knownItems = memoryEntities.items ?? [];
  const keyMemoryCards = useMemo(
    () => [
      ...(memory.activeThreads?.quests ?? []),
      ...(memory.activeThreads?.cluesAndRumors ?? []),
      ...knownNpcs.slice(0, 4),
      ...knownLocations.slice(0, 4),
    ].filter((entity, index, list) => list.findIndex((item) => item.entityId === entity.entityId) === index).slice(0, 8),
    [memory.activeThreads, knownNpcs, knownLocations]
  );

  const latestSharedRecap = historyEntries.find((session) => Boolean(session.playerSummary));
  const onboardingSteps = [
    {
      id: "character",
      done: Boolean(myCharacter || linkedCharacter),
      label: myCharacter || linkedCharacter ? copy.attentionCharacterReady : copy.attentionCharacterMissing,
      tab: "summary" as PortalTab,
    },
    {
      id: "hp",
      done: Boolean(characterEntityId && status.hitPointsCurrent !== undefined && status.hitPointsMax !== undefined),
      label: status.hitPointsCurrent !== undefined ? copy.attentionHpReady : copy.attentionHpMissing,
      tab: "session" as PortalTab,
    },
    {
      id: "objective",
      done: openObjectives.length > 0,
      label: openObjectives.length > 0 ? copy.attentionObjectiveReady : copy.attentionObjectiveMissing,
      tab: "objectives" as PortalTab,
    },
    {
      id: "question",
      done: dmQuestions.length > 0,
      label: dmQuestions.length > 0 ? copy.attentionQuestionReady : copy.attentionQuestionMissing,
      tab: "session" as PortalTab,
    },
  ];

  // Sync char form when portal state loads
  useEffect(() => {
    if (sheet || myCharacter) {
      setCharForm({
        hitPointsCurrent: String(status.hitPointsCurrent ?? ""),
        hitPointsMax: String(status.hitPointsMax ?? ""),
        armorClass: String(status.armorClass ?? ""),
        inspiration: status.inspiration ?? false,
        conditions: status.conditions.join(", "),
      });
    }
  }, [playerPortalState, myCharacter?.entityId]);

  // Poll every 10s when no character is linked yet
  useEffect(() => {
    const noLink = !playerPortalState?.link && !linkedCharacter;
    if (!noLink) return;
    const interval = setInterval(() => {
      void loadPlayerPortalState(campaignId);
    }, 10000);
    return () => clearInterval(interval);
  }, [playerPortalState?.link, linkedCharacter, campaignId, loadPlayerPortalState]);
  interface PortalProposal {
    proposalId: string;
    kind: "link_request" | "create_character" | "update_character_core";
    status: "pending" | "approved" | "rejected";
    targetCharacterEntityId?: string;
  }
  const proposals: PortalProposal[] = (playerPortalState?.proposals ?? []) as PortalProposal[];
  const pendingLinkRequests = proposals.filter(
    (p) => p.kind === "link_request" && p.status === "pending"
  );
  const pendingCreateRequests = proposals.filter(
    (p) => p.kind === "create_character" && p.status === "pending"
  );

  const handleExit = async () => {
    await logout();
    useCampaignStore.getState().leavePlayerPortal();
    navigate({ to: "/player/join" });
  };

  function buildStatusPayload(overrides: Partial<EffectiveStatus> = {}) {
    return {
      characterEntityId,
      hitPointsCurrent: overrides.hitPointsCurrent ?? asNumber(charForm.hitPointsCurrent) ?? status.hitPointsCurrent ?? 0,
      hitPointsMax: overrides.hitPointsMax ?? asNumber(charForm.hitPointsMax) ?? status.hitPointsMax ?? 0,
      armorClass: overrides.armorClass ?? asNumber(charForm.armorClass) ?? status.armorClass ?? 10,
      inspiration: overrides.inspiration ?? charForm.inspiration,
      conditions: overrides.conditions ?? parseConditionText(charForm.conditions),
    };
  }

  async function persistStatus(overrides: Partial<EffectiveStatus> = {}) {
    if (!characterEntityId) return;
    await updatePlayerPortalStatus(buildStatusPayload(overrides));
  }

  // ── Submit: Character/State ──────────────────────────────────────────────
  const handleCharSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await persistStatus();
  };

  const handleHitPointNudge = async (delta: number) => {
    const current = asNumber(charForm.hitPointsCurrent) ?? status.hitPointsCurrent ?? 0;
    const max = asNumber(charForm.hitPointsMax) ?? status.hitPointsMax;
    const next = clamp(current + delta, 0, max);
    setCharForm((form) => ({ ...form, hitPointsCurrent: String(next) }));
    await persistStatus({ hitPointsCurrent: next });
  };

  const handleInspirationToggle = async () => {
    const next = !charForm.inspiration;
    setCharForm((form) => ({ ...form, inspiration: next }));
    await persistStatus({ inspiration: next });
  };

  const handleConditionToggle = async (condition: string) => {
    const current = parseConditionText(charForm.conditions);
    const key = normalizeListKey(condition);
    const exists = current.some((item) => normalizeListKey(item) === key);
    const next = exists ? current.filter((item) => normalizeListKey(item) !== key) : [...current, condition];
    setCharForm((form) => ({ ...form, conditions: next.join(", ") }));
    await persistStatus({ conditions: next });
  };

  // ── Submit: Resource save inline ────────────────────────────────────────
  const handleResourceSave = async (resourceId: string) => {
    const edit = resourceEdits[resourceId];
    if (!edit) return;
    await upsertPlayerPortalResource({
      resourceId,
      current: parseInt(edit.current) || 0,
      max: parseInt(edit.max) || 0,
    });
    setResourceEdits((prev) => {
      const next = { ...prev };
      delete next[resourceId];
      return next;
    });
  };

  const handleResourceNudge = async (resource: any, delta: number) => {
    const max = asNumber(resource.max) ?? 0;
    const current = asNumber(resource.current) ?? 0;
    const next = clamp(current + delta, 0, max || undefined);
    await upsertPlayerPortalResource({
      resourceId: resource.resourceId,
      label: resource.label,
      current: next,
      max,
      recovery: resource.recovery,
    });
  };

  // ── Submit: Resource create ─────────────────────────────────────────────
  const handleResourceCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceForm.label.trim()) return;
    await upsertPlayerPortalResource({
      label: resourceForm.label.trim(),
      current: parseInt(resourceForm.current) || 0,
      max: parseInt(resourceForm.max) || 0,
      recovery: resourceForm.recovery,
    });
    setResourceForm({ label: "", current: "", max: "", recovery: "manual" });
    setShowResourceForm(false);
  };

  // ── Submit: Note create ─────────────────────────────────────────────────
  const handleNoteCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.title.trim()) return;
    await createPlayerPortalNote({
      title: noteForm.title.trim(),
      content: noteForm.content.trim(),
      visibility: noteForm.visibility,
      linkedEntityIds: [],
    });
    setNoteForm({ title: "", content: "", visibility: "private" });
    setShowNoteForm(false);
  };

  // ── Submit: Archive note ────────────────────────────────────────────────
  const handleNoteArchive = async (noteId: string) => {
    if (!confirm(t("session.archiveNoteConfirm"))) return;
    await updatePlayerPortalNote(noteId, { archived: true });
  };

  // ── Submit: Note edit inline ────────────────────────────────────────────
  const handleNoteEditSubmit = async (e: React.FormEvent, noteId: string) => {
    e.preventDefault();
    await updatePlayerPortalNote(noteId, {
      title: noteEditForm.title,
      content: noteEditForm.content,
      visibility: noteEditForm.visibility,
    });
    setNoteEditId(null);
  };

  // ── Submit: Objective create ────────────────────────────────────────────
  const handleObjectiveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objectiveForm.title.trim()) return;
    await createPlayerPortalObjective({
      title: objectiveForm.title.trim(),
      description: objectiveForm.description.trim() || undefined,
      kind: objectiveForm.kind,
      status: objectiveForm.status,
      visibility: objectiveForm.visibility,
    });
    setObjectiveForm({ title: "", description: "", kind: "personal", status: "open", visibility: "private" });
    setShowObjectiveForm(false);
  };

  const openQuickAction = (kind: QuickActionKind) => {
    setQuickAction(kind);
    setQuickActionForm({
      title:
        kind === "question"
          ? copy.quickQuestionPlaceholder
          : kind === "objective"
            ? copy.quickObjectivePlaceholder
            : "",
      details: "",
      visibility: kind === "note" ? "private" : "dm_visible",
    });
  };

  const handleQuickActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAction || !quickActionForm.title.trim()) return;

    if (quickAction === "question") {
      await createPlayerPortalObjective({
        title: quickActionForm.title.trim(),
        description: quickActionForm.details.trim() || undefined,
        kind: "question_for_dm",
        status: "open",
        visibility: "dm_visible",
      });
    } else if (quickAction === "objective") {
      await createPlayerPortalObjective({
        title: quickActionForm.title.trim(),
        description: quickActionForm.details.trim() || undefined,
        kind: "session",
        status: "open",
        visibility: quickActionForm.visibility,
      });
    } else {
      await createPlayerPortalNote({
        title: quickActionForm.title.trim(),
        content: quickActionForm.details.trim(),
        visibility: quickActionForm.visibility,
        linkedEntityIds: [],
      });
    }

    setQuickAction(null);
    setQuickActionForm({ title: "", details: "", visibility: "dm_visible" });
  };

  // ── Submit: Objective complete ──────────────────────────────────────────
  const handleObjectiveComplete = async (objectiveId: string) => {
    await updatePlayerPortalObjective(objectiveId, { status: "done" });
  };

  // ── Submit: link_request proposal (player requests existing character) ──
  const handleLinkRequest = async (characterEntityId: string) => {
    await createPlayerCharacterProposal({
      kind: "link_request",
      targetCharacterEntityId: characterEntityId,
      proposedChanges: {},
    });
  };

  // ── Submit: create_character proposal (player submits own character) ────
  const handleCreateChar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createCharForm.name.trim()) return;
    await createPlayerCharacterProposal({
      kind: "create_character",
      proposedChanges: {
        title: createCharForm.name.trim(),
        className: createCharForm.className.trim(),
        species: createCharForm.species.trim(),
        background: createCharForm.background.trim(),
        level: parseInt(createCharForm.level, 10) || 1,
        armorClass: parseInt(createCharForm.armorClass, 10) || 10,
        hitPointsMax: parseInt(createCharForm.hitPointsMax, 10) || 10,
        hitPointsCurrent: parseInt(createCharForm.hitPointsMax, 10) || 10,
        description: createCharForm.description.trim(),
      },
    });
    setCreateCharForm({ name: "", className: "", species: "", background: "", level: "1", armorClass: "10", hitPointsMax: "10", description: "" });
    setShowCreateCharForm(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadPlayerPortalState(campaignId);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!playerPortalState) {
    if (error) {
      return (
        <div className="player-portal-loading" style={{ flexDirection: "column", gap: "16px" }}>
          <div className="card" style={{ maxWidth: "400px", padding: "20px", border: "1px solid rgba(239,68,68,0.45)", background: "rgba(239,68,68,0.08)", color: "#fca5a5", fontSize: "0.85rem", textAlign: "center" }}>
            <p style={{ margin: 0, lineHeight: 1.5 }}>{error}</p>
            <button className="btn btn-secondary btn-sm" style={{ marginTop: "12px" }} onClick={() => navigate({ to: "/" })}>
              {t("common.back") || "Volver"}
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="player-portal-loading">
        Cargando portal del jugador...
      </div>
    );
  }

  const ALL_TABS: { id: PortalTab; label: string; icon: React.ReactNode; family?: boolean }[] = [
    { id: "session", label: "Mesa", icon: <HeartPulse size={16} />, family: true },
    { id: "summary", label: t("session.summary"), icon: <Shield size={16} />, family: true },
    { id: "character", label: "Personaje", icon: <User size={16} /> },
    { id: "knowledge", label: "Memoria", icon: <MapPinned size={16} />, family: true },
    { id: "resources", label: "Recursos", icon: <Clock size={16} /> },
    { id: "diary", label: "Diario", icon: <FileText size={16} />, family: true },
    { id: "objectives", label: t("playerPortal.objectives"), icon: <Target size={16} />, family: true },
    { id: "history", label: "Historia", icon: <BookOpen size={16} />, family: true },
  ];
  const TABS = portalMode === "family" ? ALL_TABS.filter((tab) => tab.family) : ALL_TABS;

  const tabLabel: Record<PortalTab, string> = {
    session: "Modo mesa",
    summary: t("players.playerSummary"),
    character: t("players.characterStatus"),
    knowledge: "Lo que sabe mi personaje",
    resources: "Recursos & Habilidades",
    diary: "Diario Personal",
    objectives: t("playerPortal.objectives"),
    history: "Historia de la Aventura",
  };

  return (
    <div className={`player-portal-shell ${isTabVisible ? "" : "player-portal-shell--paused"}`}>
      {/* Sidebar */}
      <aside className="sidebar player-portal-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">{campaignState?.campaign?.title ?? playerPortalState.campaign?.title ?? campaignId}</div>
          <div className="sidebar-logo-subtitle">Portal del Jugador</div>
        </div>

        <div className="player-portal-profile">
          <div className="player-portal-avatar">
            {player?.displayName?.slice(0, 2).toUpperCase() ?? "PL"}
          </div>
          <div>
            <div className="player-portal-profile__name">{player?.displayName ?? "Jugador"}</div>
            <div className="player-portal-profile__character">
              {myCharacter ? myCharacter.title : "Sin personaje"}
            </div>
          </div>
        </div>

        <div className="player-mode-switcher" style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-color)" }}>
          <div className="player-mode-buttons">
            <button
              type="button"
              className={portalMode === "family" ? "active" : ""}
              onClick={() => setPortalMode("family")}
            >
              {copy.modes.family}
            </button>
            <button
              type="button"
              className={portalMode === "advanced" ? "active" : ""}
              onClick={() => setPortalMode("advanced")}
            >
              {copy.modes.advanced}
            </button>
          </div>
          <p>{portalMode === "family" ? copy.modeHintFamily : copy.modeHintAdvanced}</p>
        </div>

        <nav className="sidebar-nav player-portal-nav" aria-label="Portal del jugador">
          {TABS.map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? "page" : undefined}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="btn btn-secondary btn-sm" onClick={() => setAccountModalOpen(true)}>
            Account
          </button>
          <button className="btn btn-danger btn-sm player-portal-exit" onClick={() => void handleExit()}>
            {t("playerPortal.leavePortal")}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content player-portal-main">
        <div className="top-bar">
          <div className="top-bar-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.1rem", fontWeight: "800" }}>{tabLabel[activeTab]}</span>
          </div>
          <div className="top-bar-actions">
            {myCharacter && (
              <span className="badge badge-success">
                {myCharacter.title}
              </span>
            )}
          </div>
        </div>

        <div className="content-body player-portal-content">
          {error && (
            <div className="card" style={{ padding: "12px 14px", marginBottom: "16px", border: "1px solid rgba(239,68,68,0.45)", background: "rgba(239,68,68,0.08)", color: "#fca5a5", fontSize: "0.85rem" }}>
              {error}
            </div>
          )}

          {/* ── TAB: Session / Table Mode ───────────────────────────────────── */}
          {activeTab === "session" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="card player-onboarding-card">
                <div className="player-onboarding-header">
                  <div>
                    <div className="player-session-kicker">{copy.attentionTitle}</div>
                    <h3>{copy.attentionSubtitle}</h3>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => void handleRefresh()} disabled={isRefreshing}>
                    <RefreshCw size={13} /> {isRefreshing ? "..." : "Sync"}
                  </button>
                </div>
                <div className="player-onboarding-grid">
                  {onboardingSteps.map((step) => (
                    <button
                      key={step.id}
                      type="button"
                      className={step.done ? "done" : ""}
                      onClick={() => step.id === "question" && !step.done ? openQuickAction("question") : setActiveTab(step.tab)}
                    >
                      <CheckSquare size={15} />
                      <span>{step.label}</span>
                    </button>
                  ))}
                </div>
                <div className="player-quick-actions">
                  <span>{copy.quickActions}</span>
                  <button className="btn btn-primary btn-sm" onClick={() => openQuickAction("question")}><MessageSquare size={13} /> {copy.quickAsk}</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => openQuickAction("note")}><FileText size={13} /> {copy.quickNote}</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => openQuickAction("objective")}><Target size={13} /> {copy.quickObjective}</button>
                </div>
              </div>

              {!myCharacter && !linkedCharacter ? (
                <EmptyPortalState title="Todavía no hay personaje vinculado">
                  El portal ya está listo, pero necesitas que el DM apruebe tu personaje o tu solicitud. Puedes pedir uno de campaña o proponer el tuyo desde el resumen.
                  <div style={{ marginTop: "14px" }}>
                    <button className="btn btn-primary btn-sm" onClick={() => setActiveTab("summary")}>Elegir o proponer personaje</button>
                  </div>
                </EmptyPortalState>
              ) : (
                <>
                  <div className="card player-session-hero">
                    <div>
                      <div className="player-session-kicker">Modo mesa</div>
                      <h2>{myCharacter?.title ?? linkedCharacter?.title}</h2>
                      <p>
                        Nivel {characterMetadata.level ?? 1} {characterMetadata.species ?? ""} {characterMetadata.className ?? ""}
                        {characterMetadata.background ? ` · ${characterMetadata.background}` : ""}
                      </p>
                    </div>
                    <div className="player-session-stat-grid">
                      <div className="player-session-stat">
                        <span>PG</span>
                        <strong>{status.hitPointsCurrent ?? "—"} / {status.hitPointsMax ?? "—"}</strong>
                      </div>
                      <div className="player-session-stat">
                        <span>CA</span>
                        <strong>{status.armorClass ?? "—"}</strong>
                      </div>
                      <div className="player-session-stat">
                        <span>Inspiración</span>
                        <strong>{status.inspiration ? "Sí" : "No"}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="player-session-layout">
                    <PortalSection
                      title={copy.recapTitle}
                      subtitle={latestSharedRecap ? latestSharedRecap.title : copy.noRecapYet}
                      action={<button className="btn btn-secondary btn-sm" onClick={() => setActiveTab("history")}>{copy.openMemory}</button>}
                    >
                      {latestSharedRecap?.playerSummary ? (
                        <p className="player-session-recap">{latestSharedRecap.playerSummary}</p>
                      ) : (
                        <p className="player-muted-line">{copy.noRecapYet}</p>
                      )}
                    </PortalSection>

                    <PortalSection
                      title={copy.tableMemory}
                      subtitle="NPCs, lugares, pistas y objetivos que pueden importar ahora."
                      action={<button className="btn btn-secondary btn-sm" onClick={() => setActiveTab("knowledge")}>{copy.openMemory}</button>}
                    >
                      {keyMemoryCards.length === 0 ? (
                        <p className="player-muted-line">No hay memoria visible todavía.</p>
                      ) : (
                        <div className="player-card-list">
                          {keyMemoryCards.slice(0, 5).map((entity) => (
                            <MemoryEntityCard key={entity.entityId} entity={entity} compact />
                          ))}
                        </div>
                      )}
                    </PortalSection>
                  </div>

                  <div className="player-session-layout">
                    <PortalSection title="Seguimiento cómodo" subtitle="Cambios manuales, rápidos y visibles en mesa.">
                      <div className="player-hp-controls">
                        <button className="btn btn-secondary btn-sm" onClick={() => void handleHitPointNudge(-5)} disabled={!characterEntityId}>-5</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => void handleHitPointNudge(-1)} disabled={!characterEntityId}>-1</button>
                        <div className="player-hp-readout">
                          <span>PG actuales</span>
                          <strong>{charForm.hitPointsCurrent || status.hitPointsCurrent || 0}</strong>
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={() => void handleHitPointNudge(1)} disabled={!characterEntityId}>+1</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => void handleHitPointNudge(5)} disabled={!characterEntityId}>+5</button>
                      </div>

                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => void handleInspirationToggle()} disabled={!characterEntityId}>
                          {charForm.inspiration ? "Quitar inspiración" : "Marcar inspiración"}
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab("character")}>Editar ficha viva</button>
                      </div>

                      <div style={{ marginTop: "18px" }}>
                        <div className="form-label">Condiciones</div>
                        <div className="player-condition-grid">
                          {CONDITION_OPTIONS.map((condition) => {
                            const active = parseConditionText(charForm.conditions).some((item) => normalizeListKey(item) === normalizeListKey(condition));
                            return (
                              <button
                                key={condition}
                                type="button"
                                className={`player-condition-chip ${active ? "active" : ""}`}
                                onClick={() => void handleConditionToggle(condition)}
                                disabled={!characterEntityId}
                              >
                                {condition}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </PortalSection>

                    <PortalSection
                      title="Objetivos abiertos"
                      subtitle="Lo importante para no perder el hilo."
                      action={<button className="btn btn-secondary btn-sm" onClick={() => { setActiveTab("objectives"); setShowObjectiveForm(true); }}>Añadir</button>}
                    >
                      {openObjectives.length === 0 ? (
                        <p className="player-muted-line">No hay objetivos abiertos.</p>
                      ) : (
                        <div className="player-card-list">
                          {openObjectives.slice(0, 5).map((objective: any) => (
                            <div key={objective.objectiveId ?? objective.title} className="player-compact-row">
                              <Target size={15} />
                              <div>
                                <strong>{objective.title}</strong>
                                {objective.description && <p>{objective.description}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </PortalSection>

                    <PortalSection
                      title="Preguntas para el DM"
                      subtitle="Dudas ordenadas sin cortar la escena."
                      action={<button className="btn btn-secondary btn-sm" onClick={() => { setActiveTab("objectives"); setObjectiveForm((form) => ({ ...form, kind: "question_for_dm", visibility: "dm_visible" })); setShowObjectiveForm(true); }}>Preguntar</button>}
                    >
                      {dmQuestions.length === 0 ? (
                        <p className="player-muted-line">No tienes preguntas pendientes.</p>
                      ) : (
                        <div className="player-card-list">
                          {dmQuestions.slice(0, 4).map((question: any) => (
                            <div key={question.objectiveId ?? question.title} className="player-compact-row">
                              <MessageSquare size={15} />
                              <div>
                                <strong>{question.title}</strong>
                                {question.description && <p>{question.description}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </PortalSection>
                  </div>

                  <PortalSection
                    title="Memoria útil ahora"
                    subtitle="Solo información visible para tu personaje o para el grupo."
                    action={<button className="btn btn-secondary btn-sm" onClick={() => setActiveTab("knowledge")}>Ver memoria</button>}
                  >
                    {keyMemoryCards.length === 0 ? (
                      <p className="player-muted-line">Aún no hay pistas, lugares o PNJ visibles para mostrar aquí.</p>
                    ) : (
                      <div className="player-memory-grid compact">
                        {keyMemoryCards.map((entity) => <MemoryEntityCard key={entity.entityId} entity={entity} compact />)}
                      </div>
                    )}
                  </PortalSection>

                  <div className="player-session-layout">
                    <PortalSection
                      title="Recursos"
                      subtitle="Marcadores manuales de mesa."
                      action={<button className="btn btn-secondary btn-sm" onClick={() => setActiveTab("resources")}>Editar</button>}
                    >
                      {resources.length === 0 ? (
                        <p className="player-muted-line">Sin recursos registrados.</p>
                      ) : (
                        <div className="player-card-list">
                          {resources.slice(0, 5).map((resource: any) => {
                            const current = asNumber(resource.current) ?? 0;
                            const max = asNumber(resource.max) ?? 0;
                            return (
                              <div key={resource.resourceId ?? resource.label} className="player-resource-row">
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                                    <strong>{resource.label}</strong>
                                    <span>{current}/{max}</span>
                                  </div>
                                  <ResourceMeter current={current} max={max} />
                                  <small>{recoveryLabel(resource.recovery)}</small>
                                </div>
                                <div style={{ display: "flex", gap: "6px" }}>
                                  <button className="btn btn-secondary btn-sm" onClick={() => void handleResourceNudge(resource, -1)}>-1</button>
                                  <button className="btn btn-secondary btn-sm" onClick={() => void handleResourceNudge(resource, 1)}>+1</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </PortalSection>

                    <PortalSection
                      title="Notas recientes"
                      subtitle="Tu libreta personal de campaña."
                      action={<button className="btn btn-secondary btn-sm" onClick={() => { setActiveTab("diary"); setShowNoteForm(true); }}>Nueva nota</button>}
                    >
                      {notes.filter((note: any) => !note.archived).length === 0 ? (
                        <p className="player-muted-line">Todavía no has escrito notas.</p>
                      ) : (
                        <div className="player-card-list">
                          {notes.filter((note: any) => !note.archived).slice(0, 4).map((note: any) => (
                            <div key={note.noteId ?? note.title} className="player-compact-row">
                              <FileText size={15} />
                              <div>
                                <strong>{note.title}</strong>
                                {note.content && <p>{note.content}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </PortalSection>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── TAB: Summary ──────────────────────────────────────────────── */}
          {activeTab === "summary" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Character header */}
              {(myCharacter || linkedCharacter) ? (
                <>
                  <div className="card" style={{ display: "flex", gap: "20px", padding: "24px", background: "linear-gradient(135deg, hsla(255, 85%, 65%, 0.14), transparent)" }}>
                    <div style={{ flexGrow: 1 }}>
                      <h2 style={{ fontSize: "1.4rem", fontWeight: "800" }}>
                        {myCharacter?.title ?? linkedCharacter?.title}
                      </h2>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "4px" }}>
                        Nivel {characterMetadata.level ?? 1} {characterMetadata.species ?? ""} {characterMetadata.className ?? ""}
                        {characterMetadata.subclass ? ` · ${characterMetadata.subclass}` : ""}
                      </p>
                      {(summaryText || characterMetadata.background) && (
                        <p style={{ color: "var(--text-main)", fontSize: "0.9rem", lineHeight: 1.6, marginTop: "12px", maxWidth: "720px" }}>
                          {summaryText || `Trasfondo: ${characterMetadata.background}`}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3" style={{ gap: "16px" }}>
                    <CharacterFact label="Clase" value={characterMetadata.className} />
                    <CharacterFact label="Especie" value={characterMetadata.species} />
                    <CharacterFact label="Trasfondo" value={characterMetadata.background} />
                  </div>

                  <CharacterInfoBlock title="Características">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: "10px" }}>
                      {ABILITIES.map((ability) => {
                        const score = asNumber(characterMetadata[ability.key]);
                        return (
                          <div key={ability.key} style={{ padding: "12px", borderRadius: "var(--radius-sm)", background: "var(--surface-2)", border: "1px solid var(--border-color)", textAlign: "center" }}>
                            <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--text-muted)" }}>{ability.short}</div>
                            <div style={{ fontSize: "1.35rem", fontWeight: 850, marginTop: "4px" }}>{score ?? "—"}</div>
                            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{abilityModifier(score)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </CharacterInfoBlock>
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* No character yet — selection/request UI */}
                  <div className="card" style={{ padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                      <h3 style={{ fontWeight: "700" }}>Sin personaje vinculado</h3>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => void handleRefresh()}
                        disabled={isRefreshing}
                        style={{ display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        <RefreshCw size={12} />
                        Actualizar
                      </button>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                      Elige un personaje de la campaña o propone el tuyo propio.
                    </p>

                    {/* Available campaign characters */}
                    {availableCharacters.length > 0 && (
                      <div style={{ marginBottom: "16px" }}>
                        <p style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "8px" }}>
                          Personajes disponibles
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {availableCharacters.map((pc) => {
                            const alreadyRequested = pendingLinkRequests.some(
                              (p) => p.targetCharacterEntityId === pc.entityId
                            );
                            return (
                              <div
                                key={pc.entityId}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "8px 12px",
                                  backgroundColor: "var(--surface-2)",
                                  borderRadius: "var(--radius-sm)",
                                  border: "1px solid var(--border-color)",
                                }}
                              >
                                <span style={{ fontSize: "0.9rem" }}>{pc.title}</span>
                                {alreadyRequested ? (
                                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                                    Solicitud enviada
                                  </span>
                                ) : (
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => void handleLinkRequest(pc.entityId)}
                                  >
                                    Solicitar
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Create own character */}
                    {pendingCreateRequests.length > 0 ? (
                      <div style={{ padding: "10px", backgroundColor: "var(--surface-2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                          Propuesta de personaje propio enviada — en espera de aprobación del DM.
                        </p>
                      </div>
                    ) : (
                      <>
                        {!showCreateCharForm ? (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setShowCreateCharForm(true)}
                          >
                            <Plus size={12} style={{ marginRight: "4px" }} />
                            Crear personaje propio
                          </button>
                        ) : (
                          <form onSubmit={(e) => void handleCreateChar(e)} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <p style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-muted)" }}>
                              Nueva propuesta de personaje
                            </p>
                            <input
                              className="input"
                              type="text"
                              placeholder="Nombre del personaje *"
                              value={createCharForm.name}
                              onChange={(e) => setCreateCharForm((f) => ({ ...f, name: e.target.value }))}
                              required
                            />
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
                              <input
                                className="input"
                                type="text"
                                placeholder="Clase *"
                                value={createCharForm.className}
                                onChange={(e) => setCreateCharForm((f) => ({ ...f, className: e.target.value }))}
                              />
                              <input
                                className="input"
                                type="text"
                                placeholder="Especie *"
                                value={createCharForm.species}
                                onChange={(e) => setCreateCharForm((f) => ({ ...f, species: e.target.value }))}
                              />
                              <input
                                className="input"
                                type="text"
                                placeholder="Trasfondo *"
                                value={createCharForm.background}
                                onChange={(e) => setCreateCharForm((f) => ({ ...f, background: e.target.value }))}
                              />
                              <input
                                className="input"
                                type="number"
                                placeholder="Nivel"
                                min="1"
                                max="20"
                                value={createCharForm.level}
                                onChange={(e) => setCreateCharForm((f) => ({ ...f, level: e.target.value }))}
                              />
                              <input
                                className="input"
                                type="number"
                                placeholder="CA"
                                min="0"
                                value={createCharForm.armorClass}
                                onChange={(e) => setCreateCharForm((f) => ({ ...f, armorClass: e.target.value }))}
                              />
                              <input
                                className="input"
                                type="number"
                                placeholder="PG máximos"
                                min="1"
                                value={createCharForm.hitPointsMax}
                                onChange={(e) => setCreateCharForm((f) => ({ ...f, hitPointsMax: e.target.value }))}
                              />
                            </div>
                            <textarea
                              className="input"
                              placeholder={t("players.dmNotes")}
                              rows={3}
                              value={createCharForm.description}
                              onChange={(e) => setCreateCharForm((f) => ({ ...f, description: e.target.value }))}
                              style={{ resize: "vertical" }}
                            />
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button type="submit" className="btn btn-primary btn-sm">
                                Enviar propuesta
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => { setShowCreateCharForm(false); setCreateCharForm({ name: "", className: "", species: "", background: "", level: "1", armorClass: "10", hitPointsMax: "10", description: "" }); }}
                              >
                                Cancelar
                              </button>
                            </div>
                          </form>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Live status */}
              <div className="grid grid-cols-3" style={{ gap: "16px" }}>
                <div className="card" style={{ padding: "16px", textAlign: "center" }}>
                  <span style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "700" }}>HP</span>
                  <h3 style={{ fontSize: "1.8rem", fontWeight: "800", marginTop: "4px" }}>
                    {status.hitPointsCurrent ?? "—"} / {status.hitPointsMax ?? "—"}
                  </h3>
                </div>
                <div className="card" style={{ padding: "16px", textAlign: "center" }}>
                  <span style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "700" }}>AC</span>
                  <h3 style={{ fontSize: "1.8rem", fontWeight: "800", marginTop: "4px" }}>
                    {status.armorClass ?? "—"}
                  </h3>
                </div>
                <div className="card" style={{ padding: "16px", textAlign: "center" }}>
                  <span style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "700" }}>Inspiración</span>
                  <h3 style={{ fontSize: "1.8rem", fontWeight: "800", marginTop: "4px" }}>
                    {status.inspiration ? "✓" : "—"}
                  </h3>
                </div>
              </div>

              {/* Conditions */}
              {(status.conditions ?? []).length > 0 && (
                <div className="card" style={{ padding: "16px" }}>
                  <h4 style={{ fontWeight: "700", marginBottom: "10px" }}>Condiciones Activas</h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {(status.conditions ?? []).map((c: string, i: number) => (
                      <span key={i} className="badge" style={{ backgroundColor: "hsla(0,80%,50%,0.15)", color: "hsl(0,80%,60%)", border: "1px solid hsl(0,80%,50%)" }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources summary */}
              {resources.length > 0 && (
                <div className="card" style={{ padding: "16px" }}>
                  <h4 style={{ fontWeight: "700", marginBottom: "10px" }}>Recursos</h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {resources.map((r: any) => (
                      <span key={r.resourceId ?? r.label} className="badge badge-default">
                        {r.label}: {r.current}/{r.max}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming objectives */}
              {objectives.filter((o: any) => o.status === "open").length > 0 && (
                <div className="card" style={{ padding: "16px" }}>
                  <h4 style={{ fontWeight: "700", marginBottom: "10px" }}>Objetivos Pendientes</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {objectives
                      .filter((o: any) => o.status === "open")
                      .slice(0, 5)
                      .map((o: any) => (
                        <div key={o.objectiveId ?? o.title} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <CheckSquare size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                          <span style={{ fontSize: "0.9rem" }}>{o.title}</span>
                          {o.kind === "question_for_dm" && (
                            <span className="badge" style={{ fontSize: "0.65rem", backgroundColor: "hsla(255,80%,60%,0.15)", color: "hsl(255,80%,70%)" }}>Para el DM</span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div className="card" style={{ padding: "16px" }}>
                <h4 style={{ fontWeight: "700", marginBottom: "12px" }}>Acciones Rápidas</h4>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab("character")}>
                    Actualizar HP / AC
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setActiveTab("diary"); setShowNoteForm(true); }}>
                    Nueva Nota
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setActiveTab("objectives"); setObjectiveForm(f => ({ ...f, kind: "question_for_dm" })); setShowObjectiveForm(true); }}>
                    Pregunta al DM
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Character / State ─────────────────────────────────────── */}
          {activeTab === "character" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {(myCharacter || linkedCharacter) ? (
                <>
                  <div className="card" style={{ padding: "24px", background: "linear-gradient(135deg, hsla(255, 85%, 65%, 0.12), transparent)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-start", flexWrap: "wrap" }}>
                      <div>
                        <h2 style={{ fontSize: "1.55rem", fontWeight: "850", marginBottom: "4px" }}>
                          {myCharacter?.title ?? linkedCharacter?.title}
                        </h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                          Nivel {characterMetadata.level ?? 1} {characterMetadata.species ?? ""} {characterMetadata.className ?? ""}
                          {characterMetadata.subclass ? ` · ${characterMetadata.subclass}` : ""}
                        </p>
                      </div>
                      {characterMetadata.isPremade !== undefined && (
                        <span className="badge badge-default">
                          {characterMetadata.isPremade ? "Premade de campaña" : "Personaje propio"}
                        </span>
                      )}
                    </div>
                    {(summaryText || characterContent || characterMetadata.note) && (
                      <div style={{ marginTop: "16px", color: "var(--text-main)", fontSize: "0.92rem", lineHeight: 1.65, whiteSpace: "pre-line" }}>
                        {characterContent || summaryText || characterMetadata.note}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3" style={{ gap: "16px" }}>
                    <CharacterFact label="Clase" value={characterMetadata.className} />
                    <CharacterFact label="Subclase" value={characterMetadata.subclass} />
                    <CharacterFact label="Especie" value={characterMetadata.species} />
                    <CharacterFact label="Trasfondo" value={characterMetadata.background} />
                    <CharacterFact label="Nivel" value={characterMetadata.level ?? 1} />
                    <CharacterFact label="PX" value={characterMetadata.xp ?? 0} />
                  </div>

                  <CharacterInfoBlock title="Combate y exploración">
                    <div className="grid grid-cols-3" style={{ gap: "12px" }}>
                      <CharacterFact label="PG" value={`${status.hitPointsCurrent ?? "—"} / ${status.hitPointsMax ?? characterMetadata.hitPointsMax ?? "—"}`} />
                      <CharacterFact label="PG temporales" value={characterMetadata.hitPointsTemp ?? 0} />
                      <CharacterFact label="CA" value={status.armorClass ?? characterMetadata.armorClass} />
                      <CharacterFact label="Dados de golpe" value={characterMetadata.hitDice} />
                      <CharacterFact label="Velocidad" value={characterMetadata.speed !== undefined ? `${characterMetadata.speed} pies` : undefined} />
                      <CharacterFact label="Iniciativa" value={signedNumber(characterMetadata.initiative)} />
                      <CharacterFact label="CD conjuros" value={characterMetadata.spellSaveDC} />
                      <CharacterFact label="Ataque conjuros" value={characterMetadata.spellAttackBonus !== undefined ? signedNumber(characterMetadata.spellAttackBonus) : undefined} />
                    </div>
                  </CharacterInfoBlock>

                  <CharacterInfoBlock title="Características">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: "10px" }}>
                      {ABILITIES.map((ability) => {
                        const score = asNumber(characterMetadata[ability.key]);
                        return (
                          <div key={ability.key} style={{ padding: "14px", borderRadius: "var(--radius-sm)", background: "var(--surface-2)", border: "1px solid var(--border-color)", textAlign: "center" }}>
                            <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--text-muted)" }}>{ability.short}</div>
                            <div style={{ fontSize: "1.45rem", fontWeight: 850, marginTop: "4px" }}>{score ?? "—"}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{abilityModifier(score)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </CharacterInfoBlock>

                  <CharacterInfoBlock title="Sentidos pasivos">
                    <div className="grid grid-cols-3" style={{ gap: "12px" }}>
                      <CharacterFact label="Percepción pasiva" value={characterMetadata.passivePerception} />
                      <CharacterFact label="Perspicacia pasiva" value={characterMetadata.passiveInsight} />
                      <CharacterFact label="Investigación pasiva" value={characterMetadata.passiveInvestigation} />
                    </div>
                  </CharacterInfoBlock>

                  <CharacterInfoBlock title="Competencias, idiomas y rasgos">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "18px" }}>
                      <div>
                        <div className="form-label">Tiradas de salvación</div>
                        <PillList items={savingThrows} />
                      </div>
                      <div>
                        <div className="form-label">Habilidades</div>
                        <PillList items={skills} />
                      </div>
                      <div>
                        <div className="form-label">Idiomas</div>
                        <PillList items={languages} />
                      </div>
                      <div>
                        <div className="form-label">Dotes / rasgos</div>
                        <PillList items={[...feats, ...keyTraits]} />
                      </div>
                    </div>
                  </CharacterInfoBlock>

                  {(personalGoals.length > 0 || importantItems.length > 0) && (
                    <CharacterInfoBlock title="Historia personal y vínculos">
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "18px" }}>
                        <div>
                          <div className="form-label">Objetivos personales</div>
                          <PillList items={personalGoals} />
                        </div>
                        <div>
                          <div className="form-label">Objetos importantes</div>
                          <PillList items={importantItems} />
                        </div>
                      </div>
                    </CharacterInfoBlock>
                  )}

                  <div className="card" style={{ padding: "24px" }}>
                    <h3 style={{ fontWeight: "700", marginBottom: "6px" }}>Estado vivo del personaje</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "18px" }}>
                      Esta parte puede cambiar durante la sesión. La ficha base queda arriba como referencia.
                    </p>
                    <form onSubmit={handleCharSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                        <div className="form-group" style={{ marginBottom: 0, flex: "1 1 100px" }}>
                          <label className="form-label">HP Actual</label>
                          <input
                            type="number"
                            className="form-input"
                            value={charForm.hitPointsCurrent}
                            onChange={(e) => setCharForm({ ...charForm, hitPointsCurrent: e.target.value })}
                            placeholder="10"
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0, flex: "1 1 100px" }}>
                          <label className="form-label">HP Máximo</label>
                          <input
                            type="number"
                            className="form-input"
                            value={charForm.hitPointsMax}
                            onChange={(e) => setCharForm({ ...charForm, hitPointsMax: e.target.value })}
                            placeholder="10"
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0, flex: "1 1 100px" }}>
                          <label className="form-label">Armadura (AC)</label>
                          <input
                            type="number"
                            className="form-input"
                            value={charForm.armorClass}
                            onChange={(e) => setCharForm({ ...charForm, armorClass: e.target.value })}
                            placeholder="10"
                          />
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <input
                          type="checkbox"
                          id="inspiration"
                          checked={charForm.inspiration}
                          onChange={(e) => setCharForm({ ...charForm, inspiration: e.target.checked })}
                        />
                        <label htmlFor="inspiration" className="form-label" style={{ margin: 0, cursor: "pointer" }}>
                          Inspiración
                        </label>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Condiciones</label>
                        <div className="player-condition-grid" style={{ marginBottom: "10px" }}>
                          {CONDITION_OPTIONS.map((condition) => {
                            const active = parseConditionText(charForm.conditions).some((item) => normalizeListKey(item) === normalizeListKey(condition));
                            return (
                              <button
                                key={condition}
                                type="button"
                                className={`player-condition-chip ${active ? "active" : ""}`}
                                onClick={() => void handleConditionToggle(condition)}
                                disabled={!characterEntityId}
                              >
                                {condition}
                              </button>
                            );
                          })}
                        </div>
                        <input
                          type="text"
                          className="form-input"
                          value={charForm.conditions}
                          onChange={(e) => setCharForm({ ...charForm, conditions: e.target.value })}
                          placeholder="Otra condición o texto libre"
                        />
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button type="submit" className="btn btn-primary btn-sm" disabled={!myCharacter && !playerPortalState?.link}>
                          Guardar Estado
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              ) : (
                <div className="card" style={{ padding: "20px" }}>
                  <h3 style={{ fontWeight: "800", marginBottom: "8px" }}>Todavía no tienes personaje vinculado</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "12px" }}>
                    Cuando el DM apruebe tu solicitud o tu propuesta, aquí aparecerá la ficha completa del personaje.
                  </p>
                  <button className="btn btn-primary btn-sm" onClick={() => setActiveTab("summary")}>
                    Elegir o proponer personaje
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Resources ────────────────────────────────────────────── */}
          {activeTab === "resources" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontWeight: "800", margin: 0 }}>Recursos</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setShowResourceForm(true)}>
                  <Plus size={14} /> Nuevo Recurso
                </button>
              </div>

              {resources.length === 0 && !showResourceForm && (
                <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No hay recursos registrados.</p>
              )}

              {resources.map((r: any) => {
                const rid = r.resourceId ?? r.label;
                const edit = resourceEdits[rid];
                return (
                  <div key={rid} className="card" style={{ padding: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <h4 style={{ fontWeight: "700" }}>{r.label}</h4>
                      {r.recovery && (
                        <span className="badge badge-default" style={{ fontSize: "0.7rem" }}>
                          Recuperación: {r.recovery}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Actual</label>
                        <input
                          type="number"
                          className="form-input"
                          style={{ width: "80px" }}
                          value={edit?.current ?? String(r.current ?? "")}
                          onChange={(e) => setResourceEdits({ ...resourceEdits, [rid]: { current: e.target.value, max: edit?.max ?? String(r.max ?? "") } })}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Máximo</label>
                        <input
                          type="number"
                          className="form-input"
                          style={{ width: "80px" }}
                          value={edit?.max ?? String(r.max ?? "")}
                          onChange={(e) => setResourceEdits({ ...resourceEdits, [rid]: { current: edit?.current ?? String(r.current ?? ""), max: e.target.value } })}
                        />
                      </div>
                      {edit && (
                        <button className="btn btn-primary btn-sm" onClick={() => void handleResourceSave(rid)}>
                          Guardar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {showResourceForm && (
                <div className="card" style={{ padding: "20px", border: "1px solid var(--primary)" }}>
                  <h4 style={{ fontWeight: "700", marginBottom: "14px" }}>Nuevo Recurso</h4>
                  <form onSubmit={handleResourceCreate} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Nombre</label>
                      <input type="text" className="form-input" placeholder="Espacio de conjuro 1er nivel" value={resourceForm.label} onChange={(e) => setResourceForm({ ...resourceForm, label: e.target.value })} required />
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Actual</label>
                        <input type="number" className="form-input" style={{ width: "80px" }} value={resourceForm.current} onChange={(e) => setResourceForm({ ...resourceForm, current: e.target.value })} />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Máximo</label>
                        <input type="number" className="form-input" style={{ width: "80px" }} value={resourceForm.max} onChange={(e) => setResourceForm({ ...resourceForm, max: e.target.value })} />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0, flexGrow: 1 }}>
                        <label className="form-label">Recuperación</label>
                        <select
                          className="form-input"
                          value={resourceForm.recovery}
                          onChange={(e) => setResourceForm({ ...resourceForm, recovery: e.target.value as "manual" | "short_rest" | "long_rest" })}
                        >
                          <option value="manual">Manual</option>
                          <option value="short_rest">Descanso corto</option>
                          <option value="long_rest">Descanso largo</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowResourceForm(false)}>Cancelar</button>
                      <button type="submit" className="btn btn-primary btn-sm">Guardar Recurso</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Diary ────────────────────────────────────────────────── */}
          {activeTab === "diary" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontWeight: "800", margin: 0 }}>Mis Notas</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setShowNoteForm(true)}>
                  <Plus size={14} /> Nueva Nota
                </button>
              </div>

              {showNoteForm && (
                <div className="card" style={{ padding: "20px", border: "1px solid var(--secondary)" }}>
                  <h4 style={{ fontWeight: "700", marginBottom: "14px" }}>Escribir Nota</h4>
                  <form onSubmit={handleNoteCreate} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Título</label>
                      <input type="text" className="form-input" placeholder="Sospechas sobre el vilnetworko..." value={noteForm.title} onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Contenido</label>
                      <textarea className="form-textarea" rows={4} placeholder={t("players.observationsPlaceholder")} value={noteForm.content} onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Visibilidad</label>
                      <select
                        className="form-input"
                        value={noteForm.visibility}
                        onChange={(e) => setNoteForm({ ...noteForm, visibility: e.target.value as "private" | "dm_visible" })}
                      >
                        <option value="private">Solo yo</option>
                        <option value="dm_visible">Visible para el DM</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowNoteForm(false)}>Cancelar</button>
                      <button type="submit" className="btn btn-primary btn-sm">Guardar Nota</button>
                    </div>
                  </form>
                </div>
              )}

              {notes.filter((n: any) => !n.archived).length === 0 && (
                <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No has escrito ninguna nota aún.</p>
              )}

              {notes
                .filter((n: any) => !n.archived)
                .map((n: any) => {
                  const nid = n.noteId ?? n.title;
                  const isEditing = noteEditId === nid;
                  return (
                    <div key={nid} className="card" style={{ padding: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4 style={{ fontWeight: "700" }}>{n.title}</h4>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          {n.visibility === "dm_visible" && (
                            <span className="badge badge-default" style={{ fontSize: "0.7rem" }}>Visible DM</span>
                          )}
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                            onClick={() => {
                              setNoteEditId(isEditing ? null : nid);
                              if (!isEditing) {
                                setNoteEditForm({ title: n.title, content: n.content ?? "", visibility: n.visibility ?? "private" });
                              }
                            }}
                          >
                            {isEditing ? t("common.cancel") : t("common.edit")}
                          </button>
                          <button
                            className="btn btn-danger btn-icon btn-sm"
                            style={{ padding: "4px" }}
                            onClick={() => void handleNoteArchive(n.noteId)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      {isEditing ? (
                        <form onSubmit={(e) => void handleNoteEditSubmit(e, nid)} style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Título</label>
                            <input type="text" className="form-input" value={noteEditForm.title} onChange={(e) => setNoteEditForm({ ...noteEditForm, title: e.target.value })} required />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Contenido</label>
                            <textarea className="form-textarea" rows={3} value={noteEditForm.content} onChange={(e) => setNoteEditForm({ ...noteEditForm, content: e.target.value })} />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Visibilidad</label>
                            <select className="form-input" value={noteEditForm.visibility} onChange={(e) => setNoteEditForm({ ...noteEditForm, visibility: e.target.value as "private" | "dm_visible" })}>
                              <option value="private">Solo yo</option>
                              <option value="dm_visible">Visible para el DM</option>
                            </select>
                          </div>
                          <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button type="submit" className="btn btn-primary btn-sm">Guardar Cambios</button>
                          </div>
                        </form>
                      ) : (
                        n.content && (
                          <p style={{ fontSize: "0.9rem", marginTop: "8px", whiteSpace: "pre-line", color: "var(--text-main)" }}>
                            {n.content}
                          </p>
                        )
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          {/* ── TAB: Objectives ───────────────────────────────────────────── */}
          {activeTab === "objectives" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontWeight: "800", margin: 0 }}>Objetivos</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setShowObjectiveForm(true)}>
                  <Plus size={14} /> Nuevo Objetivo
                </button>
              </div>

              {showObjectiveForm && (
                <div className="card" style={{ padding: "20px", border: "1px solid var(--primary)" }}>
                  <h4 style={{ fontWeight: "700", marginBottom: "14px" }}>Nuevo Objetivo</h4>
                  <form onSubmit={handleObjectiveCreate} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Título</label>
                      <input type="text" className="form-input" placeholder={t("players.characterGoalPlaceholder")} value={objectiveForm.title} onChange={(e) => setObjectiveForm({ ...objectiveForm, title: e.target.value })} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Descripción (opcional)</label>
                      <textarea className="form-textarea" rows={2} value={objectiveForm.description} onChange={(e) => setObjectiveForm({ ...objectiveForm, description: e.target.value })} />
                    </div>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      <div className="form-group" style={{ marginBottom: 0, flex: "1 1 140px" }}>
                        <label className="form-label">Tipo</label>
                        <select
                          className="form-input"
                          value={objectiveForm.kind}
                          onChange={(e) => setObjectiveForm({ ...objectiveForm, kind: e.target.value as "personal" | "session" | "question_for_dm" })}
                        >
                          <option value="personal">Personal</option>
                          <option value="session">Sesión</option>
                          <option value="question_for_dm">Pregunta al DM</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0, flex: "1 1 140px" }}>
                        <label className="form-label">Estado</label>
                        <select
                          className="form-input"
                          value={objectiveForm.status}
                          onChange={(e) => setObjectiveForm({ ...objectiveForm, status: e.target.value as "open" | "done" | "archived" })}
                        >
                          <option value="open">Abierto</option>
                          <option value="done">Completado</option>
                          <option value="archived">Archivado</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0, flex: "1 1 140px" }}>
                        <label className="form-label">Visibilidad</label>
                        <select
                          className="form-input"
                          value={objectiveForm.visibility}
                          onChange={(e) => setObjectiveForm({ ...objectiveForm, visibility: e.target.value as "private" | "dm_visible" })}
                        >
                          <option value="private">Solo yo</option>
                          <option value="dm_visible">Visible para el DM</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowObjectiveForm(false)}>Cancelar</button>
                      <button type="submit" className="btn btn-primary btn-sm">Guardar Objetivo</button>
                    </div>
                  </form>
                </div>
              )}

              {objectives.filter((o: any) => o.status === "open").length === 0 && (
                <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No hay objetivos abiertos.</p>
              )}

              {objectives
                .filter((o: any) => o.status === "open")
                .map((o: any) => (
                  <div key={o.objectiveId ?? o.title} className="card" style={{ padding: "16px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <button
                      className="btn btn-secondary btn-icon btn-sm"
                      style={{ padding: "4px", marginTop: "2px", flexShrink: 0 }}
                      title="Marcar como completado"
                      onClick={() => void handleObjectiveComplete(o.objectiveId)}
                    >
                      <CheckSquare size={14} />
                    </button>
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                        <h4 style={{ fontWeight: "700", margin: 0 }}>{o.title}</h4>
                        <span className="badge badge-default" style={{ fontSize: "0.7rem" }}>
                          {o.kind === "personal" ? "Personal" : o.kind === "session" ? t("timeline.labels.session") : "Pregunta al DM"}
                        </span>
                        {o.visibility === "dm_visible" && (
                          <span className="badge badge-default" style={{ fontSize: "0.7rem" }}>Visible DM</span>
                        )}
                      </div>
                      {o.description && (
                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>{o.description}</p>
                      )}
                    </div>
                  </div>
                ))}

              {/* Completed objectives */}
              {objectives.filter((o: any) => o.status === "done").length > 0 && (
                <div>
                  <h4 style={{ fontWeight: "700", color: "var(--text-muted)", marginBottom: "10px", fontSize: "0.85rem", textTransform: "uppercase" }}>Completados</h4>
                  {objectives
                    .filter((o: any) => o.status === "done")
                    .map((o: any) => (
                      <div key={o.objectiveId ?? o.title} className="card" style={{ padding: "12px 16px", opacity: 0.5, marginBottom: "8px" }}>
                        <span style={{ textDecoration: "line-through", fontSize: "0.9rem" }}>{o.title}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Knowledge / Character Memory ───────────────────────────── */}
          {activeTab === "knowledge" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="card" style={{ padding: "22px", background: "linear-gradient(135deg, hsla(175, 85%, 45%, 0.12), transparent)" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <Eye size={22} style={{ color: "var(--secondary)", flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <h3 style={{ fontWeight: 850, marginBottom: "6px" }}>Lo que sabe mi personaje</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                      Esta vista solo reúne entidades, pistas, relaciones y hechos visibles para el grupo, para este jugador o para el personaje vinculado.
                    </p>
                  </div>
                </div>
              </div>

              <div className="player-knowledge-stats">
                <CharacterFact label="Entradas visibles" value={memory.counts?.visibleEntities ?? 0} />
                <CharacterFact label="Hechos conocidos" value={memory.counts?.facts ?? 0} />
                <CharacterFact label="Relaciones visibles" value={memory.counts?.relations ?? 0} />
              </div>

              <PortalSection title="Frentes abiertos" subtitle="Misiones, pistas y rumores que conviene recordar.">
                {[...knownQuests, ...knownClues].length === 0 ? (
                  <p className="player-muted-line">No hay frentes visibles todavía.</p>
                ) : (
                  <div className="player-memory-grid">
                    {[...knownQuests, ...knownClues].slice(0, 12).map((entity) => (
                      <MemoryEntityCard key={entity.entityId} entity={entity} />
                    ))}
                  </div>
                )}
              </PortalSection>

              <div className="player-session-layout">
                <PortalSection title="PNJ y criaturas" subtitle="Caras conocidas de la campaña.">
                  {knownNpcs.length === 0 ? (
                    <p className="player-muted-line">Aún no hay PNJ visibles.</p>
                  ) : (
                    <div className="player-card-list">
                      {knownNpcs.slice(0, 12).map((entity) => <MemoryEntityCard key={entity.entityId} entity={entity} compact />)}
                    </div>
                  )}
                </PortalSection>

                <PortalSection title="Lugares" subtitle="Sitios visitados, mencionados o revelados.">
                  {knownLocations.length === 0 ? (
                    <p className="player-muted-line">Aún no hay lugares visibles.</p>
                  ) : (
                    <div className="player-card-list">
                      {knownLocations.slice(0, 12).map((entity) => <MemoryEntityCard key={entity.entityId} entity={entity} compact />)}
                    </div>
                  )}
                </PortalSection>
              </div>

              {(knownItems.length > 0 || (memoryEntities.factions ?? []).length > 0) && (
                <div className="player-session-layout">
                  <PortalSection title="Objetos y documentos" subtitle="Cosas que importan en la aventura.">
                    {knownItems.length === 0 ? (
                      <p className="player-muted-line">Sin objetos visibles.</p>
                    ) : (
                      <div className="player-card-list">
                        {knownItems.slice(0, 10).map((entity) => <MemoryEntityCard key={entity.entityId} entity={entity} compact />)}
                      </div>
                    )}
                  </PortalSection>

                  <PortalSection title="Facciones" subtitle="Grupos, bandos e intereses conocidos.">
                    {(memoryEntities.factions ?? []).length === 0 ? (
                      <p className="player-muted-line">Sin facciones visibles.</p>
                    ) : (
                      <div className="player-card-list">
                        {(memoryEntities.factions ?? []).slice(0, 10).map((entity) => <MemoryEntityCard key={entity.entityId} entity={entity} compact />)}
                      </div>
                    )}
                  </PortalSection>
                </div>
              )}

              <PortalSection title="Hechos conocidos" subtitle="Canon, rumores o teorías que ya son visibles para jugadores.">
                {recentFacts.length === 0 ? (
                  <p className="player-muted-line">No hay hechos visibles todavía.</p>
                ) : (
                  <div className="player-card-list">
                    {recentFacts.slice(0, 12).map((fact) => (
                      <div key={fact.factId} className="player-fact-row">
                        <Sparkles size={15} />
                        <div>
                          <strong>{fact.statement}</strong>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px" }}>
                            {fact.kind && <span className="badge badge-default">{statusLabel(fact.kind)}</span>}
                            {fact.confidence && <span className="badge badge-default">{statusLabel(fact.confidence)}</span>}
                            {(fact.relatedEntities ?? []).map((entity) => <span key={entity.entityId} className="badge badge-default">{entity.title}</span>)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </PortalSection>

              <PortalSection title="Relaciones visibles" subtitle="Conexiones ya reveladas entre personas, lugares, objetos y pistas.">
                {(memory.relations ?? []).length === 0 ? (
                  <p className="player-muted-line">No hay relaciones visibles todavía.</p>
                ) : (
                  <div className="player-card-list">
                    {(memory.relations ?? []).slice(0, 12).map((relation) => (
                      <div key={relation.relationId} className="player-relation-row">
                        <Users size={15} />
                        <div>
                          <strong>{relation.source?.title} → {relation.target?.title}</strong>
                          <p>{relation.label}{relation.description ? ` · ${relation.description}` : ""}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </PortalSection>
            </div>
          )}

          {/* ── TAB: History ───────────────────────────────────────────────── */}
          {activeTab === "history" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {historyEntries.length === 0 ? (
                <EmptyPortalState title="Historia de la aventura">
                  Aquí aparecerán los resúmenes para jugadores y eventos revelados cuando el DM los vaya compartiendo.
                </EmptyPortalState>
              ) : (
                historyEntries.map((session) => (
                  <div key={session.sessionId} className="card player-history-card">
                    <div className="player-history-header">
                      <div>
                        <span>Sesión {session.number ?? "—"}</span>
                        <h3>{session.title}</h3>
                      </div>
                      {session.status && <span className="badge badge-default">{statusLabel(session.status)}</span>}
                    </div>
                    {session.playerSummary && <p className="player-history-summary">{session.playerSummary}</p>}
                    {(session.events ?? []).length > 0 && (
                      <div className="player-history-events">
                        {(session.events ?? []).map((event) => (
                          <div key={event.eventId} className="player-history-event">
                            <Compass size={14} />
                            <div>
                              <strong>{event.title}</strong>
                              {event.description && <p>{event.description}</p>}
                              {(event.relatedEntities ?? []).length > 0 && (
                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                                  {(event.relatedEntities ?? []).map((entity) => <span key={entity.entityId} className="badge badge-default">{entity.title}</span>)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {quickAction && (
            <div className="modal-overlay" onClick={() => setQuickAction(null)}>
              <form className="modal-content player-quick-modal" onSubmit={(e) => void handleQuickActionSubmit(e)} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>
                    {quickAction === "question"
                      ? copy.quickModalTitleQuestion
                      : quickAction === "objective"
                        ? copy.quickModalTitleObjective
                        : copy.quickModalTitleNote}
                  </h3>
                  <button type="button" className="btn btn-icon btn-secondary" onClick={() => setQuickAction(null)} aria-label={copy.quickCancel}>×</button>
                </div>
                <div className="modal-body" style={{ display: "grid", gap: "14px" }}>
                  <label className="form-group" style={{ marginBottom: 0 }}>
                    <span className="form-label">{copy.quickTitleLabel}</span>
                    <input
                      className="form-input"
                      value={quickActionForm.title}
                      onChange={(e) => setQuickActionForm((form) => ({ ...form, title: e.target.value }))}
                      placeholder={
                        quickAction === "question"
                          ? copy.quickQuestionPlaceholder
                          : quickAction === "objective"
                            ? copy.quickObjectivePlaceholder
                            : copy.quickNotePlaceholder
                      }
                      autoFocus
                      required
                    />
                  </label>
                  <label className="form-group" style={{ marginBottom: 0 }}>
                    <span className="form-label">{copy.quickDetailsLabel}</span>
                    <textarea
                      className="form-input"
                      rows={4}
                      value={quickActionForm.details}
                      onChange={(e) => setQuickActionForm((form) => ({ ...form, details: e.target.value }))}
                    />
                  </label>
                  {quickAction !== "question" && (
                    <label className="form-group" style={{ marginBottom: 0 }}>
                      <span className="form-label">Visibilidad</span>
                      <select
                        className="form-input"
                        value={quickActionForm.visibility}
                        onChange={(e) => setQuickActionForm((form) => ({ ...form, visibility: e.target.value as "private" | "dm_visible" }))}
                      >
                        <option value="private">{copy.quickPrivate}</option>
                        <option value="dm_visible">{copy.quickVisibleToDm}</option>
                      </select>
                    </label>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setQuickAction(null)}>{copy.quickCancel}</button>
                  <button type="submit" className="btn btn-primary">
                    {quickAction === "question"
                      ? copy.quickSubmitQuestion
                      : quickAction === "objective"
                        ? copy.quickSubmitObjective
                        : copy.quickSubmitNote}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
        <AccountModal open={accountModalOpen} onClose={() => setAccountModalOpen(false)} />

        <nav className="player-portal-bottom-nav" aria-label="Navegación del portal del jugador">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? "active" : ""}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}
