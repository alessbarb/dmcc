import React, { Suspense } from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";

const SmartLandingLazy = React.lazy(() => import("./SmartLanding.js").then((m) => ({ default: m.SmartLanding })));
const AppPage = React.lazy(() => import("./App.js").then((m) => ({ default: m.App })));
const CampaignShellPage = React.lazy(() => import("./dm/layouts/CampaignShell.js").then((m) => ({ default: m.CampaignShell })));
const DmSetupPageLazy = React.lazy(() => import("./dm/pages/DmSetupPage.js").then((m) => ({ default: m.DmSetupPage })));
const DmUnlockPageLazy = React.lazy(() => import("./dm/pages/DmUnlockPage.js").then((m) => ({ default: m.DmUnlockPage })));
const JoinPageLazy = React.lazy(() => import("./player/pages/JoinPage.js").then((m) => ({ default: m.JoinPage })));
const PlayerJoinPageLazy = React.lazy(() => import("./player/pages/PlayerJoinPage.js").then((m) => ({ default: m.PlayerJoinPage })));
const DashboardPageLazy = React.lazy(() => import("./dm/pages/DashboardPage.js").then((m) => ({ default: m.DashboardPage })));
const WhatNowPageLazy = React.lazy(() => import("./dm/pages/WhatNowPage.js").then((m) => ({ default: m.WhatNowPage })));
const SessionPageLazy = React.lazy(() => import("./dm/sessions/SessionPage.js").then((m) => ({ default: m.SessionPage })));
const EntitiesPageLazy = React.lazy(() => import("./dm/entities/EntitiesPage.js").then((m) => ({ default: m.EntitiesPage })));
const GraphPageLazy = React.lazy(() => import("./dm/graph/GraphPage.js").then((m) => ({ default: m.GraphPage })));
const TimelinePageLazy = React.lazy(() => import("./dm/sessions/TimelinePage.js").then((m) => ({ default: m.TimelinePage })));
const BoardsPageLazy = React.lazy(() => import("./dm/pages/BoardsPage.js").then((m) => ({ default: m.BoardsPage })));
const PlayersPageLazy = React.lazy(() => import("./dm/pages/PlayersPage.js").then((m) => ({ default: m.PlayersPage })));
const SearchPageLazy = React.lazy(() => import("./dm/pages/SearchPage.js").then((m) => ({ default: m.SearchPage })));
const SettingsPageLazy = React.lazy(() => import("./dm/pages/SettingsPage.js").then((m) => ({ default: m.SettingsPage })));
const PlayerPortalPageLazy = React.lazy(() => import("./player/pages/PlayerPortalPage.js").then((m) => ({ default: m.PlayerPortalPage })));
const RegisterPageLazy = React.lazy(() => import("./player/pages/RegisterPage.js").then((m) => ({ default: m.RegisterPage })));
const CanvasPageLazy = React.lazy(() => import("./dm/canvas/pages/CanvasPage.js").then((m) => ({ default: m.CanvasPage })));
const PlayerKnowledgePageLazy = React.lazy(() =>
  import("./dm/pages/PlayerKnowledgePage.js").then((m) => ({ default: m.PlayerKnowledgePage }))
);

function withSuspense(Component: React.ComponentType) {
  return function SuspenseRoute() {
    return (
      <Suspense fallback={<div className="page-loading">Loading...</div>}>
        <Component />
      </Suspense>
    );
  };
}

// Root route simply renders an Outlet
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// SmartLanding — unified entry point
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: withSuspense(SmartLandingLazy),
});

// DM home (was App at /)
const dmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dm",
  component: withSuspense(AppPage),
});

// DM setup PIN (first run)
const dmSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dm/setup",
  component: withSuspense(DmSetupPageLazy),
});

// DM unlock with PIN
const dmUnlockRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dm/unlock",
  component: withSuspense(DmUnlockPageLazy),
});

// Player join page (code or link)
const playerJoinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/player/join",
  component: withSuspense(PlayerJoinPageLazy),
});

// Legacy join route — redirect to /player/join with campaignId
const joinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/join/$campaignId",
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/player/join", search: { campaignId: params.campaignId } });
  },
  // Fallback component (should not render due to redirect)
  component: withSuspense(JoinPageLazy),
});

// Player registration route — consume invite token
const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register/$campaignId/$inviteToken",
  component: withSuspense(RegisterPageLazy),
});

// Player portal route — direct child of rootRoute, bypasses CampaignShell
const playerPortalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/campaigns/$campaignId/player-portal",
  component: withSuspense(PlayerPortalPageLazy),
});

// Campaign shell — parent layout with sidebar
const campaignRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/campaigns/$campaignId",
  component: withSuspense(CampaignShellPage),
});

// Index redirect: /campaigns/:id → /campaigns/:id/dashboard
const campaignIndexRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/",
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/campaigns/$campaignId/dashboard", params });
  },
  component: () => null,
});

// Sub-routes — each renders its own page component
const dashboardRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/dashboard",
  component: withSuspense(DashboardPageLazy),
});

const whatNowRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/what-now",
  component: withSuspense(WhatNowPageLazy),
});

const sessionRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/session",
  component: withSuspense(SessionPageLazy),
});

const entitiesRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/entities",
  component: withSuspense(EntitiesPageLazy),
});

const graphRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/graph",
  component: withSuspense(GraphPageLazy),
});

const timelineRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/timeline",
  component: withSuspense(TimelinePageLazy),
});

const boardsRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/boards",
  component: withSuspense(BoardsPageLazy),
});

const playersRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/players",
  component: withSuspense(PlayersPageLazy),
});

const searchRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/search",
  component: withSuspense(SearchPageLazy),
});

const settingsRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/settings",
  component: withSuspense(SettingsPageLazy),
});

const canvasRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/canvas",
  component: withSuspense(CanvasPageLazy),
});

const knowledgeRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/knowledge",
  component: withSuspense(PlayerKnowledgePageLazy),
});

// Build the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  dmRoute,
  dmSetupRoute,
  dmUnlockRoute,
  playerJoinRoute,
  joinRoute,
  registerRoute,
  playerPortalRoute,
  campaignRoute.addChildren([
    campaignIndexRoute,
    canvasRoute,
    dashboardRoute,
    whatNowRoute,
    sessionRoute,
    entitiesRoute,
    graphRoute,
    timelineRoute,
    boardsRoute,
    playersRoute,
    searchRoute,
    settingsRoute,
    knowledgeRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
