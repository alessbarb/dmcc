export type ProfileAudience = "private" | "dm" | "table" | "global";
type PublicationState = "private" | "unlisted" | "published";
export type SocialField =
  | "displayName"
  | "avatarUrl"
  | "pronouns"
  | "timeZone"
  | "biography"
  | "contact";

export type SocialVisibility = Record<SocialField, ProfileAudience>;

type NotificationPreferences = {
  membership: boolean;
  campaignActivity: boolean;
  sessionReminder: boolean;
  direct: boolean;
};

export type UserPreferences = {
  userId: string;
  locale: string;
  timeFormat: "system" | "12h" | "24h";
  themeId: string;
  colorMode: "system" | "light" | "dark";
  typographySetId: string;
  density: "comfortable" | "compact";
  textScale: number;
  enhancedContrast: boolean;
  reducedMotion: boolean;
  interfaceSounds: boolean;
  notifications: NotificationPreferences;
  campaignNotifications: Record<string, Partial<NotificationPreferences>>;
  version: number;
};

export type SocialProfileBase = {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
  pronouns?: string;
  timeZone?: string;
  biography?: string;
  contact?: string;
  visibility: SocialVisibility;
  publicHandle?: string;
  publicationState: PublicationState;
  version: number;
};

export type DmSocialProfile = SocialProfileBase;
