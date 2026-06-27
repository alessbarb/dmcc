import React from "react";
import {
  BookOpen, Settings, Plus, Archive, Pencil, Share2, Info, Calendar,
  Play, Check, MessageSquare, User, Upload, X, Download, Eye,
  Layers, HelpCircle,
} from "lucide-react";

export function getEventVisualConfig(type: string) {
  let category = "other";
  let label = "Otro";
  let color = "hsl(220, 15%, 65%)";
  let bgColor = "hsla(220, 15%, 65%, 0.15)";
  let IconComponent: React.ComponentType<any> = HelpCircle;

  if (type.startsWith("Campaign")) {
    category = "campaigns"; label = "Campaña";
    color = "hsl(255, 85%, 65%)"; bgColor = "hsla(255, 85%, 65%, 0.15)";
    IconComponent = type === "CampaignCreated" ? BookOpen : Settings;
  } else if (type.startsWith("Entity")) {
    category = "entities"; label = "Entidad Narrativa";
    color = "hsl(175, 85%, 45%)"; bgColor = "hsla(175, 85%, 45%, 0.15)";
    IconComponent = type === "EntityCreated" ? Plus : (type === "EntityArchived" ? Archive : Pencil);
  } else if (type.startsWith("Relation")) {
    category = "relations"; label = "Relación";
    color = "hsl(320, 85%, 60%)"; bgColor = "hsla(320, 85%, 60%, 0.15)";
    IconComponent = type === "RelationArchived" ? Archive : Share2;
  } else if (type.startsWith("Fact")) {
    category = "facts"; label = "Hecho / Clue";
    color = "hsl(38, 95%, 55%)"; bgColor = "hsla(38, 95%, 55%, 0.15)";
    IconComponent = type === "FactArchived" ? Archive : Info;
  } else if (type.startsWith("Session")) {
    category = "sessions"; label = "Sesión";
    color = "hsl(10, 95%, 60%)"; bgColor = "hsla(10, 95%, 60%, 0.15)";
    if (type === "SessionCreated") IconComponent = Calendar;
    else if (type === "SessionStarted") IconComponent = Play;
    else if (type === "SessionClosed") IconComponent = Check;
    else IconComponent = MessageSquare;
  } else if (type.startsWith("Player")) {
    category = "players"; label = "Jugador";
    color = "hsl(195, 95%, 50%)"; bgColor = "hsla(195, 95%, 50%, 0.15)";
    IconComponent = User;
  } else {
    if (type === "AttachmentAdded") {
      label = "Adjunto"; color = "hsl(142, 70%, 50%)"; bgColor = "hsla(142, 70%, 50%, 0.15)";
      IconComponent = Upload;
    } else if (type === "AttachmentRemoved") {
      label = "Adjunto"; color = "hsl(0, 85%, 60%)"; bgColor = "hsla(0, 85%, 60%, 0.15)";
      IconComponent = X;
    } else if (type === "ImportCompleted") {
      label = "Sistema"; color = "hsl(255, 85%, 65%)"; bgColor = "hsla(255, 85%, 65%, 0.15)";
      IconComponent = Download;
    } else if (type === "ExportCompleted") {
      label = "Sistema"; color = "hsl(255, 85%, 65%)"; bgColor = "hsla(255, 85%, 65%, 0.15)";
      IconComponent = Share2;
    } else if (type === "VisibilityChanged") {
      label = "Visibilidad"; color = "hsl(38, 95%, 55%)"; bgColor = "hsla(38, 95%, 55%, 0.15)";
      IconComponent = Eye;
    } else if (type.startsWith("Tag")) {
      label = "Etiqueta"; color = "hsl(175, 85%, 45%)"; bgColor = "hsla(175, 85%, 45%, 0.15)";
      IconComponent = Layers;
    } else if (type === "SettingsUpdated") {
      label = "Ajustes"; color = "hsl(220, 15%, 65%)"; bgColor = "hsla(220, 15%, 65%, 0.15)";
      IconComponent = Settings;
    }
  }

  return { category, label, color, bgColor, IconComponent };
}

