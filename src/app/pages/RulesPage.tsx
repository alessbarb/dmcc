import React, { useState, useEffect } from "react";
import { Search, Book, Sparkles, Shield, Swords, Wand, HelpCircle, Package, Footprints, Info } from "lucide-react";

interface RuleEntry {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  content: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Reglas de Juego": <Footprints size={16} />,
  "Creación de Personajes": <Book size={16} />,
  "Clases": <Shield size={16} />,
  "Orígenes de Personajes": <Sparkles size={16} />,
  "Dotes": <Sparkles size={16} />,
  "Equipo": <Package size={16} />,
  "Casteo de Conjuros": <Wand size={16} />,
  "Conjuros": <Wand size={16} />,
  "Glosario de Reglas": <HelpCircle size={16} />,
  "Caja de Herramientas de Juego": <Package size={16} />,
  "Objetos Mágicos": <Sparkles size={16} />,
  "Monstruos": <Swords size={16} />,
  "Animales y Bestias": <Swords size={16} />,
};

export function RulesPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Glosario de Reglas");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [rules, setRules] = useState<RuleEntry[]>([]);
  const [selectedRule, setSelectedRule] = useState<RuleEntry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Load categories on mount
  useEffect(() => {
    fetch("/api/rules/categories")
      .then(res => res.json())
      .then(data => {
        if (data.categories) {
          setCategories(data.categories);
          // Set initial category to rules glossary if present, else first category
          if (data.categories.includes("Glosario de Reglas")) {
            setSelectedCategory("Glosario de Reglas");
          } else if (data.categories.length > 0) {
            setSelectedCategory(data.categories[0]);
          }
        }
      })
      .catch(err => console.error("Error loading categories:", err));
  }, []);

  // Fetch rules based on selected category & search query
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.append("category", selectedCategory);
    if (searchQuery) params.append("q", searchQuery);

    fetch(`/api/rules/search?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setRules(data.results || []);
        setTotalCount(data.total || 0);
        setLoading(false);

        // Auto-select first rule if none selected or if selected rule is not in the new results
        if (data.results && data.results.length > 0) {
          const alreadySelected = data.results.find((r: RuleEntry) => selectedRule && r.id === selectedRule.id);
          if (!alreadySelected) {
            setSelectedRule(data.results[0]);
          }
        } else {
          setSelectedRule(null);
        }
      })
      .catch(err => {
        console.error("Error searching rules:", err);
        setLoading(false);
      });
  }, [selectedCategory, searchQuery]);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 100px)", gap: "20px", color: "var(--text-main)" }}>
      {/* Sidebar categories and rules list */}
      <div style={{
        width: "360px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        backgroundColor: "#0d0f1b",
        borderRight: "1px solid var(--border-color)",
        padding: "16px",
        borderRadius: "var(--radius-lg)",
        overflowY: "hidden"
      }}>
        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: "32px", fontSize: "0.85rem", width: "100%" }}
            placeholder="Buscar en el reglamento..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Selector */}
        <div>
          <label className="form-label" style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>CATEGORÍA</label>
          <select
            className="form-select"
            style={{ fontSize: "0.85rem", width: "100%" }}
            value={selectedCategory}
            onChange={e => {
              setSelectedCategory(e.target.value);
            }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Rules list */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>Cargando reglas...</div>
          ) : rules.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>No se encontraron coincidencias.</div>
          ) : (
            rules.map(rule => (
              <div
                key={rule.id}
                onClick={() => setSelectedRule(rule)}
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  backgroundColor: selectedRule?.id === rule.id ? "rgba(59, 130, 246, 0.15)" : "#06070e",
                  border: selectedRule?.id === rule.id ? "1px solid var(--primary)" : "1px solid var(--border-color)",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ fontSize: "0.85rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                  {CATEGORY_ICONS[rule.category] || <Book size={14} />}
                  {rule.title}
                </div>
                {rule.subtitle && (
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", fontStyle: "italic" }}>
                    {rule.subtitle}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textAlign: "right" }}>
          {totalCount} entradas en esta categoría
        </div>
      </div>

      {/* Main Details Panel */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0d0f1b",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        overflowY: "auto",
        border: "1px solid var(--border-color)"
      }}>
        {selectedRule ? (
          <div>
            {/* Header */}
            <div style={{ borderBottom: "2px solid var(--border-color)", paddingBottom: "16px", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{
                  backgroundColor: "rgba(59, 130, 246, 0.2)",
                  color: "var(--primary)",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  {CATEGORY_ICONS[selectedRule.category] || <Book size={12} />}
                  {selectedRule.category}
                </span>
              </div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--secondary)", marginTop: "12px", marginBottom: "4px" }}>
                {selectedRule.title}
              </h2>
              {selectedRule.subtitle && (
                <div style={{ fontSize: "0.95rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                  {selectedRule.subtitle}
                </div>
              )}
            </div>

            {/* Content Body */}
            <div style={{
              fontSize: "0.95rem",
              lineHeight: "1.6",
              whiteSpace: "pre-wrap",
              color: "var(--text-main)",
            }}>
              {/* Highlight special labels or formatting */}
              {selectedRule.content}
            </div>
          </div>
        ) : (
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            gap: "10px"
          }}>
            <Info size={48} style={{ opacity: 0.3 }} />
            <div>Selecciona una regla en el panel izquierdo para ver sus detalles</div>
          </div>
        )}
      </div>
    </div>
  );
}
