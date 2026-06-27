import React, { Suspense } from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";

const AppPage = React.lazy(() => import("./App.js").then((m) => ({ default: m.App })));
const CampaignShellPage = React.lazy(() => import("./dm/layouts/CampaignShell.js").then((m) => ({ default: m.CampaignShell })));
const JoinPageLazy = React.lazy(() => import("./player/pages/JoinPage.js").then((m) => ({ default: m.JoinPage })));
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
const CanvasPageLazy = React.lazy(() => import("./dm/canvas/pages/CanvasPage.js").then((m) => ({ default: m.CanvasPage })));

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

// Index route (Landing Page / Campaign selector)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: withSuspense(AppPage),
});

// Join route
const joinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/join/$campaignId",
  component: withSuspense(JoinPageLazy),
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

// Build the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  joinRoute,
  playerPortalRoute,
  campaignRoute.addChildren([
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
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
