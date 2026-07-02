import type { FastifyRequest } from "fastify";

export function isLoopbackIp(ip: string): boolean {
  return ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1";
}

export function assertSameOrigin(request: FastifyRequest): void {
  const origin = request.headers.origin;
  if (!origin) {
    if (!isLoopbackIp(request.ip)) {
      throw Object.assign(new Error("Cross-origin mutation rejected"), { statusCode: 403 });
    }
    return;
  }
  const host = request.headers.host;
  try {
    if (!host || new URL(origin).host !== host) {
      throw Object.assign(new Error("Cross-origin mutation rejected"), { statusCode: 403 });
    }
  } catch (error: any) {
    if (error.statusCode === 403) throw error;
    throw Object.assign(new Error("Cross-origin mutation rejected"), { statusCode: 403 });
  }
}
