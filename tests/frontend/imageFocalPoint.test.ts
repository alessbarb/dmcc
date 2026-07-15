import { describe, expect, it } from "vitest";
import {
  DEFAULT_IMAGE_FOCAL_POINT,
  imageFocalPointToObjectPosition,
  normalizeImageFocalPoint,
  parseImageFocalPoint,
  stripImageFocalPoint,
  withImageFocalPoint,
} from "../../src/frontend/shared/images/imageFocalPoint.js";

describe("entity image focal points", () => {
  it("stores and restores a focal point in an image reference", () => {
    const imageUrl = withImageFocalPoint("/assets/entities/phandalin.webp", {
      x: 0.637,
      y: 0.284,
    });

    expect(imageUrl).toBe(
      "/assets/entities/phandalin.webp#dmcc-focus=0.6370,0.2840",
    );
    expect(parseImageFocalPoint(imageUrl)).toEqual({ x: 0.637, y: 0.284 });
    expect(stripImageFocalPoint(imageUrl)).toBe("/assets/entities/phandalin.webp");
  });

  it("clamps points to the image bounds", () => {
    expect(normalizeImageFocalPoint({ x: -2, y: 4 })).toEqual({ x: 0, y: 1 });
  });

  it("uses a slightly elevated center as the safe default", () => {
    expect(imageFocalPointToObjectPosition(undefined)).toBe("50% 42%");
    expect(DEFAULT_IMAGE_FOCAL_POINT).toEqual({ x: 0.5, y: 0.42 });
  });

  it("ignores malformed focal point markers", () => {
    expect(parseImageFocalPoint("/image.webp#dmcc-focus=wrong,value")).toBeUndefined();
  });
});
