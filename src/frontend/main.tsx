import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router.js";
import { I18nProvider } from "./shared/i18n/I18nProvider.js";
import { PwaUpdateBanner } from "./shared/components/PwaUpdateBanner.js";
import { Watermark } from "./shared/components/Watermark.js";
import "./shared/styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nProvider>
      <RouterProvider router={router} />
      <Watermark />
      <PwaUpdateBanner />
    </I18nProvider>
  </React.StrictMode>
);
