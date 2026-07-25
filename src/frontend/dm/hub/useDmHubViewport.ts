import { useEffect, useState } from "react";

const DESKTOP_QUERY = "(min-width: 768px)";

export type DmHubViewport = "desktop" | "mobile";

export function resolveDmHubViewport(matches: boolean): DmHubViewport {
  return matches ? "desktop" : "mobile";
}

export function useDmHubViewport(): DmHubViewport {
  const [viewport, setViewport] = useState<DmHubViewport>(() =>
    typeof window === "undefined" || !window.matchMedia
      ? "desktop"
      : resolveDmHubViewport(window.matchMedia(DESKTOP_QUERY).matches),
  );

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setViewport(resolveDmHubViewport(event.matches));
    };
    mql.addEventListener("change", handleChange);
    setViewport(resolveDmHubViewport(mql.matches));
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return viewport;
}
