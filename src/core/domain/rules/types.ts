import type { z } from "zod";

export interface RuleSystem {
  systemCode: string;
  systemName: string;
  characterMetadataSchema: z.ZodSchema;
  getInitialCharacterMetadata(): Record<string, unknown>;
}
