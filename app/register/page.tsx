"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#141412] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#1E1E1B] rounded-2xl border border-white/8 p-8 text-center">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-[#F0EDE8] mb-2">Sprawdź swoją skrzynkę</h2>
          <p className="text-sm text-[#F0EDE8]/50">
            Wysłaliśmy link potwierdzający na <strong className="text-[#F0EDE8]/80">{email}</strong>.
            Kliknij go, żeby aktywować konto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141412] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A96E] to-[#A07840] flex items-center justify-center text-sm">🏠</div>
          <span className="font-bold text-lg text-[#F0EDE8] tracking-tight">RoomStager</span>
        </Link>

        <div className="bg-[#1E1E1B] rounded-2xl border border-white/8 p-8">
          <h1 className="text-2xl font-bold text-[#F0EDE8] mb-1">Utwórz konto</h1>
          <p className="text-sm text-[#F0EDE8]/50 mb-6">
            Masz już konto?{" "}
            <Link href="/login" className="text-[#C9A96E] hover:text-[#E8D5A3] transition-colors">Zaloguj się</Link>
          </p>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-[#F0EDE8]/70 mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-white/10 rounded-xl px-3 py-2.5 text-sm bg-[#252521] text-[#F0EDE8] placeholder:text-[#F0EDE8]/30 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]/40 transition-all [color-scheme:dark]"
                placeholder="ty@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#F0EDE8]/70 mb-1.5">Hasło</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border border-white/10 rounded-xl px-3 py-2.5 text-sm bg-[#252521] text-[#F0EDE8] placeholder:text-[#F0EDE8]/30 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]/40 transition-all [color-scheme:dark]"
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
