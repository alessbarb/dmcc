import React, { useEffect, useRef } from "react";
import { notebooksApi } from "../../shared/api.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { WorkspaceTabs, type WorkspaceTab } from "./WorkspaceTabs.js";
import "./campaignWorkspace.css";

interface CampaignWorkspaceProps {
  titleKey: string;
  descriptionKey: string;
  eyebrowKey?: string;
  tabs?: WorkspaceTab[];
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function CampaignWorkspace({
  titleKey,
  descriptionKey,
  eyebrowKey,
  tabs,
  actions,
  children,
}: CampaignWorkspaceProps) {
  const { t } = useTranslation();
  const activeCampaignId = useCampaignStore((state) => state.activeCampaignId);
  const campaignState = useCampaignStore((state) => state.campaignState);
  const hydratedCampaignStateRef = useRef<typeof campaignState>(null);

  useEffect(() => {
    if (
      !activeCampaignId
      || !campaignState
      || hydratedCampaignStateRef.current === campaignState
      || !window.location.pathname.endsWith("/library/notebooks")
    ) {
      return;
    }

    let cancelled = false;
    const sourceCampaignState = campaignState;

    void notebooksApi.listNotebooks(activeCampaignId).then(async (response) => {
      if (!response.ok || cancelled) return;

      const payload = await response.json() as {
        notebooks?: NonNullable<ReturnType<typeof useCampaignStore.getState>["campaignState"]>["notebooks"];
        items?: NonNullable<ReturnType<typeof useCampaignStore.getState>["campaignState"]>["notebookItems"];
      };
      if (cancelled) return;

      let hydratedCampaignState: ReturnType<typeof useCampaignStore.getState>["campaignState"] = null;
      useCampaignStore.setState((state) => {
        if (
          !state.campaignState
          || state.campaignState !== sourceCampaignState
          || state.activeCampaignId !== activeCampaignId
        ) {
          return state;
        }

        hydratedCampaignState = {
          ...state.campaignState,
          notebooks: payload.notebooks ?? [],
          notebookItems: payload.items ?? [],
        };
        return { campaignState: hydratedCampaignState };
      });

      if (hydratedCampaignState) {
        hydratedCampaignStateRef.current = hydratedCampaignState;
      }
    }).catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [activeCampaignId, campaignState]);

  return (
    <section className="campaign-workspace">
      <header className="content-header campaign-workspace__header">
        <div className="page-heading campaign-workspace__heading">
          {eyebrowKey && <p className="page-eyebrow">{t(eyebrowKey)}</p>}
          <h1 className="page-title">{t(titleKey)}</h1>
          <p className="page-description">{t(descriptionKey)}</p>
        </div>
        {actions && <div className="header-actions campaign-workspace__actions">{actions}</div>}
      </header>

      {tabs && tabs.length > 1 && <WorkspaceTabs tabs={tabs} />}

      <div className="workspace-content campaign-workspace__content">{children}</div>
    </section>
  );
}
