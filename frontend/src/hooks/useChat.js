import { useCallback, useEffect, useState } from "react";
import {
  createSession,
  deleteSession as deleteSessionApi,
  getMessages,
  getSessions,
  sendMessage as sendMessageApi,
} from "../api/chatApi";

export default function useChat(enabled = true) {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSessionsLoading, setIsSessionsLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    if (!enabled) return [];
    setIsSessionsLoading(true);
    try {
      const data = await getSessions();
      setSessions(data);
      // If currently selected session no longer exists, clear message pane.
      if (activeSessionId && !data.some((s) => s.id === activeSessionId)) {
        setActiveSessionId(null);
        setMessages([]);
      }
      return data;
    } finally {
      setIsSessionsLoading(false);
    }
  }, [activeSessionId, enabled]);

  const selectSession = useCallback(async (sessionId) => {
    setActiveSessionId(sessionId);
    const msgs = await getMessages(sessionId);
    setMessages(msgs);
    setIsSidebarOpen(false);
  }, []);

  const startNewChat = useCallback(async () => {
    const created = await createSession();
    setSessions((prev) => [created, ...prev]);
    setActiveSessionId(created.id);
    setMessages([]);
    setIsSidebarOpen(false);
    return created;
  }, []);

  const sendMessage = useCallback(
    async (text) => {
      if (!text?.trim()) return;
      let targetSessionId = activeSessionId;
      if (!targetSessionId) {
        const session = await startNewChat();
        targetSessionId = session.id;
      }

      const optimisticUser = {
        id: `temp-user-${Date.now()}`,
        role: "user",
        content: text.trim(),
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticUser]);
      setIsLoading(true);
      try {
        const response = await sendMessageApi(targetSessionId, text.trim());
        setMessages((prev) => [
          ...prev,
          {
            id: response.message_id,
            role: response.role,
            content: response.content,
            created_at: response.created_at,
          },
        ]);
        const refreshed = await loadSessions();
        if (!activeSessionId && refreshed.length > 0) {
          setActiveSessionId(targetSessionId);
        }
      } catch (error) {
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticUser.id));
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [activeSessionId, loadSessions, startNewChat]
  );

  const deleteSession = useCallback(
    async (sessionId) => {
      await deleteSessionApi(sessionId);
      const next = sessions.filter((s) => s.id !== sessionId);
      setSessions(next);
      if (activeSessionId === sessionId) {
        const nextSession = next[0];
        if (nextSession) {
          setActiveSessionId(nextSession.id);
          const msgs = await getMessages(nextSession.id);
          setMessages(msgs);
        } else {
          setActiveSessionId(null);
          setMessages([]);
        }
      }
      await loadSessions();
    },
    [activeSessionId, loadSessions, sessions]
  );

  useEffect(() => {
    if (!enabled) {
      setIsSessionsLoading(false);
      return;
    }
    loadSessions().catch(() => setIsSessionsLoading(false));
  }, [enabled, loadSessions]);

  return {
    sessions,
    activeSessionId,
    messages,
    isLoading,
    isSidebarOpen,
    isSessionsLoading,
    setIsSidebarOpen,
    loadSessions,
    selectSession,
    startNewChat,
    sendMessage,
    deleteSession,
    setMessages,
  };
}
