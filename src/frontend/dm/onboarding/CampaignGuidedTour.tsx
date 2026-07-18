import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import "./campaign-guided-tour.css";
import {
  clearPendingCampaignGuidedTour,
  getPendingCampaignGuidedTourId,
  readCampaignGuidedTourState,
  writeCampaignGuidedTourState,
} from "./campaignGuidedTourStorage.js";

type TourStep = {
  id: "overview" | "home" | "session" | "entities" | "canvas" | "graph" | "players" | "settings";
  translationId: "overview" | "dashboard" | "session" | "entities" | "canvas" | "graph" | "players" | "settings";
  selectors: string[];
};

const STEPS: TourStep[] = [
  {
    id: "overview",
    translationId: "overview",
    selectors: [
      "[data-tour-id='campaign-current-campaign']",
      "[data-tour-id='campaign-mobile-title']",
      "[data-tour-id='campaign-main-workspace']",
    ],
  },
  {
    id: "home",
    translationId: "dashboard",
    selectors: [
      "[data-tour-id='campaign-nav-command-center']",
      "[data-tour-id='campaign-mobile-nav-command-center']",
    ],
  },
  {
    id: "session",
    translationId: "session",
    selectors: [
      "[data-tour-id='campaign-action-session']",
      "[data-tour-id='campaign-nav-session']",
      "[data-tour-id='campaign-mobile-nav-session']",
    ],
  },
  {
    id: "entities",
    translationId: "entities",
    selectors: [
      "[data-tour-id='campaign-action-new-entity']",
      "[data-tour-id='campaign-nav-entities']",
      "[data-tour-id='campaign-mobile-nav-entities']",
    ],
  },
  {
    id: "canvas",
    translationId: "canvas",
    selectors: [
      "[data-tour-id='campaign-nav-canvas']",
      "[data-tour-id='campaign-mobile-nav-more']",
    ],
  },
  {
    id: "graph",
    translationId: "graph",
    selectors: [
      "[data-tour-id='campaign-nav-graph']",
      "[data-tour-id='campaign-mobile-nav-more']",
    ],
  },
  {
    id: "players",
    translationId: "players",
    selectors: [
      "[data-tour-id='campaign-nav-players']",
      "[data-tour-id='campaign-nav-knowledge']",
      "[data-tour-id='campaign-mobile-nav-more']",
    ],
  },
  {
    id: "settings",
    translationId: "settings",
    selectors: [
      "[data-tour-id='campaign-nav-settings']",
      "[data-tour-id='campaign-mobile-nav-more']",
    ],
  },
];

interface CampaignGuidedTourProps {
  campaignId: string;
  enabled: boolean;
}

type HighlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
};

function visibleElement(selectors: string[]): HTMLElement | null {
  for (const selector of selectors) {
    for (const element of Array.from(document.querySelectorAll(selector))) {
      if (!(element instanceof HTMLElement)) continue;
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      if (rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden") {
        return element;
      }
    }
  }
  return null;
}

function toRect(rect: DOMRect): HighlightRect {
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    right: rect.right,
    bottom: rect.bottom,
  };
}

function cardPosition(target: HighlightRect | null): React.CSSProperties {
  const margin = 16;
  const width = Math.min(390, Math.max(290, window.innerWidth - margin * 2));
  if (window.innerWidth < 768) {
    return {
      right: 12,
      bottom: target && target.bottom > window.innerHeight - 110 ? 86 : 12,
      left: 12,
      width: "auto",
      maxHeight: "min(72dvh, 560px)",
    };
  }
  if (!target) {
    return {
      width,
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      maxHeight: `calc(100dvh - ${margin * 2}px)`,
    };
  }

  const rightSpace = window.innerWidth - target.right;
  const leftSpace = target.left;
  const top = Math.min(
    Math.max(margin, target.top),
    Math.max(margin, window.innerHeight - 520 - margin),
  );

  if (rightSpace >= width + 24) {
    return { width, top, left: target.right + 18, maxHeight: `calc(100dvh - ${margin * 2}px)` };
  }
  if (leftSpace >= width + 24) {
    return { width, top, left: target.left - width - 18, maxHeight: `calc(100dvh - ${margin * 2}px)` };
  }
  return {
    width,
    left: Math.min(Math.max(margin, target.left), window.innerWidth - width - margin),
    top: Math.min(target.bottom + 16, window.innerHeight - 520 - margin),
    maxHeight: `calc(100dvh - ${margin * 2}px)`,
  };
}

