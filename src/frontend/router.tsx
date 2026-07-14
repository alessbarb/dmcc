import React, { Suspense } from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { PlayerPortalRealtimeSync } from "./player/components/PlayerPortalRealtimeSync.js";
import { fetchAccountContext, type PlatformRole } from "./shared/auth/accountContextClient.js";
import { fetchAuthStatus } from "./shared/auth/authClient.js";
import { SystemAnnouncements } from "./shared/components/SystemAnnouncements.js";

async function requireAccountSession() {
  try {
    const status = await fetchAuthStatus();
    if (!status.sessionValid) throw redirect({ to: "/auth/login" });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "isRedirect" in error) throw error;
    throw redirect({ to: "/auth/login" });
  }
}

function requirePlatformRole(role: PlatformRole) {
  return async () => {
    await requireAccountSession();
    const context = await fetchAccountContext();
    if (!context.roles.includes(role)) {
      throw redirect({ to: "/home" });
    }
  };
}

const PromoLandingLazy = React.lazy(() =>
  import("./MainLanding.js").then((module) => ({ default: module.MainLanding })),
);
const AccountHomePageLazy = React.lazy(() =>
  import("./home/AccountHomePage.js").then((module) => ({ default: module.AccountHomePage })),
);
const SmartLandingLazy = React.lazy(() =>
  import("./SmartLanding.js").then((module) => ({ default: module.SmartLanding })),
);
const PlayerCampaignsPageLazy = React.lazy(() =>
  import("./player/pages/PlayerCampaignsPage.js").then((module) => ({ default: module.PlayerCampaignsPage })),
);
const DmHubPageLazy = React.lazy(() =>
  import("./dm/hub/DmHubPage.js").then((module) => ({ default: module.DmHubPage })),
);
const CampaignShellPage = React.lazy(() =>
  import("./dm/layouts/CampaignShell.js").then((module) => ({ default: module.CampaignShell })),
);
const LoginPageLazy = React.lazy(() =>
  import("./auth/LoginPage.js").then((module) => ({ default: module.LoginPage })),
);
const RegisterPageLazyCommon = React.lazy(() =>
  import("./auth/RegisterPage.js").then((module) => ({ default: module.RegisterPage })),
);
const PlayerJoinPageLazy = React.lazy(() =>
  import("./player/pages/PlayerJoinPage.js").then((module) => ({ default: module.PlayerJoinPage })),
);
const PlayerMessagesPageLazy = React.lazy(() =>
  import("./player/pages/PlayerMessagesPage.js").then((module) => ({ default: module.PlayerMessagesPage })),
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
const CampaignMessagesPageLazy = React.lazy(() =>
  import("./dm/pages/CampaignMessagesPage.js").then((module) => ({ default: module.CampaignMessagesPage })),
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
const AdminOverviewPageLazy = React.lazy(() =>
  import("./admin/overview/OperationsOverviewPage.js").then((module) => ({ default: module.OperationsOverviewPage })),
);
const AdminCampaignListPageLazy = React.lazy(() =>
  import("./admin/campaigns/CampaignListPage.js").then((module) => ({ default: module.CampaignListPage })),
);
const AdminUserListPageLazy = React.lazy(() =>
  import("./admin/users/UserListPage.js").then((module) => ({ default: module.UserListPage })),
);
const AdminPurgeJobsPageLazy = React.lazy(() =>
  import("./admin/purge/CampaignPurgeJobsPage.js").then((module) => ({ default: module.CampaignPurgeJobsPage })),
);
const AdminAuditLogPageLazy = React.lazy(() =>
  import("./admin/audit/AuditLogPage.js").then((module) => ({ default: module.AuditLogPage })),
);
const AdminInvitationListPageLazy = React.lazy(() =>
  import("./admin/invitations/InvitationListPage.js").then((module) => ({ default: module.InvitationListPage })),
);
const AdminAnnouncementListPageLazy = React.lazy(() =>
  import("./admin/announcements/AnnouncementListPage.js").then((module) => ({ default: module.AnnouncementListPage })),
);
const AdminCampaignTemplateSettingsPageLazy = React.lazy(() =>
  import("./admin/campaignTemplates/CampaignTemplateSettingsPage.js").then((module) => ({ default: module.CampaignTemplateSettingsPage })),
);
const AdminGameSystemSettingsPageLazy = React.lazy(() =>
  import("./admin/gameSystems/GameSystemSettingsPage.js").then((module) => ({ default: module.GameSystemSettingsPage })),
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
      <SystemAnnouncements />
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

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/home",
  beforeLoad: requireAccountSession,
  component: withSuspense(AccountHomePageLazy),
});

const portalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/portal",
  beforeLoad: requirePlatformRole("player"),
  component: withSuspense(SmartLandingLazy),
});

const playerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/player",
  beforeLoad: requirePlatformRole("player"),
  component: withSuspense(PlayerCampaignsPageLazy),
});

const playerMessagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/portal/messages/$campaignId",
  beforeLoad: requirePlatformRole("player"),
  component: withSuspense(PlayerMessagesPageLazy),
});

const aboutRoute = createRoute({ getParentRoute: () => rootRoute, path: "/about", component: withSuspense(AboutPageLazy) });
const contactRoute = createRoute({ getParentRoute: () => rootRoute, path: "/contact", component: withSuspense(ContactPageLazy) });
const privacyRoute = createRoute({ getParentRoute: () => rootRoute, path: "/privacy", component: withSuspense(PrivacyPageLazy) });
const termsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/terms", component: withSuspense(TermsPageLazy) });
const forgotPasswordRoute = createRoute({ getParentRoute: () => rootRoute, path: "/forgot-password", component: withSuspense(ForgotPasswordPageLazy) });
const resetPasswordRoute = createRoute({ getParentRoute: () => rootRoute, path: "/reset-password/$token", component: withSuspense(ResetPasswordPageLazy) });
const resetPasswordManualRoute = createRoute({ getParentRoute: () => rootRoute, path: "/reset-password", component: withSuspense(ResetPasswordPageLazy) });

const dmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dm",
  beforeLoad: requirePlatformRole("dm"),
  component: withSuspense(DmHubPageLazy),
});

const authRegisterRoute = createRoute({ getParentRoute: () => rootRoute, path: "/auth/register", component: withSuspense(RegisterPageLazyCommon) });
const authLoginRoute = createRoute({ getParentRoute: () => rootRoute, path: "/auth/login", component: withSuspense(LoginPageLazy) });
const playerJoinRoute = createRoute({ getParentRoute: () => rootRoute, path: "/player/join", component: withSuspense(PlayerJoinPageLazy) });
const joinRoute = createRoute({ getParentRoute: () => rootRoute, path: "/join/$inviteToken", component: withSuspense(PlayerJoinPageLazy) });
const registerRoute = createRoute({ getParentRoute: () => rootRoute, path: "/register/$campaignId/$inviteToken", component: withSuspense(RegisterPageLazy) });

const campaignRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/campaigns/$campaignId",
  beforeLoad: requirePlatformRole("dm"),
  component: withSuspense(CampaignShellPage),
});
const campaignIndexRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/",
  beforeLoad: ({ params }) => { throw redirect({ to: "/campaigns/$campaignId/command-center", params }); },
  component: () => null,
});
const commandCenterRoute = createRoute({ getParentRoute: () => campaignRoute, path: "/command-center", component: withSuspense(CommandCenterPageLazy) });
const sessionRoute = createRoute({ getParentRoute: () => campaignRoute, path: "/session", component: withSuspense(SessionPageLazy) });
const entitiesRoute = createRoute({ getParentRoute: () => campaignRoute, path: "/entities", component: withSuspense(EntitiesPageLazy) });
const canvasRoute = createRoute({ getParentRoute: () => campaignRoute, path: "/canvas", component: withSuspense(CanvasPageLazy) });
const graphRoute = createRoute({ getParentRoute: () => campaignRoute, path: "/graph", component: withSuspense(GraphPageLazy) });
const timelineRoute = createRoute({ getParentRoute: () => campaignRoute, path: "/timeline", component: withSuspense(TimelinePageLazy) });
const searchRoute = createRoute({ getParentRoute: () => campaignRoute, path: "/search", component: withSuspense(SearchPageLazy) });
const boardsRoute = createRoute({ getParentRoute: () => campaignRoute, path: "/boards", component: withSuspense(BoardsPageLazy) });
const playersRoute = createRoute({ getParentRoute: () => campaignRoute, path: "/players", component: withSuspense(PlayersPageLazy) });
const messagesRoute = createRoute({ getParentRoute: () => campaignRoute, path: "/messages", component: withSuspense(CampaignMessagesPageLazy) });
const rulesRoute = createRoute({ getParentRoute: () => campaignRoute, path: "/rules", component: withSuspense(RulesPageLazy) });
const knowledgeRoute = createRoute({ getParentRoute: () => campaignRoute, path: "/knowledge", component: withSuspense(PlayerKnowledgePageLazy) });
const settingsRoute = createRoute({ getParentRoute: () => campaignRoute, path: "/settings", component: withSuspense(SettingsPageLazy) });

