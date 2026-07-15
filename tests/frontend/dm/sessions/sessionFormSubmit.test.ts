import { describe, it, expect, vi } from "vitest";
import { errorMessage, runSessionAction } from "../../../../src/frontend/dm/sessions/sessionFormSubmit.js";

describe("errorMessage", () => {
  it("returns the Error message for Error instances", () => {
    expect(errorMessage(new Error("boom"))).toBe("boom");
  });

  it("stringifies non-Error values", () => {
    expect(errorMessage("plain string")).toBe("plain string");
    expect(errorMessage(404)).toBe("404");
  });
});

describe("runSessionAction", () => {
  it("logs the given message and the rejection reason on failure, without throwing", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const rejection = new Error("network down");

    runSessionAction(Promise.reject(rejection), "could not save");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(consoleErrorSpy).toHaveBeenCalledWith("could not save", rejection);
    consoleErrorSpy.mockRestore();
  });

  it("does nothing observable when the operation resolves", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    runSessionAction(Promise.resolve("ok"), "unused message");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
