import { Bot, UserRound } from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { parseBackendDate } from "../utils/date";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const ts = parseBackendDate(message.created_at);

  return (
    <div className={`flex animate-fadeInUp ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-2xl items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            isUser ? "bg-teal-500/30 text-teal-200" : "bg-cyan-500/20 text-cyan-300"
          }`}
        >
          {isUser ? <UserRound size={16} /> : <Bot size={16} />}
        </div>
        <div>
          <div
            className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
              isUser
                ? "bg-gradient-to-r from-teal-500 to-cyan-400 text-white"
                : "border border-slate-700 bg-assistantBubble text-slate-100"
            }`}
          >
            {isUser ? (
              message.content
            ) : (
              <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            )}
          </div>
          <p className={`mt-1 text-xs text-slate-400 ${isUser ? "text-right" : "text-left"}`}>
            {format(ts, "h:mm a")}
          </p>
        </div>
      </div>
    </div>
  );
}
