import React from "react";
import {
  Shield,
  Play,
  Layers,
  LayoutGrid,
  List,
  Users,
  MessageCircle,
  BookOpen,
  Settings,
} from "lucide-react";

export type CampaignSectionId =
  | "overview"
  | "session"
  | "library"
  | "map"
  | "story"
  | "people"
  | "messages"
  | "rules"
  | "settings";

export interface CampaignSectionDefinition {
  id: CampaignSectionId;
  path: string;
  labelKey: string;
  titleKey: string;
  eyebrowKey: string;
  descriptionKey: string;
  icon: React.ComponentType<{ size?: number }>;
  placement: "primary" | "secondary";
  mobilePlacement: "dock" | "more";
  mobilePriority?: number;
  keyboardShortcut?: string;
}

export const CAMPAIGN_SECTIONS: CampaignSectionDefinition[] = [
  {
    id: "overview",
    path: "overview",
    labelKey: "campaignShell.nav.dashboard",
    titleKey: "campaignShell.meta.dashboardTitle",
    eyebrowKey: "campaignShell.meta.dashboardEyebrow",
    descriptionKey: "campaignShell.meta.dashboardDescription",
    icon: Shield,
    placement: "primary",
    mobilePlacement: "dock",
    mobilePriority: 10,
    keyboardShortcut: "g d",
  },
  {
    id: "session",
    path: "session",
    labelKey: "campaignShell.nav.session",
    titleKey: "campaignShell.meta.sessionTitle",
    eyebrowKey: "campaignShell.meta.sessionEyebrow",
    descriptionKey: "campaignShell.meta.sessionDescription",
    icon: Play,
    placement: "primary",
    mobilePlacement: "dock",
    mobilePriority: 20,
    keyboardShortcut: "g s",
  },
  {
    id: "library",
    path: "library",
    labelKey: "campaignShell.nav.library",
    titleKey: "campaignShell.meta.libraryTitle",
    eyebrowKey: "campaignShell.meta.libraryEyebrow",
    descriptionKey: "campaignShell.meta.libraryDescription",
    icon: Layers,
    placement: "primary",
    mobilePlacement: "dock",
    mobilePriority: 30,
    keyboardShortcut: "g e",
  },
  {
    id: "map",
    path: "map",
    labelKey: "campaignShell.nav.map",
    titleKey: "campaignShell.meta.mapTitle",
    eyebrowKey: "campaignShell.meta.mapEyebrow",
    descriptionKey: "campaignShell.meta.mapDescription",
    icon: LayoutGrid,
    placement: "primary",
    mobilePlacement: "dock",
    mobilePriority: 40,
    keyboardShortcut: "g c",
  },
  {
    id: "story",
    path: "story",
    labelKey: "campaignShell.nav.story",
    titleKey: "campaignShell.meta.storyTitle",
    eyebrowKey: "campaignShell.meta.storyEyebrow",
    descriptionKey: "campaignShell.meta.storyDescription",
    icon: List,
    placement: "primary",
    mobilePlacement: "more",
    mobilePriority: 50,
    keyboardShortcut: "g b",
  },
  {
    id: "people",
    path: "people",
    labelKey: "campaignShell.nav.people",
    titleKey: "campaignShell.meta.peopleTitle",
    eyebrowKey: "campaignShell.meta.peopleEyebrow",
    descriptionKey: "campaignShell.meta.peopleDescription",
    icon: Users,
    placement: "primary",
    mobilePlacement: "more",
    mobilePriority: 60,
  },
  {
    id: "messages",
    path: "messages",
    labelKey: "campaignShell.nav.messages", // Wait, this key is added in campaignMessaging.ts or we can use "campaignShell.nav.players"
    titleKey: "campaignShell.meta.playersTitle",
    eyebrowKey: "campaignShell.meta.playersEyebrow",
    descriptionKey: "campaignShell.meta.playersDescription",
    icon: MessageCircle,
    placement: "secondary",
    mobilePlacement: "more",
    mobilePriority: 70,
  },
  {
    id: "rules",
    path: "rules",
    labelKey: "nav.rules",
    titleKey: "nav.rules",
    eyebrowKey: "campaignShell.meta.searchEyebrow",
    descriptionKey: "rules.searchInRules",
    icon: BookOpen,
    placement: "secondary",
    mobilePlacement: "more",
    mobilePriority: 80,
  },
  {
    id: "settings",
    path: "settings",
    labelKey: "campaignShell.nav.settings",
    titleKey: "campaignShell.meta.settingsTitle",
    eyebrowKey: "campaignShell.meta.settingsEyebrow",
    descriptionKey: "campaignShell.meta.settingsDescription",
    icon: Settings,
    placement: "secondary",
    mobilePlacement: "more",
    mobilePriority: 90,
  },
];
