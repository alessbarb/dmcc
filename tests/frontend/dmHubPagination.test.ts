import { describe, expect, it } from "vitest";
import { paginate } from "../../src/frontend/dm/hub/dmHubPagination.js";

describe("paginate", () => {
  it("slices and clamps pages", () => { expect(paginate([1, 2, 3, 4, 5], 0, 2)).toEqual({ pageItems: [1, 2], pageCount: 3, clampedPage: 0 }); expect(paginate([1, 2, 3, 4, 5], 10, 2).pageItems).toEqual([5]); expect(paginate([1, 2, 3], -1, 2).clampedPage).toBe(0); });
  it("handles empty input", () => { expect(paginate([], 0, 4)).toEqual({ pageItems: [], pageCount: 0, clampedPage: 0 }); });
});
