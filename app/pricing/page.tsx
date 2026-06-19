import { createClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/stripe";
import Link from "next/link";
import { Logo } from "@/components/Logo";

const FEATURES = {
  starter: [
    "20 generacji miesięcznie (~4 ogłoszenia)",
    "Wszystkie style wnętrz",
    "Wszystkie typy pomieszczeń",
    "Pobieranie wyników",
  ],
  agent: [
    "80 generacji miesięcznie (~16 ogłoszeń)",
    "Wszystkie style wnętrz",
    "Wszystkie typy pomieszczeń",
    "Pobieranie wyników",
    "Priorytetowa kolejka generowania",
  ],
  agencja: [
    "300 generacji miesięcznie (~60 ogłoszeń)",
    "3 konta w jednym planie",
    "Wszystkie style wnętrz",
    "Wszystkie typy pomieszczeń",
    "Pobieranie wyników",
    "Priorytetowe wsparcie",
  ],
};

const PER_GEN: Record<string, string> = {
  starter: "4,85 zł / zdjęcie",
  agent: "3,09 zł / zdjęcie",
  agencja: "1,99 zł / zdjęcie",
};

const SAVING: Record<string, string | null> = {
  starter: null,
  agent: "36% taniej niż Starter",
  agencja: "59% taniej niż Starter",
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
    <div className="min-h-screen bg-[#E8D9C4]">

      {/* Header */}
      <header className="bg-white border-b border-[#8B6B44]/25 px-6 py-4 flex items-center justify-between">
        <Logo dark />
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/app" className="text-sm text-[#C9A96E] hover:text-[#E8D5A3] transition-colors">
              Przejdź do aplikacji →
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-[#1A1410]/60 hover:text-[#1A1410] transition-colors">
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
          <h1 className="text-4xl font-bold text-[#1A1410] mb-3">Wybierz plan</h1>
          <p className="text-[#1A1410]/50 text-lg">Profesjonalny staging AI zamiast 3 000 zł za tradycyjny. Anuluj w dowolnym momencie.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {(["starter", "agent", "agencja"] as const).map((key) => {
            const plan = PLANS[key];
            const isActive = activePlan === key;
            const isAgent = key === "agent";

            return (
              <div
                key={key}
                className={`rounded-2xl border-2 p-6 flex flex-col transition-all ${
                  isAgent
                    ? "border-[#C9A96E]/60 bg-gradient-to-b from-[#C9A96E]/15 to-[#FFF9F0] shadow-xl shadow-[#C9A96E]/15 scale-[1.03]"
                    : "border-[#8B6B44]/30 bg-white"
                }`}
              >
                {isAgent && (
                  <div className="text-center mb-3">
                    <span className="bg-[#C9A96E] text-[#0a0a0a] text-xs font-black px-3 py-1 rounded-full tracking-wide uppercase">
                      Najpopularniejszy
                    </span>
                  </div>
                )}

                <h2 className="text-xl font-bold text-[#1A1410]">{plan.name}</h2>

                <div className="mt-2 mb-1">
                  <span className="text-4xl font-bold text-[#1A1410]">{(plan.amount / 100).toLocaleString("pl-PL")} zł</span>
                  <span className="text-[#1A1410]/40 text-sm"> / miesiąc</span>
                </div>

                {/* Per-gen price */}
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-xs text-[#1A1410]/50">{PER_GEN[key]}</span>
                  {SAVING[key] && (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      ↓ {SAVING[key]}
                    </span>
                  )}
                </div>

                <ul className="flex flex-col gap-2 mb-6 flex-1">
                  {FEATURES[key].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#1A1410]/60">
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
                        isAgent
                          ? "bg-gradient-to-r from-[#C9A96E] to-[#E8D5A3] text-[#0a0a0a]"
                          : "bg-white text-[#1A1410] hover:bg-[#1A1410]/5 border-2 border-[#1A1410]/35"
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

        <p className="text-center text-[#1A1410]/25 text-xs mt-10">
          Anuluj w dowolnym momencie. Bez ukrytych opłat. Faktura VAT w cenie.
        </p>
      </main>
    </div>
  );
}
