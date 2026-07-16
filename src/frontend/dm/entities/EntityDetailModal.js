import React, { useState } from "react";
// TypeScript normally substitutes .js imports with .tsx sources. This real .js wrapper
// deliberately reaches the original implementation by its concrete extension.
// @ts-ignore -- Vite supports explicit TSX imports in source modules.
import { EntityDetailModal as StandardEntityDetailModal } from "./EntityDetailModal.tsx";
// @ts-ignore -- Vite supports explicit TSX imports in source modules.
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
