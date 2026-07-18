import {
  THEME_CONTRACT_VERSION,
  THEME_ENTITY_TYPES,
  type ThemePackageV1,
} from "./themeContract.js";

export type ThemeValidationIssue = {
  path: string;
  message: string;
};

export type ThemeValidationResult =
  | { valid: true; value: ThemePackageV1; issues: [] }
  | { valid: false; issues: ThemeValidationIssue[] };

type Shape = "string" | "boolean" | "identityPalette" | { readonly [key: string]: Shape };

const domainColorShape = {
  foreground: "string",
  background: "string",
  border: "string",
} as const satisfies Shape;

const accentScaleShape = {
  foreground: "string",
  hover: "string",
  active: "string",
  background: "string",
  backgroundStrong: "string",
  border: "string",
  onAccent: "string",
} as const satisfies Shape;

const feedbackScaleShape = {
  foreground: "string",
  background: "string",
  border: "string",
  strong: "string",
  onStrong: "string",
} as const satisfies Shape;

// Object.fromEntries loses the tuple-array's literal key types; every key here
// comes directly from THEME_ENTITY_TYPES, so the cast just restores that.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const entityShape = Object.fromEntries(
  THEME_ENTITY_TYPES.map((type) => [type, domainColorShape]),
) as Record<(typeof THEME_ENTITY_TYPES)[number], typeof domainColorShape>;

export const THEME_VARIANT_SHAPE = {
  surfaces: {
    canvas: "string",
    base: "string",
    subtle: "string",
    raised: "string",
    overlay: "string",
    interactive: "string",
    interactiveHover: "string",
    selected: "string",
    disabled: "string",
  },
  text: {
    primary: "string",
    secondary: "string",
    subtle: "string",
    disabled: "string",
    inverse: "string",
    onAccent: "string",
    onMedia: "string",
    link: "string",
    linkHover: "string",
  },
  borders: {
    subtle: "string",
    default: "string",
    strong: "string",
    interactive: "string",
    interactiveHover: "string",
    selected: "string",
    overlay: "string",
  },
  accents: {
    primary: accentScaleShape,
    secondary: accentScaleShape,
  },
  focus: {
    ring: "string",
    outline: "string",
  },
  shadows: {
    small: "string",
    medium: "string",
    large: "string",
    overlay: "string",
    accent: "string",
    selected: "string",
  },
  shapes: {
    radiusSmall: "string",
    radiusMedium: "string",
    radiusLarge: "string",
    radiusPanel: "string",
    radiusInteractive: "string",
    radiusPill: "string",
  },
  feedback: {
    success: feedbackScaleShape,
    warning: feedbackScaleShape,
    danger: feedbackScaleShape,
    info: feedbackScaleShape,
  },
  narrative: {
    secret: domainColorShape,
    rumor: domainColorShape,
    canon: domainColorShape,
    theory: domainColorShape,
    consequence: domainColorShape,
  },
  entities: entityShape,
  activity: {
    campaign: domainColorShape,
    entity: domainColorShape,
    relation: domainColorShape,
    fact: domainColorShape,
    session: domainColorShape,
    player: domainColorShape,
    attachment: domainColorShape,
    system: domainColorShape,
    visibility: domainColorShape,
    tag: domainColorShape,
    settings: domainColorShape,
    other: domainColorShape,
  },
  graph: {
    background: "string",
    grid: "string",
    edge: "string",
    edgeMuted: "string",
    edgeHighlighted: "string",
    edgeCritical: "string",
    edgeSelected: "string",
    edgeLabelBackground: "string",
    edgeLabelText: "string",
    nodeShadow: "string",
    nodeSelectedRing: "string",
  },
  canvas: {
    background: "string",
    grid: "string",
    selection: "string",
    selectionBorder: "string",
    guide: "string",
    toolbarBackground: "string",
    toolbarBorder: "string",
    minimapBackground: "string",
    minimapMask: "string",
  },
  media: {
    overlay: "string",
    overlayStrong: "string",
    overlaySubtle: "string",
    placeholderBackground: "string",
    placeholderForeground: "string",
    border: "string",
    focusRing: "string",
  },
  messaging: {
    receivedBackground: "string",
    receivedBorder: "string",
    ownBackground: "string",
    ownBorder: "string",
    systemBackground: "string",
    systemBorder: "string",
    unreadMarker: "string",
    mentionBackground: "string",
  },
  identityPalette: "identityPalette",
} as const satisfies Shape;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateShape(
  value: unknown,
  shape: Shape,
  path: string,
  issues: ThemeValidationIssue[],
): void {
  if (shape === "string") {
    if (typeof value !== "string" || value.trim().length === 0) {
      issues.push({ path, message: "Expected a non-empty string" });
    }
    return;
  }

  if (shape === "boolean") {
    if (typeof value !== "boolean") {
      issues.push({ path, message: "Expected a boolean" });
    }
    return;
  }

  if (shape === "identityPalette") {
    if (!Array.isArray(value) || value.length !== 8) {
      issues.push({ path, message: "Expected exactly 8 identity colors" });
      return;
    }
    value.forEach((color, index) => {
      if (typeof color !== "string" || color.trim().length === 0) {
        issues.push({ path: `${path}[${index}]`, message: "Expected a non-empty string" });
      }
    });
    return;
  }

  if (!isRecord(value)) {
    issues.push({ path, message: "Expected an object" });
    return;
  }

  const expectedKeys = Object.keys(shape);
  const actualKeys = Object.keys(value);

  for (const key of expectedKeys) {
    if (!(key in value)) {
      issues.push({ path: `${path}.${key}`, message: "Missing required property" });
      continue;
    }
    validateShape(value[key], shape[key], `${path}.${key}`, issues);
  }

  for (const key of actualKeys) {
    if (!(key in shape)) {
      issues.push({ path: `${path}.${key}`, message: "Unknown property" });
    }
  }
}

