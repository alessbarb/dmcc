import React, { Suspense } from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { PlayerPortalRealtimeSync } from "./player/components/PlayerPortalRealtimeSync.js";
import { fetchAuthStatus } from "./shared/auth/authClient.js";

async function requireAccountSession() {
  try {
    const status = await fetchAuthStatus();
    if (!status.sessionValid) {
      throw redirect({ to: "/" });
    }
  } catch (error: any) {
    if (error?.isRedirect) throw error;
    throw redirect({ to: "/" });
  }
}

const PromoLandingLazy = React.lazy(() =>
  import("./MainLanding.js").then((module) => ({ default: module.MainLanding })),
);
const SmartLandingLazy = React.lazy(() =>
  import("./SmartLanding.js").then((module) => ({ default: module.SmartLanding })),
);
const DmHubPageLazy = React.lazy(() =>
  import("./dm/hub/DmHubPage.js").then((module) => ({ default: module.DmHubPage })),
);
const CampaignShellPage = React.lazy(() =>
  import("./dm/layouts/CampaignShell.js").then((module) => ({ default: module.CampaignShell })),
);
const DmSetupPageLazy = React.lazy(() =>
  import("./dm/pages/DmSetupPage.js").then((module) => ({ default: module.DmSetupPage })),
);
const DmLoginPageLazy = React.lazy(() =>
  import("./dm/pages/DmLoginPage.js").then((module) => ({ default: module.DmLoginPage })),
);
const PlayerJoinPageLazy = React.lazy(() =>
  import("./player/pages/PlayerJoinPage.js").then((module) => ({ default: module.PlayerJoinPage })),
);
const RegisterPageLazy = React.lazy(() =>
  import("./player/pages/RegisterPage.js").then((module) => ({ default: module.RegisterPage })),
);
const CommandCenterPageLazy = React.lazy(() =>
  import("./dm/pages/CommandCenterPage.js").then((module) => ({ default: module.CommandCenterPage })),
);
const SessionPageLazy = React.lazy(() =>
  import("./dm/sessions/SessionPage.js").then((module) => ({ default: module.SessionPage })),
);
const EntitiesPageLazy = React.lazy(() =>
  import("./dm/entities/EntitiesPage.js").then((module) => ({ default: module.EntitiesPage })),
);
const CanvasPageLazy = React.lazy(() =>
  import("./dm/canvas/pages/CanvasPage.js").then((module) => ({ default: module.CanvasPage })),
);
const GraphPageLazy = React.lazy(() =>
  import("./dm/graph/GraphPage.js").then((module) => ({ default: module.GraphPage })),
);
const TimelinePageLazy = React.lazy(() =>
  import("./dm/sessions/TimelinePage.js").then((module) => ({ default: module.TimelinePage })),
);
const SearchPageLazy = React.lazy(() =>
  import("./dm/pages/SearchPage.js").then((module) => ({ default: module.SearchPage })),
);
const BoardsPageLazy = React.lazy(() =>
  import("./dm/pages/BoardsPage.js").then((module) => ({ default: module.BoardsPage })),
);
const PlayersPageLazy = React.lazy(() =>
  import("./dm/pages/PlayersPage.js").then((module) => ({ default: module.PlayersPage })),
);
const RulesPageLazy = React.lazy(() =>
  import("./dm/pages/RulesPage.js").then((module) => ({ default: module.RulesPage })),
);
const PlayerKnowledgePageLazy = React.lazy(() =>
  import("./dm/pages/PlayerKnowledgePage.js").then((module) => ({ default: module.PlayerKnowledgePage })),
);
const SettingsPageLazy = React.lazy(() =>
  import("./dm/pages/SettingsPage.js").then((module) => ({ default: module.SettingsPage })),
);
const OnboardingPageLazy = React.lazy(() =>
  import("./dm/pages/OnboardingPage.js").then((module) => ({ default: module.OnboardingPage })),
);
const PremadeCampaignPreviewPageLazy = React.lazy(() =>
  import("./dm/pages/PremadeCampaignPreviewPage.js").then((module) => ({ default: module.PremadeCampaignPreviewPage })),
);
const AccountPageLazy = React.lazy(() =>
  import("./account/AccountPage.js").then((module) => ({ default: module.AccountPage })),
);
const AboutPageLazy = React.lazy(() =>
  import("./institutional/InstitutionalPage.js").then((module) => ({ default: module.AboutPage })),
);
const ContactPageLazy = React.lazy(() =>
  import("./institutional/InstitutionalPage.js").then((module) => ({ default: module.ContactPage })),
);
const PrivacyPageLazy = React.lazy(() =>
  import("./institutional/InstitutionalPage.js").then((module) => ({ default: module.PrivacyPage })),
);
const TermsPageLazy = React.lazy(() =>
  import("./institutional/InstitutionalPage.js").then((module) => ({ default: module.TermsPage })),
);
const ForgotPasswordPageLazy = React.lazy(() =>
  import("./shared/auth/ForgotPasswordPage.js").then((module) => ({ default: module.ForgotPasswordPage })),
);
const ResetPasswordPageLazy = React.lazy(() =>
  import("./shared/auth/ResetPasswordPage.js").then((module) => ({ default: module.ResetPasswordPage })),
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

function RootRouteComponent() {
  return (
    <>
      <PlayerPortalRealtimeSync />
      <Outlet />
    </>
  );
}

const rootRoute = createRootRoute({ component: RootRouteComponent });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: withSuspense(PromoLandingLazy),
});

const portalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/portal",
  beforeLoad: requireAccountSession,
  component: withSuspense(SmartLandingLazy),
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

const dmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dm",
  beforeLoad: requireAccountSession,
  component: withSuspense(DmHubPageLazy),
});

const dmSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dm/setup",
  component: withSuspense(DmSetupPageLazy),
});

const dmLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dm/login",
  component: withSuspense(DmLoginPageLazy),
});

const playerJoinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/player/join",
  component: withSuspense(PlayerJoinPageLazy),
});

const playerJoinTokenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/join/$inviteToken",
  component: withSuspense(PlayerJoinPageLazy),
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: withSuspense(RegisterPageLazy),
});

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account",
  beforeLoad: requireAccountSession,
  component: withSuspense(AccountPageLazy),
});

const campaignRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/campaigns/$campaignId",
  beforeLoad: requireAccountSession,
  component: withSuspense(CampaignShellPage),
});

const commandCenterRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/command-center",
  component: withSuspense(CommandCenterPageLazy),
});

const sessionRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/sessions/$sessionId",
  component: withSuspense(SessionPageLazy),
});

const entitiesRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/entities",
  component: withSuspense(EntitiesPageLazy),
});

const canvasRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/canvas",
  component: withSuspense(CanvasPageLazy),
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

const searchRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/search",
  component: withSuspense(SearchPageLazy),
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

const rulesRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/rules",
  component: withSuspense(RulesPageLazy),
});

const playerKnowledgeRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/player-knowledge",
  component: withSuspense(PlayerKnowledgePageLazy),
});

const settingsRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/settings",
  component: withSuspense(SettingsPageLazy),
});

const onboardingRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/onboarding",
  component: withSuspense(OnboardingPageLazy),
});

const premadePreviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/premades/$templateId",
  beforeLoad: requireAccountSession,
  component: withSuspense(PremadeCampaignPreviewPageLazy),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  portalRoute,
  aboutRoute,
  contactRoute,
  privacyRoute,
  termsRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  resetPasswordManualRoute,
  dmRoute,
  dmSetupRoute,
  dmLoginRoute,
  playerJoinRoute,
  playerJoinTokenRoute,
  registerRoute,
  accountRoute,
  campaignRoute.addChildren([
    commandCenterRoute,
    sessionRoute,
    entitiesRoute,
    canvasRoute,
    graphRoute,
    timelineRoute,
    searchRoute,
    boardsRoute,
    playersRoute,
    rulesRoute,
    playerKnowledgeRoute,
    settingsRoute,
    onboardingRoute,
  ]),
  premadePreviewRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
