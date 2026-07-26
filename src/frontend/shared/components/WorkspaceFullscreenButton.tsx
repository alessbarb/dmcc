import { Maximize2, Minimize2 } from "lucide-react";
import { useTranslation } from "../i18n/useTranslation.js";

interface WorkspaceFullscreenButtonProps {
  isFullscreen: boolean;
  onToggle: () => void;
}

export function WorkspaceFullscreenButton({ isFullscreen, onToggle }: WorkspaceFullscreenButtonProps) {
  const { t } = useTranslation();
  const label = isFullscreen
    ? t("entityDetail.relationsGraph.exitFullscreen")
    : t("entityDetail.relationsGraph.enterFullscreen");

  return (
    <button
      type="button"
      className="workspace-fullscreen-button"
      onClick={onToggle}
      aria-label={label}
      title={label}
    >
      {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
    </button>
  );
}
