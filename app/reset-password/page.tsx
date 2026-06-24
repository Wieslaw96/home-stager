"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/reset-password/update`,
    });
    if (error) {
      setError("Nie udało się wysłać linku. Sprawdź czy podany e-mail jest poprawny.");
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#E8D9C4] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo dark />
        </div>

        <div className="bg-white rounded-2xl border border-[#8B6B44]/35 p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-3xl mb-4">✉️</div>
              <h1 className="text-xl font-bold text-[#1A1410] mb-2">Sprawdź skrzynkę</h1>
              <p className="text-sm text-[#1A1410]/55 mb-6">
                Wysłaliśmy link do resetowania hasła na <strong>{email}</strong>. Sprawdź też folder spam.
              </p>
              <Link href="/login" className="text-sm text-[#C9A96E] hover:text-[#8B5E30] transition-colors">
                ← Wróć do logowania
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-[#1A1410] mb-1">Resetuj hasło</h1>
              <p className="text-sm text-[#1A1410]/50 mb-6">
                Podaj swój e-mail — wyślemy link do ustawienia nowego hasła.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1410]/70 mb-1.5">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full border border-[#8B6B44]/40 rounded-xl px-3 py-2.5 text-sm bg-white text-[#1A1410] placeholder:text-[#1A1410]/30 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/60 focus:border-[#C9A96E]/40 transition-all [color-scheme:light]"
                    placeholder="ty@example.com"
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
                  {loading ? "Wysyłanie…" : "Wyślij link resetujący"}
                </button>
              </form>

              <p className="text-center mt-5 text-sm text-[#1A1410]/40">
                <Link href="/login" className="text-[#C9A96E] hover:text-[#8B5E30] transition-colors">
                  ← Wróć do logowania
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
