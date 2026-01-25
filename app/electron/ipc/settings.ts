import { ipcMain } from "electron";
import SecureMasterKeyManager from "../utils/masterKeyManager";
import SecureTokenManager from "../utils/tokenManager";

export const registerSettingsHandlers = () => {
  ipcMain.handle("save-custom-provider-config", async (_, config: any) => {
    try {
      const masterKey = SecureMasterKeyManager.getPersistentMasterKey();
      const tokenManager = new SecureTokenManager(masterKey);

      // Store the config as a JSON string securely
      tokenManager.storeToken("custom_provider_config", JSON.stringify(config));
      return { success: true };
    } catch (error: any) {
      console.error("Failed to save custom provider config:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("get-custom-provider-config", async () => {
    try {
      const masterKey = SecureMasterKeyManager.getPersistentMasterKey();
      const tokenManager = new SecureTokenManager(masterKey);

      const configStr = tokenManager.retrieveToken("custom_provider_config");
      if (!configStr) return null;

      return JSON.parse(configStr);
    } catch (error) {
      console.error("Failed to get custom provider config:", error);
      return null;
    }
  });
};
