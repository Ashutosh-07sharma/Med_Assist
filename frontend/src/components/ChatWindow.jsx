import { HeartPulse } from "lucide-react";
import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

const suggested = [
  "What are symptoms of diabetes?",
  "How to manage high blood pressure?",
  "What is a normal heart rate?",
];

export default function ChatWindow({ activeSessionId, messages, isLoading, onSuggestedPrompt }) {
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!activeSessionId) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-2xl text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300">
            <HeartPulse size={34} />
          </div>
          <h2 className="text-3xl font-semibold text-white">Welcome to MediAssist</h2>
          <p className="mt-2 text-slate-400">Your AI-powered medical information assistant</p>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {suggested.map((prompt) => (
              <button
                key={prompt}
                onClick={() => onSuggestedPrompt(prompt)}
                className="rounded-xl border border-slate-700 bg-slate-900/40 p-3 text-left text-sm text-slate-200 transition hover:border-cyan-500/50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
      {messages.length === 0 && (
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-700 bg-slate-900/40 p-4 text-center text-sm text-slate-400">
          No messages yet. Start by asking a health-related question.
        </div>
      )}
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {isLoading && <TypingIndicator />}
    </div>
  );
}
