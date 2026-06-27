import React from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { App } from "./App.js";
import { CampaignShell } from "./dm/layouts/CampaignShell.js";
import { JoinPage } from "./player/pages/JoinPage.js";
import { DashboardPage } from "./dm/pages/DashboardPage.js";
import { WhatNowPage } from "./dm/pages/WhatNowPage.js";
import { SessionPage } from "./dm/sessions/SessionPage.js";
import { EntitiesPage } from "./dm/entities/EntitiesPage.js";
import { GraphPage } from "./dm/graph/GraphPage.js";
import { TimelinePage } from "./dm/sessions/TimelinePage.js";
import { BoardsPage } from "./dm/pages/BoardsPage.js";
import { PlayersPage } from "./dm/pages/PlayersPage.js";
import { SearchPage } from "./dm/pages/SearchPage.js";
import { SettingsPage } from "./dm/pages/SettingsPage.js";
import { PlayerPortalPage } from "./player/pages/PlayerPortalPage.js";
import { CanvasPage } from "./dm/canvas/pages/CanvasPage.js";

// Root route simply renders an Outlet
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Index route (Landing Page / Campaign selector)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <App />,
});

// Join route
const joinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/join/$campaignId",
  component: JoinPage,
});

// Player portal route — direct child of rootRoute, bypasses CampaignShell
const playerPortalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/campaigns/$campaignId/player-portal",
  component: PlayerPortalPage,
});

// Campaign shell — parent layout with sidebar
const campaignRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/campaigns/$campaignId",
  component: CampaignShell,
});

// Sub-routes — each renders its own page component
const dashboardRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const whatNowRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/what-now",
  component: WhatNowPage,
});

const sessionRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/session",
  component: SessionPage,
});

const entitiesRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/entities",
  component: EntitiesPage,
});

const graphRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/graph",
  component: GraphPage,
});

const timelineRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/timeline",
  component: TimelinePage,
});

const boardsRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/boards",
  component: BoardsPage,
});

const playersRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/players",
  component: PlayersPage,
});

const searchRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/search",
  component: SearchPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/settings",
  component: SettingsPage,
});

const canvasRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/canvas",
  component: CanvasPage,
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
