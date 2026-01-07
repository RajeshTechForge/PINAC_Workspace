import { useContext, useEffect } from "react";
import { FrameHeader } from "./components/FrameHeader";
import { EmbeddingSettingsContext } from "./context/EmbeddingSettings";
import { getBackendPort, setBackendPort } from "./utils/backendPort";

// context
import { AuthContext } from "./context/Authentication";
import { WelcomeTextProvider } from "./context/WelcomeText";
import { ChatMsgProvider } from "./context/ChatMsg";
import { AttachmentProvider } from "./context/Attachment";
import "./index.css";

// pages
import SignInPage from "./pages/SignIn";
import HomePage from "./pages/Home";

const App = () => {
  const isAuthenticated = useContext(AuthContext)?.isAuthenticated;
  const embeddingContext = useContext(EmbeddingSettingsContext);

  // Store backend port in localStorage when received
  useEffect(() => {
    const handleBackendPort = (_: any, port: number) => {
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

  // check if default embedding model is downloaded
  useEffect(() => {
    const checkEmbeddingStatus = async () => {
      const port = getBackendPort();
      if (!port) return;
      try {
        const response = await fetch(
          `http://localhost:${port}/api/rag/default-embedder/status`
        );
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        embeddingContext?.setIsDefaultModel(data.status);
      } catch (error) {
        console.error("Failed to fetch:", error);
      }
    };

    checkEmbeddingStatus();
  }, []);

  // ---------------------------------------------------- //
  return (
    <WelcomeTextProvider>
      <AttachmentProvider>
        <ChatMsgProvider>
          {isAuthenticated ? (
            <FrameHeader children={<HomePage />} />
          ) : (
            <FrameHeader children={<SignInPage />} />
          )}
        </ChatMsgProvider>
      </AttachmentProvider>
    </WelcomeTextProvider>
  );
};

export default App;
