import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import { logoutPlayer } from "@frontend/shared/auth/authClient.js";


type PortalTab = "summary" | "character" | "resources" | "diary" | "objectives" | "history";

type CharacterMetadata = Record<string, any>;

type EffectiveStatus = {
  hitPointsCurrent?: number;
  hitPointsMax?: number;
  armorClass?: number;
  inspiration?: boolean;
  conditions: string[];
};

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

export function PlayerPortalView({ campaignId }: { campaignId: string }) {
  const { t } = useTranslation();
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

  const [activeTab, setActiveTab] = useState<PortalTab>("summary");

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

  // Diary inline edit state
  const [noteEditId, setNoteEditId] = useState<string | null>(null);
  const [noteEditForm, setNoteEditForm] = useState({
    title: "",
    content: "",
    visibility: "private" as "private" | "dm_visible",
  });

  const playerId = playerPortalState?.playerId ?? sessionStorage.getItem("dmcc_playerId");

  useEffect(() => {
    useCampaignStore.setState({ activeCampaignId: campaignId });
    void loadPlayerPortalState(campaignId);
  }, [campaignId, loadPlayerPortalState]);

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
  const languages = asList(characterMetadata.languages);
  const feats = asList(characterMetadata.feats);
  const keyTraits = asList(characterMetadata.keyTraits);
  const personalGoals = asList(characterMetadata.personalGoals);
  const importantItems = asList(characterMetadata.importantItems);

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
    await logoutPlayer(campaignId);
    useCampaignStore.setState({ activeCampaignId: null, campaignState: null, playerPortalState: null });
    navigate({ to: "/player/join" });
  };

  // ── Submit: Character/State ──────────────────────────────────────────────
  const handleCharSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const characterEntityId = myCharacter?.entityId ?? playerPortalState?.link?.characterEntityId;
    if (!characterEntityId) return;
    await updatePlayerPortalStatus({
      characterEntityId,
      hitPointsCurrent: parseInt(charForm.hitPointsCurrent, 10) || 0,
      hitPointsMax: parseInt(charForm.hitPointsMax, 10) || 0,
      armorClass: parseInt(charForm.armorClass, 10) || 10,
      inspiration: charForm.inspiration,
      conditions: charForm.conditions
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
    });
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
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "var(--text-muted)" }}>
        Cargando portal del jugador...
      </div>
    );
  }

  const TABS: { id: PortalTab; label: string; icon: React.ReactNode }[] = [
    { id: "summary", label: t("session.summary"), icon: <Shield size={16} /> },
    { id: "character", label: "Personaje", icon: <User size={16} /> },
    { id: "resources", label: "Recursos", icon: <Clock size={16} /> },
    { id: "diary", label: "Diario", icon: <FileText size={16} /> },
    { id: "objectives", label: t("playerPortal.objectives"), icon: <Target size={16} /> },
    { id: "history", label: "Historia", icon: <BookOpen size={16} /> },
  ];

  const tabLabel: Record<PortalTab, string> = {
    summary: t("players.playerSummary"),
    character: t("players.characterStatus"),
    resources: "Recursos & Habilidades",
    diary: "Diario Personal",
    objectives: t("playerPortal.objectives"),
    history: "Historia de la Aventura",
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside className="sidebar" style={{ width: "260px", flexShrink: 0 }}>
        <div className="sidebar-header">
          <div className="sidebar-logo">{campaignState?.campaign?.title ?? playerPortalState.campaign?.title ?? campaignId}</div>
          <div className="sidebar-logo-subtitle">Portal del Jugador</div>
        </div>

        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-color)", display: "flex", gap: "10px", alignItems: "center" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "var(--primary)", color: "var(--text-main)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
            {player?.displayName?.slice(0, 2).toUpperCase() ?? "PL"}
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)" }}>{player?.displayName ?? "Jugador"}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {myCharacter ? myCharacter.title : "Sin personaje"}
            </div>
          </div>
        </div>

        <nav className="sidebar-nav" style={{ flexGrow: 1, padding: "16px 0" }}>
          {TABS.map((tab) => (
            <div
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="btn btn-danger btn-sm" style={{ width: "100%" }} onClick={() => void handleExit()}>
            {t("playerPortal.leavePortal")}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content" style={{ flexGrow: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
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

        <div className="content-body" style={{ padding: "32px", maxWidth: "900px", width: "100%", margin: "0 auto" }}>
          {error && (
            <div className="card" style={{ padding: "12px 14px", marginBottom: "16px", border: "1px solid rgba(239,68,68,0.45)", background: "rgba(239,68,68,0.08)", color: "#fca5a5", fontSize: "0.85rem" }}>
              {error}
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
                        <label className="form-label">Condiciones (separadas por coma)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={charForm.conditions}
                          onChange={(e) => setCharForm({ ...charForm, conditions: e.target.value })}
                          placeholder="envenenado, asustado"
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
                      <input type="text" className="form-input" placeholder="Sospechas sobre el villano..." value={noteForm.title} onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })} required />
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

          {/* ── TAB: History (stub) ───────────────────────────────────────── */}
          {activeTab === "history" && (
            <div className="card" style={{ padding: "24px", textAlign: "center" }}>
              <h3>Historia de la aventura</h3>
              <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
                Tu historial de aventura aparecerá aquí a medida que la campaña avance.
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
