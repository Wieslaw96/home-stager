import { createClient } from "@/lib/supabase/server";
import { getStripe, PLANS, type PlanKey } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ plan: string }> }) {
  const { plan: planKey } = await params;
  const plan = PLANS[planKey as PlanKey];

  if (!plan || !plan.priceId) {
    return NextResponse.redirect(new URL("/pricing", req.url));
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const stripe = getStripe();
  const siteUrl = new URL(req.url).origin;

  if (user) {
    // Logged-in: attach customer and go straight to /app after payment
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

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: plan.priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${siteUrl}/api/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/pricing`,
      metadata: { user_id: user.id, plan: planKey },
    });

    return NextResponse.redirect(session.url!, 303);
  }

  // Guest: no account needed — Stripe collects email, register after payment
  const session = await stripe.checkout.sessions.create({
    line_items: [{ price: plan.priceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${siteUrl}/register?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/#plans`,
    metadata: { plan: planKey },
  });

  return NextResponse.redirect(session.url!, 303);
}
