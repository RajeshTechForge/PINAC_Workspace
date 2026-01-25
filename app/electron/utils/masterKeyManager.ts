import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { app } from "electron";

class SecureMasterKeyManager {
  private static readonly KEY_FILE_NAME = "app-secret.key";

  // Generates a cryptographically secure random master key
  static generateMasterKey(length: number = 64): string {
    return crypto.randomBytes(length).toString("hex");
  }

  // Gets or creates a persistent master key for the application
  static getPersistentMasterKey(): string {
    const userDataPath = app.getPath("userData");
    const keyFilePath = path.join(userDataPath, this.KEY_FILE_NAME);

    try {
      if (fs.existsSync(keyFilePath)) {
        return fs.readFileSync(keyFilePath, "utf8").trim();
      }

      const newMasterKey = this.generateMasterKey();
      fs.mkdirSync(userDataPath, { recursive: true });
      fs.writeFileSync(keyFilePath, newMasterKey, {
        mode: 0o600,
        encoding: "utf8",
      });

      return newMasterKey;
    } catch (error) {
      console.error("Failed to manage master key:", error);
      throw new Error("Could not generate or retrieve master key");
    }
  }

  /**
   * Provides an additional layer of key derivation
   * @param masterKey Original master key
   * @param salt Optional salt for key derivation
   * @returns Derived key
   */
  static deriveMasterKey(masterKey: string, salt?: string): string {
    const finalSalt = salt || "default-app-salt";
    const iterations = 100000; // PBKDF2 iterations
    const keyLength = 64; // bytes

    return crypto
      .pbkdf2Sync(masterKey, finalSalt, iterations, keyLength, "sha512")
      .toString("hex");
  }
}

export default SecureMasterKeyManager;
