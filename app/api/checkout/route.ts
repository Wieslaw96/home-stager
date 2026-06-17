import { createClient } from "@/lib/supabase/server";
import { getStripe, PLANS, type PlanKey } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const formData = await req.formData();
  const planKey = formData.get("plan") as PlanKey;
  const plan = PLANS[planKey];

  if (!plan || !plan.priceId) {
    return NextResponse.json({ error: "Nieprawidłowy plan." }, { status: 400 });
  }

  const stripe = getStripe();

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email! });
    customerId = customer.id;
    await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  const siteUrl = new URL(req.url).origin;
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: plan.priceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${siteUrl}/?success=1`,
    cancel_url: `${siteUrl}/pricing`,
    metadata: { user_id: user.id, plan: planKey },
  });

  return NextResponse.redirect(session.url!, 303);
}
