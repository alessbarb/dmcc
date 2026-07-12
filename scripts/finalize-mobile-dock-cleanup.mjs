import { readFileSync, writeFileSync, rmSync } from "node:fs";

function replaceRequired(source, before, after, label) {
  if (!source.includes(before)) throw new Error(`Missing target: ${label}`);
  return source.replace(before, after);
}

const smartPath = "src/frontend/SmartLanding.tsx";
let smart = readFileSync(smartPath, "utf8");
smart = replaceRequired(
  smart,
  'import { PlayerCharacterSelectionCard } from "./player/components/PlayerCharacterSelectionCard.js";\n',
  'import { PlayerCharacterSelectionCard } from "./player/components/PlayerCharacterSelectionCard.js";\nimport { buildPlayerMobileDockItems } from "./player/navigation/playerMobileDockItems.js";\n',
  "player dock builder import",
);
const smartDockBlock = `  const playerDockItems = [
    { id: "home", label: t("playerPortal.tabs.home"), Icon: Home, onSelect: () => onTabChange("home") },
    { id: "character", label: t("playerPortal.tabs.character"), Icon: User, onSelect: () => onTabChange("character") },
    { id: "messages", label: t("playerPortal.messaging.heading"), Icon: MessageCircle, onSelect: () => navigate({ to: "/portal/messages/$campaignId", params: { campaignId } }) },
    { id: "recap", label: t("playerPortal.tabs.recap"), Icon: BookOpen, onSelect: () => onTabChange("recap") },
    { id: "memory", label: t("playerPortal.tabs.memory"), Icon: Shield, onSelect: () => onTabChange("memory") },
    { id: "constellation", label: t("playerPortal.tabs.constellation"), Icon: Network, onSelect: () => onTabChange("constellation") },
    { id: "objectives", label: t("playerPortal.tabs.objectives"), Icon: Flag, onSelect: () => onTabChange("objectives") },
    { id: "notes", label: t("playerPortal.tabs.notes"), Icon: FileText, onSelect: () => onTabChange("notes") },
  ];`;
smart = replaceRequired(
  smart,
  smartDockBlock,
  `  const playerDockItems = buildPlayerMobileDockItems({
    t,
    openTab: onTabChange,
    openMessages: () => navigate({ to: "/portal/messages/$campaignId", params: { campaignId } }),
  });`,
  "player dock block",
);
smart = replaceRequired(
  smart,
  '        sheetLabel={t("playerPortal.title")}\n',
  '        sheetLabel={t("playerPortal.title")}\n        closeLabel={t("common.close")}\n',
  "player dock close label",
);
writeFileSync(smartPath, smart);

const messagesPath = "src/frontend/player/pages/PlayerMessagesPage.tsx";
let messages = readFileSync(messagesPath, "utf8");
messages = replaceRequired(
  messages,
  'import { ArrowLeft, BookOpen, FileText, Flag, Home, MessageCircle, Network, Shield, User } from "lucide-react";\n',
  'import { ArrowLeft } from "lucide-react";\n',
  "player messages icon imports",
);
messages = replaceRequired(
  messages,
  'import { MobileDock } from "../../shared/components/MobileDock.js";\n',
  'import { MobileDock } from "../../shared/components/MobileDock.js";\nimport { buildPlayerMobileDockItems } from "../navigation/playerMobileDockItems.js";\n',
  "player messages dock builder import",
);
const messagesDockStart = messages.indexOf("  const dockItems = [");
const messagesDockEnd = messages.indexOf("  ];", messagesDockStart) + 4;
if (messagesDockStart < 0 || messagesDockEnd < messagesDockStart) throw new Error("Missing player messages dock block");
messages = messages.slice(0, messagesDockStart) + `  const dockItems = buildPlayerMobileDockItems({
    t,
    openTab: openPortalTab,
    openMessages: () => undefined,
  });` + messages.slice(messagesDockEnd);
messages = replaceRequired(
  messages,
  '        sheetLabel={t("playerPortal.title")}\n',
  '        sheetLabel={t("playerPortal.title")}\n        closeLabel={t("common.close")}\n',
  "messages dock close label",
);
writeFileSync(messagesPath, messages);

const shellPath = "src/frontend/dm/layouts/CampaignShell.tsx";
let shell = readFileSync(shellPath, "utf8");
shell = replaceRequired(
  shell,
  '        sheetLabel={t("campaignShell.campaignMenuLabel")}\n',
  '        sheetLabel={t("campaignShell.campaignMenuLabel")}\n        closeLabel={t("common.close")}\n',
  "DM dock close label",
);
writeFileSync(shellPath, shell);

const cssPath = "src/frontend/shared/styles/index.css";
let css = readFileSync(cssPath, "utf8");
const classReplacements = [
  ["campaign-mobile-nav-overlay", "mobile-dock-overlay"],
  ["campaign-mobile-nav-sheet", "mobile-dock-sheet"],
  ["campaign-mobile-icon-btn", "mobile-dock-icon-btn"],
  ["campaign-mobile-bottom-nav__item", "mobile-dock__item"],
  ["campaign-mobile-bottom-nav", "mobile-dock"],
];
for (const [legacyName, canonicalName] of classReplacements) {
  css = css.replaceAll(legacyName, canonicalName);
}
writeFileSync(cssPath, css);

const testPath = "tests/frontend/sharedMobileDockContracts.test.ts";
let test = readFileSync(testPath, "utf8");
test = test.replaceAll("campaign-mobile-bottom-nav__item", "mobile-dock__item");
test = replaceRequired(
  test,
  'const playerStyles = readFileSync(join(ROOT, "src/frontend/shared/styles/p1.css"), "utf8");\n',
  'const playerStyles = readFileSync(join(ROOT, "src/frontend/shared/styles/p1.css"), "utf8");\nconst sharedStyles = readFileSync(join(ROOT, "src/frontend/shared/styles/index.css"), "utf8");\nconst playerDockOptions = readFileSync(join(ROOT, "src/frontend/player/navigation/playerMobileDockItems.ts"), "utf8");\n',
  "dock test sources",
);
test = replaceRequired(
  test,
  `  it("keeps Messages in the three direct player and DM destinations", () => {
    expect(dmSource).toContain('const dockPriority = ["command-center", "session", "messages"]');
    expect(playerSource).toContain('{ id: "messages"');
    expect(playerMessagesSource).toContain('activeId="messages"');
  });`,
  `  it("keeps Messages in the three direct player and DM destinations", () => {
    expect(dmSource).toContain('const dockPriority = ["command-center", "session", "messages"]');
    expect(playerDockOptions).toContain('{ id: "messages"');
    expect(playerSource).toContain("buildPlayerMobileDockItems");
    expect(playerMessagesSource).toContain('activeId="messages"');
  });

  it("contains no campaign-specific legacy classes in the shared dock", () => {
    expect(dockSource).not.toContain("campaign-mobile-");
    expect(sharedStyles).not.toContain("campaign-mobile-nav-");
    expect(sharedStyles).not.toContain("campaign-mobile-bottom-nav");
    expect(dockSource).toContain("closeLabel");
    expect(dockSource).not.toContain('aria-label="Cerrar"');
  });`,
  "legacy CSS contract",
);
writeFileSync(testPath, test);

rmSync("scripts/finalize-mobile-dock-cleanup.mjs");
rmSync(".github/workflows/finalize-mobile-dock-cleanup.yml");
