import React, { useEffect, useState, useRef } from "react";

export function RpgPortalBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const d20Style: React.CSSProperties = {
    transform: isHovered
      ? `translate(${(mousePos.x - 50) * 0.2}px, ${(mousePos.y - 50) * 0.2}px) rotate(${((mousePos.x - 50) * 0.08)}deg)`
      : "translate(0px, 0px) rotate(0deg)",
    transition: "transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)",
    transformOrigin: "500px 200px",
  };

  return (
    <div ref={containerRef} className="rpg-portal-background" aria-hidden="true">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 400"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <pattern id="battleGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--theme-graph-grid)" strokeWidth="1" />
          </pattern>
          <radialGradient id="portalGlowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--theme-accents-primary-foreground)" stopOpacity="0.12" />
            <stop offset="60%" stopColor="var(--theme-accents-secondary-foreground)" stopOpacity="0.03" />
            <stop offset="100%" stopColor="var(--theme-accents-primary-foreground)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="d20Glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--theme-accents-secondary-foreground)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--theme-accents-secondary-foreground)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#battleGrid)" />
        <circle cx="500" cy="200" r="320" fill="url(#portalGlowGrad)" />

        <g className="summoning-circle-group">
          <circle
            cx="500"
            cy="200"
            r="160"
            fill="none"
            stroke="var(--theme-accents-primary-foreground)"
            strokeWidth="1.5"
            strokeDasharray="25 15 5 15"
            opacity="0.25"
            className="rpg-portal-rotate-cw"
          />
          <circle
            cx="500"
            cy="200"
            r="135"
            fill="none"
            stroke="var(--theme-accents-secondary-foreground)"
            strokeWidth="1"
            strokeDasharray="2 12"
            opacity="0.3"
            className="rpg-portal-rotate-ccw"
          />
          <circle
            cx="500"
            cy="200"
            r="110"
            fill="none"
            stroke="var(--theme-accents-primary-foreground)"
            strokeWidth="0.5"
            opacity="0.15"
          />

          <line x1="500" y1="30" x2="500" y2="370" stroke="var(--theme-accents-secondary-foreground)" strokeWidth="0.5" opacity="0.08" strokeDasharray="4 8" />
          <line x1="330" y1="200" x2="670" y2="200" stroke="var(--theme-accents-secondary-foreground)" strokeWidth="0.5" opacity="0.08" strokeDasharray="4 8" />
          <line x1="380" y1="80" x2="620" y2="320" stroke="var(--theme-accents-primary-foreground)" strokeWidth="0.5" opacity="0.06" strokeDasharray="4 8" />
          <line x1="380" y1="320" x2="620" y2="80" stroke="var(--theme-accents-primary-foreground)" strokeWidth="0.5" opacity="0.06" strokeDasharray="4 8" />
        </g>

        <g style={d20Style} className="rpg-d20-group">
          <circle cx="500" cy="200" r="100" fill="url(#d20Glow)" opacity="0.4" />

          <polygon
            points="580,200 540,269 460,269 420,200 460,131 540,131"
            fill="var(--theme-media-overlay-subtle)"
            stroke="var(--theme-accents-secondary-foreground)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            className="rpg-d20-hexagon"
          />

          <g stroke="var(--theme-accents-secondary-foreground)" strokeWidth="1" strokeLinejoin="round" opacity="0.6">
            <line x1="528" y1="216" x2="580" y2="200" />
            <line x1="528" y1="216" x2="540" y2="269" />
            <line x1="528" y1="216" x2="540" y2="131" />
            <line x1="472" y1="216" x2="540" y2="269" />
            <line x1="472" y1="216" x2="460" y2="269" />
            <line x1="472" y1="216" x2="420" y2="200" />
            <line x1="500" y1="168" x2="420" y2="200" />
            <line x1="500" y1="168" x2="460" y2="131" />
            <line x1="500" y1="168" x2="540" y2="131" />
          </g>

          <polygon
            points="528,216 472,216 500,168"
            fill="var(--theme-surfaces-selected)"
            stroke="var(--theme-accents-secondary-foreground)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            className="rpg-d20-triangle"
          />

          <text
            x="500"
            y="206"
            textAnchor="middle"
            fill="var(--theme-text-on-media)"
            fontSize="18"
            fontWeight="900"
            fontFamily="var(--font-sans)"
            className="rpg-d20-text"
            style={{
              filter: "drop-shadow(0 0 5px var(--theme-accents-secondary-foreground))",
              userSelect: "none",
            }}
          >
            20
          </text>
        </g>
      </svg>

      <div className="rpg-portal-sparks">
        <div className="spark spark-1"></div>
        <div className="spark spark-2"></div>
        <div className="spark spark-3"></div>
        <div className="spark spark-4"></div>
        <div className="spark spark-5"></div>
      </div>
    </div>
  );
}
