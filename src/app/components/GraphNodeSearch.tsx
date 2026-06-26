import Fuse from "fuse.js";
import { memo, useEffect, useMemo, useRef, useState, useDeferredValue } from "react";
import { Search, X } from "lucide-react";

export type GraphSearchItem = {
  nodeId: string;
  title: string;
  type: string;
  summary?: string;
  content?: string;
  status?: string;
  importance?: string;
  metadataText?: string;
};

type GraphNodeSearchProps = {
  items: GraphSearchItem[];
  onSelectNode: (nodeId: string) => void;
};

export const GraphNodeSearch = memo(function GraphNodeSearch({
  items,
  onSelectNode,
}: GraphNodeSearchProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // React prioriza la escritura y retrasa la búsqueda pesada unos frames si hace falta.
  const deferredQuery = useDeferredValue(query);

  const fuse = useMemo(() => {
    return new Fuse(items, {
      threshold: 0.32,
      ignoreLocation: true,
      minMatchCharLength: 2,
      keys: [
        { name: "title", weight: 0.55 },
        { name: "type", weight: 0.12 },
        { name: "summary", weight: 0.16 },
        { name: "content", weight: 0.08 },
        { name: "metadataText", weight: 0.09 },
      ],
    });
  }, [items]);

  const results = useMemo(() => {
    const normalizedQuery = deferredQuery.trim();

    if (normalizedQuery.length < 2) {
      return items.slice(0, 8);
    }

    return fuse.search(normalizedQuery).slice(0, 10).map((result) => result.item);
  }, [deferredQuery, fuse, items]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [deferredQuery]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (isTyping) return;

      if (event.key === "/" || (event.ctrlKey && event.key.toLowerCase() === "k")) {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const selectResult = (nodeId: string) => {
    onSelectNode(nodeId);
    setIsOpen(false);
  };

  return (
    <div className="graph-search">
      <Search size={15} className="graph-search__icon" />

      <input
        ref={inputRef}
        className="form-input graph-search__input"
        type="search"
        placeholder="Buscar nodo por nombre, tipo, secreto, pista..."
        value={query}
        onFocus={() => setIsOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setQuery("");
            setIsOpen(false);
            return;
          }

          if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlightedIndex((index) => Math.min(index + 1, results.length - 1));
            return;
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlightedIndex((index) => Math.max(index - 1, 0));
            return;
          }

          if (event.key === "Enter") {
            event.preventDefault();
            const result = results[highlightedIndex];
            if (result) {
              selectResult(result.nodeId);
            }
          }
        }}
      />

      {query && (
        <button
          type="button"
          className="graph-search__clear"
          aria-label="Limpiar búsqueda"
          onClick={() => {
            setQuery("");
            setIsOpen(false);
            inputRef.current?.focus();
          }}
        >
          <X size={14} />
        </button>
      )}

      {isOpen && results.length > 0 && (
        <div className="graph-search__results">
          {results.map((result, index) => (
            <button
              key={result.nodeId}
              type="button"
              className={`graph-search__result ${
                index === highlightedIndex ? "is-highlighted" : ""
              }`}
              onMouseDown={(event) => {
                event.preventDefault();
                selectResult(result.nodeId);
              }}
            >
              <span className="graph-search__result-title">{result.title}</span>
              <span className="graph-search__result-meta">
                {result.type}
                {result.importance ? ` · ${result.importance}` : ""}
                {result.status ? ` · ${result.status}` : ""}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
