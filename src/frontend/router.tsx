import React, { Suspense } from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { fetchAuthStatus } from "./shared/auth/authClient.js";

async function requireAccountSession() {
  try {
    const status = await fetchAuthStatus();
    if (!status.dmSessionValid) {
      throw redirect({ to: "/" });
    }
  } catch (err: any) {
    if (err?.isRedirect) throw err;
    throw redirect({ to: "/" });
  }
}

const PromoLandingLazy = React.lazy(() => import("./MainLanding.js").then((m) => ({ default: m.MainLanding })));
const SmartLandingLazy = React.lazy(() => import("./SmartLanding.js").then((m) => ({ default: m.SmartLanding })));
const AppPage = React.lazy(() => import("./App.js").then((m) => ({ default: m.App })));
const DmHubPageLazy = React.lazy(() => import("./dm/hub/DmHubPage.js").then((m) => ({ default: m.DmHubPage })));
const CampaignShellPage = React.lazy(() => import("./dm/layouts/CampaignShell.js").then((m) => ({ default: m.CampaignShell })));
const DmSetupPageLazy = React.lazy(() => import("./dm/pages/DmSetupPage.js").then((m) => ({ default: m.DmSetupPage })));
const DmUnlockPageLazy = React.lazy(() => import("./dm/pages/DmUnlockPage.js").then((m) => ({ default: m.DmUnlockPage })));
const PlayerJoinPageLazy = React.lazy(() => import("./player/pages/PlayerJoinPage.js").then((m) => ({ default: m.PlayerJoinPage })));
const DashboardPageLazy = React.lazy(() => import("./dm/pages/DashboardPage.js").then((m) => ({ default: m.DashboardPage })));
const CommandCenterPageLazy = React.lazy(() => import("./dm/pages/CommandCenterPage.js").then((m) => ({ default: m.CommandCenterPage })));
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
const WebPlayerPortalPageLazy = React.lazy(() => import("./player/pages/WebPlayerPortalPage.js").then((m) => ({ default: m.WebPlayerPortalPage })));
const PlayerConstellationPageLazy = React.lazy(() => import("./player/pages/PlayerConstellationPage.js").then((m) => ({ default: m.PlayerConstellationPage })));
const RegisterPageLazy = React.lazy(() => import("./player/pages/RegisterPage.js").then((m) => ({ default: m.RegisterPage })));
const CanvasPageLazy = React.lazy(() => import("./dm/canvas/pages/CanvasPage.js").then((m) => ({ default: m.CanvasPage })));
const PlayerKnowledgePageLazy = React.lazy(() =>
  import("./dm/pages/PlayerKnowledgePage.js").then((m) => ({ default: m.PlayerKnowledgePage }))
);
const OnboardingPageLazy = React.lazy(() =>
  import("./dm/pages/OnboardingPage.js").then((m) => ({ default: m.OnboardingPage }))
);
const PremadeCampaignPreviewPageLazy = React.lazy(() =>
  import("./dm/pages/PremadeCampaignPreviewPage.js").then((m) => ({ default: m.PremadeCampaignPreviewPage }))
);
const AccountPageLazy = React.lazy(() =>
  import("./account/AccountPage.js").then((m) => ({ default: m.AccountPage }))
);
const AboutPageLazy = React.lazy(() =>
  import("./institutional/InstitutionalPage.js").then((m) => ({ default: m.AboutPage }))
);
const ContactPageLazy = React.lazy(() =>
  import("./institutional/InstitutionalPage.js").then((m) => ({ default: m.ContactPage }))
);
const PrivacyPageLazy = React.lazy(() =>
  import("./institutional/InstitutionalPage.js").then((m) => ({ default: m.PrivacyPage }))
);
const TermsPageLazy = React.lazy(() =>
  import("./institutional/InstitutionalPage.js").then((m) => ({ default: m.TermsPage }))
);
const ForgotPasswordPageLazy = React.lazy(() =>
  import("./shared/auth/ForgotPasswordPage.js").then((m) => ({ default: m.ForgotPasswordPage }))
);
const ResetPasswordPageLazy = React.lazy(() =>
  import("./shared/auth/ResetPasswordPage.js").then((m) => ({ default: m.ResetPasswordPage }))
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

// MainLanding — main promotional landing page
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: withSuspense(PromoLandingLazy),
});

// Selection Portal — what used to be the index page (role select)
const portalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/portal",
  beforeLoad: requireAccountSession,
  component: withSuspense(SmartLandingLazy),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: withSuspense(DmUnlockPageLazy),
});

const webRegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: withSuspense(DmSetupPageLazy),
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: withSuspense(AboutPageLazy),
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: withSuspense(ContactPageLazy),
});

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy",
  component: withSuspense(PrivacyPageLazy),
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: withSuspense(TermsPageLazy),
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forgot-password",
  component: withSuspense(ForgotPasswordPageLazy),
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reset-password/$token",
  component: withSuspense(ResetPasswordPageLazy),
});

const resetPasswordManualRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reset-password",
  component: withSuspense(ResetPasswordPageLazy),
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app",
  beforeLoad: requireAccountSession,
  component: withSuspense(AppPage),
});

const appCampaignsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/campaigns",
  beforeLoad: requireAccountSession,
  component: withSuspense(AppPage),
});

// DM home (was App at /)
const dmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dm",
  beforeLoad: requireAccountSession,
  component: withSuspense(DmHubPageLazy),
});

// /dm/campaigns → hub (campaigns panel is there)
const dmCampaignsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dm/campaigns",
  beforeLoad: async () => {
    await requireAccountSession();
    throw redirect({ to: "/dm" });
  },
  component: () => null,
});

// /dm/campaigns/new → hub (modal is opened in App.tsx state, not URL-driven yet)
const dmCampaignsNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dm/campaigns/new",
  beforeLoad: async () => {
    await requireAccountSession();
    throw redirect({ to: "/dm" });
  },
  component: () => null,
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

// Invitation join route — /join/:inviteToken is the final web/app entry point.
const joinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/join/$inviteToken",
  component: withSuspense(PlayerJoinPageLazy),
});

// Player registration route — consume invite token
const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register/$campaignId/$inviteToken",
  component: withSuspense(RegisterPageLazy),
});

// Player portal routes — direct child of rootRoute, bypasses CampaignShell
const playerPortalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/campaigns/$campaignId/player-portal",
  component: withSuspense(PlayerPortalPageLazy),
});

const playerPortalWebRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/player/campaigns/$campaignId",
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/player/campaigns/$campaignId/home", params });
  },
  component: () => null,
});

const playerPortalHomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/player/campaigns/$campaignId/home",
  component: withSuspense(WebPlayerPortalPageLazy),
});
const playerPortalRecapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/player/campaigns/$campaignId/recap",
  component: withSuspense(WebPlayerPortalPageLazy),
});
const playerPortalCharacterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/player/campaigns/$campaignId/character",
  component: withSuspense(WebPlayerPortalPageLazy),
});
const playerPortalMemoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/player/campaigns/$campaignId/memory",
  component: withSuspense(WebPlayerPortalPageLazy),
});
const playerPortalConstellationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/player/campaigns/$campaignId/constellation",
  component: withSuspense(PlayerConstellationPageLazy),
});
const playerPortalObjectivesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/player/campaigns/$campaignId/objectives",
  component: withSuspense(WebPlayerPortalPageLazy),
});
const playerPortalNotesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/player/campaigns/$campaignId/notes",
  component: withSuspense(WebPlayerPortalPageLazy),
});
const playerPortalProposalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/player/campaigns/$campaignId/proposals",
  component: withSuspense(WebPlayerPortalPageLazy),
});

// Campaign shell — parent layout with sidebar
const campaignRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/campaigns/$campaignId",
  beforeLoad: requireAccountSession,
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

const commandCenterRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/command-center",
  component: withSuspense(CommandCenterPageLazy),
});

const liveTableRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/live",
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/campaigns/$campaignId/command-center", params });
  },
  component: () => null,
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

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: withSuspense(OnboardingPageLazy),
});

const premadePreviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/premades/$templateId",
  component: withSuspense(PremadeCampaignPreviewPageLazy),
});

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account",
  beforeLoad: requireAccountSession,
  component: withSuspense(AccountPageLazy),
});

// Build the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  portalRoute,
  loginRoute,
  webRegisterRoute,
  aboutRoute,
  contactRoute,
  privacyRoute,
  termsRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  resetPasswordManualRoute,
  appRoute,
  appCampaignsRoute,
  dmRoute,
  dmCampaignsRoute,
  dmCampaignsNewRoute,
  accountRoute,
  onboardingRoute,
  premadePreviewRoute,
  dmSetupRoute,
  dmUnlockRoute,
  playerJoinRoute,
  joinRoute,
  registerRoute,
  playerPortalRoute,
  playerPortalWebRoute,
  playerPortalHomeRoute,
  playerPortalRecapRoute,
  playerPortalCharacterRoute,
  playerPortalMemoryRoute,
  playerPortalConstellationRoute,
  playerPortalObjectivesRoute,
  playerPortalNotesRoute,
  playerPortalProposalsRoute,
  campaignRoute.addChildren([
    campaignIndexRoute,
    canvasRoute,
    dashboardRoute,
    commandCenterRoute,
    liveTableRoute,
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
