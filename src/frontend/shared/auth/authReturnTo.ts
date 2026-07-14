const AUTH_RETURN_TO_KEY = "dmcc_auth_return_to";

export function rememberAuthReturnTo(path: string): void {
  if (!path.startsWith("/") || path.startsWith("//")) return;
  window.sessionStorage.setItem(AUTH_RETURN_TO_KEY, path);
}

export function consumeAuthReturnTo(fallback = "/home"): string {
  const path = window.sessionStorage.getItem(AUTH_RETURN_TO_KEY);
  window.sessionStorage.removeItem(AUTH_RETURN_TO_KEY);
  return path && path.startsWith("/") && !path.startsWith("//") ? path : fallback;
}
