import { BookOpen, FileText, Flag, Home, MessageCircle, Network, Shield, User } from "lucide-react";
import type { TranslationKey } from "@shared/i18n/types.js";
import type { MobileDockItem } from "../../shared/components/MobileDock.js";

export type PlayerDockTab = "home" | "character" | "recap" | "memory" | "constellation" | "objectives" | "notes";

interface BuildPlayerMobileDockItemsOptions {
  t: (key: TranslationKey) => string;
  openTab: (tab: PlayerDockTab) => void;
  openMessages: () => void;
}

export function buildPlayerMobileDockItems({
  t,
  openTab,
  openMessages,
}: BuildPlayerMobileDockItemsOptions): MobileDockItem[] {
  return [
    { id: "home", label: t("playerPortal.tabs.home"), Icon: Home, onSelect: () => openTab("home") },
    { id: "character", label: t("playerPortal.tabs.character"), Icon: User, onSelect: () => openTab("character") },
    { id: "messages", label: t("playerPortal.messaging.heading"), Icon: MessageCircle, onSelect: openMessages },
    { id: "recap", label: t("playerPortal.tabs.recap"), Icon: BookOpen, onSelect: () => openTab("recap") },
    { id: "memory", label: t("playerPortal.tabs.memory"), Icon: Shield, onSelect: () => openTab("memory") },
    { id: "constellation", label: t("playerPortal.tabs.constellation"), Icon: Network, onSelect: () => openTab("constellation") },
    { id: "objectives", label: t("playerPortal.tabs.objectives"), Icon: Flag, onSelect: () => openTab("objectives") },
    { id: "notes", label: t("playerPortal.tabs.notes"), Icon: FileText, onSelect: () => openTab("notes") },
  ];
}
