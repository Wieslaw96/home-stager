import { createClient } from "@/lib/supabase/server";
import { getStripe, getPlanByPriceId } from "@/lib/stripe";
import { createClient as createAdminSupabase } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function adminClient() {
  return createAdminSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.redirect(new URL("/pricing", req.url));
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
      return NextResponse.redirect(new URL("/pricing?error=payment_failed", req.url));
    }

    if (session.mode === "subscription" && session.subscription) {
      const sub = session.subscription as import("stripe").Stripe.Subscription;
      const planKey = getPlanByPriceId(sub.items.data[0].price.id);

      if (planKey) {
        await adminClient().from("subscriptions").upsert({
          id: sub.id,
          user_id: user.id,
          plan: planKey,
          status: sub.status,
          current_period_end: new Date(
            (sub as unknown as { current_period_end: number }).current_period_end * 1000
          ).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        });
      }
    }
  } catch {
    // If Stripe check fails, still redirect to success — webhook may have already handled it
  }

  return NextResponse.redirect(new URL("/?success=1", req.url));
}
