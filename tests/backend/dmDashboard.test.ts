import { describe, expect, it } from "vitest";
import { createServer } from "../../src/backend/server/createServer.js";

function sessionCookie(response: any): string {
  const header = response.headers["set-cookie"];
  const cookieStr = Array.isArray(header) ? header[0] : String(header);
  expect(cookieStr).toContain("dmcc_session=");
  return cookieStr.split(";")[0];
}

async function registerAndLogin(server: ReturnType<typeof createServer>, email: string, password: string) {
  const register = await server.inject({
    method: "POST",
    url: "/api/auth/register",
    payload: { email, password, displayName: "Dashboard DM" },
  });
  expect(register.statusCode, register.body).toBe(201);

  const login = await server.inject({
    method: "POST",
    url: "/api/auth/login",
    payload: { email, password },
  });
  expect(login.statusCode, login.body).toBe(200);
  return sessionCookie(login);
}

describe("DM dashboard endpoint", () => {
  it("returns a normalized global DM dashboard", async () => {
    const server = createServer({ storageMode: "postgres" });
    const suffix = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const cookie = await registerAndLogin(server, `dm_dashboard_${suffix}@example.com`, "correct horse battery");

    const emptyRes = await server.inject({
      method: "GET",
      url: "/api/dm/dashboard?locale=en",
      headers: { cookie },
    });
    expect(emptyRes.statusCode, emptyRes.body).toBe(200);
    expect(emptyRes.json()).toMatchObject({
      totals: {
        campaigns: 0,
        activeTables: 0,
        players: 0,
        sessions: 0,
        npcs: 0,
        entities: 0,
      },
      campaigns: [],
      activeTables: [],
      alerts: [],
      recentActivity: [],
    });
    expect(emptyRes.json().premadeTemplates.length).toBeGreaterThan(0);

    const campaignId = `cmp_dm_dash_${suffix.replace(/[^a-zA-Z0-9_]/g, "_")}`;
    const createRes = await server.inject({
      method: "POST",
      url: "/api/campaigns",
      headers: { cookie },
      payload: {
        campaignId,
        title: "Dashboard Contract Campaign",
        system: "generic_fantasy_d20",
      },
    });
    expect(createRes.statusCode, createRes.body).toBe(201);

    const dashboardRes = await server.inject({
      method: "GET",
      url: "/api/dm/dashboard?locale=en",
      headers: { cookie },
    });
    expect(dashboardRes.statusCode, dashboardRes.body).toBe(200);
    const dashboard = dashboardRes.json();

    expect(dashboard.totals.campaigns).toBe(1);
    expect(dashboard.totals.activeTables).toBe(0);
    expect(dashboard.campaigns).toHaveLength(1);
    expect(dashboard.campaigns[0]).toMatchObject({
      campaignId,
      title: "Dashboard Contract Campaign",
      system: "generic_fantasy_d20",
      stats: {
        playersCount: 0,
        npcsCount: 0,
        locationsCount: 0,
        questsCount: 0,
        secretsCount: 0,
        cluesCount: 0,
        sessionsCount: 0,
        activeSession: null,
      },
    });
    expect(dashboard.alerts.some((alert: any) => alert.id === "missing_campaign_cover")).toBe(true);
    expect(dashboard.alerts.some((alert: any) => alert.id === "empty_campaigns")).toBe(true);

    await server.close();
  }, 60000);
});
