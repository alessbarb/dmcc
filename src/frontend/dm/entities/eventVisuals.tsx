import React from "react";
import {
  BookOpen, Settings, Plus, Archive, Pencil, Share2, Info, Calendar,
  Play, Check, MessageSquare, User, Upload, X, Download, Eye,
  Layers, HelpCircle,
} from "lucide-react";
import { createTranslator } from "@shared/i18n/translate.js";
import type { SupportedLocale } from "@shared/i18n/types.js";

export function getEventVisualConfig(type: string, locale: SupportedLocale = "es") {
  const { t } = createTranslator(locale);
  let category = "other";
  let label = t("timeline.labels.other");
  let color = "hsl(220, 15%, 65%)";
  let bgColor = "hsla(220, 15%, 65%, 0.15)";
  let IconComponent: React.ComponentType<any> = HelpCircle;

  if (type.startsWith("Campaign")) {
    category = "campaigns"; label = t("timeline.labels.campaign");
    color = "hsl(255, 85%, 65%)"; bgColor = "hsla(255, 85%, 65%, 0.15)";
    IconComponent = type === "CampaignCreated" ? BookOpen : Settings;
  } else if (type.startsWith("Entity")) {
    category = "entities"; label = t("timeline.labels.entity");
    color = "hsl(175, 85%, 45%)"; bgColor = "hsla(175, 85%, 45%, 0.15)";
    IconComponent = type === "EntityCreated" ? Plus : (type === "EntityArchived" ? Archive : Pencil);
  } else if (type.startsWith("Relation")) {
    category = "relations"; label = t("timeline.labels.relation");
    color = "hsl(320, 85%, 60%)"; bgColor = "hsla(320, 85%, 60%, 0.15)";
    IconComponent = type === "RelationArchived" ? Archive : Share2;
  } else if (type.startsWith("Fact")) {
    category = "facts"; label = t("timeline.labels.fact");
    color = "hsl(38, 95%, 55%)"; bgColor = "hsla(38, 95%, 55%, 0.15)";
    IconComponent = type === "FactArchived" ? Archive : Info;
  } else if (type.startsWith("Session")) {
    category = "sessions"; label = t("timeline.labels.session");
    color = "hsl(10, 95%, 60%)"; bgColor = "hsla(10, 95%, 60%, 0.15)";
    if (type === "SessionCreated") IconComponent = Calendar;
    else if (type === "SessionStarted") IconComponent = Play;
    else if (type === "SessionClosed") IconComponent = Check;
    else IconComponent = MessageSquare;
  } else if (type.startsWith("Player")) {
    category = "players"; label = t("timeline.labels.player");
    color = "hsl(195, 95%, 50%)"; bgColor = "hsla(195, 95%, 50%, 0.15)";
    IconComponent = User;
  } else {
    if (type === "AttachmentAdded") {
      label = t("timeline.labels.attachment"); color = "hsl(142, 70%, 50%)"; bgColor = "hsla(142, 70%, 50%, 0.15)";
      IconComponent = Upload;
    } else if (type === "AttachmentRemoved") {
      label = t("timeline.labels.attachment"); color = "hsl(0, 85%, 60%)"; bgColor = "hsla(0, 85%, 60%, 0.15)";
      IconComponent = X;
    } else if (type === "ImportCompleted") {
      label = t("timeline.labels.system"); color = "hsl(255, 85%, 65%)"; bgColor = "hsla(255, 85%, 65%, 0.15)";
      IconComponent = Download;
    } else if (type === "ExportCompleted") {
      label = t("timeline.labels.system"); color = "hsl(255, 85%, 65%)"; bgColor = "hsla(255, 85%, 65%, 0.15)";
      IconComponent = Share2;
    } else if (type === "VisibilityChanged") {
      label = t("timeline.labels.visibility"); color = "hsl(38, 95%, 55%)"; bgColor = "hsla(38, 95%, 55%, 0.15)";
      IconComponent = Eye;
    } else if (type.startsWith("Tag")) {
      label = t("timeline.labels.tag"); color = "hsl(175, 85%, 45%)"; bgColor = "hsla(175, 85%, 45%, 0.15)";
      IconComponent = Layers;
    } else if (type === "SettingsUpdated") {
      label = t("timeline.labels.settings"); color = "hsl(220, 15%, 65%)"; bgColor = "hsla(220, 15%, 65%, 0.15)";
      IconComponent = Settings;
    }
  }

  return { category, label, color, bgColor, IconComponent };
}

export function renderEventDescription(type: string, payload: any, campaignState: any, locale: SupportedLocale = "es") {
  const { t } = createTranslator(locale);
  if (!payload) return <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{t("timeline.descriptions.noAdditionalData")}</p>;

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
            {t("timeline.descriptions.campaignInitialized", { title: payload.title })}
          </p>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {t("timeline.descriptions.systemStatus", { system: payload.system, status: payload.status })}
          </p>
        </div>
      );
    case "PlayerProfileCreated":
      return (
        <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>
          {t("timeline.descriptions.playerJoined", { name: payload.displayName })}
        </p>
      );
    case "EntityCreated":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <p style={{ fontSize: "0.95rem", color: "var(--text-main)", fontWeight: "600" }}>
            {t("timeline.descriptions.entityCreated", { title: payload.title })}{" "}
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
          {t("timeline.descriptions.entityUpdated", { title: payload.title || getEntityTitle(payload.entityId) })}
        </p>
      );
    case "EntityArchived":
      return (
        <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>
          {t("timeline.descriptions.entityArchived", { title: getEntityTitle(payload.entityId) })}
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
      return <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>{t("timeline.descriptions.relationArchived")}</p>;
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
          {t("timeline.descriptions.visibilityChanged", { title: getEntityTitle(payload.targetId) })}{" "}
          → <span className="badge badge-primary">{payload.visibility?.kind || "dm_only"}</span>
        </p>
      );
    case "SessionStarted":
      return <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>{t("timeline.descriptions.sessionStarted", { number: payload.number || "" })}</p>;
    case "SessionClosed":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <p style={{ fontSize: "0.95rem", color: "var(--text-main)", fontWeight: "600" }}>{t("timeline.descriptions.sessionClosed")}</p>
          {payload.summary && (
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", whiteSpace: "pre-wrap" }}>{payload.summary}</p>
          )}
        </div>
      );
    case "SettingsUpdated":
      return (
        <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>
          {t("timeline.descriptions.settingsUpdated", { state: payload.lanModeEnabled ? "On" : "Off" })}
        </p>
      );
    case "ImportCompleted":
      return (
        <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>
          {t("timeline.descriptions.importCompleted", { count: payload.count, format: payload.format })}
        </p>
      );
    default:
      return <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>{t("timeline.descriptions.eventFallback", { type })}</p>;
  }
}
