import React, { useState } from "react";
import { EntityDetailModal as StandardEntityDetailModal } from "./EntityDetailModal.tsx";
import { PlayerCharacterDetailModal } from "./PlayerCharacterDetailModal.tsx";
import "./playerCharacterDetail.css";

export function EntityDetailModal(props) {
  const [showStandardModal, setShowStandardModal] = useState(false);

  if (props.selectedEntity?.entityType !== "player_character" || showStandardModal) {
    return React.createElement(StandardEntityDetailModal, props);
  }

  return React.createElement(PlayerCharacterDetailModal, {
    ...props,
    onOpenLegacy: () => setShowStandardModal(true),
  });
}
