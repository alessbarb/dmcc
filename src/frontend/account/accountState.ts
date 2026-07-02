export type ConflictState<T> = {
  server: T;
  draft: T;
  conflicted: true;
};

export function mergeConflict<T>(server: T, draft: T): ConflictState<T> {
  return { server, draft, conflicted: true };
}

export function isDirty<T>(saved: T, draft: T): boolean {
  return JSON.stringify(saved) !== JSON.stringify(draft);
}

export function normalizeReturnTo(value: unknown, fallback = "/dm"): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  return value;
}
