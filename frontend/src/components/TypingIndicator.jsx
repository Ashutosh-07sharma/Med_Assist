export default function TypingIndicator() {
  return (
    <div className="max-w-lg animate-fadeInUp">
      <div className="rounded-2xl border border-slate-700 bg-assistantBubble px-4 py-3 text-sm text-slate-300">
        <p className="mb-2 text-xs text-slate-400">MediAssist is thinking...</p>
        <div className="flex gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300 [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300 [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
