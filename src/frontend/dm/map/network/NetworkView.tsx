import React from "react";
import { NetworkFlow } from "./NetworkFlow.js";
import "./networkFlow.css";

export function NetworkView() {
  return (
    <div
      className="network-workspace-view network-workspace-view--immersive"
      data-testid="network-workspace-view"
    >
      <NetworkFlow />
    </div>
  );
}
