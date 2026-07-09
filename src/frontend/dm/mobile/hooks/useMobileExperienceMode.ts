import { useEffect, useState } from "react";
import type { CanvasDeviceMode } from "../../canvas/components/CampaignCanvasFlow.js";

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mediaQuery = window.matchMedia(query);
    const listener = () => setMatches(mediaQuery.matches);
    listener();
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, [query]);
  return matches;
}

export function useMobileExperienceMode(): { deviceMode: CanvasDeviceMode; isMobile: boolean; isTablet: boolean } {
  const isMobile = useMediaQuery("(max-width: 599px)");
  const isTablet = useMediaQuery("(min-width: 600px) and (max-width: 899px)");
  return { deviceMode: isMobile ? "mobile" : isTablet ? "tablet" : "desktop", isMobile, isTablet };
}
