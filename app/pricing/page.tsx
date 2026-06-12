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
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between">
        <span className="font-bold text-slate-800 text-lg">RoomStager</span>
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/" className="text-sm text-blue-600 hover:underline">Przejdź do aplikacji →</Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-slate-600 hover:text-slate-800">Zaloguj się</Link>
              <Link href="/register" className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">Zarejestruj się</Link>
            </>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">Wybierz plan</h1>
          <p className="text-slate-500 text-lg">Transformuj wnętrza z pomocą AI. Anuluj w dowolnym momencie.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {(["starter", "growth", "pro"] as const).map((key) => {
            const plan = PLANS[key];
            const isActive = activePlan === key;
            const isGrowth = key === "growth";

            return (
              <div
                key={key}
                className={`bg-white rounded-2xl border-2 p-6 flex flex-col ${
                  isGrowth ? "border-blue-500 shadow-lg shadow-blue-100" : "border-slate-200"
                }`}
              >
                {isGrowth && (
                  <div className="text-center mb-3">
                    <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Najpopularniejszy
                    </span>
                  </div>
                )}

                <h2 className="text-xl font-bold text-slate-800">{plan.name}</h2>
                <div className="mt-2 mb-4">
                  <span className="text-4xl font-bold text-slate-900">{plan.amount / 100} zł</span>
                  <span className="text-slate-500 text-sm"> / miesiąc</span>
                </div>

                <ul className="flex flex-col gap-2 mb-6 flex-1">
                  {FEATURES[key].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-green-500 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {isActive ? (
                  <form action="/api/billing-portal" method="POST">
                    <button className="w-full border-2 border-blue-500 text-blue-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-50 transition-colors">
                      Zarządzaj subskrypcją
                    </button>
                  </form>
                ) : (
                  <form action="/api/checkout" method="POST">
                    <input type="hidden" name="plan" value={key} />
                    <button
                      className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                        isGrowth
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-slate-800 text-white hover:bg-slate-900"
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
      </main>
    </div>
  );
}
