import React, { useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { Copy, Play, Power, RefreshCw, Users } from "lucide-react";
import { closeLiveTable, getLiveTable, openLiveTable } from "../../shared/api/webProductClient.js";

export function LiveTablePage() {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };
  const [liveTable, setLiveTable] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [durationHours, setDurationHours] = useState(4);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getLiveTable(campaignId);
      setLiveTable(result.liveTable ?? null);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [campaignId]);

  const handleOpen = async () => {
    setError(null);
    try {
      const result = await openLiveTable(campaignId, { durationHours });
      setLiveTable(result.liveTable);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    }
  };

  const handleClose = async () => {
    if (!liveTable?.liveTableId) return;
    setError(null);
    try {
      await closeLiveTable(campaignId, liveTable.liveTableId);
      setLiveTable(null);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    }
  };

  const copyCode = async () => {
    if (!liveTable?.shortCode) return;
    await navigator.clipboard?.writeText(liveTable.shortCode).catch(() => undefined);
  };

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div>
        <p style={{ margin: "0 0 6px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".12em", fontSize: 12 }}>Mesa en vivo</p>
        <h1 style={{ margin: 0 }}>Live Table Mode</h1>
        <p style={{ color: "var(--text-muted)", maxWidth: 720 }}>Abre una mesa temporal para que los jugadores reciban revelaciones y consulten el portal durante la sesión. No usa red local: es un código de mesa web.</p>
      </div>

      {error && <div className="card" style={{ padding: 16, color: "var(--color-danger)" }}>{error}</div>}
      {loading ? <div className="card" style={{ padding: 24 }}>Cargando modo mesa...</div> : (
        <div className="card" style={{ padding: 24, display: "grid", gap: 18 }}>
          {liveTable ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <p style={{ margin: 0, color: "var(--text-muted)" }}>Código activo</p>
                  <strong style={{ fontSize: "clamp(2rem, 8vw, 4rem)", letterSpacing: ".12em" }}>{liveTable.shortCode}</strong>
                  <p style={{ margin: "8px 0 0", color: "var(--text-muted)" }}>Caduca: {new Date(liveTable.expiresAt).toLocaleString()}</p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <button type="button" className="btn btn-secondary" onClick={copyCode}><Copy size={16} /> Copiar código</button>
                  <button type="button" className="btn btn-danger" onClick={() => void handleClose()}><Power size={16} /> Cerrar mesa</button>
                </div>
              </div>
              <div style={{ border: "1px solid var(--border-color)", borderRadius: 14, padding: 16, background: "rgba(255,255,255,.025)" }}>
                <Users size={18} /> <strong>Jugadores</strong>
                <p style={{ marginBottom: 0, color: "var(--text-muted)" }}>La presencia en vivo se conectará en la siguiente iteración de UX. Por ahora el código sirve para abrir el portal correcto desde `/api/live-tables/:code/join`.</p>
              </div>
            </>
          ) : (
            <>
              <p style={{ margin: 0, color: "var(--text-muted)" }}>No hay mesa activa. Abre una para esta sesión.</p>
              <label style={{ display: "grid", gap: 6, maxWidth: 240 }}>
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Duración</span>
                <select className="form-input" value={durationHours} onChange={(event) => setDurationHours(Number(event.target.value))}>
                  <option value={2}>2 horas</option>
                  <option value={4}>4 horas</option>
                  <option value={8}>8 horas</option>
                  <option value={24}>24 horas</option>
                </select>
              </label>
              <button type="button" className="btn btn-primary" onClick={() => void handleOpen()}><Play size={16} /> Abrir modo mesa</button>
            </>
          )}
        </div>
      )}
      <button type="button" className="btn btn-secondary" onClick={() => void load()}><RefreshCw size={16} /> Actualizar</button>
    </div>
  );
}
