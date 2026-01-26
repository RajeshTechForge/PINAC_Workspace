import { app, BrowserWindow, dialog } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { createMainWindow } from "./windows/mainWindow";
import { registerAuthHandlers, handleDeepLink } from "./ipc/auth";
import { registerUserHandlers } from "./ipc/user";
import { registerFileHandlers } from "./ipc/file";
import { registerWindowHandlers } from "./ipc/window";
import { registerAiHandlers } from "./ipc/ai";
import { registerSettingsHandlers } from "./ipc/settings";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

let mainWindow: BrowserWindow | null = null;

// Register IPC Handlers
registerUserHandlers();
registerFileHandlers();
registerAiHandlers();
registerSettingsHandlers();

const initWindow = () => {
  mainWindow = createMainWindow(
    path.join(__dirname, "preload.js"),
    RENDERER_DIST,
    VITE_DEV_SERVER_URL,
  );

  // Register handlers that need window instance
  registerAuthHandlers();
  registerWindowHandlers(mainWindow);
};

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    mainWindow = null;
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    initWindow();
  }
});

app.whenReady().then(async () => {
  initWindow();

  // Protocol Handling (Deep Links)
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient("pinac-workspace", process.execPath, [
        path.resolve(process.argv[1]),
      ]);
    }
  } else {
    app.setAsDefaultProtocolClient("pinac-workspace");
  }
});

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (_, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    const url = commandLine.pop();
    if (url) {
      handleDeepLink(url, mainWindow);
    } else {
      dialog.showErrorBox(
        "Error",
        "Something went wrong, unable to authenticate. Please try again.",
      );
    }
  });
}

// macOS Open URL
app.on("open-url", (event, url) => {
  event.preventDefault();
  handleDeepLink(url, mainWindow);
});
