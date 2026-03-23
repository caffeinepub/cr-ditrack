import { useState } from "react";

const STORAGE_KEY = "seque_subscription";

export interface SubscriptionState {
  tier: "free" | "premium";
  activatedAt?: string;
}

export function getSubscriptionState(): SubscriptionState {
  try {
    return (
      JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || {
        tier: "free",
      }
    );
  } catch {
    return { tier: "free" };
  }
}

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>(getSubscriptionState);

  const activate = () => {
    const next: SubscriptionState = {
      tier: "premium",
      activatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setState(next);
  };

  const deactivate = () => {
    const next: SubscriptionState = { tier: "free" };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setState(next);
  };

  return {
    isPremium: state.tier === "premium",
    clientLimit: state.tier === "premium" ? Number.POSITIVE_INFINITY : 10,
    activate,
    deactivate,
  };
}
