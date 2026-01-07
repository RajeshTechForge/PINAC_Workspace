import { app, BrowserWindow, screen, ipcMain, shell, dialog } from "electron";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import path from "node:path";
import * as fs from "fs";
import * as net from "net";
import isDev from "electron-is-dev";
import { ChildProcessWithoutNullStreams } from "child_process";

// ====================================================== //
//         Functions to Find Free Port for Backend        //
// ====================================================== //

const findFreePort = (startPort: number = 5000): Promise<number[]> => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.listen(startPort, () => {
      const port = (server.address() as net.AddressInfo)?.port;
      server.close(() => {
        resolve([port]);
      });
    });

    server.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        // Port is in use, try the next one
        findFreePort(startPort + 1)
          .then(resolve)
          .catch(reject);
      } else {
        reject(err);
      }
    });
  });
};

// ====================================================== //
//         Functions to Manage Python Backend             //
// ====================================================== //

let pythonProcess: ChildProcessWithoutNullStreams | null;
let backendPort: number | null;

const startPythonBackend = async () => {
  try {
    // Find an available port
    const [port] = await findFreePort();
    backendPort = port;

    console.log(`Starting Python backend on port ${port}`);

    let pythonCommand;
    let pythonArgs;
    let pythonOptions;

    if (isDev) {
      if (process.platform === "win32") {
        // Windows
        pythonCommand = path.join(
          __dirname,
          "..",
          "backend",
          "venv",
          "Scripts",
          "python.exe"
        );
      } else {
        // macOS/Linux
        pythonCommand = path.join(
          __dirname,
          "..",
          "backend",
          "venv",
          "bin",
          "python"
        );
      }

      pythonArgs = [
        path.join(__dirname, "..", "backend", "app.py"),
        "--port",
        port.toString(),
      ];

      pythonOptions = {
        cwd: path.join(__dirname, "..", "backend"),
      };
    } else {
      // Production: Use the packaged Python executable
      if (process.platform === "win32") {
        pythonCommand = path.join(process.resourcesPath, "backend", "app.exe");
      } else {
        pythonCommand = path.join(process.resourcesPath, "backend", "app");
      }

      pythonArgs = ["--port", port.toString()];

      pythonOptions = {
        cwd: path.join(process.resourcesPath, "backend"),
      };
    }

    // Create environment variables - pass the port
    const env = { ...process.env, PORT: port.toString() };
    // @ts-ignore
    pythonOptions.env = env;

    // Spawn the Python process
    pythonProcess = spawn(pythonCommand, pythonArgs, pythonOptions);

    // Handle Python process output
    pythonProcess.stdout.on("data", (data) => {
      console.log(`Python backend: ${data}`);
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`Python backend error: ${data}`);
    });

    pythonProcess.on("close", (code) => {
      console.log(`Python backend process exited with code ${code}`);
      pythonProcess = null;
    });

    // Return the port for the frontend to use
    return port;
  } catch (error) {
    console.error("Failed to start Python backend:", error);
    app.quit();
  }
};

//
const stopPythonBackend = () => {
  if (pythonProcess) {
    console.log("Stopping Python backend");

    if (process.platform === "win32") {
      // On Windows, use taskkill to ensure all child processes are terminated
      spawn("taskkill", ["/pid", String(pythonProcess.pid), "/f", "/t"]);
    } else {
      // On macOS/Linux, use the kill command
      pythonProcess.kill();
    }

    pythonProcess = null;
  }
};

// ============================================================ //
//          Creating Main Window and Initializing App           //
// ============================================================ //

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
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
      new Date().toLocaleString()
    );
    // Send backend port immediately when window is ready
    if (backendPort) {
      mainWindow?.webContents.send("backend-port-initial", backendPort);
    }
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
  // Start Python backend first
  await startPythonBackend();
  createMainWindow();
});

// ======================================================================== //
//        frontend request to backend (for backend functionalities)          //
// ======================================================================== //

ipcMain.on("get-user-info", async (event) => {
  try {
    const response = await fetch(
      `http://localhost:${backendPort}/api/auth/user-info`
    );
    const userData = await response.json();
    event.reply("backend-response", userData);
  } catch (error) {
    const userData = {
      displayName: null,
      nickname: null,
      email: null,
    };
    event.reply("backend-response", userData);
  }
});

ipcMain.on("save-user-info", async (event, userInfo) => {
  try {
    const response = await fetch(
      `http://localhost:${backendPort}/api/auth/user-info`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userInfo),
      }
    );
    const result = await response.json();
    event.reply("backend-response", {
      error_occurred: !result.success,
      response: result.success,
      error: result.error || null,
    });
  } catch (error: any) {
    event.reply("backend-response", {
      error_occurred: true,
      response: false,
      error: error.message,
    });
  }
});

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
    return result.filePaths[0]; // Full path to selected file
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
    // Set a flag to skip any confirmation dialogs or save prompts
    mainWindow.webContents.closeDevTools();
    // For immediate visual feedback, hide the window first
    mainWindow.hide();
    // Force garbage collection of any resources
    if (global.gc) global.gc();
    // Destroy the window and quit the app in one go
    mainWindow.destroy();
    stopPythonBackend();
    if (process.platform !== "darwin") {
      app.exit(0); // More immediate than app.quit()
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
    // Someone tried to run a second instance, we should focus our window.
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
        "Something went wrong, unable to authenticate. Please try again."
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
      // Send auth data to backend instead of handling locally
      const response = await fetch(
        `http://localhost:${backendPort}/api/auth/deep-link`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: encodedData }),
        }
      );

      const result = await response.json();
      if (result.success) {
        mainWindow?.reload(); // Reload the app
      } else {
        dialog.showErrorBox("Authentication Error", result.error);
      }
    } catch (error) {
      console.error("Deep link handling error:", error);
      dialog.showErrorBox(
        "Error",
        "Something went wrong during authentication. Please try again."
      );
    }
  } else {
    dialog.showErrorBox(
      "Error",
      "Something went wrong, unable to authenticate. Please try again."
    );
  }
};
