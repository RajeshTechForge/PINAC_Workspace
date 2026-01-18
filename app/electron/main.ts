import { app, BrowserWindow, screen, ipcMain, shell, dialog } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import * as fs from "fs";

import SecureMasterKeyManager from "./utilis/masterKeyManager";
import SecureTokenManager from "./utilis/tokenManager";

//
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

let mainWindow: BrowserWindow | null;

const userDataPath = app.getPath("userData");
const sizeFile = path.join(userDataPath, "window-size.json");

//
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

//
const createMainWindow = async () => {
  const savedSize = getSavedSize();
  const defaultSize = getDefaultSize();

  const { width, height } = savedSize || defaultSize;

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    minWidth: 768,
    minHeight: 600,
    frame: false,
    autoHideMenuBar: true,
    icon: "public/icon/Round App Logo.png",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Test active push message to Renderer-process.
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow?.webContents.send(
      "main-process-message",
      new Date().toLocaleString(),
    );
  });

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    mainWindow.loadFile(path.join(RENDERER_DIST, "index.html"));
  }

  // Save the window size when it is resized.
  mainWindow.on("resize", () => {
    if (mainWindow) {
      saveSize(mainWindow.getBounds().width, mainWindow.getBounds().height);
    }
  });
};

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    mainWindow = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.whenReady().then(async () => {
  createMainWindow();
});

// ======================================================================== //
//        frontend request to backend (for backend functionalities)         //
// ======================================================================== //

ipcMain.handle("open-file-dialog", async (_, acceptedFileTypes) => {
  const filters = [];

  if (acceptedFileTypes && acceptedFileTypes.length > 0) {
    // Convert accepted types to dialog filters
    filters.push(...acceptedFileTypes);
  } else {
    filters.push({ name: "All Files", extensions: ["*"] }); // Default filter
  }

  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: filters,
  });
  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});

//
ipcMain.on("reload-app", () => {
  mainWindow?.reload();
});

ipcMain.on("open-external-link", (_, url) => {
  shell.openExternal(url);
});

// to handle window controls
ipcMain.on("minimize", () => {
  mainWindow?.minimize();
});

ipcMain.on("maximize", () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.restore();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on("close", () => {
  if (mainWindow) {
    mainWindow.webContents.closeDevTools();
    mainWindow.hide();
    // Force garbage collection of any resources
    if (global.gc) global.gc();
    mainWindow.destroy();
    if (process.platform !== "darwin") {
      app.exit(0);
    }
  }
});

// =========================================================================== //
//                                                                             //
//                      Authentication using Deep Link                         //
//                                                                             //
// =========================================================================== //

// Registering app's custom protocol
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("pinac-workspace", process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient("pinac-workspace");
}

// Handle protocol when app is already running
// for Windows and Linux
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
      parseAuthDataFromUrl(url);
    } else {
      dialog.showErrorBox(
        "Error",
        "Something went wrong, unable to authenticate. Please try again.",
      );
    }
  });
}

// Handle protocol if app is already running
// for MacOS
app.on("open-url", (event, url) => {
  event.preventDefault();
  parseAuthDataFromUrl(url);
});

//
//   Parse Auth data from URL   //
// ============================ //

const parseAuthDataFromUrl = async (url: string) => {
  const urlObj = new URL(url);
  const encodedData = urlObj.searchParams.get("data");
  if (encodedData) {
    try {
      const decodedData = Buffer.from(encodedData, "base64").toString("utf-8");
      const { idToken, refreshToken, webApiKey, email } =
        JSON.parse(decodedData);

      if (idToken && refreshToken && webApiKey) {
        const masterKey = SecureMasterKeyManager.getPersistentMasterKey();
        const tokenManager = new SecureTokenManager(masterKey);

        tokenManager.storeToken("idToken", idToken);
        tokenManager.storeToken("refreshToken", refreshToken);
        tokenManager.storeToken("webApiKey", webApiKey);
        if (email) tokenManager.storeToken("userEmail", email);

        if (mainWindow) {
          mainWindow.webContents.send(
            "auth-success",
            "Authentication successful",
          );
          mainWindow.reload();
        }
      } else {
        throw new Error("Missing Tokens");
      }
    } catch (error) {
      console.error("Deep link handling error:", error);
      dialog.showErrorBox(
        "Error",
        "Something went wrong during authentication. Please try again.",
      );
    }
  } else {
    dialog.showErrorBox(
      "Error",
      "Something went wrong, unable to authenticate. Please try again.",
    );
  }
};
