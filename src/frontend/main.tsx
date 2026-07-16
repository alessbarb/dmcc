import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import {
  bootstrapDeviceAppearance,
  hydrateAccountAppearance,
} from "./account/appearanceRuntime.js";
import { router } from "./router.js";
import { I18nProvider } from "./shared/i18n/I18nProvider.js";
import { EntityDetailEscapeBehavior } from "./shared/components/EntityDetailEscapeBehavior.js";
import { PwaUpdateBanner } from "./shared/components/PwaUpdateBanner.js";
import { Watermark } from "./shared/components/Watermark.js";
import { ImageFocalPointBehavior } from "./shared/images/ImageFocalPointBehavior.js";
import "./shared/styles/index.css";
import "./shared/styles/p1.css";

bootstrapDeviceAppearance();
void hydrateAccountAppearance();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nProvider>
      <RouterProvider router={router} />
      <EntityDetailEscapeBehavior />
      <ImageFocalPointBehavior />
      <Watermark />
      <PwaUpdateBanner />
    </I18nProvider>
  </React.StrictMode>,
);
