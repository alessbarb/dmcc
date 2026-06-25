export function nowIso(): string {
  return new Date().toISOString();
}

export function isValidIsoDate(dateStr: string): boolean {
  const timestamp = Date.parse(dateStr);
  return !isNaN(timestamp);
}
