import { useEffect, useState } from "react";

export type DmHubDensity = "low" | "compact" | "comfortable";

export const pageSizeByDensity: Record<DmHubDensity, number> = {
  low: 3,
  compact: 4,
  comfortable: 6,
};

const LOW_QUERY = "(max-height: 660px)";
const COMPACT_QUERY = "(max-height: 760px)";

export function resolveDmHubDensity(lowMatches: boolean, compactMatches: boolean): DmHubDensity {
  if (lowMatches) return "low";
  if (compactMatches) return "compact";
  return "comfortable";
}

function resolveDensity(): DmHubDensity {
  if (typeof window === "undefined" || !window.matchMedia) return "comfortable";
  return resolveDmHubDensity(
    window.matchMedia(LOW_QUERY).matches,
    window.matchMedia(COMPACT_QUERY).matches,
  );
}

export function useDmHubDensity(): DmHubDensity {
  const [density, setDensity] = useState<DmHubDensity>(resolveDensity);

  useEffect(() => {
    const lowMql = window.matchMedia(LOW_QUERY);
    const compactMql = window.matchMedia(COMPACT_QUERY);
    const handleChange = () => setDensity(resolveDensity());
    lowMql.addEventListener("change", handleChange);
    compactMql.addEventListener("change", handleChange);
    handleChange();
    return () => {
      lowMql.removeEventListener("change", handleChange);
      compactMql.removeEventListener("change", handleChange);
    };
  }, []);

  return density;
}
