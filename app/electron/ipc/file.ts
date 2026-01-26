import { ipcMain, dialog } from "electron";

export const registerFileHandlers = () => {
  ipcMain.handle("open-file-dialog", async (_, acceptedFileTypes) => {
    const filters = [];

    if (acceptedFileTypes && acceptedFileTypes.length > 0) {
      filters.push(...acceptedFileTypes);
    } else {
      filters.push({ name: "All Files", extensions: ["*"] });
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
};
