export type ThemePackage = {
  id: string;
  contractVersion: 1;
  labelKey: string;
  variants: Record<"light" | "dark", Record<string, string>>;
  supportsEnhancedContrast: boolean;
};

const defaultTheme: ThemePackage = {
  id: "default",
  contractVersion: 1,
  labelKey: "accountCenter.appearance.themeDefault",
  supportsEnhancedContrast: true,
  variants: {
    dark: {
      "--bg-main": "hsl(228 36% 6%)",
      "--bg-card": "hsl(226 25% 10%)",
      "--text-main": "hsl(42 30% 94%)",
      "--primary": "hsl(38 66% 62%)",
    },
    light: {
      "--bg-main": "hsl(42 30% 96%)",
      "--bg-card": "hsl(40 28% 100%)",
      "--text-main": "hsl(228 30% 12%)",
      "--primary": "hsl(30 70% 38%)",
    },
  },
};

export const themes = new Map<string, ThemePackage>([["default", defaultTheme]]);

export function getTheme(id: string): ThemePackage {
  return themes.get(id) ?? defaultTheme;
}
