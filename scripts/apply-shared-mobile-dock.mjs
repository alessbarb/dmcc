import { readFileSync, writeFileSync, rmSync } from "node:fs";

function replaceRequired(source, before, after, label) {
  if (!source.includes(before)) throw new Error(`Missing target: ${label}`);
  return source.replace(before, after);
}

const shellPath = "src/frontend/dm/layouts/CampaignShell.tsx";
let shell = readFileSync(shellPath, "utf8");
shell = replaceRequired(shell, "  MoreHorizontal,\n", "", "DM MoreHorizontal import");
shell = replaceRequired(shell, "  X,\n", "", "DM X import");
shell = replaceRequired(
  shell,
  'import { useKeyboardShortcuts } from "../../shared/hooks/useKeyboardShortcuts.js";\n',
  'import { useKeyboardShortcuts } from "../../shared/hooks/useKeyboardShortcuts.js";\nimport { MobileDock } from "../../shared/components/MobileDock.js";\n',
  "DM MobileDock import",
);
shell = replaceRequired(shell, "  mobilePrimary?: boolean;\n", "", "DM mobilePrimary type");
shell = shell.replaceAll("      mobilePrimary: true,\n", "");
shell = replaceRequired(shell, "  const [mobileNavOpen, setMobileNavOpen] = useState(false);\n", "", "DM mobile nav state");
const dmEffect = `  useEffect(() => {
    if (!mobileNavOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileNavOpen]);

`;
shell = replaceRequired(shell, dmEffect, "", "DM legacy dock effect");
shell = replaceRequired(
  shell,
  `  const mobilePrimaryNav = navItems.filter((item) => item.mobilePrimary);
  const mobileMoreNav = navItems.filter((item) => !item.mobilePrimary);
`,
  "",
  "DM legacy dock collections",
);
shell = replaceRequired(
  shell,
  `  const handleNavClick = (path: string) => {
    setMobileNavOpen(false);
    navigate({ to: \`/campaigns/\${campaignId}/\${path}\` });
  };
`,
  `  const handleNavClick = (path: string) => {
    navigate({ to: \`/campaigns/\${campaignId}/\${path}\` });
  };

  const dockPriority = ["command-center", "session", "messages"];
  const dockNavItems = [
    ...dockPriority.map((path) => navItems.find((item) => item.path === path)).filter(Boolean),
    ...navItems.filter((item) => !dockPriority.includes(item.path)),
  ] as CampaignNavItem[];
  const dockItems = dockNavItems.map(({ path, label, Icon }) => ({
    id: path,
    label,
    Icon,
    onSelect: () => handleNavClick(path),
  }));
`,
  "DM canonical dock items",
);
const overlayStart = shell.indexOf("      {mobileNavOpen && (");
const bottomNavStart = shell.indexOf('      <nav className="campaign-mobile-bottom-nav"', overlayStart);
const bottomNavEndMarker = "      </nav>\n";
const bottomNavEnd = shell.indexOf(bottomNavEndMarker, bottomNavStart) + bottomNavEndMarker.length;
if (overlayStart < 0 || bottomNavStart < 0 || bottomNavEnd < bottomNavStart) throw new Error("Missing DM dock render block");
shell = shell.slice(0, overlayStart) + `      <MobileDock
        items={dockItems}
        activeId={currentSegment}
        ariaLabel={t("campaignShell.mainNavigationLabel")}
        moreLabel={t("campaignShell.mobileMore")}
        sheetLabel={t("campaignShell.campaignMenuLabel")}
      />

` + shell.slice(bottomNavEnd);
writeFileSync(shellPath, shell);

