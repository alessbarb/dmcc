import { useCallback, useEffect, useRef, useState } from "react";

export function useWorkspaceFullscreen<T extends HTMLElement>() {
  const workspaceRef = useRef<T>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsFullscreen(document.fullscreenElement === workspaceRef.current);
    };

    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const workspace = workspaceRef.current;
    if (!workspace) return;

    try {
      if (document.fullscreenElement === workspace) {
        await document.exitFullscreen();
        return;
      }

      if (document.fullscreenElement) await document.exitFullscreen();
      await workspace.requestFullscreen({ navigationUI: "hide" });
    } catch {
      // Fullscreen can be rejected by browser policy or unavailable in an embedded context.
    }
  }, []);

  return { workspaceRef, isFullscreen, toggleFullscreen };
}
