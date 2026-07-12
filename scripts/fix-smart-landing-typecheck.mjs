import { readFileSync, writeFileSync, rmSync } from "node:fs";

function replaceRequired(source, before, after, label) {
  if (!source.includes(before)) throw new Error(`Missing target: ${label}`);
  return source.replace(before, after);
}

const path = "src/frontend/SmartLanding.tsx";
let source = readFileSync(path, "utf8");

source = replaceRequired(
  source,
  `<h2 style={{ margin: 0 }}>{t("playerPortal.constellation.heading")}</h2>
            <p style={{ margin: "4px 0 0", color: "var(--text-muted)" }}>{t("playerPortal.constellation.description")}</p>`,
  `<h2 style={{ margin: 0 }}>{t("playerPortal.tabs.constellation")}</h2>`,
  "constellation heading",
);

source = replaceRequired(
  source,
  `: !activeCanvas ? <Card><p>{t("playerPortal.empty.noSharedConstellation")}</p></Card> : (`,
  `: !activeCanvas ? <Card><p>{t("playerPortal.empty.noVisibleContent")}</p></Card> : (`,
  "constellation empty state",
);

source = replaceRequired(
  source,
  `            <CampaignCanvasFlow
              canvas={activeCanvas}
              onCanvasChange={() => undefined}
              onSelectNode={setSelectedNodeId}
              onSelectEdge={setSelectedEdgeId}
              selectedNodeId={selectedNodeId}
              selectedEdgeId={selectedEdgeId}
              interactionMode={interactionMode}
              onInteractionModeChange={setInteractionMode}
              locked={locked}
              onLockedChange={setLocked}
              showMinimap={showMinimap}
              onShowMinimapChange={setShowMinimap}
              readOnly
              hideDmOnly
            />`,
  `            <CampaignCanvasFlow
              canvasId={activeCanvas.id}
              canvas={activeCanvas}
              selectedNodeId={selectedNodeId}
              selectedEdgeId={selectedEdgeId}
              onSelectNode={setSelectedNodeId}
              onSelectEdge={setSelectedEdgeId}
              onClearSelection={() => {
                setSelectedNodeId(null);
                setSelectedEdgeId(null);
              }}
              interactionMode={interactionMode}
              isLocked={locked}
              showMinimap={showMinimap}
              onModeChange={setInteractionMode}
              onLockChange={setLocked}
              onMinimapToggle={() => setShowMinimap((visible) => !visible)}
              publicOnly
              isPlayerView
            />`,
  "CampaignCanvasFlow props",
);

source = replaceRequired(
  source,
  `        setStatus({ sessionValid: false, role: null } as AuthStatus);`,
  `        setStatus({ accountConfigured: false, sessionValid: false, user: null });`,
  "AuthStatus fallback",
);

source = replaceRequired(
  source,
  `    return (
      <RpgPortalBackground>
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
          <p style={{ color: "var(--text-muted)" }}>{t("playerPortal.loading.access")}</p>
        </div>
      </RpgPortalBackground>
    );`,
  `    return (
      <div style={{ minHeight: "100vh", position: "relative", display: "grid", placeItems: "center" }}>
        <RpgPortalBackground />
        <p style={{ position: "relative", zIndex: 1, color: "var(--text-muted)" }}>{t("playerPortal.loading.access")}</p>
      </div>
    );`,
  "loading background composition",
);

source = replaceRequired(
  source,
  `    return (
      <RpgPortalBackground>
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
          <Card style={{ maxWidth: 560 }}>
            <ShieldAlert size={30} />
            <h1>{t("playerPortal.signInRequired.title")}</h1>
            <p style={{ color: "var(--text-muted)" }}>{t("playerPortal.signInRequired.description")}</p>
            <button className="btn btn-primary" type="button" onClick={() => navigate({ to: "/" })}>{t("playerPortal.signInRequired.goHome")}</button>
          </Card>
        </div>
      </RpgPortalBackground>
    );`,
  `    return (
      <div style={{ minHeight: "100vh", position: "relative", display: "grid", placeItems: "center", padding: 20 }}>
        <RpgPortalBackground />
        <div style={{ position: "relative", zIndex: 1 }}>
          <Card style={{ maxWidth: 560 }}>
            <ShieldAlert size={30} />
            <h1>{t("playerPortal.signInRequired.title")}</h1>
            <p style={{ color: "var(--text-muted)" }}>{t("playerPortal.signInRequired.description")}</p>
            <button className="btn btn-primary" type="button" onClick={() => navigate({ to: "/" })}>{t("playerPortal.signInRequired.goHome")}</button>
          </Card>
        </div>
      </div>
    );`,
  "signed-out background composition",
);

source = replaceRequired(
  source,
  `  return (
    <RpgPortalBackground>
      <PortalTopBar actions={` ,
  `  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <RpgPortalBackground />
      <div style={{ position: "relative", zIndex: 1 }}>
      <PortalTopBar actions={` ,
  "hub background opening",
);

source = replaceRequired(
  source,
  `      </main>
    </RpgPortalBackground>
  );
}`,
  `      </main>
      </div>
    </div>
  );
}`,
  "hub background closing",
);

writeFileSync(path, source);
rmSync("scripts/fix-smart-landing-typecheck.mjs");
rmSync(".github/workflows/fix-smart-landing-typecheck.yml");
