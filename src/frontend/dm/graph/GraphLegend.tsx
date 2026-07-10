import { formatEntityType } from "@shared/i18n/index.js";

export interface GraphLegendProps {
  colors: Record<string, string>;
  locale: string;
  compact?: boolean;
}

export function GraphLegend({ colors, locale, compact = false }: GraphLegendProps) {
  return (
    <div className={compact ? "graph-legend graph-legend--compact" : "graph-legend"}>
      <p className="graph-legend__title">Leyenda</p>
      <div className="graph-legend__grid">
        {Object.entries(colors).map(([type, color]) => (
          <div key={type} className="graph-legend__item">
            <span className="graph-legend__dot" style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}` }} />
            <span>{formatEntityType(type, locale)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
