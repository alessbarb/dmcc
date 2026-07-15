import React from "react";
import { NetworkFlow } from "./NetworkFlow.js";

export function NetworkView() {
  return (
    <div className="network-workspace-view" data-testid="network-workspace-view">
      <NetworkFlow />
    </div>
  );
}
