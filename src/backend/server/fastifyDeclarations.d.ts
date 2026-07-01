import "fastify";

declare module "fastify" {
  interface FastifyInstance {
    dmSessionToken: string;
    lanExposed: boolean;
    activeAccessCodes: Map<string, string>;
    playerTokens: Map<string, { campaignId: string; playerId: string }>;
    allowLegacyTestAuth: boolean;
  }
}
