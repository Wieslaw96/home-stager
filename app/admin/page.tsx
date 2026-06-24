"use client";

import { useState } from "react";

const PLANS = [
  { key: "starter", label: "Starter (20 generacji/mies.)" },
  { key: "agent", label: "Agent (80 generacji/mies.)" },
  { key: "agencja", label: "Agencja (300 generacji/mies.)" },
];

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [days, setDays] = useState(7);
  const [plan, setPlan] = useState("starter");
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/grant-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, days, plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ ok: false, msg: data.error ?? "Błąd." });
      } else {
        const exp = new Date(data.expires).toLocaleDateString("pl-PL");
        setStatus({ ok: true, msg: `Dostęp aktywowany dla ${data.email} — plan ${data.plan}, ${data.days} dni (do ${exp}).` });
        setEmail("");
      }
    } catch {
      setStatus({ ok: false, msg: "Błąd połączenia." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-2">Panel administratora</h1>
        <p className="text-white/40 text-sm mb-8">Aktywuj dostęp próbny dla agenta</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/50 uppercase tracking-widest">Email agenta</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agent@example.com"
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#C9A96E] transition-colors"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-white/50 uppercase tracking-widest">Plan</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#C9A96E] transition-colors"
              >
                {PLANS.map((p) => (
                  <option key={p.key} value={p.key}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 w-28">
              <label className="text-xs text-white/50 uppercase tracking-widest">Dni</label>
              <input
                type="number"
                min={1}
                max={90}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#C9A96E] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#C9A96E] hover:bg-[#b8935a] disabled:opacity-50 text-black font-semibold rounded-lg py-3 text-sm transition-colors"
          >
            {loading ? "Aktywuję..." : "Aktywuj dostęp próbny"}
          </button>
        </form>

        {status && (
          <div className={`mt-4 rounded-lg px-4 py-3 text-sm ${status.ok ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
            {status.msg}
          </div>
        )}
      </div>
    </main>
  );
}