export function renderEventDescription(type: string, payload: any, campaignState: any) {
  if (!payload) return <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No hay datos adicionales.</p>;

  const getEntityTitle = (id: string) => {
    if (!campaignState?.entities) return id;
    const ent = campaignState.entities.find((e: any) => e.entityId === id || e.id === id);
    return ent ? ent.title : id;
  };

  switch (type) {
    case "CampaignCreated":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <p style={{ fontSize: "0.95rem", color: "var(--text-main)", fontWeight: "600" }}>
            Campaña inicializada: <span style={{ color: "var(--primary)" }}>{payload.title}</span>
          </p>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Sistema: <code style={{ backgroundColor: "#1e2230", padding: "2px 6px", borderRadius: "4px", fontSize: "0.8rem" }}>{payload.system}</code> | Estado: <span className="badge badge-success">{payload.status}</span>
          </p>
        </div>
      );
    case "PlayerProfileCreated":
      return (
        <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>
          El jugador/a <span style={{ color: "var(--color-success)", fontWeight: "600" }}>{payload.displayName}</span> se ha unido a la mesa.
        </p>
      );
    case "EntityCreated":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <p style={{ fontSize: "0.95rem", color: "var(--text-main)", fontWeight: "600" }}>
            Entidad creada: <span style={{ color: "var(--secondary)" }}>{payload.title}</span>{" "}
            <span className="badge badge-primary" style={{ fontSize: "0.65rem" }}>{payload.entityType}</span>
          </p>
          {payload.summary && (
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>"{payload.summary}"</p>
          )}
        </div>
      );
    case "EntityUpdated":
      return (
        <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>
          Entidad <span style={{ fontWeight: "600", color: "var(--secondary)" }}>{payload.title || getEntityTitle(payload.entityId)}</span> modificada.
        </p>
      );
    case "EntityArchived":
      return (
        <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>
          Entidad archivada: <span style={{ fontWeight: "600" }}>{getEntityTitle(payload.entityId)}</span>.
        </p>
      );
    case "RelationCreated":
      return (
        <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>
          <span style={{ fontWeight: "600" }}>{getEntityTitle(payload.sourceEntityId)}</span>{" "}
          <span style={{ color: "var(--primary)", fontStyle: "italic" }}>{payload.relationType}</span>{" "}
          <span style={{ fontWeight: "600" }}>{getEntityTitle(payload.targetEntityId)}</span>
        </p>
      );
    case "RelationArchived":
      return <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>Relación archivada.</p>;
    case "FactCreated":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>"{payload.statement}"</p>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            <span className="badge badge-default">{payload.kind}</span>{" "}
            <span className="badge badge-warning">{payload.confidence}</span>
          </p>
        </div>
      );
    case "VisibilityChanged":
      return (
        <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>
          Visibilidad de <span style={{ fontWeight: "600" }}>{getEntityTitle(payload.targetId)}</span>{" "}
          → <span className="badge badge-primary">{payload.visibility?.kind || "dm_only"}</span>
        </p>
      );
    case "SessionStarted":
      return <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>Sesión #{payload.number || ""} iniciada.</p>;
    case "SessionClosed":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <p style={{ fontSize: "0.95rem", color: "var(--text-main)", fontWeight: "600" }}>Sesión cerrada.</p>
          {payload.summary && (
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", whiteSpace: "pre-wrap" }}>{payload.summary}</p>
          )}
        </div>
      );
    case "SettingsUpdated":
      return (
        <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>
          Ajustes actualizados (LAN: <span className="badge badge-default">{payload.lanModeEnabled ? "On" : "Off"}</span>).
        </p>
      );
    case "ImportCompleted":
      return (
        <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>
          {payload.count} registros importados ({payload.format}).
        </p>
      );
    default:
      return <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>Evento: {type}.</p>;
  }
}
