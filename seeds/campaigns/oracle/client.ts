import { initSeedClient, preflightSeedClient, api as sharedApi } from "../../shared/seedClient.js";
import { BASE, CAMPAIGN_TITLE, CMP, CONFIRMATION, MODE } from "./config.js";

export async function init() {
  await initSeedClient({
    baseUrl: BASE,
    campaignTitle: CAMPAIGN_TITLE,
    campaignId: CMP,
    mode: MODE,
    confirmation: CONFIRMATION,
  });
}

export async function preflight() {
  return await preflightSeedClient();
}

export const api = sharedApi;
