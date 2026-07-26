import { useEffect, useRef, useState } from "react";

export type ScrollDirection = "up" | "down" | "idle";

/**
 * Tracks window scroll direction so fixed overlays (FAB, etc.) can get out
 * of the way while the user is reading, and reappear once they stop.
 * `idle` also covers "at the top of the page" so the control is visible
 * on first paint and after returning to the top.
 */
export function useScrollDirection(threshold = 8): ScrollDirection {
  const [direction, setDirection] = useState<ScrollDirection>("idle");
  const lastY = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    lastY.current = window.scrollY;
    let ticking = false;

    const evaluate = () => {
      const y = window.scrollY;
      if (y <= 0) {
        setDirection("idle");
        lastY.current = y;
        ticking = false;
        return;
      }
      const delta = y - lastY.current;
      if (Math.abs(delta) > threshold) {
        setDirection(delta > 0 ? "down" : "up");
        lastY.current = y;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(evaluate);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return direction;
}
