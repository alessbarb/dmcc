import { AlertTriangle, CheckCircle2, HelpCircle, Lightbulb, Lock, MessageSquare, RefreshCw, XCircle } from "lucide-react";

export const CONFIDENCE_DOTS: Record<string, { dots: number; label: string }> = {
  unconfirmed: { dots: 1, label: "Sin confirmar" },
  suspected: { dots: 2, label: "Sospechado" },
  likely: { dots: 3, label: "Probable" },
  confirmed: { dots: 3, label: "Confirmado" },
  false: { dots: 0, label: "Falso" },
  medium: { dots: 2, label: "Sin confirmar" },
};

export type FactKindPresentation = {
  label: string;
  color: string;
  Icon: typeof CheckCircle2;
};

export function getFactKindPresentation(kind: string, playerTheoryLabel: string): Record<string, FactKindPresentation> {
  return {
    canon: { label: "CANON", color: "var(--theme-feedback-success-foreground)", Icon: CheckCircle2 },
    dm_secret: { label: "SECRETO DM", color: "var(--theme-feedback-danger-foreground)", Icon: Lock },
    rumor: { label: "RUMOR", color: "var(--theme-feedback-warning-foreground)", Icon: MessageSquare },
    lie: { label: "MENTIRA", color: "var(--theme-feedback-danger-strong)", Icon: XCircle },
    player_theory: { label: playerTheoryLabel, color: "var(--theme-accents-primary-foreground)", Icon: Lightbulb },
    mistake: { label: "ERROR", color: "var(--theme-text-secondary)", Icon: AlertTriangle },
    retcon: { label: "RETCON", color: "var(--theme-narrative-secret-foreground)", Icon: RefreshCw },
    unknown: { label: "DESCONOCIDO", color: "var(--theme-text-subtle)", Icon: HelpCircle },
  };
}
