import { useEffect } from "react";
import {
  applyStoredImageFocalPoint,
  applyStoredImageFocalPoints,
} from "./imageFocalPoint.js";

export function ImageFocalPointBehavior() {
  useEffect(() => {
    applyStoredImageFocalPoints();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.target instanceof HTMLImageElement) {
          applyStoredImageFocalPoint(mutation.target);
          continue;
        }

        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node instanceof HTMLImageElement) {
            applyStoredImageFocalPoint(node);
          }
          applyStoredImageFocalPoints(node);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src"],
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
