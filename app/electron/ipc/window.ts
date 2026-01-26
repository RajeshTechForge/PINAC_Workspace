import { ipcMain, shell, BrowserWindow, app } from "electron";

export const registerWindowHandlers = (mainWindow: BrowserWindow | null) => {
  ipcMain.on("reload-app", () => {
    mainWindow?.reload();
  });

  ipcMain.on("open-external-link", (_, url) => {
    shell.openExternal(url);
  });

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
      if (global.gc) global.gc();
      mainWindow.destroy();
      if (process.platform !== "darwin") {
        app.exit(0);
      }
    }
  });
};
