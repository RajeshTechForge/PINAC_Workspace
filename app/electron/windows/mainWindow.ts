import { BrowserWindow, screen, app } from "electron";
import path from "node:path";
import * as fs from "fs";

const userDataPath = app.getPath("userData");
const sizeFile = path.join(userDataPath, "window-size.json");

// Returns the default window size
const getDefaultSize = (): { width: number; height: number } => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  return { width, height }; // max-window
};

// Retrieves the saved window size
const getSavedSize = (): { width: number; height: number } | null => {
  if (fs.existsSync(sizeFile)) {
    const sizeData = fs.readFileSync(sizeFile);
    return JSON.parse(sizeData.toString());
  }
  return null;
};

// Saves the current window size to a file
const saveSize = (width: number, height: number): void => {
  fs.writeFileSync(sizeFile, JSON.stringify({ width, height }));
};

export const createMainWindow = (
  preloadPath: string,
  rendererDist: string,
  devServerUrl?: string
): BrowserWindow => {
  const savedSize = getSavedSize();
  const defaultSize = getDefaultSize();

  const { width, height } = savedSize || defaultSize;

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: width,
    height: height,
    minWidth: 768,
    minHeight: 600,
    frame: false,
    autoHideMenuBar: true,
    icon: "public/Round App Logo.png",
    webPreferences: {
      preload: preloadPath,
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Test active push message to Renderer-process.
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow?.webContents.send(
      "main-process-message",
      new Date().toLocaleString()
    );
  });

  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else {
    mainWindow.loadFile(path.join(rendererDist, "index.html"));
  }

  // Save the window size when it is resized.
  mainWindow.on("resize", () => {
    if (mainWindow) {
      saveSize(mainWindow.getBounds().width, mainWindow.getBounds().height);
    }
  });

  return mainWindow;
};
