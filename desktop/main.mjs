import { app, BrowserWindow, Menu, shell } from "electron";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { existsSync, mkdirSync } from "node:fs";
import { networkInterfaces } from "node:os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const appRoot = resolve(__dirname, "..");

let server;
let mainWindow;
let serverUrl;
let isClosing = false;

function resolvePublicDir() {
  const candidates = [
    join(appRoot, "dist", "public"),
    join(process.resourcesPath ?? "", "app", "dist", "public"),
  ];

  return candidates.find((candidate) => existsSync(join(candidate, "index.html"))) ?? candidates[0];
}

function resolveDataDir() {
  if (process.env.DMCC_DATA_DIR) {
    return resolve(process.env.DMCC_DATA_DIR);
  }

  const documentsDir = app.getPath("documents");
  return join(documentsDir, "DMCampaignCompanion");
}

function shouldExposeLan() {
  return process.env.DMCC_DESKTOP_LAN === "1" || process.argv.includes("--lan");
}

function getLanAddresses(port) {
  const interfaces = networkInterfaces();
  const addresses = [];

  for (const values of Object.values(interfaces)) {
    for (const details of values ?? []) {
      if (details.family === "IPv4" && !details.internal) {
        addresses.push(`http://${details.address}:${port}`);
      }
    }
  }

  return addresses;
}

async function startInternalServer() {
  const publicDir = resolvePublicDir();
  const dataDir = resolveDataDir();
  mkdirSync(dataDir, { recursive: true });

  process.env.DMCC_PUBLIC_DIR = publicDir;
  process.env.DMCC_DATA_DIR = dataDir;

  const serverModuleUrl = pathToFileURL(join(appRoot, "dist", "src", "backend", "server", "createServer.js")).href;
  const { createServer } = await import(serverModuleUrl);

  server = createServer({ dataDir });

  const exposeLan = shouldExposeLan();
  const host = exposeLan ? "0.0.0.0" : "127.0.0.1";
  const requestedPort = Number(process.env.DMCC_DESKTOP_PORT ?? process.env.PORT ?? "0");
  const port = Number.isFinite(requestedPort) ? requestedPort : 0;

  if (exposeLan) {
    server.lanExposed = true;
  }

  await server.listen({ host, port });

  const address = server.server.address();
  const actualPort = typeof address === "object" && address ? address.port : port;
  serverUrl = `http://127.0.0.1:${actualPort}`;

  console.log(`DMCC Desktop server listening at ${serverUrl}`);

  if (exposeLan) {
    const lanUrls = getLanAddresses(actualPort);
    if (lanUrls.length > 0) {
      console.log(`DMCC LAN URLs: ${lanUrls.join(", ")}`);
    }
  }

  return serverUrl;
}

async function createMainWindow() {
  const url = await startInternalServer();

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 980,
    minWidth: 1120,
    minHeight: 720,
    title: "DM Campaign Companion",
    backgroundColor: "#090d18",
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    void shell.openExternal(targetUrl);
    return { action: "deny" };
  });

  await mainWindow.loadURL(url);
}

function createMenu() {
  const template = [
    {
      label: "DMCC",
      submenu: [
        {
          label: "Open Data Folder",
          click: async () => {
            await shell.openPath(resolveDataDir());
          },
        },
        {
          label: "Open in Browser",
          click: async () => {
            if (serverUrl) {
              await shell.openExternal(serverUrl);
            }
          },
        },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.on("ready", async () => {
  createMenu();
  await createMainWindow();
});

app.on("activate", async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createMainWindow();
  }
});

app.on("before-quit", async (event) => {
  if (isClosing || !server) {
    return;
  }

  event.preventDefault();
  isClosing = true;
  const closingServer = server;
  server = undefined;
  await closingServer.close();
  app.quit();
});

app.on("window-all-closed", () => {
  app.quit();
});
