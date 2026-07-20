export const THEME_CONTRACT_VERSION = 2 as const;

export const THEME_ENTITY_TYPES = [
  "player",
  "npc",
  "location",
  "faction",
  "quest",
  "clue",
  "secret",
  "item",
  "creature",
  "encounter",
  "scene",
  "front",
  "clock",
  "decision",
  "consequence",
  "rumor",
  "reference",
  "handout",
  "note",
] as const;

export type ThemeEntityType = (typeof THEME_ENTITY_TYPES)[number];

export type ThemeDomainColor = {
  foreground: string;
  background: string;
  border: string;
};

export type ThemeAccentScale = {
  foreground: string;
  hover: string;
  active: string;
  background: string;
  backgroundStrong: string;
  border: string;
  onAccent: string;
};

export type ThemeFeedbackScale = {
  foreground: string;
  background: string;
  border: string;
  strong: string;
  onStrong: string;
};

export type ThemeSurfaces = {
  canvas: string;
  base: string;
  subtle: string;
  raised: string;
  overlay: string;
  interactive: string;
  interactiveHover: string;
  selected: string;
  disabled: string;
};

export type ThemeText = {
  primary: string;
  secondary: string;
  subtle: string;
  disabled: string;
  inverse: string;
  onAccent: string;
  onMedia: string;
  link: string;
  linkHover: string;
};

export type ThemeBorders = {
  subtle: string;
  default: string;
  strong: string;
  interactive: string;
  interactiveHover: string;
  selected: string;
  overlay: string;
};

export type ThemeFocus = {
  ring: string;
  outline: string;
};

export type ThemeShadows = {
  small: string;
  medium: string;
  large: string;
  overlay: string;
  accent: string;
  selected: string;
};

export type ThemeShapes = {
  radiusSmall: string;
  radiusMedium: string;
  radiusLarge: string;
  radiusPanel: string;
  radiusInteractive: string;
  radiusPill: string;
};

export type ThemeNarrative = {
  secret: ThemeDomainColor;
  rumor: ThemeDomainColor;
  canon: ThemeDomainColor;
  theory: ThemeDomainColor;
  consequence: ThemeDomainColor;
};

export type ThemeEntities = Record<ThemeEntityType, ThemeDomainColor>;

export type ThemeActivity = {
  campaign: ThemeDomainColor;
  entity: ThemeDomainColor;
  relation: ThemeDomainColor;
  fact: ThemeDomainColor;
  session: ThemeDomainColor;
  player: ThemeDomainColor;
  attachment: ThemeDomainColor;
  system: ThemeDomainColor;
  visibility: ThemeDomainColor;
  tag: ThemeDomainColor;
  settings: ThemeDomainColor;
  other: ThemeDomainColor;
};

export type ThemeGraph = {
  background: string;
  grid: string;
  edge: string;
  edgeMuted: string;
  edgeHighlighted: string;
  edgeCritical: string;
  edgeSelected: string;
  edgeLabelBackground: string;
  edgeLabelText: string;
  nodeShadow: string;
  nodeSelectedRing: string;
};

export type ThemeCanvas = {
  background: string;
  grid: string;
  selection: string;
  selectionBorder: string;
  guide: string;
  toolbarBackground: string;
  toolbarBorder: string;
  minimapBackground: string;
  minimapMask: string;
};

export type ThemeMedia = {
  overlay: string;
  overlayStrong: string;
  overlaySubtle: string;
  placeholderBackground: string;
  placeholderForeground: string;
  border: string;
  focusRing: string;
};

export type ThemeMessaging = {
  receivedBackground: string;
  receivedBorder: string;
  ownBackground: string;
  ownBorder: string;
  systemBackground: string;
  systemBorder: string;
  unreadMarker: string;
  mentionBackground: string;
};

export type ThemeArtwork = {
  appBackgroundImage: string;
  appBackgroundPosition: string;
  appBackgroundPositionCompact: string;
  appBackgroundSize: string;
  appBackgroundSizeCompact: string;
  appBackgroundOpacity: string;
  appBackgroundVeil: string;
};

export type ThemeIdentityPalette = readonly [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

export type ThemeVariant = {
  surfaces: ThemeSurfaces;
  text: ThemeText;
  borders: ThemeBorders;
  accents: {
    primary: ThemeAccentScale;
    secondary: ThemeAccentScale;
  };
  focus: ThemeFocus;
  shadows: ThemeShadows;
  shapes: ThemeShapes;
  feedback: {
    success: ThemeFeedbackScale;
    warning: ThemeFeedbackScale;
    danger: ThemeFeedbackScale;
    info: ThemeFeedbackScale;
  };
  narrative: ThemeNarrative;
  entities: ThemeEntities;
  activity: ThemeActivity;
  graph: ThemeGraph;
  canvas: ThemeCanvas;
  media: ThemeMedia;
  messaging: ThemeMessaging;
  artwork: ThemeArtwork;
  identityPalette: ThemeIdentityPalette;
};

export type ThemePackage = {
  id: string;
  contractVersion: typeof THEME_CONTRACT_VERSION;
  labelKey: string;
  supportsEnhancedContrast: boolean;
  variants: {
    light: ThemeVariant;
    dark: ThemeVariant;
  };
};
