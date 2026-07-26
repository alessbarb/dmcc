/**
 * B5 (UX audit 2026-07-26): session cards showed two different title
 * formats side by side in the same list — "Sesión 1 — La emboscada..."
 * next to "#6 Castillo Cragmaw" — because the previous logic kept a
 * title as-is whenever it already started with the localized "Sesión N"
 * prefix, but prepended a raw "#N " otherwise. Both branches were
 * individually reasonable; together they produced two visual conventions
 * for the same concept. This always renders "{Sesión N} — {title}",
 * stripping a redundant leading "Sesión N" or "#N" the title might
 * already carry so numbering never doubles up.
 */
export function formatSessionCardTitle(
  session: { number?: number; title: string },
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  if (!session.number) return session.title;

  const numberLabel = t("session.sessionNumber", { number: session.number });
  const hashPrefix = `#${session.number}`;
  let title = session.title.trim();

  if (title.startsWith(numberLabel)) {
    title = title.slice(numberLabel.length).replace(/^[\s—-]+/, "");
  } else if (title.startsWith(hashPrefix)) {
    title = title.slice(hashPrefix.length).replace(/^[\s—-]+/, "");
  }

  return title ? `${numberLabel} — ${title}` : numberLabel;
}
