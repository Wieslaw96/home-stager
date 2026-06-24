import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function adminClient() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const PLAN_LIMITS: Record<string, number> = { starter: 20, agent: 80, agencja: 300 };

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Brak dostępu." }, { status: 401 });

  const { data: sub } = await supabase.from("subscriptions")
    .select("plan").eq("user_id", user.id).eq("status", "active").maybeSingle();
  if (sub?.plan !== "admin") return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });

  const { email, days = 7, plan = "starter" } = await req.json();
  if (!email) return NextResponse.json({ error: "Podaj email." }, { status: 400 });

  const admin = adminClient();
  const { data: { users }, error: listErr } = await admin.auth.admin.listUsers();
  if (listErr) return NextResponse.json({ error: listErr.message }, { status: 500 });

  const target = users.find((u) => u.email === email);
  if (!target) return NextResponse.json({ error: `Nie znaleziono konta: ${email}. Agent musi się najpierw zarejestrować.` }, { status: 404 });

  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + days);

  const { error } = await admin.from("subscriptions").upsert({
    id: `trial_${target.id}`,
    user_id: target.id,
    plan,
    status: "active",
    current_period_end: periodEnd.toISOString(),
    cancel_at_period_end: false,
    updated_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    email,
    plan,
    days,
    limit: PLAN_LIMITS[plan] ?? 20,
    expires: periodEnd.toISOString(),
  });
}
