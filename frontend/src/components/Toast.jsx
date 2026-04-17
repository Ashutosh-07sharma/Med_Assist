import { CircleAlert, X } from "lucide-react";

export default function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className="fixed right-4 top-4 z-50 max-w-sm animate-fadeInUp rounded-xl border border-rose-400/50 bg-rose-500/10 p-3 text-rose-200 backdrop-blur">
      <div className="flex items-start gap-2">
        <CircleAlert size={18} className="mt-0.5 shrink-0" />
        <div className="flex-1 text-sm">{toast.message}</div>
        <button type="button" onClick={onClose} className="text-rose-200 hover:text-white">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
