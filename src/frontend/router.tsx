import React, { Suspense } from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { useTranslation } from "./shared/i18n/useTranslation.js";
import { PlayerPortalRealtimeSync } from "./player/components/PlayerPortalRealtimeSync.js";
import { fetchSession } from "./shared/auth/authClient.js";
import type { PlatformRole } from "./shared/auth/authTypes.js";
import { SystemAnnouncements } from "./shared/components/SystemAnnouncements.js";

async function requireAccountSession() {
  try {
    const session = await fetchSession();
    if (!session.sessionValid) throw redirect({ to: "/auth/login" });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "isRedirect" in error) throw error;
    throw redirect({ to: "/auth/login" });
  }
}

function requirePlatformRole(role: PlatformRole) {
  return async () => {
    const session = await fetchSession();
    if (!session.sessionValid) throw redirect({ to: "/auth/login" });
    if (!session.user?.roles?.includes(role)) throw redirect({ to: "/home" });
  };
}

const PromoLandingLazy = React.lazy(() =>
  import("./MainLanding.js").then((module) => ({ default: module.MainLanding })),
);
const AccountHomePageLazy = React.lazy(() =>
  import("./home/AccountHomePage.js").then((module) => ({ default: module.AccountHomePage })),
);
const PlayerCampaignsPageLazy = React.lazy(() =>
  import("./player/pages/PlayerCampaignsPage.js").then((module) => ({ default: module.PlayerCampaignsPage })),
);
const PlayerCampaignShellLazy = React.lazy(() =>
  import("./player/pages/PlayerCampaignShell.js").then((module) => ({ default: module.PlayerCampaignShell })),
);
const PlayerCampaignOverviewLazy = React.lazy(() =>
  import("./player/pages/PlayerCampaignTabRoutes.js").then((module) => ({ default: module.PlayerCampaignOverviewRoute })),
);
const PlayerCampaignRecapLazy = React.lazy(() =>
  import("./player/pages/PlayerCampaignTabRoutes.js").then((module) => ({ default: module.PlayerCampaignRecapRoute })),
);
const PlayerCampaignCharacterLazy = React.lazy(() =>
  import("./player/pages/PlayerCampaignTabRoutes.js").then((module) => ({ default: module.PlayerCampaignCharacterRoute })),
);
const PlayerCampaignMemoryLazy = React.lazy(() =>
  import("./player/pages/PlayerCampaignTabRoutes.js").then((module) => ({ default: module.PlayerCampaignMemoryRoute })),
);
const PlayerCampaignConstellationLazy = React.lazy(() =>
  import("./player/pages/PlayerCampaignTabRoutes.js").then((module) => ({ default: module.PlayerCampaignConstellationRoute })),
);
const PlayerCampaignObjectivesLazy = React.lazy(() =>
  import("./player/pages/PlayerCampaignTabRoutes.js").then((module) => ({ default: module.PlayerCampaignObjectivesRoute })),
);
const PlayerCampaignNotesLazy = React.lazy(() =>
  import("./player/pages/PlayerCampaignTabRoutes.js").then((module) => ({ default: module.PlayerCampaignNotesRoute })),
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
const RegisterPageLazy = React.lazy(() =>
  import("./auth/RegisterPage.js").then((module) => ({ default: module.RegisterPage })),
);
const InvitationPageLazy = React.lazy(() =>
  import("./invitations/InvitationPage.js").then((module) => ({ default: module.InvitationPage })),
);
const PlayerJoinPageLazy = React.lazy(() =>
  import("./player/pages/PlayerJoinPage.js").then((module) => ({ default: module.PlayerJoinPage })),
);
const PlayerMessagesPageLazy = React.lazy(() =>
  import("./player/pages/PlayerMessagesPage.js").then((module) => ({ default: module.PlayerMessagesPage })),
);
const OverviewPageLazy = React.lazy(() =>
  import("./dm/overview/OverviewPage.js").then((module) => ({ default: module.OverviewPage })),
);
const LibraryWorkspacePageLazy = React.lazy(() =>
  import("./dm/library/LibraryWorkspacePage.js").then((module) => ({ default: module.LibraryWorkspacePage })),
);
const EntityListViewLazy = React.lazy(() =>
  import("./dm/library/list/EntityListView.js").then((module) => ({ default: module.EntityListView })),
);
const EntityBoardsViewLazy = React.lazy(() =>
  import("./dm/library/boards/EntityBoardsView.js").then((module) => ({ default: module.EntityBoardsView })),
);
const LibraryNotebooksViewLazy = React.lazy(() =>
  import("./dm/library/notebooks/NotebooksView.js").then((module) => ({ default: module.NotebooksView })),
);
const CampaignMapWorkspacePageLazy = React.lazy(() =>
  import("./dm/map/CampaignMapWorkspacePage.js").then((module) => ({ default: module.CampaignMapWorkspacePage })),
);
const CanvasViewLazy = React.lazy(() =>
  import("./dm/map/canvas/CanvasView.js").then((module) => ({ default: module.CanvasView })),
);
const NetworkViewLazy = React.lazy(() =>
  import("./dm/map/network/NetworkView.js").then((module) => ({ default: module.NetworkView })),
);
const StoryWorkspacePageLazy = React.lazy(() =>
  import("./dm/story/StoryWorkspacePage.js").then((module) => ({ default: module.StoryWorkspacePage })),
);
const StoryPlanViewLazy = React.lazy(() =>
  import("./dm/story/plan/StoryPlanView.js").then((module) => ({ default: module.StoryPlanView })),
);
const CampaignHistoryViewLazy = React.lazy(() =>
  import("./dm/story/history/CampaignHistoryView.js").then((module) => ({ default: module.CampaignHistoryView })),
);
const PeopleWorkspacePageLazy = React.lazy(() =>
  import("./dm/people/PeopleWorkspacePage.js").then((module) => ({ default: module.PeopleWorkspacePage })),
);
const GroupViewLazy = React.lazy(() =>
  import("./dm/people/group/GroupView.js").then((module) => ({ default: module.GroupView })),
);
const InvitationsViewLazy = React.lazy(() =>
  import("./dm/people/invitations/InvitationsView.js").then((module) => ({ default: module.InvitationsView })),
);
const PlayerKnowledgeViewLazy = React.lazy(() =>
  import("./dm/people/knowledge/PlayerKnowledgeView.js").then((module) => ({ default: module.PlayerKnowledgeView })),
);
const SessionsIndexPageLazy = React.lazy(() =>
  import("./dm/sessions/SessionsIndexPage.js").then((module) => ({ default: module.SessionsIndexPage })),
);
const SessionDetailPageLazy = React.lazy(() =>
  import("./dm/sessions/SessionDetailPage.js").then((module) => ({ default: module.SessionDetailPage })),
);
const SessionNarrativeMapPageLazy = React.lazy(() =>
  import("./dm/sessions/narrativeMap/SessionNarrativeMapPage.js").then((module) => ({ default: module.SessionNarrativeMapPage })),
);
const SessionConsequenceChainPageLazy = React.lazy(() =>
  import("./dm/sessions/consequenceChain/SessionConsequenceChainPage.js").then((module) => ({ default: module.SessionConsequenceChainPage })),
);
const CampaignMessagesPageLazy = React.lazy(() =>
  import("./dm/pages/CampaignMessagesPage.js").then((module) => ({ default: module.CampaignMessagesPage })),
);
const RulesPageLazy = React.lazy(() =>
  import("./dm/pages/RulesPage.js").then((module) => ({ default: module.RulesPage })),
);
const SettingsPageLazy = React.lazy(() =>
  import("./dm/pages/SettingsPage.js").then((module) => ({ default: module.SettingsPage })),
);
const OnboardingPageLazy = React.lazy(() =>
  import("./dm/pages/OnboardingPage.js").then((module) => ({ default: module.OnboardingPage })),
);
const CampaignTemplatePreviewPageLazy = React.lazy(() =>
  import("./dm/pages/CampaignTemplatePreviewPage.js").then((module) => ({ default: module.CampaignTemplatePreviewPage })),
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
    return <Suspense fallback={<div className="page-loading">Loading...</div>}><Component /></Suspense>;
  };
}

