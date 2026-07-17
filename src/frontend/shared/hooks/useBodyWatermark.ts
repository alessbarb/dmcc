import { useEffect } from "react";

/**
 * Standalone pages outside the CampaignWorkspace shell (canvas, notebooks,
 * rules) can't use CampaignWorkspace's `data-watermark` prop, since the
 * global <Watermark> singleton lives above them in the tree. This hook sets
 * the same kind of flag directly on <body> for the duration of the page's
 * lifetime, so their CSS can target `body[data-watermark="..."]` instead of
 * reaching into the page's own DOM structure with `body:has(.some-page)`.
 */
export type BodyWatermarkMode = "hidden" | "canvas" | "notebooks";

export function useBodyWatermark(mode: BodyWatermarkMode): void {
  useEffect(() => {
    const { body } = document;
    const previous = body.dataset.watermark;
    body.dataset.watermark = mode;
    return () => {
      if (previous === undefined) delete body.dataset.watermark;
      else body.dataset.watermark = previous;
    };
  }, [mode]);
}
