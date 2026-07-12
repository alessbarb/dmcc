import { readFileSync, writeFileSync, rmSync } from "node:fs";

function replaceRequired(source, before, after, label) {
  if (!source.includes(before)) throw new Error(`Missing target: ${label}`);
  return source.replace(before, after);
}

const smartPath = "src/frontend/SmartLanding.tsx";
let smart = readFileSync(smartPath, "utf8");
smart = replaceRequired(smart, "  LogOut,\n  Network,", "  LogOut,\n  MessageCircle,\n  Network,", "player message icon import");
smart = replaceRequired(
  smart,
  `        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate({ to: "/player/join" })}>
          <Plus size={15} /> {t("playerPortal.actions.join")}
        </button>`,
  `        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => navigate({ to: "/portal/messages/$campaignId", params: { campaignId } })}
        >
          <MessageCircle size={15} /> Mensajes
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate({ to: "/player/join" })}>
          <Plus size={15} /> {t("playerPortal.actions.join")}
        </button>`,
  "player messages header action",
);
writeFileSync(smartPath, smart);

const shellPath = "src/frontend/dm/layouts/CampaignShell.tsx";
let shell = readFileSync(shellPath, "utf8");
shell = replaceRequired(shell, "  MapPin,\n  MoreHorizontal,", "  MapPin,\n  MessageCircle,\n  MoreHorizontal,", "dm message icon import");
shell = replaceRequired(
  shell,
  `  players: {
    titleKey: "campaignShell.meta.playersTitle",
    eyebrowKey: "campaignShell.meta.playersEyebrow",
    descriptionKey: "campaignShell.meta.playersDescription",
  },`,
  `  players: {
    titleKey: "campaignShell.meta.playersTitle",
    eyebrowKey: "campaignShell.meta.playersEyebrow",
    descriptionKey: "campaignShell.meta.playersDescription",
  },
  messages: {
    titleKey: "campaignShell.meta.playersTitle",
    eyebrowKey: "campaignShell.meta.playersEyebrow",
    descriptionKey: "campaignShell.meta.playersDescription",
  },`,
  "messages page metadata",
);
shell = replaceRequired(
  shell,
  `    {
      path: "players",
      label: t("campaignShell.nav.players"),
      Icon: User,
      group: "secondary",
    },`,
  `    {
      path: "players",
      label: t("campaignShell.nav.players"),
      Icon: User,
      group: "secondary",
    },
    {
      path: "messages",
      label: "Mensajes",
      Icon: MessageCircle,
      group: "secondary",
      mobilePrimary: true,
    },`,
  "dm messages nav item",
);
writeFileSync(shellPath, shell);

const routerPath = "src/frontend/router.tsx";
let router = readFileSync(routerPath, "utf8");
router = replaceRequired(router, 'import { CampaignMessagingShortcut } from "./shared/components/CampaignMessagingShortcut.js";\n', "", "shortcut import");
router = replaceRequired(router, "      <CampaignMessagingShortcut />\n", "", "shortcut mount");
writeFileSync(routerPath, router);

rmSync("src/frontend/shared/components/CampaignMessagingShortcut.tsx");
rmSync("scripts/apply-messaging-navigation-fix.mjs");
rmSync(".github/workflows/apply-messaging-navigation-fix.yml");
