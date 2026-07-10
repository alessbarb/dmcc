import { describe, expect, it } from "vitest";

import { isAllowedExternalUrl } from "../../desktop/externalUrl.mjs";

describe("isAllowedExternalUrl", () => {
  it("allows expected safe external protocols", () => {
    expect(isAllowedExternalUrl("https://example.com/docs?section=1")).toBe(true);
    expect(isAllowedExternalUrl("mailto:dm@example.com")).toBe(true);
  });

  it.each([
    "file:///etc/passwd",
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "shell:AppsFolder\\Microsoft.WindowsCalculator_8wekyb3d8bbwe!App",
    "vscode://file/workspace/settings.json",
  ])("rejects explicitly unsafe protocol %s", (targetUrl) => {
    expect(isAllowedExternalUrl(targetUrl)).toBe(false);
  });

  it("rejects protocols that are not explicitly allowed", () => {
    expect(isAllowedExternalUrl("http://example.com")).toBe(false);
    expect(isAllowedExternalUrl("ftp://example.com/file.txt")).toBe(false);
  });

  it("rejects malformed URLs", () => {
    expect(isAllowedExternalUrl("not a url")).toBe(false);
    expect(isAllowedExternalUrl("")).toBe(false);
  });
});
