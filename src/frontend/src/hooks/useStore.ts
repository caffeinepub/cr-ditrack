import { useCallback, useState } from "react";

export interface Client {
  id: string;
  name: string;
  phone: string;
  quartier: string;
  localisation: string;
  notes?: string;
  createdAt: number;
}

export interface Transaction {
  id: string;
  clientId: string;
  type: "dette" | "paiement";
  amount: number;
  product: string;
  dueDate: string;
  reminderTime?: string;
  createdAt: number;
}

export interface PersonalReminder {
  id: string;
  title: string;
  clientId?: string;
  note?: string;
  reminderDate: string; // YYYY-MM-DD
  reminderTime: string; // HH:MM
  fired: boolean;
  createdAt: number;
}

const CLIENTS_KEY = "creditrack_clients";
const TRANSACTIONS_KEY = "creditrack_transactions";
const PERSONAL_REMINDERS_KEY = "creditrack_personal_reminders";

const SAMPLE_IDS = ["c1", "c2", "c3"];

function load<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T[];
  } catch {
    // ignore
  }
  return fallback;
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function initStore() {
  // Clear sample data if present from previous versions
  try {
    const rawClients = localStorage.getItem(CLIENTS_KEY);
    if (rawClients) {
      const clients = JSON.parse(rawClients) as Client[];
      const hasSampleData = clients.some((c) => SAMPLE_IDS.includes(c.id));
      if (hasSampleData) {
        save(CLIENTS_KEY, []);
        save(TRANSACTIONS_KEY, []);
        return;
      }
    }
  } catch {
    // ignore
  }

  if (!localStorage.getItem(CLIENTS_KEY)) {
    save(CLIENTS_KEY, []);
  }
  if (!localStorage.getItem(TRANSACTIONS_KEY)) {
    save(TRANSACTIONS_KEY, []);
  }
}

initStore();

export function useStore() {
  const [clients, setClients] = useState<Client[]>(() =>
    load<Client>(CLIENTS_KEY, []),
  );
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    load<Transaction>(TRANSACTIONS_KEY, []),
  );
  const [personalReminders, setPersonalReminders] = useState<
    PersonalReminder[]
  >(() => load<PersonalReminder>(PERSONAL_REMINDERS_KEY, []));

  const addClient = useCallback((client: Omit<Client, "id" | "createdAt">) => {
    const newClient: Client = {
      ...client,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setClients((prev) => {
      const updated = [...prev, newClient];
      save(CLIENTS_KEY, updated);
      return updated;
    });
    return newClient;
  }, []);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    setClients((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      save(CLIENTS_KEY, updated);
      return updated;
    });
  }, []);

  const deleteClient = useCallback((id: string) => {
    setClients((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      save(CLIENTS_KEY, updated);
      return updated;
    });
    setTransactions((prev) => {
      const updated = prev.filter((t) => t.clientId !== id);
      save(TRANSACTIONS_KEY, updated);
      return updated;
    });
  }, []);

  const addTransaction = useCallback(
    (tx: Omit<Transaction, "id" | "createdAt">) => {
      const newTx: Transaction = {
        ...tx,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      setTransactions((prev) => {
        const updated = [...prev, newTx];
        save(TRANSACTIONS_KEY, updated);
        return updated;
      });
      return newTx;
    },
    [],
  );

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      save(TRANSACTIONS_KEY, updated);
      return updated;
    });
  }, []);

  const getClientBalance = useCallback(
    (clientId: string) => {
      return transactions
        .filter((t) => t.clientId === clientId)
        .reduce(
          (sum, t) => (t.type === "dette" ? sum + t.amount : sum - t.amount),
          0,
        );
    },
    [transactions],
  );

  const getTotalReceivable = useCallback(() => {
    return clients.reduce((sum, c) => {
      const bal = getClientBalance(c.id);
      return bal > 0 ? sum + bal : sum;
    }, 0);
  }, [clients, getClientBalance]);

  const addPersonalReminder = useCallback(
    (reminder: Omit<PersonalReminder, "id" | "fired" | "createdAt">) => {
      const newReminder: PersonalReminder = {
        ...reminder,
        id: crypto.randomUUID(),
        fired: false,
        createdAt: Date.now(),
      };
      setPersonalReminders((prev) => {
        const updated = [...prev, newReminder];
        save(PERSONAL_REMINDERS_KEY, updated);
        return updated;
      });
      return newReminder;
    },
    [],
  );

  const deletePersonalReminder = useCallback((id: string) => {
    setPersonalReminders((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      save(PERSONAL_REMINDERS_KEY, updated);
      return updated;
    });
  }, []);

  const markReminderFired = useCallback((id: string) => {
    setPersonalReminders((prev) => {
      const updated = prev.map((r) =>
        r.id === id ? { ...r, fired: true } : r,
      );
      save(PERSONAL_REMINDERS_KEY, updated);
      return updated;
    });
  }, []);

  return {
    clients,
    transactions,
    personalReminders,
    addClient,
    updateClient,
    deleteClient,
    addTransaction,
    deleteTransaction,
    getClientBalance,
    getTotalReceivable,
    addPersonalReminder,
    deletePersonalReminder,
    markReminderFired,
  };
}
