import { readFileSync, writeFileSync, rmSync } from "node:fs";

function replaceRequired(source, before, after, label) {
  if (!source.includes(before)) throw new Error(`Missing codemod target: ${label}`);
  return source.replace(before, after);
}

const smartLandingPath = "src/frontend/SmartLanding.tsx";
let smartLanding = readFileSync(smartLandingPath, "utf8");
smartLanding = replaceRequired(smartLanding, "  MessageSquare,\n", "", "MessageSquare import");
smartLanding = replaceRequired(smartLanding, "  Send,\n", "", "Send import");
smartLanding = replaceRequired(smartLanding, "  createPlayerProposal,\n", "", "createPlayerProposal import");
smartLanding = replaceRequired(smartLanding, "  getPlayerProposals,\n", "", "getPlayerProposals import");
smartLanding = replaceRequired(
  smartLanding,
  '  | "notes"\n  | "proposals";',
  '  | "notes";',
  "PortalTab proposals member",
);
smartLanding = replaceRequired(
  smartLanding,
  '  { id: "proposals", labelKey: "playerPortal.tabs.proposals", Icon: Send },\n',
  "",
  "proposals tab registration",
);
smartLanding = replaceRequired(
  smartLanding,
  "    home: null, recap: null, character: null, memory: null, constellation: null, objectives: null, notes: null, proposals: null,\n",
  "    home: null, recap: null, character: null, memory: null, constellation: null, objectives: null, notes: null,\n",
  "proposals tab ref",
);
smartLanding = replaceRequired(
  smartLanding,
  '  const [draftProposal, setDraftProposal] = useState("");\n',
  "",
  "proposal draft state",
);
smartLanding = replaceRequired(
  smartLanding,
  '      if (tab === "proposals") body = await getPlayerProposals(campaignId);\n',
  "",
  "proposal loader",
);
const proposalBlock = `    if (tab === "proposals") return (
      <div style={{ display: "grid", gap: 14 }}>
        <Card>
          <h2 style={{ marginTop: 0 }}>{t("playerPortal.proposals.heading")}</h2>
          <label htmlFor="player-proposal-draft" className="player-portal-field">
            <span>{t("playerPortal.proposals.label")}</span>
            <span id="player-proposal-help" className="player-portal-help">{t("playerPortal.proposals.instructions")}</span>
            <textarea id="player-proposal-draft" aria-describedby="player-proposal-help" className="form-textarea" rows={4} value={draftProposal} onChange={(event) => setDraftProposal(event.target.value)} placeholder={t("playerPortal.proposals.placeholder")} />
          </label>
          <button className="btn btn-primary" type="button" style={{ marginTop: 10 }} disabled={!draftProposal.trim()} onClick={async () => {
            await createPlayerProposal(campaignId, { type: "player_note", text: draftProposal });
            setDraftProposal("");
            await load();
          }}><MessageSquare size={16} /> {t("playerPortal.proposals.send")}</button>
        </Card>
        <Card>{payload.proposals?.length ? payload.proposals.map((proposal: any) => <article key={proposal.proposalId} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: 8 }}><strong>{proposal.type}</strong><p style={{ color: "var(--text-muted)" }}>{typeof proposal.content === "string" ? proposal.content : JSON.stringify(proposal.content)}</p><span style={{ fontSize: 12 }}>{proposal.status}</span></article>) : <p style={{ color: "var(--text-muted)" }}>{t("playerPortal.empty.noProposalsYet")}</p>}</Card>
      </div>
    );
`;
smartLanding = replaceRequired(smartLanding, proposalBlock, "", "proposal render block");
smartLanding = replaceRequired(
  smartLanding,
  "  }, [campaignId, counts.facts, counts.visibleEntities, draftNote, draftProposal, payload, tab, t]);",
  "  }, [campaignId, counts.facts, counts.visibleEntities, draftNote, payload, tab, t]);",
  "proposal memo dependency",
);
writeFileSync(smartLandingPath, smartLanding);

const clientPath = "src/frontend/shared/api/webProductClient.ts";
let client = readFileSync(clientPath, "utf8");
const getProposals = `export async function getPlayerProposals(campaignId: string): Promise<{ proposals: any[] }> {
  return readJson(
    await apiFetch(\`/api/player/campaigns/\${encodeURIComponent(campaignId)}/proposals\`),
    "No se pudieron cargar las propuestas",
  );
}

`;
client = replaceRequired(client, getProposals, "", "legacy getPlayerProposals client");
const proposalFunctionStart = "export async function createPlayerProposal(campaignId: string, input: any): Promise<any> {\n";
client = replaceRequired(
  client,
  proposalFunctionStart,
  `${proposalFunctionStart}  if (input?.kind !== "link_request" && input?.type !== "link_request") {\n    throw new Error("Las propuestas genéricas se han sustituido por la mensajería de campaña");\n  }\n`,
  "structured proposal client guard",
);
writeFileSync(clientPath, client);

rmSync("scripts/apply-messaging-codemod.mjs");
rmSync(".github/workflows/apply-messaging-codemod.yml");
