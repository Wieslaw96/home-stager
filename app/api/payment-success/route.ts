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
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(new URL("/pricing?error=missing_session", req.url));
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL(`/login?next=/api/payment-success?session_id=${sessionId}`, req.url), 303);
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });

  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    return NextResponse.redirect(new URL("/pricing?error=payment_incomplete", req.url));
  }

  if (session.mode === "subscription" && session.subscription) {
    const rawSub = session.subscription;
    const subId = typeof rawSub === "string" ? rawSub : rawSub.id;
    const sub = typeof rawSub === "string"
      ? await stripe.subscriptions.retrieve(rawSub)
      : rawSub;

    const planKey = getPlanByPriceId(sub.items.data[0].price.id);

    if (planKey) {
      const admin = adminClient();

      // Ensure profile row exists (FK constraint)
      const stripeCustomerId = typeof session.customer === "string"
        ? session.customer
        : session.customer?.id ?? null;

      await admin.from("profiles").upsert({
        id: user.id,
        email: user.email ?? "",
        ...(stripeCustomerId ? { stripe_customer_id: stripeCustomerId } : {}),
      }, { onConflict: "id", ignoreDuplicates: false });

      const periodEndTs: number =
        (sub as unknown as { current_period_end?: number }).current_period_end
        ?? sub.items.data[0]?.current_period_end
        ?? 0;

      const { error } = await admin.from("subscriptions").upsert({
        id: subId,
        user_id: user.id,
        plan: planKey,
        status: sub.status,
        current_period_end: periodEndTs ? new Date(periodEndTs * 1000).toISOString() : null,
        cancel_at_period_end: sub.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("[payment-success] upsert error:", error);
        return NextResponse.redirect(
          new URL(`/pricing?error=db_error&msg=${encodeURIComponent(error.message)}`, req.url)
        );
      }

      await admin.from("subscriptions").delete().eq("id", `trial_${user.id}`);
    } else {
      console.error("[payment-success] unknown priceId:", sub.items.data[0].price.id);
      return NextResponse.redirect(new URL("/pricing?error=unknown_plan", req.url));
    }
  }

  return NextResponse.redirect(new URL("/app?success=1", req.url));
}