function RootRouteComponent() {
  return <><SystemAnnouncements /><PlayerPortalRealtimeSync /><Outlet /></>;
}

function RootNotFoundComponent() {
  const { t } = useTranslation();
  return (
    <div className="page-loading" role="alert">
      <p>{t("common.routeNotFoundTitle")}</p>
      <p>{t("common.routeNotFoundDescription")}</p>
      <Link to="/home" className="btn btn-primary btn-sm">{t("common.backToHome")}</Link>
    </div>
  );
}

const rootRoute = createRootRoute({ component: RootRouteComponent, notFoundComponent: RootNotFoundComponent });
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
const playerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/player",
  beforeLoad: requirePlatformRole("player"),
  component: withSuspense(PlayerCampaignsPageLazy),
});
const playerCampaignRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/player/campaigns/$campaignId",
  beforeLoad: requirePlatformRole("player"),
  component: withSuspense(PlayerCampaignShellLazy),
});
const playerCampaignIndexRoute = createRoute({
  getParentRoute: () => playerCampaignRoute,
  path: "/",
  beforeLoad: ({ params }) => { throw redirect({ to: "/player/campaigns/$campaignId/overview", params }); },
  component: () => null,
});
const playerCampaignOverviewRoute = createRoute({
  getParentRoute: () => playerCampaignRoute,
  path: "/overview",
  component: withSuspense(PlayerCampaignOverviewLazy),
});
const playerCampaignRecapRoute = createRoute({
  getParentRoute: () => playerCampaignRoute,
  path: "/recap",
  component: withSuspense(PlayerCampaignRecapLazy),
});
const playerCampaignCharacterRoute = createRoute({
  getParentRoute: () => playerCampaignRoute,
  path: "/character",
  component: withSuspense(PlayerCampaignCharacterLazy),
});
const playerCampaignMemoryRoute = createRoute({
  getParentRoute: () => playerCampaignRoute,
  path: "/memory",
  component: withSuspense(PlayerCampaignMemoryLazy),
});
const playerCampaignConstellationRoute = createRoute({
  getParentRoute: () => playerCampaignRoute,
  path: "/constellation",
  component: withSuspense(PlayerCampaignConstellationLazy),
});
const playerCampaignObjectivesRoute = createRoute({
  getParentRoute: () => playerCampaignRoute,
  path: "/objectives",
  component: withSuspense(PlayerCampaignObjectivesLazy),
});
const playerCampaignNotesRoute = createRoute({
  getParentRoute: () => playerCampaignRoute,
  path: "/notes",
  component: withSuspense(PlayerCampaignNotesLazy),
});
const playerCampaignMessagesRoute = createRoute({
  getParentRoute: () => playerCampaignRoute,
  path: "/messages",
  component: withSuspense(PlayerMessagesPageLazy),
});
const invitationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/invitations/$inviteToken",
  component: withSuspense(InvitationPageLazy),
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
  beforeLoad: requirePlatformRole("dm"),
  component: withSuspense(DmHubPageLazy),
});
const authRegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/register",
  component: withSuspense(RegisterPageLazy),
});
const authLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/login",
  component: withSuspense(LoginPageLazy),
});
const playerJoinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/player/join",
  component: withSuspense(PlayerJoinPageLazy),
});

const campaignRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/campaigns/$campaignId",
  beforeLoad: requirePlatformRole("dm"),
  component: withSuspense(CampaignShellPage),
});
const campaignIndexRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/",
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/campaigns/$campaignId/overview", params });
  },
  component: () => null,
});
const overviewRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/overview",
  component: withSuspense(OverviewPageLazy),
});
const sessionRedirectRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/session",
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/campaigns/$campaignId/sessions", params });
  },
  component: () => null,
});
const sessionsRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/sessions",
  component: withSuspense(SessionsIndexPageLazy),
});
const sessionDetailRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/sessions/$sessionId",
  component: withSuspense(SessionDetailPageLazy),
});
const sessionNarrativeMapRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/sessions/$sessionId/map",
  component: withSuspense(SessionNarrativeMapPageLazy),
});
const sessionConsequenceChainRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/sessions/$sessionId/consequences",
  component: withSuspense(SessionConsequenceChainPageLazy),
});

// Library Workspace
const libraryRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/library",
  component: withSuspense(LibraryWorkspacePageLazy),
});
const libraryIndexRoute = createRoute({
  getParentRoute: () => libraryRoute,
  path: "/",
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/campaigns/$campaignId/library/list", params });
  },
  component: () => null,
});
const libraryListRoute = createRoute({
  getParentRoute: () => libraryRoute,
  path: "/list",
  component: withSuspense(EntityListViewLazy),
});
const libraryBoardsRoute = createRoute({
  getParentRoute: () => libraryRoute,
  path: "/boards",
  component: withSuspense(EntityBoardsViewLazy),
});
const libraryNotebooksRoute = createRoute({
  getParentRoute: () => libraryRoute,
  path: "/notebooks",
  component: withSuspense(LibraryNotebooksViewLazy),
});

// Map Workspace
const mapRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/map",
  component: withSuspense(CampaignMapWorkspacePageLazy),
});
const mapIndexRoute = createRoute({
  getParentRoute: () => mapRoute,
  path: "/",
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/campaigns/$campaignId/map/canvas", params });
  },
  component: () => null,
});
const mapCanvasRoute = createRoute({
  getParentRoute: () => mapRoute,
  path: "/canvas",
  component: withSuspense(CanvasViewLazy),
});
const mapNetworkRoute = createRoute({
  getParentRoute: () => mapRoute,
  path: "/network",
  component: withSuspense(NetworkViewLazy),
});

