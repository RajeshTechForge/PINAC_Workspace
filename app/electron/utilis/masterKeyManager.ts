import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { app } from "electron";

class SecureMasterKeyManager {
  private static readonly KEY_FILE_NAME = "app-secret.key";

  /**
   * Generates a cryptographically secure random master key
   * @param length Length of the key in bytes (default: 64 bytes = 512 bits)
   * @returns Hex-encoded random key
   */
  static generateMasterKey(length: number = 64): string {
    return crypto.randomBytes(length).toString("hex");
  }

  /**
   * Gets or creates a persistent master key for the application
   * @returns Persistent master key
   */
  static getPersistentMasterKey(): string {
    const userDataPath = app.getPath("userData");
    const keyFilePath = path.join(userDataPath, this.KEY_FILE_NAME);

    try {
      if (fs.existsSync(keyFilePath)) {
        // Read existing key
        return fs.readFileSync(keyFilePath, "utf8").trim();
      }

      // Generate a new key
      const newMasterKey = this.generateMasterKey();

      fs.mkdirSync(userDataPath, { recursive: true });

      // Write key with restricted permissions
      fs.writeFileSync(keyFilePath, newMasterKey, {
        mode: 0o600, // Read/write only for the owner
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