export function CampaignGuidedTour({ campaignId, enabled }: CampaignGuidedTourProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<HighlightRect | null>(null);
  const [stateRevision, setStateRevision] = useState(0);
  const autoStartAttempted = useRef(false);
  const currentStep = STEPS[stepIndex] ?? STEPS[0];

  const finished = useMemo(() => {
    const stored = readCampaignGuidedTourState(campaignId);
    return Boolean(stored.completedAt || stored.dismissedAt);
  }, [campaignId, stateRevision]);

  const start = () => {
    setStepIndex(0);
    setOpen(true);
  };

  const dismiss = () => {
    writeCampaignGuidedTourState(campaignId, { dismissedAt: new Date().toISOString() });
    clearPendingCampaignGuidedTour(campaignId);
    setStateRevision((value) => value + 1);
    setOpen(false);
  };

  const finish = () => {
    writeCampaignGuidedTourState(campaignId, { completedAt: new Date().toISOString() });
    clearPendingCampaignGuidedTour(campaignId);
    setStateRevision((value) => value + 1);
    setOpen(false);
  };

  useEffect(() => {
    autoStartAttempted.current = false;
    setOpen(false);
    setStepIndex(0);
    setTargetRect(null);
  }, [campaignId]);

  useEffect(() => {
    if (!enabled || autoStartAttempted.current || finished) return;
    if (getPendingCampaignGuidedTourId() !== campaignId) return;
    autoStartAttempted.current = true;
    const timer = window.setTimeout(start, 300);
    return () => window.clearTimeout(timer);
  }, [campaignId, enabled, finished]);

  useEffect(() => {
    const listener = (event: Event) => {
      const detail: unknown = event instanceof CustomEvent ? event.detail : undefined;
      const detailCampaignId =
        detail && typeof detail === "object" && "campaignId" in detail && typeof detail.campaignId === "string"
          ? detail.campaignId
          : undefined;
      if (detailCampaignId && detailCampaignId !== campaignId) return;
      start();
    };
    window.addEventListener("dmcc:start-campaign-tour", listener);
    return () => window.removeEventListener("dmcc:start-campaign-tour", listener);
  }, [campaignId]);

  useLayoutEffect(() => {
    if (!open) return;
    let frame = 0;
    const measure = () => {
      const target = visibleElement(currentStep.selectors);
      if (!target) {
        setTargetRect(null);
        return;
      }
      target.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
      frame = window.requestAnimationFrame(() => setTargetRect(toRect(target.getBoundingClientRect())));
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [currentStep, open]);

  useEffect(() => {
    if (!open) return;
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
      if (event.key === "ArrowLeft") setStepIndex((index) => Math.max(0, index - 1));
      if (event.key === "ArrowRight") {
        if (stepIndex === STEPS.length - 1) finish();
        else setStepIndex((index) => Math.min(STEPS.length - 1, index + 1));
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [open, stepIndex]);

  if (!enabled || !open) return null;

  const translationPath = `campaignTour.steps.${currentStep.translationId}`;
  const highlightStyle = targetRect
    ? {
        top: targetRect.top - 8,
        left: targetRect.left - 8,
        width: targetRect.width + 16,
        height: targetRect.height + 16,
      }
    : undefined;

  return (
    <div className="campaign-tour" role="presentation">
      <div className="campaign-tour__scrim" aria-hidden="true" />
      {highlightStyle && <div className="campaign-tour__highlight" style={highlightStyle} aria-hidden="true" />}
      <section
        className="campaign-tour__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="campaign-tour-title"
        aria-describedby="campaign-tour-description"
        style={cardPosition(targetRect)}
      >
        <header className="campaign-tour__header">
          <div>
            <span className="campaign-tour__eyebrow">
              {t("campaignTour.eyebrow", { current: stepIndex + 1, total: STEPS.length })}
            </span>
            <h2 id="campaign-tour-title">{t(`${translationPath}.title`)}</h2>
          </div>
          <button type="button" className="campaign-tour__icon-btn" onClick={dismiss} aria-label={t("campaignTour.skip")}>
            <X size={16} />
          </button>
        </header>

        <div id="campaign-tour-description" className="campaign-tour__content">
          <p>{t(`${translationPath}.body`)}</p>
          <p>{t(`${translationPath}.detail`)}</p>
          <p className="campaign-tour__tip">{t(`${translationPath}.tip`)}</p>
        </div>

        <div className="campaign-tour__progress" aria-label={t("campaignTour.progress", { current: stepIndex + 1, total: STEPS.length })}>
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              type="button"
              className={`campaign-tour__dot ${index === stepIndex ? "active" : ""} ${index < stepIndex ? "done" : ""}`}
              onClick={() => setStepIndex(index)}
              aria-label={t("campaignTour.goToStep", { number: index + 1, title: t(`campaignTour.steps.${step.translationId}.title`) })}
            />
          ))}
        </div>

        <footer className="campaign-tour__footer">
          <button type="button" className="btn btn-secondary btn-sm" onClick={dismiss}>
            {t("campaignTour.skip")}
          </button>
          <div className="campaign-tour__footer-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
              disabled={stepIndex === 0}
            >
              <ChevronLeft size={14} /> {t("campaignTour.previous")}
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                if (stepIndex === STEPS.length - 1) finish();
                else setStepIndex((index) => Math.min(STEPS.length - 1, index + 1));
              }}
            >
              {stepIndex === STEPS.length - 1 ? t("campaignTour.finish") : t("campaignTour.next")}
              {stepIndex === STEPS.length - 1 ? null : <ChevronRight size={14} />}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
