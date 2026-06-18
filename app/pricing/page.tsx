import { createClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/stripe";
import Link from "next/link";

const FEATURES = {
  starter: ["20 generacji miesięcznie", "Wszystkie style wnętrz", "Wszystkie typy pomieszczeń", "Pobieranie wyników"],
  growth: ["60 generacji miesięcznie", "Wszystkie style wnętrz", "Wszystkie typy pomieszczeń", "Pobieranie wyników", "Priorytetowe wsparcie"],
  pro: ["Nielimitowane generacje", "Wszystkie style wnętrz", "Wszystkie typy pomieszczeń", "Pobieranie wyników", "Priorytetowe wsparcie", "Dostęp do nowych funkcji"],
};

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let activePlan: string | null = null;
  if (user) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    activePlan = sub?.plan ?? null;
  }

  return (
    <div className="min-h-screen bg-[#1C1C18]">

      {/* Header */}
      <header className="bg-[#242420] border-b border-white/6 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A96E] to-[#A07840] flex items-center justify-center text-sm">🏠</div>
          <span className="font-bold text-[#F0EDE8] text-lg tracking-tight">RoomStager</span>
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/app" className="text-sm text-[#C9A96E] hover:text-[#E8D5A3] transition-colors">
              Przejdź do aplikacji →
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-[#F0EDE8]/60 hover:text-[#F0EDE8] transition-colors">
                Zaloguj się
              </Link>
              <Link
                href="/register"
                className="text-sm bg-gradient-to-r from-[#C9A96E] to-[#E8D5A3] text-[#0a0a0a] font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-all"
              >
                Zarejestruj się
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#F0EDE8] mb-3">Wybierz plan</h1>
          <p className="text-[#F0EDE8]/50 text-lg">Transformuj wnętrza z pomocą AI. Anuluj w dowolnym momencie.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {(["starter", "growth", "pro"] as const).map((key) => {
            const plan = PLANS[key];
            const isActive = activePlan === key;
            const isGrowth = key === "growth";

            return (
              <div
                key={key}
                className={`rounded-2xl border-2 p-6 flex flex-col transition-all ${
                  isGrowth
                    ? "border-[#C9A96E]/40 bg-gradient-to-b from-[#C9A96E]/10 to-[#1E1E1B] shadow-xl shadow-[#C9A96E]/10"
                    : "border-white/8 bg-[#242420]"
                }`}
              >
                {isGrowth && (
                  <div className="text-center mb-3">
                    <span className="bg-[#C9A96E] text-[#0a0a0a] text-xs font-black px-3 py-1 rounded-full tracking-wide uppercase">
                      Najpopularniejszy
                    </span>
                  </div>
                )}

                <h2 className="text-xl font-bold text-[#F0EDE8]">{plan.name}</h2>
                <div className="mt-2 mb-4">
                  <span className="text-4xl font-bold text-[#F0EDE8]">{plan.amount / 100} zł</span>
                  <span className="text-[#F0EDE8]/40 text-sm"> / miesiąc</span>
                </div>

                <ul className="flex flex-col gap-2 mb-6 flex-1">
                  {FEATURES[key].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#F0EDE8]/60">
                      <span className="text-[#C9A96E] mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {isActive ? (
                  <form action="/api/billing-portal" method="POST">
                    <button className="w-full border-2 border-[#C9A96E]/40 text-[#C9A96E] rounded-xl py-2.5 text-sm font-semibold hover:bg-[#C9A96E]/10 transition-colors">
                      Zarządzaj subskrypcją
                    </button>
                  </form>
                ) : (
                  <form action="/api/checkout" method="POST">
                    <input type="hidden" name="plan" value={key} />
                    <button
                      className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] ${
                        isGrowth
                          ? "bg-gradient-to-r from-[#C9A96E] to-[#E8D5A3] text-[#0a0a0a]"
                          : "bg-white/8 text-[#F0EDE8] hover:bg-white/12 border border-white/10"
                      }`}
                    >
                      {user ? "Wybierz plan" : "Zacznij teraz"}
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-[#F0EDE8]/25 text-xs mt-8">
          Anuluj w dowolnym momencie. Bez ukrytych opłat. Faktura VAT w cenie.
        </p>
      </main>
    </div>
  );
}
