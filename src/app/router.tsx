import React from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { App } from "./App.js";
import { CampaignShell } from "./CampaignShell.js";
import { JoinPage } from "./pages/JoinPage.js";
import { DashboardPage } from "./pages/DashboardPage.js";
import { WhatNowPage } from "./pages/WhatNowPage.js";
import { SessionPage } from "./pages/SessionPage.js";
import { EntitiesPage } from "./pages/EntitiesPage.js";
import { GraphPage } from "./pages/GraphPage.js";
import { TimelinePage } from "./pages/TimelinePage.js";
import { BoardsPage } from "./pages/BoardsPage.js";
import { PlayersPage } from "./pages/PlayersPage.js";
import { SearchPage } from "./pages/SearchPage.js";
import { SettingsPage } from "./pages/SettingsPage.js";

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

// Build the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  joinRoute,
  campaignRoute.addChildren([
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