// Story Workspace
const storyRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/story",
  component: withSuspense(StoryWorkspacePageLazy),
});
const storyIndexRoute = createRoute({
  getParentRoute: () => storyRoute,
  path: "/",
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/campaigns/$campaignId/story/history", params });
  },
  component: () => null,
});
const storyHistoryRoute = createRoute({
  getParentRoute: () => storyRoute,
  path: "/history",
  component: withSuspense(CampaignHistoryViewLazy),
});
const storyPlanRoute = createRoute({
  getParentRoute: () => storyRoute,
  path: "/plan",
  component: withSuspense(StoryPlanViewLazy),
});

// People Workspace
const peopleRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/people",
  component: withSuspense(PeopleWorkspacePageLazy),
});
const peopleIndexRoute = createRoute({
  getParentRoute: () => peopleRoute,
  path: "/",
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/campaigns/$campaignId/people/group", params });
  },
  component: () => null,
});
const peopleGroupRoute = createRoute({
  getParentRoute: () => peopleRoute,
  path: "/group",
  component: withSuspense(GroupViewLazy),
});
const peopleInvitationsRoute = createRoute({
  getParentRoute: () => peopleRoute,
  path: "/invitations",
  component: withSuspense(InvitationsViewLazy),
});
const peopleKnowledgeRoute = createRoute({
  getParentRoute: () => peopleRoute,
  path: "/knowledge",
  component: withSuspense(PlayerKnowledgeViewLazy),
});

const messagesRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/messages",
  component: withSuspense(CampaignMessagesPageLazy),
});
const rulesRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/rules",
  component: withSuspense(RulesPageLazy),
});
const settingsRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/settings",
  component: withSuspense(SettingsPageLazy),
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  beforeLoad: requirePlatformRole("dm"),
  component: withSuspense(OnboardingPageLazy),
});
const campaignTemplatePreviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/campaign-templates/$templateId",
  component: withSuspense(CampaignTemplatePreviewPageLazy),
});
const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account",
  beforeLoad: requireAccountSession,
  component: withSuspense(AccountPageLazy),
});

const adminGuard = requirePlatformRole("admin");
const adminOverviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  beforeLoad: adminGuard,
  component: withSuspense(AdminOverviewPageLazy),
});
const adminCampaignsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/campaigns",
  beforeLoad: adminGuard,
  component: withSuspense(AdminCampaignListPageLazy),
});
const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/users",
  beforeLoad: adminGuard,
  component: withSuspense(AdminUserListPageLazy),
});
const adminPurgeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/purge",
  beforeLoad: adminGuard,
  component: withSuspense(AdminPurgeJobsPageLazy),
});
const adminAuditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/audit",
  beforeLoad: adminGuard,
  component: withSuspense(AdminAuditLogPageLazy),
});
const adminInvitationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/invitations",
  beforeLoad: adminGuard,
  component: withSuspense(AdminInvitationListPageLazy),
});
const adminAnnouncementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/announcements",
  beforeLoad: adminGuard,
  component: withSuspense(AdminAnnouncementListPageLazy),
});
const adminCampaignTemplatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/campaign-templates",
  beforeLoad: adminGuard,
  component: withSuspense(AdminCampaignTemplateSettingsPageLazy),
});
const adminGameSystemsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/game-systems",
  beforeLoad: adminGuard,
  component: withSuspense(AdminGameSystemSettingsPageLazy),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  homeRoute,
  playerRoute,
  invitationRoute,
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
  accountRoute,
  onboardingRoute,
  campaignTemplatePreviewRoute,
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
    overviewRoute,
    sessionRedirectRoute,
    sessionsRoute,
    sessionDetailRoute,
    sessionNarrativeMapRoute,
    sessionConsequenceChainRoute,
    libraryRoute.addChildren([
      libraryIndexRoute,
      libraryListRoute,
      libraryBoardsRoute,
      libraryNotebooksRoute,
    ]),
    mapRoute.addChildren([
      mapIndexRoute,
      mapCanvasRoute,
      mapNetworkRoute,
    ]),
    storyRoute.addChildren([
      storyIndexRoute,
      storyHistoryRoute,
      storyPlanRoute,
    ]),
    peopleRoute.addChildren([
      peopleIndexRoute,
      peopleGroupRoute,
      peopleInvitationsRoute,
      peopleKnowledgeRoute,
    ]),
    messagesRoute,
    rulesRoute,
    settingsRoute,
  ]),
  playerCampaignRoute.addChildren([
    playerCampaignIndexRoute,
    playerCampaignOverviewRoute,
    playerCampaignRecapRoute,
    playerCampaignCharacterRoute,
    playerCampaignMemoryRoute,
    playerCampaignConstellationRoute,
    playerCampaignObjectivesRoute,
    playerCampaignNotesRoute,
    playerCampaignMessagesRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
