export function formatElapsed(startedAt: string | undefined): string {
  if (!startedAt) return "—";
  const ms = Date.now() - new Date(startedAt).getTime();
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function formatRelative(
  isoDate: string,
  t: (key: string, values?: Record<string, string | number>) => string,
): string {
  const ms = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return t("sessionPage.relativeNow");
  if (minutes < 60) return t("sessionPage.relativeMinutes", { count: minutes });
  const hours = Math.floor(minutes / 60);
  return t("sessionPage.relativeHours", { count: hours });
}