const smartPath = "src/frontend/SmartLanding.tsx";
let smart = readFileSync(smartPath, "utf8");
smart = replaceRequired(
  smart,
  'import { PortalTopBar } from "./shared/components/PortalTopBar.js";\n',
  'import { PortalTopBar } from "./shared/components/PortalTopBar.js";\nimport { MobileDock } from "./shared/components/MobileDock.js";\n',
  "player MobileDock import",
);
smart = replaceRequired(
  smart,
  '          className="btn btn-primary btn-sm"\n          onClick={() => navigate({ to: "/portal/messages/$campaignId", params: { campaignId } })}',
  '          className="btn btn-primary btn-sm player-portal-header__messages"\n          onClick={() => navigate({ to: "/portal/messages/$campaignId", params: { campaignId } })}',
  "player desktop messages action",
);
const smartDockAnchor = `  const content = useMemo(() => {`;
const smartDockDefinition = `  const playerDockItems = [
    { id: "home", label: t("playerPortal.tabs.home"), Icon: Home, onSelect: () => onTabChange("home") },
    { id: "character", label: t("playerPortal.tabs.character"), Icon: User, onSelect: () => onTabChange("character") },
    { id: "messages", label: t("playerPortal.messaging.title"), Icon: MessageCircle, onSelect: () => navigate({ to: "/portal/messages/$campaignId", params: { campaignId } }) },
    { id: "recap", label: t("playerPortal.tabs.recap"), Icon: BookOpen, onSelect: () => onTabChange("recap") },
    { id: "memory", label: t("playerPortal.tabs.memory"), Icon: Shield, onSelect: () => onTabChange("memory") },
    { id: "constellation", label: t("playerPortal.tabs.constellation"), Icon: Network, onSelect: () => onTabChange("constellation") },
    { id: "objectives", label: t("playerPortal.tabs.objectives"), Icon: Flag, onSelect: () => onTabChange("objectives") },
    { id: "notes", label: t("playerPortal.tabs.notes"), Icon: FileText, onSelect: () => onTabChange("notes") },
  ];

`;
smart = replaceRequired(smart, smartDockAnchor, smartDockDefinition + smartDockAnchor, "player dock items");
smart = replaceRequired(
  smart,
  `      </main>
    </div>
  );
}`,
  `      </main>
      <MobileDock
        items={playerDockItems}
        activeId={tab}
        ariaLabel={t("playerPortal.tabs.ariaLabel")}
        moreLabel={t("campaignShell.mobileMore")}
        sheetLabel={t("playerPortal.title")}
      />
    </div>
  );
}`,
  "player dock render",
);
writeFileSync(smartPath, smart);

const playerMessagesPath = "src/frontend/player/pages/PlayerMessagesPage.tsx";
let playerMessages = readFileSync(playerMessagesPath, "utf8");
playerMessages = replaceRequired(
  playerMessages,
  'import { ArrowLeft } from "lucide-react";\n',
  'import { ArrowLeft, BookOpen, FileText, Flag, Home, MessageCircle, Network, Shield, User } from "lucide-react";\n',
  "message page icons",
);
playerMessages = replaceRequired(
  playerMessages,
  'import { PortalTopBar } from "../../shared/components/PortalTopBar.js";\n',
  'import { PortalTopBar } from "../../shared/components/PortalTopBar.js";\nimport { MobileDock } from "../../shared/components/MobileDock.js";\n',
  "message page dock import",
);
playerMessages = replaceRequired(
  playerMessages,
  `  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)" }}>`,
  `  const openPortalTab = (tab: string) => navigate({ to: \`/portal?campaignId=\${encodeURIComponent(campaignId)}&tab=\${tab}\` as any });
  const dockItems = [
    { id: "home", label: t("playerPortal.tabs.home"), Icon: Home, onSelect: () => openPortalTab("home") },
    { id: "character", label: t("playerPortal.tabs.character"), Icon: User, onSelect: () => openPortalTab("character") },
    { id: "messages", label: t("playerPortal.messaging.title"), Icon: MessageCircle, onSelect: () => undefined },
    { id: "recap", label: t("playerPortal.tabs.recap"), Icon: BookOpen, onSelect: () => openPortalTab("recap") },
    { id: "memory", label: t("playerPortal.tabs.memory"), Icon: Shield, onSelect: () => openPortalTab("memory") },
    { id: "constellation", label: t("playerPortal.tabs.constellation"), Icon: Network, onSelect: () => openPortalTab("constellation") },
    { id: "objectives", label: t("playerPortal.tabs.objectives"), Icon: Flag, onSelect: () => openPortalTab("objectives") },
    { id: "notes", label: t("playerPortal.tabs.notes"), Icon: FileText, onSelect: () => openPortalTab("notes") },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", paddingBottom: "calc(5.25rem + env(safe-area-inset-bottom))" }}>`,
  "message page dock items",
);
playerMessages = replaceRequired(
  playerMessages,
  `      </main>
    </div>`,
  `      </main>
      <MobileDock
        items={dockItems}
        activeId="messages"
        ariaLabel={t("playerPortal.tabs.ariaLabel")}
        moreLabel={t("campaignShell.mobileMore")}
        sheetLabel={t("playerPortal.title")}
      />
    </div>`,
  "message page dock render",
);
writeFileSync(playerMessagesPath, playerMessages);

const cssPath = "src/frontend/shared/styles/p1.css";
let css = readFileSync(cssPath, "utf8");
css = replaceRequired(
  css,
  `  .player-portal-nav {
    position: fixed;`,
  `  .player-portal-nav {
    display: none;
  }

  .player-portal-header__messages {
    display: none;
  }

  .player-portal-nav--legacy-hidden {
    position: fixed;`,
  "hide legacy player mobile nav",
);
writeFileSync(cssPath, css);

rmSync("scripts/apply-shared-mobile-dock.mjs");
rmSync(".github/workflows/apply-shared-mobile-dock.yml");
