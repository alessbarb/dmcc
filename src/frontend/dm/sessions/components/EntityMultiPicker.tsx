import type { Entity } from "../../../shared/stores/campaignStore.js";
import type { MaybeCampaignState } from "../sessionTypes.js";
import { uniqueIds } from "../prep/sessionPrepUtils.js";

export function EntityMultiPicker({
  label,
  help,
  campaignState,
  ids,
  onChange,
  typeFilter,
}: {
  label: string;
  help?: string;
  campaignState: MaybeCampaignState;
  ids: string[];
  onChange: (ids: string[]) => void;
  typeFilter?: string | string[];
}) {
  const entities = (campaignState?.entities ?? []).filter((entity: Entity) => {
    if (entity.archived) return false;
    if (!typeFilter) return true;
    const allowed = Array.isArray(typeFilter) ? typeFilter : [typeFilter];
    return allowed.includes(entity.entityType);
  });

  const toggle = (entityId: string) => {
    onChange(ids.includes(entityId) ? ids.filter((id) => id !== entityId) : uniqueIds([...ids, entityId]));
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {help && <p style={{ fontSize: "0.78rem", color: "var(--theme-text-secondary)", marginBottom: "8px" }}>{help}</p>}
      {entities.length === 0 ? (
        <p style={{ fontSize: "0.82rem", color: "var(--theme-text-secondary)", padding: "10px 0" }}>—</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", maxHeight: "120px", overflowY: "auto", padding: "4px" }}>
          {entities.map((entity: Entity) => (
            <button
              key={entity.entityId}
              type="button"
              className={`btn btn-sm ${ids.includes(entity.entityId) ? "btn-primary" : "btn-secondary"}`}
              onClick={() => toggle(entity.entityId)}
              style={{ fontSize: "0.76rem", padding: "4px 9px" }}
            >
              {entity.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
