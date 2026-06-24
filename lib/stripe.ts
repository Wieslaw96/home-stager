import Stripe from "stripe";

export function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-05-27.dahlia" });
}

export type PlanKey = "trial" | "starter" | "agent" | "agencja" | "admin";

export const PLANS: Record<PlanKey, { name: string; priceId: string; generations: number; amount: number }> = {
  trial: {
    name: "Trial",
    priceId: "",
    generations: 1,
    amount: 0,
  },
  starter: {
    name: "Starter",
    priceId: process.env.STRIPE_PRICE_STARTER ?? "",
    generations: 20,
    amount: 9700,
  },
  agent: {
    name: "Agent",
    priceId: process.env.STRIPE_PRICE_AGENT ?? "",
    generations: 80,
    amount: 24700,
  },
  agencja: {
    name: "Agencja",
    priceId: process.env.STRIPE_PRICE_AGENCJA ?? "",
    generations: 300,
    amount: 59700,
  },
  admin: {
    name: "Admin",
    priceId: "",
    generations: Infinity,
    amount: 0,
  },
};

export function getPlanByPriceId(priceId: string): PlanKey | null {
  const entry = Object.entries(PLANS).find(([, v]) => v.priceId === priceId);
  return entry ? (entry[0] as PlanKey) : null;
}
