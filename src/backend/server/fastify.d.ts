import type { WebUser } from "./web/webSession.js";

declare module "fastify" {
  interface FastifyRequest {
    webUser: WebUser | null;
    setDecorator<T = unknown>(name: string, value: T): void;
    getDecorator<T = unknown>(name: string): T;
  }
}
