import { describe, expect, it } from "vitest";
import { markdownToPlainText } from "../../src/frontend/shared/utils/markdownText.js";

describe("markdownToPlainText", () => {
  it("removes Markdown structure while preserving readable text", () => {
    expect(markdownToPlainText("## Uso en mesa\n\n- **Phandalin** está amenazado.")).toBe(
      "Uso en mesa Phandalin está amenazado.",
    );
  });

  it("keeps link labels and inline code", () => {
    expect(markdownToPlainText("Consulta [el mapa](https://example.com) y usa `d20`."))
      .toBe("Consulta el mapa y usa d20.");
  });

  it("does not expose fenced code blocks in compact text", () => {
    expect(markdownToPlainText("Antes\n\n```ts\nsecret()\n```\n\nDespués")).toBe("Antes Después");
  });
});
