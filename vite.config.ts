import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { resolve } from "path";

const devServerHost = process.env.DMCC_VITE_HOST ?? "127.0.0.1";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null,
      manifest: {
        name: "DM Campaign Companion",
        short_name: "DMCC",
        description: "Motor de memoria narrativa para Dungeon Masters",
        theme_color: "hsl(230, 35%, 7%)",
        background_color: "hsl(230, 35%, 7%)",
        display: "standalone",
        orientation: "any",
        start_url: "/",
        scope: "/",
        lang: "es",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallbackDenylist: [
          /^\/api\//,
          /^\/assets\//,
          /^\/icons\//,
          /^\/favicon\.ico$/,
          /^\/sw\.js$/,
          /^\/manifest\.webmanifest$/,
          /^\/workbox-/,
          /\.[^/]+$/,
        ],
        globPatterns: ["**/*.{js,css,html,svg,woff2}", "icons/*.png", "assets/ui/watermark.png", "premades/**/*.json"],
        runtimeCaching: [
          {
            urlPattern: /^\/api\//,
            handler: "NetworkOnly",
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  root: ".",
  resolve: {
    alias: {
      "@frontend": resolve(__dirname, "src/frontend"),
      "@backend": resolve(__dirname, "src/backend"),
      "@core": resolve(__dirname, "src/core"),
      "@shared": resolve(__dirname, "src/shared"),
    },
  },
  build: {
    outDir: "dist/public",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        entryFileNames: "assets/[hash].js",
        chunkFileNames: "assets/[hash].js",
        assetFileNames: "assets/[hash][extname]",
      },
    },
  },
  server: {
    host: devServerHost,
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4877",
        // Preserve the browser-facing Host so the backend's Origin/Host CSRF
        // check sees localhost:5173 on both headers in development.
        changeOrigin: false,
      },
    },
  },
});