export function validateThemePackage(value: unknown): ThemeValidationResult {
  const issues: ThemeValidationIssue[] = [];

  if (!isRecord(value)) {
    return { valid: false, issues: [{ path: "theme", message: "Expected an object" }] };
  }

  const allowedKeys = new Set([
    "id",
    "contractVersion",
    "labelKey",
    "supportsEnhancedContrast",
    "variants",
  ]);

  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) {
      issues.push({ path: `theme.${key}`, message: "Unknown property" });
    }
  }

  validateShape(value.id, "string", "theme.id", issues);
  validateShape(value.labelKey, "string", "theme.labelKey", issues);
  validateShape(
    value.supportsEnhancedContrast,
    "boolean",
    "theme.supportsEnhancedContrast",
    issues,
  );

  if (value.contractVersion !== THEME_CONTRACT_VERSION) {
    issues.push({
      path: "theme.contractVersion",
      message: `Expected contract version ${THEME_CONTRACT_VERSION}`,
    });
  }

  if (!isRecord(value.variants)) {
    issues.push({ path: "theme.variants", message: "Expected an object" });
  } else {
    const variantKeys = Object.keys(value.variants);
    for (const key of ["light", "dark"] as const) {
      if (!(key in value.variants)) {
        issues.push({ path: `theme.variants.${key}`, message: "Missing required property" });
      } else {
        validateShape(
          value.variants[key],
          THEME_VARIANT_SHAPE,
          `theme.variants.${key}`,
          issues,
        );
      }
    }
    for (const key of variantKeys) {
      if (key !== "light" && key !== "dark") {
        issues.push({ path: `theme.variants.${key}`, message: "Unknown property" });
      }
    }
  }

  if (issues.length > 0) {
    return { valid: false, issues };
  }

  // Every field was checked above; issues.length === 0 means value now conforms to ThemePackageV1.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return { valid: true, value: value as ThemePackageV1, issues: [] };
}
