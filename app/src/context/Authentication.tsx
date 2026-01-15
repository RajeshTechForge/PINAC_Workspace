import React, { useEffect, useState } from "react";
import { getBackendPort, setBackendPort } from "../utils/backendPort";

export const AuthContext = React.createContext<{
  isAuthenticated: boolean;
  logout: () => void;
} | null>(null);

// Auth Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [backendPort, setLocalBackendPort] = useState<number | null>(
    getBackendPort()
  );
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const checkInitialAuth = async () => {
    if (!backendPort) return;
    try {
      const response = await fetch(
        `http://localhost:${backendPort}/api/auth/status`
      );
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
    } catch (error) {
      console.error("Failed to check initial auth:", error);
    }
  };

  const logout = async () => {
    if (!backendPort) return;
    try {
      const response = await fetch(
        `http://localhost:${backendPort}/api/auth/logout`
      );
      const data = await response.json();
      setIsAuthenticated(data.success);
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  // checking auth from main process
  useEffect(() => {
    const handleBackendPort = (_: any, port: number) => {
      setLocalBackendPort(port);
      setBackendPort(port);
    };

    if (window.ipcRenderer) {
      window.ipcRenderer.on("backend-port-initial", handleBackendPort);
    }

    return () => {
      if (window.ipcRenderer) {
        window.ipcRenderer.off("backend-port-initial", handleBackendPort);
      }
    };
  }, []);

  useEffect(() => {
    if (backendPort) {
      checkInitialAuth();
    }
  }, [backendPort]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
