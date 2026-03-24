import { useState } from "react";

const STORAGE_KEY = "seque_boutiques";

export interface Boutique {
  id: string;
  name: string;
  quartier: string;
  phone: string;
  tier: "free" | "premium";
  activated: boolean;
  joinDate: string;
  transactionCount: number;
  totalAmountFCFA: number;
  accessCode: string;
  owner: string;
  lastPaymentDate?: string;
}

export interface GlobalTransaction {
  id: string;
  storeId: string;
  storeName: string;
  clientName: string;
  type: "dette" | "paiement";
  amount: number;
  product: string;
  createdAt: number;
}

function load(): Boutique[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function save(data: Boutique[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Lookup a boutique by its access code (case-insensitive). */
export function getBoutiqueByCode(code: string): Boutique | undefined {
  const boutiques = load();
  return boutiques.find(
    (b) => b.accessCode.trim().toUpperCase() === code.trim().toUpperCase(),
  );
}

/** Reads real client/transaction data from a store's localStorage */
export function getStoreLiveStats(storeId: string): {
  clientCount: number;
  totalDebt: number;
  lastTransactionDate: string | null;
} {
  try {
    const clients: Array<{ id: string }> = JSON.parse(
      localStorage.getItem(`creditrack_clients_${storeId}`) || "[]",
    );
    const transactions: Array<{
      clientId: string;
      type: string;
      amount: number;
      createdAt: number;
    }> = JSON.parse(
      localStorage.getItem(`creditrack_transactions_${storeId}`) || "[]",
    );
    const clientCount = clients.length;
    const totalDebt = transactions.reduce(
      (sum, t) => (t.type === "dette" ? sum + t.amount : sum - t.amount),
      0,
    );
    const dates = transactions.map((t) => t.createdAt).sort((a, b) => b - a);
    const lastTransactionDate =
      dates.length > 0 ? new Date(dates[0]).toISOString().split("T")[0] : null;
    return {
      clientCount,
      totalDebt: Math.max(0, totalDebt),
      lastTransactionDate,
    };
  } catch {
    return { clientCount: 0, totalDebt: 0, lastTransactionDate: null };
  }
}

/** Collects all transactions across all boutiques */
export function getAllTransactions(boutiques: Boutique[]): GlobalTransaction[] {
  const result: GlobalTransaction[] = [];
  for (const b of boutiques) {
    try {
      const clients: Array<{ id: string; name: string }> = JSON.parse(
        localStorage.getItem(`creditrack_clients_${b.id}`) || "[]",
      );
      const transactions: Array<{
        id: string;
        clientId: string;
        type: string;
        amount: number;
        product: string;
        createdAt: number;
      }> = JSON.parse(
        localStorage.getItem(`creditrack_transactions_${b.id}`) || "[]",
      );
      const clientMap: Record<string, string> = {};
      for (const c of clients) clientMap[c.id] = c.name;
      for (const t of transactions) {
        result.push({
          id: t.id,
          storeId: b.id,
          storeName: b.name,
          clientName: clientMap[t.clientId] || "Inconnu",
          type: t.type as "dette" | "paiement",
          amount: t.amount,
          product: t.product,
          createdAt: t.createdAt,
        });
      }
    } catch {
      /* skip */
    }
  }
  return result.sort((a, b) => b.createdAt - a.createdAt);
}

function getISOWeek(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return `${d.getFullYear()}-W${String(
    1 +
      Math.round(
        ((d.getTime() - week1.getTime()) / 86400000 -
          3 +
          ((week1.getDay() + 6) % 7)) /
          7,
      ),
  ).padStart(2, "0")}`;
}

export function useBoutiqueStore() {
  const [boutiques, setBoutiques] = useState<Boutique[]>(load);

  const update = (data: Boutique[]) => {
    save(data);
    setBoutiques(data);
  };

  const addBoutique = (data: Omit<Boutique, "id" | "joinDate">): Boutique => {
    const existing = boutiques.find(
      (b) =>
        b.accessCode.trim().toUpperCase() ===
        data.accessCode.trim().toUpperCase(),
    );
    if (existing) {
      throw new Error(
        "Ce code d'accès est déjà utilisé par une autre boutique.",
      );
    }
    const b: Boutique = {
      ...data,
      id: `b_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      joinDate: new Date().toISOString().split("T")[0],
    };
    update([...boutiques, b]);
    return b;
  };

  const toggleActivation = (id: string) => {
    update(
      boutiques.map((b) =>
        b.id === id ? { ...b, activated: !b.activated } : b,
      ),
    );
  };

  const upgradeToPremium = (id: string) => {
    update(boutiques.map((b) => (b.id === id ? { ...b, tier: "premium" } : b)));
  };

  const downgradeToFree = (id: string) => {
    update(boutiques.map((b) => (b.id === id ? { ...b, tier: "free" } : b)));
  };

  const deleteBoutique = (id: string) => {
    update(boutiques.filter((b) => b.id !== id));
  };

  const updateStats = (
    id: string,
    transactionCount: number,
    totalAmountFCFA: number,
  ) => {
    update(
      boutiques.map((b) =>
        b.id === id ? { ...b, transactionCount, totalAmountFCFA } : b,
      ),
    );
  };

  const updateLastPaymentDate = (id: string, date: string) => {
    update(
      boutiques.map((b) => (b.id === id ? { ...b, lastPaymentDate: date } : b)),
    );
  };

  const getGlobalStats = () => ({
    totalBoutiques: boutiques.length,
    activeBoutiques: boutiques.filter((b) => b.activated).length,
    premiumBoutiques: boutiques.filter((b) => b.tier === "premium").length,
    totalAmountFCFA: boutiques.reduce((sum, b) => sum + b.totalAmountFCFA, 0),
  });

  const getWeeklyGrowth = (): Array<{
    week: string;
    count: number;
    cumulative: number;
  }> => {
    const weeks: string[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      weeks.push(getISOWeek(d));
    }
    const weekMap: Record<string, number> = {};
    for (const b of boutiques) {
      const w = getISOWeek(new Date(b.joinDate));
      weekMap[w] = (weekMap[w] || 0) + 1;
    }
    let cumulative = 0;
    const oldCumulative = boutiques.filter((b) => {
      const w = getISOWeek(new Date(b.joinDate));
      return !weeks.includes(w);
    }).length;
    cumulative = oldCumulative;
    return weeks.map((w, i) => {
      const count = weekMap[w] || 0;
      cumulative += count;
      return { week: `S${i + 1}`, count, cumulative };
    });
  };

  return {
    boutiques,
    addBoutique,
    toggleActivation,
    upgradeToPremium,
    downgradeToFree,
    deleteBoutique,
    updateStats,
    updateLastPaymentDate,
    getGlobalStats,
    getWeeklyGrowth,
  };
}
