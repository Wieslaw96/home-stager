import Stripe from "stripe";

export function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-05-27.dahlia" });
}

export type PlanKey = "starter" | "growth" | "pro";

export const PLANS: Record<PlanKey, { name: string; priceId: string; generations: number; amount: number }> = {
  starter: {
    name: "Starter",
    priceId: process.env.STRIPE_PRICE_STARTER ?? "",
    generations: 20,
    amount: 4900,
  },
  growth: {
    name: "Growth",
    priceId: process.env.STRIPE_PRICE_GROWTH ?? "",
    generations: 60,
    amount: 9900,
  },
  pro: {
    name: "Pro",
    priceId: process.env.STRIPE_PRICE_PRO ?? "",
    generations: Infinity,
    amount: 49900,
  },
};

export function getPlanByPriceId(priceId: string): PlanKey | null {
  const entry = Object.entries(PLANS).find(([, v]) => v.priceId === priceId);
  return entry ? (entry[0] as PlanKey) : null;
}
