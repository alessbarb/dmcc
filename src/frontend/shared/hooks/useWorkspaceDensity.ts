import { useState, useEffect } from "react";

export type WorkspaceDensity = "comfortable" | "compact" | "dense";

export function useWorkspaceDensity(): WorkspaceDensity {
  // Default to comfortable, evaluate on mount in useEffect to avoid window access on SSR/render
  const [density, setDensity] = useState<WorkspaceDensity>("comfortable");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const comfortableQuery = window.matchMedia("(min-width: 1440px) and (min-height: 900px)");
    const denseQuery = window.matchMedia("(max-width: 1179px) or (max-height: 719px)");

    const evaluate = () => {
      if (denseQuery.matches) {
        setDensity("dense");
      } else if (comfortableQuery.matches) {
        setDensity("comfortable");
      } else {
        setDensity("compact");
      }
    };

    evaluate();

    comfortableQuery.addEventListener("change", evaluate);
    denseQuery.addEventListener("change", evaluate);

    return () => {
      comfortableQuery.removeEventListener("change", evaluate);
      denseQuery.removeEventListener("change", evaluate);
    };
  }, []);

  return density;
}
