import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, rmSync } from "node:fs";

function replaceRequired(source, before, after, label) {
  if (!source.includes(before)) throw new Error(`Missing target: ${label}`);
  return source.replace(before, after);
}

let source = execFileSync("git", ["show", "origin/main:src/frontend/SmartLanding.tsx"], { encoding: "utf8" });

source = replaceRequired(
  source,
  'import { PortalTopBar } from "./shared/components/PortalTopBar.js";\n',
  'import { PortalTopBar } from "./shared/components/PortalTopBar.js";\nimport { MobileDock } from "./shared/components/MobileDock.js";\n',
  "MobileDock import",
);

source = replaceRequired(
  source,
  '          className="btn btn-primary btn-sm"\n          onClick={() => navigate({ to: "/portal/messages/$campaignId", params: { campaignId } })}',
  '          className="btn btn-primary btn-sm player-portal-header__messages"\n          onClick={() => navigate({ to: "/portal/messages/$campaignId", params: { campaignId } })}',
  "desktop messages action class",
);

source = replaceRequired(
  source,
  '  const content = useMemo(() => {',
  `  const playerDockItems = [
    { id: "home", label: t("playerPortal.tabs.home"), Icon: Home, onSelect: () => onTabChange("home") },
    { id: "character", label: t("playerPortal.tabs.character"), Icon: User, onSelect: () => onTabChange("character") },
    { id: "messages", label: t("playerPortal.messaging.heading"), Icon: MessageCircle, onSelect: () => navigate({ to: "/portal/messages/$campaignId", params: { campaignId } }) },
    { id: "recap", label: t("playerPortal.tabs.recap"), Icon: BookOpen, onSelect: () => onTabChange("recap") },
    { id: "memory", label: t("playerPortal.tabs.memory"), Icon: Shield, onSelect: () => onTabChange("memory") },
    { id: "constellation", label: t("playerPortal.tabs.constellation"), Icon: Network, onSelect: () => onTabChange("constellation") },
    { id: "objectives", label: t("playerPortal.tabs.objectives"), Icon: Flag, onSelect: () => onTabChange("objectives") },
    { id: "notes", label: t("playerPortal.tabs.notes"), Icon: FileText, onSelect: () => onTabChange("notes") },
  ];

  const content = useMemo(() => {`,
  "player dock items",
);

source = replaceRequired(
  source,
  `      </main>
    </div>
  );
}

export function SmartLanding()`,
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
}

export function SmartLanding()`,
  "player dock render",
);

writeFileSync("src/frontend/SmartLanding.tsx", source);
rmSync("tests/frontend/smartLandingTypeContracts.test.ts");
rmSync("scripts/clean-pr112-smartlanding.mjs");
rmSync(".github/workflows/clean-pr112-smartlanding.yml");
