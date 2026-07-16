import React from "react";
import {
  BookOpen, Settings, Plus, Archive, Pencil, Share2, Info, Calendar,
  Play, Check, MessageSquare, User, Upload, X, Download, Eye,
  Layers, HelpCircle,
} from "lucide-react";
import { createTranslator } from "@shared/i18n/translate.js";
import type { SupportedLocale } from "@shared/i18n/types.js";
import {
  activityThemeColor,
  themeCss,
  type ThemeActivityType,
} from "@shared/theme/themeCssVariables.js";

function visualColors(type: ThemeActivityType) {
  const colors = activityThemeColor(type);
  return { color: colors.foreground, bgColor: colors.background };
}

export function getEventVisualConfig(type: string, locale: SupportedLocale = "es") {
  const { t } = createTranslator(locale);
  let category = "other";
  let label = t("timeline.labels.other");
  let { color, bgColor } = visualColors("other");
  let IconComponent: React.ComponentType<any> = HelpCircle;

  if (type.startsWith("Campaign")) {
    category = "campaigns"; label = t("timeline.labels.campaign");
    ({ color, bgColor } = visualColors("campaign"));
    IconComponent = type === "CampaignCreated" ? BookOpen : Settings;
  } else if (type.startsWith("Entity")) {
    category = "entities"; label = t("timeline.labels.entity");
    ({ color, bgColor } = visualColors("entity"));
    IconComponent = type === "EntityCreated" ? Plus : (type === "EntityArchived" ? Archive : Pencil);
  } else if (type.startsWith("Relation")) {
    category = "relations"; label = t("timeline.labels.relation");
    ({ color, bgColor } = visualColors("relation"));
    IconComponent = type === "RelationArchived" ? Archive : Share2;
  } else if (type.startsWith("Fact")) {
    category = "facts"; label = t("timeline.labels.fact");
    ({ color, bgColor } = visualColors("fact"));
    IconComponent = type === "FactArchived" ? Archive : Info;
  } else if (type.startsWith("Session")) {
    category = "sessions"; label = t("timeline.labels.session");
    ({ color, bgColor } = visualColors("session"));
    if (type === "SessionCreated") IconComponent = Calendar;
    else if (type === "SessionStarted") IconComponent = Play;
    else if (type === "SessionClosed") IconComponent = Check;
    else IconComponent = MessageSquare;
  } else if (type.startsWith("Player")) {
    category = "players"; label = t("timeline.labels.player");
    ({ color, bgColor } = visualColors("player"));
    IconComponent = User;
  } else if (type === "AttachmentAdded") {
    label = t("timeline.labels.attachment");
    ({ color, bgColor } = visualColors("attachment"));
    IconComponent = Upload;
  } else if (type === "AttachmentRemoved") {
    label = t("timeline.labels.attachment");
    color = themeCss.feedback.danger.foreground;
    bgColor = themeCss.feedback.danger.background;
    IconComponent = X;
  } else if (type === "ImportCompleted") {
    label = t("timeline.labels.system");
    ({ color, bgColor } = visualColors("system"));
    IconComponent = Download;
  } else if (type === "ExportCompleted") {
    label = t("timeline.labels.system");
    ({ color, bgColor } = visualColors("system"));
    IconComponent = Share2;
  } else if (type === "VisibilityChanged" || type === "ClueRevealed") {
    label = t("timeline.labels.visibility");
    ({ color, bgColor } = visualColors("visibility"));
    IconComponent = Eye;
  } else if (type.startsWith("Tag")) {
    label = t("timeline.labels.tag");
    ({ color, bgColor } = visualColors("tag"));
    IconComponent = Layers;
  } else if (type === "SettingsUpdated") {
    label = t("timeline.labels.settings");
    ({ color, bgColor } = visualColors("settings"));
    IconComponent = Settings;
  }

  return { category, label, color, bgColor, IconComponent };
}

