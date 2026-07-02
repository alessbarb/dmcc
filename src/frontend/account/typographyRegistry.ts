export type TypographyPackage = {
  id: string;
  contractVersion: 1;
  labelKey: string;
  headingFamily: string;
  bodyFamily: string;
  monoFamily: string;
  supportedWeights: number[];
  scale: number;
  license: { name: string; url: string };
};

const defaultTypography: TypographyPackage = {
  id: "cinzel-outfit",
  contractVersion: 1,
  labelKey: "accountCenter.appearance.typographyDefault",
  headingFamily: '"Cinzel", Georgia, serif',
  bodyFamily: '"Outfit", Inter, system-ui, sans-serif',
  monoFamily: "ui-monospace, monospace",
  supportedWeights: [400, 500, 600, 700, 800, 900],
  scale: 1,
  license: { name: "SIL Open Font License 1.1", url: "https://openfontlicense.org" },
};

export const typographySets = new Map<string, TypographyPackage>([
  ["cinzel-outfit", defaultTypography],
]);

export function getTypographySet(id: string): TypographyPackage {
  return typographySets.get(id) ?? defaultTypography;
}
