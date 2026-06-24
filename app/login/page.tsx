"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/app";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Nieprawidłowy e-mail lub hasło.");
      setLoading(false);
    } else {
      router.push(next);
      router.refresh();
    }
  }

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  return (
    <div className="min-h-screen bg-[#E8D9C4] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo dark />
        </div>

        <div className="bg-white rounded-2xl border border-[#8B6B44]/35 p-8">
          <h1 className="text-2xl font-bold text-[#1A1410] mb-1">Zaloguj się</h1>
          <p className="text-sm text-[#1A1410]/50 mb-6">
            Nie masz konta?{" "}
            <Link href="/register" className="text-[#C9A96E] hover:text-[#E8D5A3] transition-colors">Zarejestruj się</Link>
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-[#1A1410]/70">Hasło</label>
                <Link href="/reset-password" className="text-xs text-[#C9A96E] hover:text-[#8B5E30] transition-colors">
                  Zapomniałem hasła
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-[#8B6B44]/40 rounded-xl px-3 py-2.5 text-sm bg-white text-[#1A1410] placeholder:text-[#1A1410]/30 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/60 focus:border-[#C9A96E]/40 transition-all [color-scheme:light]"
                placeholder="••••••••"
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
              {loading ? "Logowanie…" : "Zaloguj się"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-[#8B6B44]/10" />
            <span className="text-xs text-[#1A1410]/30">lub</span>
            <div className="flex-1 h-px bg-[#8B6B44]/10" />
          </div>

          <button
            onClick={handleGoogle}
            className="w-full border border-[#8B6B44]/40 rounded-xl py-2.5 text-sm font-medium text-[#1A1410]/70 hover:bg-[#8B6B44]/8 hover:text-[#1A1410] bg-white transition-all flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            Zaloguj przez Google
          </button>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
