/**
 * Daj agentowi darmowy dostęp próbny.
 *
 * Użycie:
 *   node grant-trial.mjs <email> [dni] [plan]
 *
 * Przykłady:
 *   node grant-trial.mjs agent@example.com
 *   node grant-trial.mjs agent@example.com 14
 *   node grant-trial.mjs agent@example.com 7 agent
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf-8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => l.split("=").map((s) => s.trim()))
    .map(([k, ...v]) => [k, v.join("=")])
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

const [email, daysArg = "7", plan = "starter"] = process.argv.slice(2);

if (!email) {
  console.error("Użycie: node grant-trial.mjs <email> [dni] [plan]");
  process.exit(1);
}

const days = parseInt(daysArg, 10);
const periodEnd = new Date();
periodEnd.setDate(periodEnd.getDate() + days);

async function main() {
  const { data: { users }, error: userErr } = await supabase.auth.admin.listUsers();
  if (userErr) throw userErr;

  const user = users.find((u) => u.email === email);
  if (!user) {
    console.error(`\n❌ Nie znaleziono konta: ${email}`);
    console.error(`   Agent musi się najpierw zarejestrować na stageria.pl\n`);
    process.exit(1);
  }

  const { error } = await supabase.from("subscriptions").upsert({
    id: `trial_${user.id}`,
    user_id: user.id,
    plan,
    status: "active",
    current_period_end: periodEnd.toISOString(),
    cancel_at_period_end: false,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;

  const PLAN_LIMITS = { starter: 20, agent: 80, agencja: 300 };
  const limit = PLAN_LIMITS[plan] ?? 20;

  console.log(`\n✅ Dostęp próbny aktywowany`);
  console.log(`   Email:  ${email}`);
  console.log(`   Plan:   ${plan} (${limit} generacji/mies.)`);
  console.log(`   Ważny:  ${days} dni — do ${periodEnd.toLocaleDateString("pl-PL")}\n`);
}

main().catch((e) => { console.error("Błąd:", e.message); process.exit(1); });
