"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "@/lib/auth";
import Logo from "@/components/player/Logo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await loginAction(username, password, callbackUrl);
      if (result.success) {
        router.push(callbackUrl);
      } else {
        setError(result.error || "Authentication failed.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-up">
        {/* Analog Lounge Login Panel */}
        <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-[2rem] p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(69,56,45,0.15)] relative overflow-hidden backdrop-blur-xl">
          
          {/* Subtle gradient sheen */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none opacity-50 block dark:hidden" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none hidden dark:block" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-8">
               <Logo />
            </div>

            <h1 className="font-display text-2xl font-medium text-[var(--text-primary)] tracking-wide mb-2 text-center">
              Curator Access
            </h1>
            <p className="text-[var(--text-muted)] text-[14px] mb-8 text-center">
              Please authenticate to enter the archive.
            </p>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-medium tracking-widest uppercase text-[var(--text-secondary)]">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border-b border-[var(--border)] bg-transparent py-3 px-1 text-[16px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-muted)]"
                  placeholder="Enter username"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="flex flex-col gap-2 mb-2">
                <label className="text-[12px] font-medium tracking-widest uppercase text-[var(--text-secondary)]">
                  Passphrase
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-b border-[var(--border)] bg-transparent py-3 px-1 text-[16px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-muted)]"
                  placeholder="Enter passphrase"
                  autoComplete="current-password"
                  required
                />
              </div>

              {error && (
                <div className="text-[var(--danger)] text-sm font-medium text-center bg-[var(--danger)]/10 py-2 px-3 rounded-lg animate-fade-in">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="mt-4 w-full bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white font-medium py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center shadow-lg shadow-[var(--accent)]/20"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Authenticate"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-8 h-8 border border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
