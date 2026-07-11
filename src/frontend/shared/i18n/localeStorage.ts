const LOCALE_STORAGE_KEY = "dmcc_language";
const LEGACY_LOCALE_STORAGE_KEY = "dmcc_language_legacy";

export function readStoredLocale(): string | null {
  try {
    const current = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (current) return current;

    const legacy = localStorage.getItem(LEGACY_LOCALE_STORAGE_KEY);
    if (!legacy) return null;

    localStorage.setItem(LOCALE_STORAGE_KEY, legacy);
    localStorage.removeItem(LEGACY_LOCALE_STORAGE_KEY);
    return legacy;
  } catch {
    return null;
  }
}

export function writeStoredLocale(locale: string): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    localStorage.removeItem(LEGACY_LOCALE_STORAGE_KEY);
  } catch {
    // localStorage can be unavailable in restricted browser contexts.
  }
}
