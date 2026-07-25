import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const mockSetDensity = vi.fn();
const mockState = vi.fn().mockImplementation((initVal) => [initVal, mockSetDensity]);
const mockEffect = vi.fn().mockImplementation((f) => f());

vi.mock("react", () => ({
  useState: (initVal: any) => mockState(initVal),
  useEffect: (f: any) => mockEffect(f),
}));

import { useWorkspaceDensity } from "../../src/frontend/shared/hooks/useWorkspaceDensity.js";

describe("useWorkspaceDensity hook", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      matchMedia: vi.fn().mockImplementation((query: string) => {
        let matches = false;
        if (query.includes("min-width: 1440px") && query.includes("min-height: 900px")) {
          matches = true;
        }
        return {
          matches,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        };
      }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("evaluates and returns density based on window matchMedia", () => {
    useWorkspaceDensity();

    expect(window.matchMedia).toHaveBeenCalledWith("(min-width: 1440px) and (min-height: 900px)");
    expect(window.matchMedia).toHaveBeenCalledWith("(max-width: 1179px) or (max-height: 719px)");
  });
});
