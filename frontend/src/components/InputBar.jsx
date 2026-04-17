import { SendHorizonal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function InputBar({ onSend, isLoading }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxHeight = 5 * 24;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [value]);

  const submit = () => {
    if (isLoading || !value.trim()) return;
    onSend(value);
    setValue("");
  };

  return (
    <div className="border-t border-slate-800 bg-chatBg px-3 py-3 md:px-5">
      <div className="mx-auto flex max-w-4xl items-end gap-2 rounded-2xl border border-slate-700 bg-slate-900/40 p-2">
        <textarea
          ref={textareaRef}
          className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
          placeholder="Ask me about symptoms, medications, health conditions..."
          value={value}
          maxLength={2000}
          disabled={isLoading}
          rows={1}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button
          type="button"
          onClick={submit}
          disabled={isLoading || !value.trim()}
          className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 p-2 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Send message"
        >
          <SendHorizonal size={18} />
        </button>
      </div>
      {value.length > 1800 && <p className="mx-auto mt-1 max-w-4xl text-right text-xs text-slate-400">{value.length}/2000</p>}
    </div>
  );
}