export function renderEventDescription(
  type: string,
  payload: any,
  campaignState: any,
  locale: SupportedLocale = "es",
  onEntityClick?: (entityId: string) => void,
  allEvents?: any[],
) {
  const { t } = createTranslator(locale);
  if (!payload) {
    return (
      <p style={{ color: themeCss.text.secondary, fontSize: "0.85rem" }}>
        {t("timeline.descriptions.noAdditionalData")}
      </p>
    );
  }

  const getEntityTitle = (id: string) => {
    if (!campaignState?.entities) return id;
    const ent = campaignState.entities.find((e: any) => e.entityId === id || e.id === id);
    return ent ? ent.title : id;
  };

  const EntityLink = ({ id }: { id: string }) => {
    const title = getEntityTitle(id);
    if (!onEntityClick) return <span style={{ fontWeight: "600" }}>{title}</span>;
    return (
      <button
        onClick={() => onEntityClick(id)}
        style={{
          fontWeight: "600",
          color: themeCss.text.link,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          fontSize: "inherit",
          textDecoration: "underline dotted",
        }}
      >
        {title}
      </button>
    );
  };

  switch (type) {
    case "CampaignCreated":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <p style={{ fontSize: "0.95rem", color: themeCss.text.primary, fontWeight: "600" }}>
            {t("timeline.descriptions.campaignInitialized", { title: payload.title })}
          </p>
          <p style={{ fontSize: "0.85rem", color: themeCss.text.secondary }}>
            {t("timeline.descriptions.systemStatus", { system: payload.system, status: payload.status })}
          </p>
        </div>
      );
    case "PlayerProfileCreated":
      return (
        <p style={{ fontSize: "0.9rem", color: themeCss.text.primary }}>
          {t("timeline.descriptions.playerJoined", { name: payload.displayName })}
        </p>
      );
    case "EntityCreated":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <p style={{ fontSize: "0.95rem", color: themeCss.text.primary, fontWeight: "600" }}>
            {t("timeline.descriptions.entityCreated", { title: payload.title })}{" "}
            <span className="badge badge-primary" style={{ fontSize: "0.65rem" }}>{payload.entityType}</span>
          </p>
          {payload.summary && (
            <p style={{ fontSize: "0.85rem", color: themeCss.text.secondary, fontStyle: "italic" }}>
              "{payload.summary}"
            </p>
          )}
        </div>
      );
    case "EntityUpdated":
      return (
        <p style={{ fontSize: "0.9rem", color: themeCss.text.primary }}>
          {t("timeline.descriptions.entityUpdated", { title: "" })}<EntityLink id={payload.entityId || payload.id} />
        </p>
      );
    case "EntityArchived":
      return (
        <p style={{ fontSize: "0.9rem", color: themeCss.text.primary }}>
          {t("timeline.descriptions.entityArchived", { title: "" })}<EntityLink id={payload.entityId || payload.id} />
        </p>
      );
    case "RelationCreated":
      return (
        <p style={{ fontSize: "0.9rem", color: themeCss.text.primary }}>
          <EntityLink id={payload.sourceEntityId} />{" "}
          <span style={{ color: themeCss.text.link, fontStyle: "italic" }}>{payload.relationType}</span>{" "}
          <EntityLink id={payload.targetEntityId} />
        </p>
      );
    case "RelationArchived":
      return <p style={{ fontSize: "0.9rem", color: themeCss.text.primary }}>{t("timeline.descriptions.relationArchived")}</p>;
    case "FactCreated": {
      const isRetconned = allEvents?.some(
        (e: any) =>
          e.type === "FactUpdated" &&
          (e.payload?.factId === payload.factId || e.payload?.id === payload.factId) &&
          e.payload?.kind === "retcon",
      ) ?? false;
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", opacity: isRetconned ? 0.55 : 1 }}>
          <p style={{ fontSize: "0.9rem", color: themeCss.text.primary, textDecoration: isRetconned ? "line-through" : "none" }}>
            "{payload.statement}"
          </p>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span className="badge badge-default">{payload.kind}</span>
            <span className="badge badge-warning">{payload.confidence}</span>
            {isRetconned && (
              <span
                className="badge"
                style={{
                  backgroundColor: themeCss.feedback.danger.background,
                  color: themeCss.feedback.danger.foreground,
                  border: `1px solid ${themeCss.feedback.danger.border}`,
                  fontSize: "0.65rem",
                }}
              >
                {t("timeline.retconned")}
              </span>
            )}
          </div>
        </div>
      );
    }
    case "VisibilityChanged":
      return (
        <p style={{ fontSize: "0.9rem", color: themeCss.text.primary }}>
          {t("timeline.descriptions.visibilityChanged", { title: "" })}<EntityLink id={payload.targetId} />{" "}
          → <span className="badge badge-primary">{payload.visibility?.kind || "dm_only"}</span>
        </p>
      );
    case "ClueRevealed":
      return (
        <p style={{ fontSize: "0.9rem", color: themeCss.text.primary }}>
          {t("timeline.descriptions.visibilityChanged", { title: "" })}<EntityLink id={payload.clueEntityId} />{" "}
          → <span className="badge badge-primary">{payload.visibility?.kind || "dm_only"}</span>
        </p>
      );
    case "SessionStarted":
      return <p style={{ fontSize: "0.9rem", color: themeCss.text.primary }}>{t("timeline.descriptions.sessionStarted", { number: payload.number || "" })}</p>;
    case "SessionClosed":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <p style={{ fontSize: "0.95rem", color: themeCss.text.primary, fontWeight: "600" }}>{t("timeline.descriptions.sessionClosed")}</p>
          {payload.summary && (
            <p style={{ fontSize: "0.85rem", color: themeCss.text.secondary, whiteSpace: "pre-wrap" }}>{payload.summary}</p>
          )}
        </div>
      );
    case "SettingsUpdated":
      return <p style={{ fontSize: "0.9rem", color: themeCss.text.primary }}>{t("timeline.descriptions.settingsUpdated")}</p>;
    case "ImportCompleted":
      return (
        <p style={{ fontSize: "0.9rem", color: themeCss.text.primary }}>
          {t("timeline.descriptions.importCompleted", { count: payload.count, format: payload.format })}
        </p>
      );
    default:
      return <p style={{ fontSize: "0.9rem", color: themeCss.text.primary }}>{t("timeline.descriptions.eventFallback", { type })}</p>;
  }
}
