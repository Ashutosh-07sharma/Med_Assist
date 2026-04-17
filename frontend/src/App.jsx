import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser, login, signup } from "./api/chatApi";
import AuthPage from "./components/AuthPage";
import ChatWindow from "./components/ChatWindow";
import InputBar from "./components/InputBar";
import Sidebar from "./components/Sidebar";
import Toast from "./components/Toast";
import useChat from "./hooks/useChat";

function getErrorMessage(error) {
  return (
    error?.response?.data?.detail ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

export default function App() {
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const {
    sessions,
    activeSessionId,
    messages,
    isLoading,
    isSidebarOpen,
    isSessionsLoading,
    setIsSidebarOpen,
    selectSession,
    startNewChat,
    sendMessage,
    deleteSession,
  } = useChat(Boolean(user));

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsAuthLoading(false);
        return;
      }
      try {
        const me = await getCurrentUser();
        setUser(me);
      } catch {
        localStorage.removeItem("accessToken");
      } finally {
        setIsAuthLoading(false);
      }
    };
    bootstrapAuth();
  }, []);

  const withToast = (fn) => async (...args) => {
    try {
      await fn(...args);
    } catch (error) {
      setToast({ message: getErrorMessage(error) });
    }
  };

  const handleSuggestedPrompt = async (prompt) => {
    try {
      await sendMessage(prompt);
    } catch (error) {
      setToast({ message: getErrorMessage(error) });
    }
  };

  const handleSignup = async (name, email, password) => {
    setIsAuthSubmitting(true);
    try {
      const result = await signup(name, email, password);
      localStorage.setItem("accessToken", result.access_token);
      setUser(result.user);
    } catch (error) {
      setToast({ message: getErrorMessage(error) });
      throw error;
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleLogin = async (email, password) => {
    setIsAuthSubmitting(true);
    try {
      const result = await login(email, password);
      localStorage.setItem("accessToken", result.access_token);
      setUser(result.user);
    } catch (error) {
      setToast({ message: getErrorMessage(error) });
      throw error;
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    window.location.reload();
  };

  if (isAuthLoading) {
    return <div className="flex h-full items-center justify-center bg-appBg text-slate-300">Loading...</div>;
  }

  if (!user) {
    return (
      <>
        <AuthPage onLogin={handleLogin} onSignup={handleSignup} isLoading={isAuthSubmitting} />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  return (
    <div className="flex h-full bg-appBg text-slate-100">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelect={withToast(selectSession)}
        onNewChat={withToast(startNewChat)}
        onDelete={withToast(deleteSession)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isLoading={isSessionsLoading}
      />

      <main className="relative flex min-h-0 flex-1 flex-col bg-chatBg">
        <button
          type="button"
          onClick={handleLogout}
          className="absolute right-3 top-3 z-10 rounded-md border border-slate-700 bg-chatBg px-3 py-1 text-xs text-slate-300 hover:bg-slate-800 md:right-5"
        >
          <span className="mr-2 border-r border-slate-700 pr-2 text-slate-400">{user?.name || "User"}</span>
          Logout
        </button>
        <div className="border-b border-slate-800 px-3 py-2 md:px-5">
          <div className="mb-2 flex items-center">
            <button
              type="button"
              className="rounded-md p-2 text-slate-300 hover:bg-slate-800 md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        <ChatWindow
          activeSessionId={activeSessionId}
          messages={messages}
          isLoading={isLoading}
          onSuggestedPrompt={handleSuggestedPrompt}
        />
        <InputBar onSend={withToast(sendMessage)} isLoading={isLoading} />
      </main>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
