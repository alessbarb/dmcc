const ALLOWED_EXTERNAL_PROTOCOLS = new Set(["https:", "mailto:"]);
const BLOCKED_EXTERNAL_PROTOCOLS = new Set(["file:", "javascript:", "data:", "shell:", "vscode:"]);

/**
 * Validate URLs before handing them to the host OS via Electron shell.openExternal.
 * Only expected safe protocols are allowed; local files, script URLs, custom shell
 * protocols, and malformed input are denied.
 *
 * @param {string} targetUrl
 * @returns {boolean}
 */
export function isAllowedExternalUrl(targetUrl) {
  let parsedUrl;

  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return false;
  }

  if (BLOCKED_EXTERNAL_PROTOCOLS.has(parsedUrl.protocol)) {
    return false;
  }

  return ALLOWED_EXTERNAL_PROTOCOLS.has(parsedUrl.protocol);
}
