import type { FastifyReply } from "fastify";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Command failed";
}

function explicitStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;
  const statusCode = (error as { statusCode?: unknown }).statusCode;
  return typeof statusCode === "number" ? statusCode : undefined;
}

export function writeCommandError(reply: FastifyReply, error: unknown): Record<string, any> {
  const message = errorMessage(error);
  const normalized = message.toLowerCase();
  let statusCode = explicitStatus(error);

  if (!statusCode && (error as { name?: string } | null)?.name === "CommandConflictError") {
    statusCode = 409;
  }
  if (!statusCode && normalized.includes("not found")) {
    statusCode = 404;
  }
  if (!statusCode && /(already|conflict|cycle|cannot|archived|does not belong|terminal)/i.test(message)) {
    statusCode = 409;
  }
  if (!statusCode && /(invalid|required|must|expected|limit exceeded|non-negative|unsupported)/i.test(message)) {
    statusCode = 400;
  }

  reply.code(statusCode ?? 500);

  const responsePayload: Record<string, any> = { error: message };
  if (error && typeof error === "object") {
    if ("errorCode" in error) {
      responsePayload.errorCode = (error as any).errorCode;
    }
    if ("details" in error) {
      responsePayload.details = (error as any).details;
    }
  }

  return responsePayload;
}
