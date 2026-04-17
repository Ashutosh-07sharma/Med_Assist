import { formatDistanceToNow } from "date-fns";
import { MessageSquarePlus, Trash2 } from "lucide-react";
import { parseBackendDate } from "../utils/date";

function SessionSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="animate-pulse rounded-xl bg-slate-800/70 p-3">
          <div className="mb-2 h-3 w-3/4 rounded bg-slate-700" />
          <div className="h-2 w-1/3 rounded bg-slate-700" />
        </div>
      ))}
    </div>
  );
}

export default function Sidebar({
  sessions,
  activeSessionId,
  onSelect,
  onNewChat,
  onDelete,
  isOpen,
  onClose,
  isLoading,
}) {
  return (
    <>
      {isOpen && <button type="button" className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={onClose} />}
      <aside
        className={`fixed left-0 top-0 z-30 flex h-full w-[280px] flex-col bg-sidebarBg transition-transform md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-slate-800 p-4">
          <h1 className="bg-gradient-to-r from-teal-500 to-cyan-400 bg-clip-text text-2xl font-bold text-transparent animate-pulseSoft">
            🏥 MediAssist
          </h1>
          <button
            type="button"
            onClick={onNewChat}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <MessageSquarePlus size={16} /> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {isLoading ? (
            <SessionSkeleton />
          ) : sessions.length === 0 ? (
            <p className="rounded-xl border border-slate-700 bg-slate-900/40 p-3 text-sm text-slate-400">No conversations yet.</p>
          ) : (
            <ul className="space-y-2">
              {[...sessions]
                .sort((a, b) => parseBackendDate(b.updated_at) - parseBackendDate(a.updated_at))
                .map((session) => (
                <li key={session.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(session.id)}
                    className={`group w-full rounded-xl border px-3 py-2 text-left ${
                      activeSessionId === session.id
                        ? "border-cyan-500/40 bg-cyan-500/10"
                        : "border-transparent bg-slate-900/40 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-1 text-sm text-slate-100">{session.title || "New Conversation"}</p>
                      <button
                        type="button"
                        className="invisible text-slate-400 hover:text-rose-300 group-hover:visible"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(session.id);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDistanceToNow(parseBackendDate(session.updated_at), { addSuffix: true })}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-800 p-3 text-xs text-slate-500">For informational use only</div>
      </aside>
    </>
  );
}
