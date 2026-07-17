import type { Entity } from "../../../shared/stores/campaignStore.js";
import type { MaybeCampaignState } from "../sessionTypes.js";
import { uniqueIds } from "../prep/sessionPrepUtils.js";
import "./session-forms.css";

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
      {help && <p className="session-form-help">{help}</p>}
      {entities.length === 0 ? (
        <p className="session-form-empty-inline">—</p>
      ) : (
        <div className="session-entity-picker">
          {entities.map((entity: Entity) => (
            <button
              key={entity.entityId}
              type="button"
              className={`btn btn-sm session-entity-picker__option ${ids.includes(entity.entityId) ? "btn-primary" : "btn-secondary"}`}
              onClick={() => toggle(entity.entityId)}
            >
              {entity.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
