import React, { useEffect, useState } from "react";

export const AuthContext = React.createContext<{
  isAuthenticated: boolean;
  logout: () => void;
} | null>(null);

// Auth Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const checkAuthenticated = async () => {
    try {
      const result = await window.ipcRenderer.invoke("check-auth");
      setIsAuthenticated(result);
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
    }
  };

  const logout = async () => {
    try {
      await window.ipcRenderer.invoke("logout");
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    checkAuthenticated();

    // Listen for auth-success event from main process
    const removeListener = window.ipcRenderer.on(
      "auth-success",
      (_event, _message) => {
        checkAuthenticated();
      },
    );

    return () => {
      removeListener();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
