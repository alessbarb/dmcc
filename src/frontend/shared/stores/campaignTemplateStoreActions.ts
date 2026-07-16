import { createId } from "@shared/ids.js";
import { markCampaignGuidedTourPending } from "../../dm/onboarding/campaignGuidedTourStorage.js";
import {
  getCampaignTemplate,
  getCampaignTemplateLocale,
  importCampaignTemplate,
  listCampaignTemplates,
  readApiError,
} from "../api.js";
import { readNdjsonStream } from "../api/readNdjsonStream.js";
import type { CampaignTemplateImportEvent } from "@shared/templateImportTypes.js";
import type {
  CampaignStateStore,
  CampaignTemplate,
  CampaignTemplateImportState,
} from "./campaignStore.js";

type StoreSet = (
  partial: Partial<CampaignStateStore> | ((state: CampaignStateStore) => Partial<CampaignStateStore>)
) => void;

type CampaignTemplateActions = Pick<
  CampaignStateStore,
  | "clearCampaignTemplateImportState"
  | "fetchCampaignTemplates"
  | "fetchCampaignTemplate"
  | "importCampaignTemplate"
>;

export const idleCampaignTemplateImportState = (): CampaignTemplateImportState => ({
  status: "idle",
  templateId: null,
  operationId: null,
  campaignId: null,
  completedSteps: 0,
  totalSteps: 0,
  percent: 0,
  stage: null,
  error: null,
});

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function createCampaignTemplateActions(set: StoreSet, get: () => CampaignStateStore): CampaignTemplateActions {
  return {
    clearCampaignTemplateImportState: () => set({ campaignTemplateImportState: idleCampaignTemplateImportState() }),

    fetchCampaignTemplates: async () => {
      const locale = getCampaignTemplateLocale();
      try {
        const response = await listCampaignTemplates(locale);
        if (!response.ok) {
          throw new Error(await readApiError(response, "Failed to fetch campaign templates"));
        }
        const data = await response.json();
        set({
          campaignTemplates: Array.isArray(data.templates) ? data.templates : [],
          campaignTemplatesLocale: locale,
        });
      } catch (error) {
        set({ campaignTemplates: [], campaignTemplatesLocale: locale, error: errorMessage(error) });
      }
    },

    fetchCampaignTemplate: async (templateId: string) => {
      const locale = getCampaignTemplateLocale();
      set({ loading: true, error: null });
      try {
        const response = await getCampaignTemplate(templateId, locale);
        if (!response.ok) {
          throw new Error(await readApiError(response, "Failed to fetch campaign template"));
        }
        const template = await response.json() as CampaignTemplate;
        set({ activeCampaignTemplate: template, activeCampaignTemplateKey: `${templateId}:${locale}`, loading: false });
        return template;
      } catch (error) {
        set({ activeCampaignTemplate: null, activeCampaignTemplateKey: null, error: errorMessage(error), loading: false });
        return null;
      }
    },

    importCampaignTemplate: async (templateId, options) => {
      const operationId = `imp_${createId("cmd")}`;
      set({
        campaignTemplateImportState: {
          ...idleCampaignTemplateImportState(),
          status: "running",
          templateId,
          operationId,
          stage: "preparing",
        },
      });

      try {
        const response = await importCampaignTemplate(templateId, options, {
          "Idempotency-Key": operationId,
        });
        if (!response.ok) {
          throw new Error(await readApiError(response, "Failed to import campaign template"));
        }

        let campaignId: string | null = null;
        let successEventReceived = false;
        await readNdjsonStream<CampaignTemplateImportEvent>(response, (event) => {
          if (event.type === "started") {
            campaignId = event.campaignId;
            set((state) => ({
              campaignTemplateImportState: {
                ...state.campaignTemplateImportState,
                campaignId: event.campaignId,
                totalSteps: event.totalSteps,
              },
            }));
          } else if (event.type === "progress") {
            set((state) => ({
              campaignTemplateImportState: {
                ...state.campaignTemplateImportState,
                completedSteps: event.completedSteps,
                totalSteps: event.totalSteps,
                percent: event.percent,
                stage: event.stage,
              },
            }));
          } else if (event.type === "success") {
            successEventReceived = true;
            campaignId = event.campaignId;
            set((state) => ({
              campaignTemplateImportState: {
                ...state.campaignTemplateImportState,
                status: "idle",
                percent: 100,
                campaignId: event.campaignId,
              },
            }));
          } else if (event.type === "error") {
            throw new Error(event.messageKey || "Failed to import campaign template");
          }
        });

        if (!successEventReceived || !campaignId) {
          throw new Error("campaignTemplateImport.error.interrupted");
        }

        await get().fetchCampaigns();
        markCampaignGuidedTourPending(campaignId);
        return campaignId;
      } catch (error) {
        const message = error instanceof Error ? error.message : "campaignTemplateImport.error.failed";
        set((state) => ({
          campaignTemplateImportState: {
            ...state.campaignTemplateImportState,
            status: "failed",
            error: message,
          },
        }));
        throw error;
      }
    },
  };
}
