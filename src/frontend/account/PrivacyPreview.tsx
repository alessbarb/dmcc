import { useState } from "react";

export function PrivacyPreview({
  previews,
}: {
  previews: Record<"owner" | "dm" | "table" | "global", Record<string, unknown> | null>;
}) {
  const [audience, setAudience] = useState<keyof typeof previews>("owner");
  return (
    <section aria-labelledby="privacy-title">
      <h2 id="privacy-title">Privacy preview</h2>
      <label>
        View as
        <select value={audience} onChange={(event) => setAudience(event.target.value as keyof typeof previews)}>
          <option value="owner">You</option>
          <option value="dm">Campaign DM</option>
          <option value="table">Table member</option>
          <option value="global">Global profile</option>
        </select>
      </label>
      <pre>{JSON.stringify(previews[audience] ?? {}, null, 2)}</pre>
    </section>
  );
}
