import { useCallback, useEffect, useMemo, useState } from "react";
import type { Transaction } from "./useBackendStore";

function getStoredTreated(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

/**
 * App Badging API hook — affiche un badge numérique sur l'icône PWA.
 * Le chiffre représente les clients avec des dettes en retard
 * (dueDate < aujourd'hui) non encore traités par un rappel WhatsApp.
 */
export function useAppBadge(
  transactions: Transaction[],
  getClientBalance: (id: string) => number,
  storeId: string,
) {
  // Stable today value — computed once per render cycle via useMemo
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const storageKey = `badge_treated_${storeId}_${today}`;

  const [treated, setTreated] = useState<Set<string>>(() =>
    getStoredTreated(storageKey),
  );

  // Clients with at least one overdue debt and a positive balance
  const overdueClientIds = useMemo(() => {
    const ids = new Set<string>();
    for (const tx of transactions) {
      if (tx.type === "dette" && tx.dueDate && tx.dueDate < today) {
        const bal = getClientBalance(tx.clientId);
        if (bal > 0) ids.add(tx.clientId);
      }
    }
    return ids;
  }, [transactions, getClientBalance, today]);

  // Untreated = overdue but no WhatsApp reminder sent yet today
  const untreatedCount = useMemo(() => {
    let count = 0;
    for (const id of overdueClientIds) {
      if (!treated.has(id)) count++;
    }
    return count;
  }, [overdueClientIds, treated]);

  // Update the OS app badge whenever count changes
  useEffect(() => {
    // Guard for environments where navigator is unavailable (WebView)
    if (typeof navigator === "undefined") return;
    if (!("setAppBadge" in navigator)) return;
    const nav = navigator as Navigator & {
      setAppBadge: (count?: number) => Promise<void>;
      clearAppBadge: () => Promise<void>;
    };
    if (untreatedCount > 0) {
      nav.setAppBadge(untreatedCount).catch(() => {});
    } else {
      nav.clearAppBadge().catch(() => {});
    }
  }, [untreatedCount]);

  // Clear badge on unmount / logout
  useEffect(() => {
    return () => {
      if (typeof navigator === "undefined") return;
      if (!("clearAppBadge" in navigator)) return;
      (navigator as Navigator & { clearAppBadge: () => Promise<void> })
        .clearAppBadge()
        .catch(() => {});
    };
  }, []);

  const markClientTreated = useCallback(
    (clientId: string) => {
      setTreated((prev) => {
        if (prev.has(clientId)) return prev;
        const next = new Set(prev);
        next.add(clientId);
        try {
          localStorage.setItem(storageKey, JSON.stringify([...next]));
        } catch {}
        return next;
      });
    },
    [storageKey],
  );

  return {
    /** Nombre de dettes en retard non encore traitées */
    overdueCount: untreatedCount,
    overdueClientIds,
    /** Appeler quand un rappel WhatsApp a été envoyé pour ce client */
    markClientTreated,
  };
}
