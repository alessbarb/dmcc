import { describe, expect, it } from "vitest";
import { CompactEmptyState } from "../../src/frontend/shared/components/CompactEmptyState.js";

describe("CompactEmptyState component", () => {
  it("constructs correct React element with title and default props", () => {
    const element = CompactEmptyState({
      title: "No Campaigns",
      description: "Create a new one to begin",
    });

    expect(element.type).toBe("div");
    expect(element.props.className).toContain("compact-empty-state");
    expect(element.props.className).toContain("compact-empty-state--standard");

    // Children includes icon, title, description, actions
    const titleChild = element.props.children.find(
      (child: any) => child && child.props && child.props.className === "compact-empty-state__title"
    );
    expect(titleChild.props.children).toBe("No Campaigns");

    const descChild = element.props.children.find(
      (child: any) => child && child.props && child.props.className === "compact-empty-state__description"
    );
    expect(descChild.props.children).toBe("Create a new one to begin");
  });

  it("handles actionable state and custom size", () => {
    const primaryAction = {
      label: "Create",
      onClick: () => {},
    };

    const element = CompactEmptyState({
      title: "No Campaigns",
      primaryAction,
      size: "compact",
    });

    expect(element.props.className).toContain("compact-empty-state--actionable");
    expect(element.props.className).toContain("compact-empty-state--compact");
  });
});
