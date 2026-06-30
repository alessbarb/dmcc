import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import {
  clearPendingCampaignGuidedTour,
  getPendingCampaignGuidedTourId,
  readCampaignGuidedTourState,
  writeCampaignGuidedTourState,
} from "./campaignGuidedTourStorage.js";

type TourStepId =
  | "overview"
  | "dashboard"
  | "canvas"
  | "entities"
  | "session"
  | "whatNow"
  | "graph"
  | "players"
  | "settings";

type TourPlacementSide = "top" | "bottom" | "left" | "right";
type TourPlacementAlignment = "start" | "center" | "end";
type TourPlacement = `${TourPlacementSide}-${TourPlacementAlignment}` | "center" | "mobile-sheet";

interface TourStepDefinition {
  id: TourStepId;
  targetSelectors: string[];
  preferredPlacement: TourPlacement;
  fallbackPlacements: TourPlacement[];
}

interface CampaignGuidedTourProps {
  campaignId: string;
  enabled: boolean;
}

interface MeasuredRect {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

interface MeasuredSize {
  width: number;
  height: number;
}

interface ViewportSize {
  width: number;
  height: number;
}

interface TourPlacementCandidate {
  placement: TourPlacement;
  left: number;
  top: number;
  score: number;
}

interface TourPlacementResult {
  placement: TourPlacement;
  style: React.CSSProperties;
}

const TOUR_MARGIN = 18;
const TOUR_OFFSET = 18;
const TOUR_CARD_MIN_WIDTH = 300;
const TOUR_CARD_MAX_WIDTH = 390;
const TOUR_MOBILE_BREAKPOINT = 768;
const TOUR_MOBILE_SHEET_MARGIN = 12;
const TOUR_MOBILE_NAV_RESERVED_SPACE = 84;

const STEPS: TourStepDefinition[] = [
  {
    id: "overview",
    targetSelectors: [
      "[data-tour-id='campaign-current-campaign']",
      "[data-tour-id='campaign-mobile-title']",
      "[data-tour-id='campaign-main-workspace']",
    ],
    preferredPlacement: "right-start",
    fallbackPlacements: ["right-center", "bottom-start", "bottom-center", "center"],
  },
  {
    id: "dashboard",
    targetSelectors: [
      "[data-tour-id='campaign-nav-dashboard']",
      "[data-tour-id='campaign-mobile-nav-dashboard']",
    ],
    preferredPlacement: "right-start",
    fallbackPlacements: ["right-center", "bottom-start", "bottom-center", "center"],
  },
  {
    id: "canvas",
    targetSelectors: [
      "[data-tour-id='campaign-nav-canvas']",
      "[data-tour-id='campaign-mobile-nav-more']",
    ],
    preferredPlacement: "right-center",
    fallbackPlacements: ["right-start", "right-end", "top-center", "bottom-center", "center"],
  },
  {
    id: "entities",
    targetSelectors: [
      "[data-tour-id='campaign-action-new-entity']",
      "[data-tour-id='campaign-nav-entities']",
      "[data-tour-id='campaign-mobile-nav-entities']",
    ],
    preferredPlacement: "right-center",
    fallbackPlacements: ["bottom-center", "left-center", "top-center", "center"],
  },
  {
    id: "session",
    targetSelectors: [
      "[data-tour-id='campaign-action-session']",
      "[data-tour-id='campaign-nav-session']",
      "[data-tour-id='campaign-mobile-nav-session']",
    ],
    preferredPlacement: "right-center",
    fallbackPlacements: ["bottom-center", "left-center", "top-center", "center"],
  },
  {
    id: "whatNow",
    targetSelectors: [
      "[data-tour-id='campaign-nav-what-now']",
      "[data-tour-id='campaign-mobile-nav-what-now']",
    ],
    preferredPlacement: "right-center",
    fallbackPlacements: ["right-start", "bottom-center", "left-center", "center"],
  },
  {
    id: "graph",
    targetSelectors: [
      "[data-tour-id='campaign-nav-graph']",
      "[data-tour-id='campaign-mobile-nav-more']",
    ],
    preferredPlacement: "right-center",
    fallbackPlacements: ["right-start", "right-end", "bottom-center", "left-center", "center"],
  },
  {
    id: "players",
    targetSelectors: [
      "[data-tour-id='campaign-nav-players']",
      "[data-tour-id='campaign-nav-knowledge']",
      "[data-tour-id='campaign-mobile-nav-more']",
    ],
    preferredPlacement: "right-end",
    fallbackPlacements: ["right-center", "top-center", "left-end", "center"],
  },
  {
    id: "settings",
    targetSelectors: [
      "[data-tour-id='campaign-nav-settings']",
      "[data-tour-id='campaign-mobile-nav-more']",
    ],
    preferredPlacement: "right-end",
    fallbackPlacements: ["right-center", "top-center", "left-end", "center"],
  },
];

function isElementVisible(element: Element): element is HTMLElement {
  if (!(element instanceof HTMLElement)) return false;
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
}

function findFirstVisibleTarget(selectors: string[]): HTMLElement | null {
  for (const selector of selectors) {
    const candidates = Array.from(document.querySelectorAll(selector));
    const visible = candidates.find(isElementVisible);
    if (visible) return visible;
  }
  return null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function toMeasuredRect(rect: DOMRect): MeasuredRect {
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    right: rect.right,
    bottom: rect.bottom,
  };
}

function getViewportSize(): ViewportSize {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function getTourCardWidth(viewport: ViewportSize): number {
  return Math.min(TOUR_CARD_MAX_WIDTH, Math.max(TOUR_CARD_MIN_WIDTH, viewport.width - TOUR_MARGIN * 2));
}

function getTourCardHeight(cardSize: MeasuredSize | null, viewport: ViewportSize): number {
  const availableHeight = Math.max(180, viewport.height - TOUR_MARGIN * 2);
  return Math.min(cardSize?.height ?? 410, availableHeight);
}

function uniquePlacements(placements: TourPlacement[]): TourPlacement[] {
  return Array.from(new Set(placements));
}

function getRawCandidatePosition(
  placement: TourPlacement,
  target: MeasuredRect,
  cardSize: MeasuredSize,
): Pick<TourPlacementCandidate, "left" | "top"> {
  const [side, alignment] = placement.split("-") as [TourPlacementSide, TourPlacementAlignment];

  if (side === "top" || side === "bottom") {
    const top = side === "top" ? target.top - TOUR_OFFSET - cardSize.height : target.bottom + TOUR_OFFSET;
    const leftByAlignment: Record<TourPlacementAlignment, number> = {
      start: target.left,
      center: target.left + target.width / 2 - cardSize.width / 2,
      end: target.right - cardSize.width,
    };

    return { top, left: leftByAlignment[alignment] };
  }

  const left = side === "left" ? target.left - TOUR_OFFSET - cardSize.width : target.right + TOUR_OFFSET;
  const topByAlignment: Record<TourPlacementAlignment, number> = {
    start: target.top,
    center: target.top + target.height / 2 - cardSize.height / 2,
    end: target.bottom - cardSize.height,
  };

  return { left, top: topByAlignment[alignment] };
}

function getOverflowAmount(left: number, top: number, cardSize: MeasuredSize, viewport: ViewportSize): number {
  const overflowLeft = Math.max(TOUR_MARGIN - left, 0);
  const overflowTop = Math.max(TOUR_MARGIN - top, 0);
  const overflowRight = Math.max(left + cardSize.width - (viewport.width - TOUR_MARGIN), 0);
  const overflowBottom = Math.max(top + cardSize.height - (viewport.height - TOUR_MARGIN), 0);
  return overflowLeft + overflowTop + overflowRight + overflowBottom;
}

function getOverlapArea(a: MeasuredRect, b: MeasuredRect): number {
  const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return width * height;
}

function createPlacementCandidate(
  placement: TourPlacement,
  target: MeasuredRect,
  cardSize: MeasuredSize,
  viewport: ViewportSize,
  order: number,
): TourPlacementCandidate {
  const maxLeft = Math.max(TOUR_MARGIN, viewport.width - cardSize.width - TOUR_MARGIN);
  const maxTop = Math.max(TOUR_MARGIN, viewport.height - cardSize.height - TOUR_MARGIN);
  const raw = placement === "center"
    ? {
        left: (viewport.width - cardSize.width) / 2,
        top: (viewport.height - cardSize.height) / 2,
      }
    : getRawCandidatePosition(placement, target, cardSize);
  const left = clamp(raw.left, TOUR_MARGIN, maxLeft);
  const top = clamp(raw.top, TOUR_MARGIN, maxTop);
  const placedRect: MeasuredRect = {
    left,
    top,
    width: cardSize.width,
    height: cardSize.height,
    right: left + cardSize.width,
    bottom: top + cardSize.height,
  };
  const overflow = getOverflowAmount(raw.left, raw.top, cardSize, viewport);
  const overlap = getOverlapArea(placedRect, target);
  const centerPenalty = placement === "center" ? 40 : 0;

  return {
    placement,
    left,
    top,
    score: overflow * 100 + overlap * 0.15 + order * 8 + centerPenalty,
  };
}

function calculateTourPlacement(
  targetRect: MeasuredRect | null,
  cardSize: MeasuredSize | null,
  step: TourStepDefinition,
): TourPlacementResult {
  const viewport = getViewportSize();
  const isMobile = viewport.width < TOUR_MOBILE_BREAKPOINT;

  if (isMobile) {
    const shouldReserveBottomNavSpace = Boolean(targetRect && targetRect.bottom > viewport.height - 110);
    return {
      placement: "mobile-sheet",
      style: {
        left: TOUR_MOBILE_SHEET_MARGIN,
        right: TOUR_MOBILE_SHEET_MARGIN,
        bottom: shouldReserveBottomNavSpace ? TOUR_MOBILE_NAV_RESERVED_SPACE : TOUR_MOBILE_SHEET_MARGIN,
        width: "auto",
        maxHeight: "min(72vh, 560px)",
      },
    };
  }

  const width = getTourCardWidth(viewport);
  const height = getTourCardHeight(cardSize, viewport);
  const resolvedCardSize: MeasuredSize = { width, height };
  const maxLeft = Math.max(TOUR_MARGIN, viewport.width - width - TOUR_MARGIN);
  const maxTop = Math.max(TOUR_MARGIN, viewport.height - height - TOUR_MARGIN);

  if (!targetRect) {
    return {
      placement: "center",
      style: {
        width,
        maxHeight: viewport.height - TOUR_MARGIN * 2,
        left: clamp((viewport.width - width) / 2, TOUR_MARGIN, maxLeft),
        top: clamp((viewport.height - height) / 2, TOUR_MARGIN, maxTop),
      },
    };
  }

  const placements = uniquePlacements([
    step.preferredPlacement,
    ...step.fallbackPlacements,
    "right-center",
    "left-center",
    "bottom-center",
    "top-center",
    "center",
  ]);
  const candidates = placements.map((placement, index) => createPlacementCandidate(placement, targetRect, resolvedCardSize, viewport, index));
  const bestCandidate = candidates.reduce((best, candidate) => candidate.score < best.score ? candidate : best, candidates[0]);

  return {
    placement: bestCandidate.placement,
    style: {
      width,
      maxHeight: viewport.height - TOUR_MARGIN * 2,
      left: bestCandidate.left,
      top: bestCandidate.top,
    },
  };
}

export function CampaignGuidedTour({ campaignId, enabled }: CampaignGuidedTourProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<MeasuredRect | null>(null);
  const [cardSize, setCardSize] = useState<MeasuredSize | null>(null);
  const [hasStoredState, setHasStoredState] = useState(false);
  const autoStartAttemptedRef = useRef(false);
  const cardRef = useRef<HTMLElement | null>(null);

  const currentStep = STEPS[stepIndex] ?? STEPS[0];
  const totalSteps = STEPS.length;
  const currentNumber = stepIndex + 1;

  const hasFinishedForCampaign = useMemo(() => {
    const stored = readCampaignGuidedTourState(campaignId);
    return Boolean(stored.completedAt || stored.dismissedAt);
  }, [campaignId, hasStoredState]);

  const startTour = (fromBeginning = true) => {
    if (fromBeginning) setStepIndex(0);
    setIsOpen(true);
  };

  const dismissTour = () => {
    writeCampaignGuidedTourState(campaignId, { dismissedAt: new Date().toISOString() });
    setHasStoredState((value) => !value);
    clearPendingCampaignGuidedTour(campaignId);
    setIsOpen(false);
  };

  const finishTour = () => {
    writeCampaignGuidedTourState(campaignId, { completedAt: new Date().toISOString() });
    setHasStoredState((value) => !value);
    clearPendingCampaignGuidedTour(campaignId);
    setIsOpen(false);
  };

  useEffect(() => {
    autoStartAttemptedRef.current = false;
    setIsOpen(false);
    setStepIndex(0);
    setTargetRect(null);
    setCardSize(null);
  }, [campaignId]);

  useEffect(() => {
    if (!enabled || autoStartAttemptedRef.current) return;
    const pendingCampaignId = getPendingCampaignGuidedTourId();
    if (pendingCampaignId !== campaignId || hasFinishedForCampaign) return;

    autoStartAttemptedRef.current = true;
    const startTimer = window.setTimeout(() => startTour(true), 300);
    return () => window.clearTimeout(startTimer);
  }, [campaignId, enabled, hasFinishedForCampaign]);

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<{ campaignId?: string }>).detail;
      if (detail?.campaignId && detail.campaignId !== campaignId) return;
      startTour(true);
    };
    window.addEventListener("dmcc:start-campaign-tour", listener);
    return () => window.removeEventListener("dmcc:start-campaign-tour", listener);
  }, [campaignId]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    let frameId = 0;
    const measure = () => {
      const target = findFirstVisibleTarget(currentStep.targetSelectors);
      if (!target) {
        setTargetRect(null);
        return;
      }
      target.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
      frameId = window.requestAnimationFrame(() => {
        setTargetRect(toMeasuredRect(target.getBoundingClientRect()));
      });
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [currentStep, isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const cardElement = cardRef.current;
    if (!cardElement) return;

    const measureCard = () => {
      const rect = cardElement.getBoundingClientRect();
      const nextSize = {
        width: Math.ceil(rect.width),
        height: Math.ceil(rect.height),
      };
      setCardSize((currentSize) => {
        if (currentSize?.width === nextSize.width && currentSize.height === nextSize.height) return currentSize;
        return nextSize;
      });
    };

    measureCard();
    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measureCard) : null;
    resizeObserver?.observe(cardElement);
    window.addEventListener("resize", measureCard);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", measureCard);
    };
  }, [currentStep.id, isOpen, stepIndex, t]);

  useEffect(() => {
    if (!isOpen) return;

    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dismissTour();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        if (stepIndex === totalSteps - 1) finishTour();
        else setStepIndex((index) => Math.min(index + 1, totalSteps - 1));
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setStepIndex((index) => Math.max(index - 1, 0));
      }
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [isOpen, stepIndex, totalSteps]);

  if (!enabled) return null;

  const stepTitle = t(`campaignTour.steps.${currentStep.id}.title`);
  const stepBody = t(`campaignTour.steps.${currentStep.id}.body`);
  const stepDetail = t(`campaignTour.steps.${currentStep.id}.detail`);
  const stepTip = t(`campaignTour.steps.${currentStep.id}.tip`);
  const placement = calculateTourPlacement(targetRect, cardSize, currentStep);
  const cardStyle = placement.style;
  const highlightStyle: React.CSSProperties | undefined = targetRect
    ? {
        top: targetRect.top - 8,
        left: targetRect.left - 8,
        width: targetRect.width + 16,
        height: targetRect.height + 16,
      }
    : undefined;

  return (
    <>
      {isOpen && (
        <div className="campaign-tour" role="presentation">
          <div className="campaign-tour__scrim" aria-hidden="true" />
          {highlightStyle ? <div className="campaign-tour__highlight" style={highlightStyle} aria-hidden="true" /> : null}

          <section
            ref={cardRef}
            className="campaign-tour__card"
            data-placement={placement.placement}
            role="dialog"
            aria-modal="true"
            aria-labelledby="campaign-tour-title"
            aria-describedby="campaign-tour-description"
            style={cardStyle}
          >
            <header className="campaign-tour__header">
              <div>
                <span className="campaign-tour__eyebrow">
                  {t("campaignTour.eyebrow", { current: currentNumber, total: totalSteps })}
                </span>
                <h2 id="campaign-tour-title">{stepTitle}</h2>
              </div>
              <button
                type="button"
                className="campaign-tour__icon-btn"
                onClick={dismissTour}
                aria-label={t("campaignTour.skip")}
              >
                <X size={16} />
              </button>
            </header>

            <div id="campaign-tour-description" className="campaign-tour__content">
              <p>{stepBody}</p>
              <p>{stepDetail}</p>
              <p className="campaign-tour__tip">{stepTip}</p>
            </div>

            <div className="campaign-tour__progress" aria-label={t("campaignTour.progress", { current: currentNumber, total: totalSteps })}>
              {STEPS.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  className={`campaign-tour__dot ${index === stepIndex ? "active" : ""} ${index < stepIndex ? "done" : ""}`}
                  onClick={() => setStepIndex(index)}
                  aria-label={t("campaignTour.goToStep", { number: index + 1, title: t(`campaignTour.steps.${step.id}.title`) })}
                />
              ))}
            </div>

            <footer className="campaign-tour__footer">
              <button type="button" className="btn btn-secondary btn-sm" onClick={dismissTour}>
                {t("campaignTour.skip")}
              </button>
              <div className="campaign-tour__footer-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setStepIndex((index) => Math.max(index - 1, 0))}
                  disabled={stepIndex === 0}
                >
                  <ChevronLeft size={14} />
                  {t("campaignTour.previous")}
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    if (stepIndex === totalSteps - 1) finishTour();
                    else setStepIndex((index) => Math.min(index + 1, totalSteps - 1));
                  }}
                >
                  {stepIndex === totalSteps - 1 ? t("campaignTour.finish") : t("campaignTour.next")}
                  {stepIndex === totalSteps - 1 ? null : <ChevronRight size={14} />}
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
