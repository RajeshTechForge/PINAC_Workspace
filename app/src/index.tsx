import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./context/Authentication.tsx";
import { ModalBoxProvider } from "./context/ModalBox.tsx";
import SettingsProvider from "./context/SettingsProvider";
import App from "./App.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <ModalBoxProvider>
          <App />
        </ModalBoxProvider>
      </SettingsProvider>
    </AuthProvider>
  </React.StrictMode>
);
