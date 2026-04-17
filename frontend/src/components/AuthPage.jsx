import { HeartPulse } from "lucide-react";
import { useState } from "react";

export default function AuthPage({ onLogin, onSignup, isLoading }) {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (isSignup) {
        await onSignup(form.name, form.email, form.password);
        return;
      }
      await onLogin(form.email, form.password);
    } catch {
      // Errors are surfaced as toast from the parent.
    }
  };

  return (
    <div className="flex min-h-full items-center justify-center bg-appBg p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-chatBg p-6 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300">
            <HeartPulse size={28} />
          </div>
          <h1 className="bg-gradient-to-r from-teal-500 to-cyan-400 bg-clip-text text-3xl font-bold text-transparent">
            MediAssist
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {isSignup ? "Create your account" : "Login to continue"}
          </p>
        </div>

        <form className="space-y-3" onSubmit={submit}>
          {isSignup && (
            <input
              required
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              placeholder="Full name"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm outline-none focus:border-cyan-400"
            />
          )}
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            placeholder="Email"
            className="w-full rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm outline-none focus:border-cyan-400"
          />
          <input
            required
            type="password"
            minLength={6}
            value={form.password}
            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
            placeholder="Password (min 6 chars)"
            className="w-full rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 px-3 py-2 font-medium text-white disabled:opacity-50"
          >
            {isLoading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        <button
          type="button"
          className="mt-4 w-full text-sm text-cyan-300 hover:text-cyan-200"
          onClick={() => setIsSignup((prev) => !prev)}
        >
          {isSignup ? "Already have an account? Login" : "No account? Create one"}
        </button>
      </div>
    </div>
  );
}
