import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";

interface RelationCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RelationCreateModal({ isOpen, onClose }: RelationCreateModalProps) {
  const { campaignState, createRelation, error } = useCampaignStore();

  const [relationForm, setRelationForm] = useState({
    sourceEntityId: "",
    targetEntityId: "",
    relationType: "located_in"
  });

  const handleCreateRelationSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!relationForm.sourceEntityId || !relationForm.targetEntityId) return;
    await createRelation(relationForm);
    // If createRelation set an error (duplicate), keep modal open — user sees the error
    const storeError = useCampaignStore.getState().error;
    if (!storeError) {
      onClose();
      setRelationForm({ sourceEntityId: "", targetEntityId: "", relationType: "located_in" });
    }
  };

  if (!isOpen) return null;
  if (!campaignState) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 style={{ fontWeight: "700" }}>Crear relación</h2>
          <button className="btn btn-icon btn-secondary" onClick={() => {
            useCampaignStore.setState({ error: null });
            onClose();
          }}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleCreateRelationSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Source Entity</label>
              <select
                className="form-select"
                value={relationForm.sourceEntityId}
                onChange={(e) => setRelationForm({ ...relationForm, sourceEntityId: e.target.value })}
                required
              >
                <option value="">-- Select Source Node --</option>
                {campaignState.entities.filter(e => !e.archived).map(e => (
                  <option key={e.entityId} value={e.entityId}>[{e.entityType}] {e.title}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Relation Type</label>
              <select
                className="form-select"
                value={relationForm.relationType}
                onChange={(e) => setRelationForm({ ...relationForm, relationType: e.target.value })}
              >
                <option value="located_in">located_in</option>
                <option value="lives_in">lives_in</option>
                <option value="member_of">member_of</option>
                <option value="ally_of">ally_of</option>
                <option value="enemy_of">enemy_of</option>
                <option value="hides">hides</option>
                <option value="points_to">points_to</option>
                <option value="causes">causes</option>
                <option value="contradicts">contradicts</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Entity</label>
              <select
                className="form-select"
                value={relationForm.targetEntityId}
                onChange={(e) => setRelationForm({ ...relationForm, targetEntityId: e.target.value })}
                required
              >
                <option value="">-- Select Target Node --</option>
                {campaignState.entities.filter(e => !e.archived).map(e => (
                  <option key={e.entityId} value={e.entityId}>[{e.entityType}] {e.title}</option>
                ))}
              </select>
            </div>
          </div>
          {error?.includes("Duplicate relation") && (
            <div style={{ padding: "10px 16px", backgroundColor: "hsl(30, 60%, 15%)", borderTop: "1px solid hsl(30, 60%, 30%)", display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem" }}>
              <AlertTriangle size={14} style={{ color: "hsl(30, 80%, 60%)", flexShrink: 0 }} />
              <span style={{ color: "hsl(30, 80%, 70%)" }}>Duplicate relation already exists. Create anyway?</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ marginLeft: "auto", flexShrink: 0 }}
                onClick={async () => {
                  useCampaignStore.setState({ error: null });
                  await createRelation({ ...relationForm, force: true } as any);
                  onClose();
                  setRelationForm({ sourceEntityId: "", targetEntityId: "", relationType: "located_in" });
                }}
              >
                Crear igualmente
              </button>
            </div>
          )}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => {
              useCampaignStore.setState({ error: null });
              onClose();
            }}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Registrar relación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
