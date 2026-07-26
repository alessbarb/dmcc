export interface CampaignStatusMetric {
  key: string;
  label: string;
  value: number;
  onClick: () => void;
}

interface CampaignStatusStripProps {
  label: string;
  metrics: CampaignStatusMetric[];
}

/** Compact navigable campaign indicators; intentionally not a grid of cards. */
export function CampaignStatusStrip({ label, metrics }: CampaignStatusStripProps) {
  return (
    <div className="dashboard-status-strip" aria-label={label}>
      {metrics.map((metric) => (
        <button key={metric.key} type="button" className="dashboard-status-strip__item" onClick={metric.onClick}>
          <strong>{metric.value}</strong>
          <span>{metric.label}</span>
        </button>
      ))}
    </div>
  );
}
