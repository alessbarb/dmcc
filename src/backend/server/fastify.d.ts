import type { WebUser } from "./web/webSession.js";

declare module "fastify" {
  interface FastifyRequest {
    webUser: WebUser | null;
    setDecorator<T = any>(name: string, value: T): void;
    getDecorator<T = any>(name: string): T;
  }
}
