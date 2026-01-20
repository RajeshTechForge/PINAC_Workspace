import { ipcMain, dialog, BrowserWindow } from "electron";
import SecureMasterKeyManager from "../utils/masterKeyManager";
import SecureTokenManager from "../utils/tokenManager";

export const registerAuthHandlers = (mainWindow: BrowserWindow | null) => {
  ipcMain.handle("check-auth", async () => {
    try {
      const masterKey = SecureMasterKeyManager.getPersistentMasterKey();
      const tokenManager = new SecureTokenManager(masterKey);
      const idToken = tokenManager.retrieveToken("idToken");
      return !!idToken;
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle("logout", async () => {
    try {
      const masterKey = SecureMasterKeyManager.getPersistentMasterKey();
      const tokenManager = new SecureTokenManager(masterKey);
      tokenManager.clearAllTokens();
      return true;
    } catch (error) {
      console.error("Logout failed", error);
      return false;
    }
  });
};

export const handleDeepLink = async (url: string, mainWindow: BrowserWindow | null) => {
  const urlObj = new URL(url);
  const encodedData = urlObj.searchParams.get("data");
  
  if (!encodedData) {
    dialog.showErrorBox(
      "Error",
      "Something went wrong, unable to authenticate. Please try again."
    );
    return;
  }

  try {
    const decodedData = Buffer.from(encodedData, "base64").toString("utf-8");
    const { idToken, refreshToken, webApiKey, email } = JSON.parse(decodedData);

    if (idToken && refreshToken && webApiKey) {
      const masterKey = SecureMasterKeyManager.getPersistentMasterKey();
      const tokenManager = new SecureTokenManager(masterKey);

      tokenManager.storeToken("idToken", idToken);
      tokenManager.storeToken("refreshToken", refreshToken);
      tokenManager.storeToken("webApiKey", webApiKey);
      if (email) tokenManager.storeToken("userEmail", email);

      if (mainWindow) {
        mainWindow.webContents.send("auth-success", "Authentication successful");
        mainWindow.reload();
      }
    } else {
      throw new Error("Missing Tokens");
    }
  } catch (error) {
    console.error("Deep link handling error:", error);
    dialog.showErrorBox(
      "Error",
      "Something went wrong during authentication. Please try again."
    );
  }
};
