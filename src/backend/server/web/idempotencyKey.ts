import type { FastifyRequest } from "fastify";
import { HttpError } from "../errors.js";

export function requireIdempotencyKey(request: FastifyRequest): string {
  const value = request.headers["idempotency-key"];
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  throw new HttpError("Idempotency-Key header is required", 400);
}
