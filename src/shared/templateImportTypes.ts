export type ImportStage =
  | "preparing"
  | "campaign"
  | "entities"
  | "relations"
  | "facts"
  | "sessions"
  | "canvases"
  | "finalizing";

export type CampaignTemplateImportEvent =
  | {
      type: "started";
      schemaVersion: 1;
      operationId: string;
      campaignId: string;
      totalSteps: number;
    }
  | {
      type: "progress";
      completedSteps: number;
      totalSteps: number;
      percent: number;
      stage: ImportStage;
    }
  | {
      type: "success";
      campaignId: string;
      title: string;
    }
  | {
      type: "error";
      operationId: string;
      code: string;
      messageKey: string;
    };
