export type ParsedCapture =
  | { kind: "note"; text: string }
  | { kind: "npc"; name: string; role: string }
  | { kind: "decision"; text: string }
  | { kind: "consequence"; text: string }
  | { kind: "clue" }
  | { kind: "unknown" };

export function parseQuickCapture(raw: string): ParsedCapture {
  const s = raw.trim();
  const lower = s.toLowerCase();
  if (lower.startsWith("+pnj ") || lower.startsWith("+npc ")) {
    const body = s.slice(5).trim();
    const [name, role = ""] = body.split("|").map((x) => x.trim());
    return { kind: "npc", name, role };
  }
  if (lower.startsWith("+decision ") || lower.startsWith("+d ")) {
    const text = s.slice(lower.startsWith("+d ") ? 3 : 10).trim();
    return { kind: "decision", text };
  }
  if (lower.startsWith("+consecuencia ") || lower.startsWith("+consequence ") || lower.startsWith("+c ")) {
    const offset = lower.startsWith("+c ") ? 3 : lower.startsWith("+consecuencia ") ? 14 : 13;
    return { kind: "consequence", text: s.slice(offset).trim() };
  }
  if (lower === "+pista" || lower === "+clue" || lower === "+reveal") {
    return { kind: "clue" };
  }
  if (lower.startsWith("+nota ") || lower.startsWith("+note ") || lower.startsWith("+n ") || lower.startsWith("+h ")) {
    const offset = lower.startsWith("+n ") || lower.startsWith("+h ") ? 3 : lower.startsWith("+nota ") ? 6 : 6;
    return { kind: "note", text: s.slice(offset).trim() };
  }
  if (!s.startsWith("+")) {
    return { kind: "note", text: s };
  }
  return { kind: "unknown" };
}
