import React from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet
} from "@tanstack/react-router";
import { App } from "./App.js";

// Root route simply renders an Outlet
const rootRoute = createRootRoute({
  component: () => <Outlet />
});

// Index route (Landing Page / Campaign selector)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <App />
});

// Campaign layout & sub-pages
const campaignRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/campaigns/$campaignId"
});

const dashboardRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/dashboard",
  component: () => <App />
});

const whatNowRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/what-now",
  component: () => <App />
});

const sessionRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/session",
  component: () => <App />
});

const entitiesRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/entities",
  component: () => <App />
});

const graphRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/graph",
  component: () => <App />
});

const timelineRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/timeline",
  component: () => <App />
});

const searchRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/search",
  component: () => <App />
});

const playersRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/players",
  component: () => <App />
});

const boardsRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/boards",
  component: () => <App />
});

const settingsRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/settings",
  component: () => <App />
});

const playerPortalRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/player-portal",
  component: () => <App />
});

// Join route (redirects or opens player-portal join)
const joinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/join/$campaignId",
  component: () => <App />
});

// Build the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  campaignRoute.addChildren([
    dashboardRoute,
    whatNowRoute,
    sessionRoute,
    entitiesRoute,
    graphRoute,
    timelineRoute,
    searchRoute,
    playersRoute,
    boardsRoute,
    settingsRoute,
    playerPortalRoute
  ]),
  joinRoute
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