const onboardingRoute = createRoute({ getParentRoute: () => rootRoute, path: "/onboarding", beforeLoad: requirePlatformRole("dm"), component: withSuspense(OnboardingPageLazy) });
const premadePreviewRoute = createRoute({ getParentRoute: () => rootRoute, path: "/premades/$templateId", component: withSuspense(PremadeCampaignPreviewPageLazy) });
const accountRoute = createRoute({ getParentRoute: () => rootRoute, path: "/account", beforeLoad: requireAccountSession, component: withSuspense(AccountPageLazy) });

const adminGuard = requirePlatformRole("admin");
const adminOverviewRoute = createRoute({ getParentRoute: () => rootRoute, path: "/admin", beforeLoad: adminGuard, component: withSuspense(AdminOverviewPageLazy) });
const adminCampaignsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/admin/campaigns", beforeLoad: adminGuard, component: withSuspense(AdminCampaignListPageLazy) });
const adminUsersRoute = createRoute({ getParentRoute: () => rootRoute, path: "/admin/users", beforeLoad: adminGuard, component: withSuspense(AdminUserListPageLazy) });
const adminPurgeRoute = createRoute({ getParentRoute: () => rootRoute, path: "/admin/purge", beforeLoad: adminGuard, component: withSuspense(AdminPurgeJobsPageLazy) });
const adminAuditRoute = createRoute({ getParentRoute: () => rootRoute, path: "/admin/audit", beforeLoad: adminGuard, component: withSuspense(AdminAuditLogPageLazy) });
const adminInvitationsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/admin/invitations", beforeLoad: adminGuard, component: withSuspense(AdminInvitationListPageLazy) });
const adminAnnouncementsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/admin/announcements", beforeLoad: adminGuard, component: withSuspense(AdminAnnouncementListPageLazy) });
const adminCampaignTemplatesRoute = createRoute({ getParentRoute: () => rootRoute, path: "/admin/campaign-templates", beforeLoad: adminGuard, component: withSuspense(AdminCampaignTemplateSettingsPageLazy) });
const adminGameSystemsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/admin/game-systems", beforeLoad: adminGuard, component: withSuspense(AdminGameSystemSettingsPageLazy) });

const routeTree = rootRoute.addChildren([
  indexRoute,
  homeRoute,
  portalRoute,
  playerRoute,
  playerMessagesRoute,
  aboutRoute,
  contactRoute,
  privacyRoute,
  termsRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  resetPasswordManualRoute,
  dmRoute,
  authRegisterRoute,
  authLoginRoute,
  playerJoinRoute,
  joinRoute,
  registerRoute,
  accountRoute,
  onboardingRoute,
  premadePreviewRoute,
  adminOverviewRoute,
  adminCampaignsRoute,
  adminUsersRoute,
  adminPurgeRoute,
  adminAuditRoute,
  adminInvitationsRoute,
  adminAnnouncementsRoute,
  adminCampaignTemplatesRoute,
  adminGameSystemsRoute,
  campaignRoute.addChildren([
    campaignIndexRoute,
    commandCenterRoute,
    sessionRoute,
    entitiesRoute,
    canvasRoute,
    graphRoute,
    timelineRoute,
    searchRoute,
    boardsRoute,
    playersRoute,
    messagesRoute,
    rulesRoute,
    knowledgeRoute,
    settingsRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
