export class HttpError extends Error {
  constructor(message: string, readonly statusCode: number) {
    super(message);
    this.name = "HttpError";
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === "string" && error.trim()) {
    return error;
  }
  return "Unknown error";
}

function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(getErrorMessage(error), { cause: error });
}
