import { ipcMain } from "electron";
import * as fs from "fs";
import path from "path";
import { app } from "electron";

const userDataPath = app.getPath("userData");
const userInfoFile = path.join(userDataPath, "user-info.json");

export const registerUserHandlers = () => {
  ipcMain.on("save-user-info", async (event, userInfo) => {
    try {
      const { displayName, nickname, email } = userInfo;
      fs.writeFileSync(
        userInfoFile,
        JSON.stringify({ displayName, nickname, email }),
      );

      event.reply("backend-response", {
        error_occurred: false,
        response: true,
        error: null,
      });
    } catch (error: any) {
      event.reply("backend-response", {
        error_occurred: true,
        response: false,
        error: error.message,
      });
    }
  });

  ipcMain.on("get-user-info", async (event) => {
    try {
      let userData = {
        displayName: null,
        nickname: null,
        email: null,
      };

      if (fs.existsSync(userInfoFile)) {
        const data = fs.readFileSync(userInfoFile, "utf8");
        userData = JSON.parse(data);
      }

      event.reply("backend-response", userData);
    } catch (error) {
      event.reply("backend-response", {
        displayName: null,
        nickname: null,
        email: null,
      });
    }
  });
};
