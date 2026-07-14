import type { CampaignId, NotebookId, NotebookItemId } from "@shared/ids.js";
import type { NotebookItemTargetType } from "../resource/resourceType.js";

export interface CampaignNotebook {
  campaignId: CampaignId;
  notebookId: NotebookId;
  parentNotebookId?: NotebookId | null;
  title: string;
  description?: string | null;
  icon?: string | null;
  sortOrder: number;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignNotebookItem {
  campaignId: CampaignId;
  notebookItemId: NotebookItemId;
  notebookId: NotebookId;
  targetType: NotebookItemTargetType;
  targetId: string;
  sortOrder: number;
  createdAt: string;
}
