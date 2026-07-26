import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const mockSetDirection = vi.fn();
let currentState = "idle";
const mockState = vi.fn().mockImplementation((_initVal) => [currentState, mockSetDirection]);
const mockEffect = vi.fn().mockImplementation((f) => f());
const mockRef = vi.fn().mockImplementation((initVal) => ({ current: initVal }));

vi.mock("react", () => ({
  useState: (initVal: any) => mockState(initVal),
  useEffect: (f: any) => mockEffect(f),
  useRef: (initVal: any) => mockRef(initVal),
}));

import { useScrollDirection } from "../../src/frontend/shared/hooks/useScrollDirection.js";

describe("useScrollDirection hook", () => {
  let scrollListener: ((event?: unknown) => void) | undefined;
  let rafCallback: (() => void) | undefined;

  beforeEach(() => {
    currentState = "idle";
    scrollListener = undefined;
    rafCallback = undefined;
    vi.stubGlobal("window", {
      scrollY: 0,
      addEventListener: vi.fn((event: string, handler: (e?: unknown) => void) => {
        if (event === "scroll") scrollListener = handler;
      }),
      removeEventListener: vi.fn(),
      requestAnimationFrame: vi.fn((cb: () => void) => {
        rafCallback = cb;
        return 1;
      }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("registers a passive scroll listener", () => {
    useScrollDirection();

    expect(window.addEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
      { passive: true },
    );
  });

  it("reports 'down' once scroll delta exceeds the threshold going down", () => {
    useScrollDirection(8);

    (window as any).scrollY = 50;
    scrollListener?.();
    rafCallback?.();

    expect(mockSetDirection).toHaveBeenCalledWith("down");
  });

  it("reports 'idle' once the user scrolls back to the top", () => {
    useScrollDirection(8);

    (window as any).scrollY = 0;
    scrollListener?.();
    rafCallback?.();

    expect(mockSetDirection).toHaveBeenCalledWith("idle");
  });
});
