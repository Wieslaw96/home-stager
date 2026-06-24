"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

function RegisterForm() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const next = sessionId
      ? `/api/payment-success?session_id=${sessionId}`
      : "/app";

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).fbq?.("track", "Lead");
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#E8D9C4] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-[#8B6B44]/35 p-8 text-center">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-[#1A1410] mb-2">Sprawdź swoją skrzynkę</h2>
          <p className="text-sm text-[#1A1410]/50">
            Wysłaliśmy link potwierdzający na <strong className="text-[#1A1410]/80">{email}</strong>.
            Kliknij go, żeby aktywować konto
            {sessionId ? " i aktywować subskrypcję." : "."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8D9C4] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="flex justify-center mb-8">
          <Logo dark />
        </div>

        {sessionId && (
          <div className="bg-[#C9A96E]/15 border border-[#C9A96E]/30 rounded-xl px-4 py-3 mb-4 text-center">
            <p className="text-sm text-[#1A1410]/80 font-medium">
              Płatność zakończona. Utwórz konto, żeby aktywować subskrypcję.
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-[#8B6B44]/35 p-8">
          <h1 className="text-2xl font-bold text-[#1A1410] mb-1">Utwórz konto</h1>
          <p className="text-sm text-[#1A1410]/50 mb-6">
            Masz już konto?{" "}
            <Link href={sessionId ? `/login?next=/api/payment-success?session_id=${sessionId}` : "/login"} className="text-[#C9A96E] hover:text-[#E8D5A3] transition-colors">Zaloguj się</Link>
          </p>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1410]/70 mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-[#8B6B44]/40 rounded-xl px-3 py-2.5 text-sm bg-white text-[#1A1410] placeholder:text-[#1A1410]/30 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/60 focus:border-[#C9A96E]/40 transition-all [color-scheme:light]"
                placeholder="ty@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1410]/70 mb-1.5">Hasło</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border border-[#8B6B44]/40 rounded-xl px-3 py-2.5 text-sm bg-white text-[#1A1410] placeholder:text-[#1A1410]/30 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/60 focus:border-[#C9A96E]/40 transition-all [color-scheme:light]"
                placeholder="min. 6 znaków"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/30 rounded-xl px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#C9A96E] to-[#E8D5A3] text-[#0a0a0a] rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-all active:scale-[0.98]"
            >
              {loading ? "Rejestracja…" : "Zarejestruj się"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
