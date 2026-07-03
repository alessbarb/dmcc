import React, { useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { BookOpen, EyeOff, GitFork, Lightbulb, Search } from "lucide-react";
import { searchCampaign } from "../../shared/api/webProductClient.js";

export interface SearchPageProps {
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

function iconFor(type: string) {
  if (type === "fact") return <BookOpen size={16} />;
  if (type === "relation") return <GitFork size={16} />;
  if (type === "clue") return <Lightbulb size={16} />;
  if (type === "objective") return <Search size={16} />;
  return <EyeOff size={16} />;
}

export function SearchPage(props: SearchPageProps = {}) {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };
  const [queryLocal, setQueryLocal] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const query = props.searchQuery ?? queryLocal;
  const setQuery = props.setSearchQuery ?? setQueryLocal;

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }
    const handle = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await searchCampaign(campaignId, q);
        setResults(response.results ?? []);
        setError(null);
      } catch (err: any) {
        setError(err?.message ?? String(err));
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => window.clearTimeout(handle);
  }, [campaignId, query]);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div>
        <p style={{ margin: "0 0 6px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".12em", fontSize: 12 }}>Búsqueda segura</p>
        <h1 style={{ margin: 0 }}>Busca en toda la memoria de DM</h1>
        <p style={{ color: "var(--text-muted)", maxWidth: 760 }}>Esta búsqueda consulta el backend y puede encontrar contenido público y secreto porque estás en vista DM. El portal jugador usa otro endpoint filtrado.</p>
      </div>
      <div className="card" style={{ padding: 18 }}>
        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ color: "var(--text-muted)", fontSize: 13 }}>PNJ, pista, secreto, relación, objetivo...</span>
          <div style={{ position: "relative" }}>
            <Search size={17} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input className="form-input" style={{ paddingLeft: 38 }} value={query} onChange={(event) => setQuery(event.target.value)} autoFocus placeholder="Busca en la campaña..." />
          </div>
        </label>
      </div>
      {error && <div className="card" style={{ padding: 16, color: "var(--color-danger)" }}>{error}</div>}
      {loading && <div className="card" style={{ padding: 16 }}>Buscando...</div>}
      {!loading && query.trim().length >= 2 && results.length === 0 && !error && <div className="card" style={{ padding: 24, color: "var(--text-muted)" }}>No hay resultados.</div>}
      <div style={{ display: "grid", gap: 10 }}>
        {results.map((result, index) => {
          const item = result.item ?? {};
          return (
            <article key={`${result.type}-${item.id ?? index}`} className="card" style={{ padding: 16, display: "grid", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: ".08em" }}>{iconFor(result.type)} {result.type} · {item.visibility ?? "dm"}</div>
              <strong style={{ fontSize: 17 }}>{item.title ?? item.id ?? "Resultado"}</strong>
              {item.summary && <p style={{ margin: 0, color: "var(--text-muted)", lineHeight: 1.5 }}>{item.summary}</p>}
              {item.dmSummary && <p style={{ margin: 0, color: "var(--color-warning)", lineHeight: 1.5 }}>DM: {item.dmSummary}</p>}
            </article>
          );
        })}
      </div>
    </div>
  );
}
