import { useEffect, useMemo, useState } from "react";
import { Clock, Copy, Play, Power, Radio, RefreshCw, Users, X } from "lucide-react";
import { closeLiveTable, getLiveTable, openLiveTable, type LiveTableSummary } from "../../shared/api/webProductClient.js";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

type LiveTableModalProps = {
  campaignId: string;
  isOpen: boolean;
  onClose: () => void;
  activeSessionId?: string | null;
  initialLiveTable?: LiveTableSummary | null;
  onLiveTableChange?: (liveTable: LiveTableSummary | null) => void;
};

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function LiveTableModal({
  campaignId,
  isOpen,
  onClose,
  activeSessionId = null,
  initialLiveTable = null,
  onLiveTableChange,
}: LiveTableModalProps) {
  const [liveTable, setLiveTable] = useState<LiveTableSummary | null>(initialLiveTable);
  const [durationHours, setDurationHours] = useState(4);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const title = liveTable ? "Mesa en vivo activa" : "Abrir modo mesa";
  const expiresLabel = useMemo(() => formatDateTime(liveTable?.expiresAt), [liveTable?.expiresAt]);

  const setLiveTableAndNotify = (next: LiveTableSummary | null) => {
    setLiveTable(next);
    onLiveTableChange?.(next);
  };

  const load = async () => {
    if (!campaignId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getLiveTable(campaignId);
      setLiveTableAndNotify(result.liveTable ?? null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLiveTable(initialLiveTable ?? null);
  }, [initialLiveTable]);

  useEffect(() => {
    if (!isOpen) return;
    setCopied(false);
    void load();
  }, [campaignId, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const handleOpen = async () => {
    setWorking(true);
    setError(null);
    try {
      const result = await openLiveTable(campaignId, { activeSessionId, durationHours });
      setLiveTableAndNotify(result.liveTable);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setWorking(false);
    }
  };

  const handleCloseLiveTable = async () => {
    if (!liveTable?.liveTableId) return;
    setWorking(true);
    setError(null);
    try {
      await closeLiveTable(campaignId, liveTable.liveTableId);
      setLiveTableAndNotify(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setWorking(false);
    }
  };

  const copyCode = async () => {
    if (!liveTable?.shortCode) return;
    await navigator.clipboard?.writeText(liveTable.shortCode).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay live-table-modal-overlay" role="presentation" onClick={onClose}>
      <section
        className="modal-content live-table-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="live-table-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header live-table-modal__header">
          <div>
            <p className="live-table-modal__eyebrow"><Radio size={14} /> Modo mesa</p>
            <h2 id="live-table-modal-title">{title}</h2>
            <p>Comparte un código temporal sin salir de tu pantalla actual. Los jugadores entran desde su portal y solo reciben datos filtrados.</p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar modo mesa">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body live-table-modal__body">
          {error && <div className="live-table-modal__error">{error}</div>}

          {loading ? (
            <div className="live-table-modal__loading"><RefreshCw size={18} /> Cargando mesa...</div>
          ) : liveTable ? (
            <div className="live-table-modal__active">
              <div className="live-table-modal__code-card">
                <span>Código activo</span>
                <strong>{liveTable.shortCode}</strong>
                <small><Clock size={13} /> Caduca: {expiresLabel}</small>
              </div>

              <div className="live-table-modal__actions">
                <button type="button" className="btn btn-secondary" onClick={() => void copyCode()}>
                  <Copy size={16} /> {copied ? "Copiado" : "Copiar código"}
                </button>
                <button type="button" className="btn btn-danger" disabled={working} onClick={() => void handleCloseLiveTable()}>
                  <Power size={16} /> Cerrar mesa
                </button>
              </div>

              <div className="live-table-modal__info-card">
                <Users size={18} />
                <div>
                  <strong>Jugadores conectados</strong>
                  <p>La presencia en vivo queda dentro de la app. Las revelaciones llegan por SSE como metadatos y el portal vuelve a consultar endpoints filtrados.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="live-table-modal__setup">
              <div className="live-table-modal__setup-copy">
                <strong>Abre una mesa temporal para esta sesión.</strong>
                <p>Ideal para revelar pistas, compartir handouts y mantener el portal de jugador sincronizado sin convertirlo en una página aparte.</p>
              </div>

              <label className="live-table-modal__field">
                <span>Duración</span>
                <select className="form-input" value={durationHours} onChange={(event) => setDurationHours(Number(event.target.value))}>
                  <option value={2}>2 horas</option>
                  <option value={4}>4 horas</option>
                  <option value={8}>8 horas</option>
                  <option value={24}>24 horas</option>
                </select>
              </label>
            </div>
          )}
        </div>

        <div className="modal-footer live-table-modal__footer">
          <button type="button" className="btn btn-secondary" onClick={() => void load()} disabled={loading || working}>
            <RefreshCw size={16} /> Actualizar
          </button>
          {!liveTable && (
            <button type="button" className="btn btn-primary" disabled={working || loading} onClick={() => void handleOpen()}>
              <Play size={16} /> Abrir modo mesa
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
