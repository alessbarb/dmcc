import type { FastifyReply } from "fastify";
import { CommandConflictError } from "@core/persistence/repositories/campaignRepository.js";

export function sendCommandError(reply: FastifyReply, error: unknown): boolean {
  if (error instanceof CommandConflictError) {
    reply.code(409).send({ error: error.message });
    return true;
  }

  return false;
}
