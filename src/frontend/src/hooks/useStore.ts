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
  photoBase64?: string;
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

const BASE_CLIENTS_KEY = "creditrack_clients";
const BASE_TRANSACTIONS_KEY = "creditrack_transactions";
const BASE_PERSONAL_REMINDERS_KEY = "creditrack_personal_reminders";

const SAMPLE_IDS = ["c1", "c2", "c3"];

function getKeys(storeId: string) {
  if (!storeId) {
    return {
      clientsKey: BASE_CLIENTS_KEY,
      transactionsKey: BASE_TRANSACTIONS_KEY,
      remindersKey: BASE_PERSONAL_REMINDERS_KEY,
    };
  }
  return {
    clientsKey: `creditrack_clients_${storeId}`,
    transactionsKey: `creditrack_transactions_${storeId}`,
    remindersKey: `creditrack_personal_reminders_${storeId}`,
  };
}

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

function initStore(storeId: string) {
  // Si storeId ICP présent, pas d'initialisation localStorage pour éviter les conflits
  if (storeId) return;

  const { clientsKey, transactionsKey } = getKeys(storeId);
  // Clear sample data if present from previous versions
  try {
    const rawClients = localStorage.getItem(clientsKey);
    if (rawClients) {
      const clients = JSON.parse(rawClients) as Client[];
      const hasSampleData = clients.some((c) => SAMPLE_IDS.includes(c.id));
      if (hasSampleData) {
        save(clientsKey, []);
        save(transactionsKey, []);
        return;
      }
    }
  } catch {
    // ignore
  }

  if (!localStorage.getItem(clientsKey)) {
    save(clientsKey, []);
  }
  if (!localStorage.getItem(transactionsKey)) {
    save(transactionsKey, []);
  }
}

export function useStore(storeId = "") {
  const { clientsKey, transactionsKey, remindersKey } = getKeys(storeId);

  // Run init once for this storeId
  initStore(storeId);

  const [clients, setClients] = useState<Client[]>(() =>
    load<Client>(clientsKey, []),
  );
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    load<Transaction>(transactionsKey, []),
  );
  const [personalReminders, setPersonalReminders] = useState<
    PersonalReminder[]
  >(() => load<PersonalReminder>(remindersKey, []));

  const addClient = useCallback(
    (client: Omit<Client, "id" | "createdAt">) => {
      const newClient: Client = {
        ...client,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      setClients((prev) => {
        const updated = [...prev, newClient];
        save(clientsKey, updated);
        return updated;
      });
      return newClient;
    },
    [clientsKey],
  );

  const updateClient = useCallback(
    (id: string, updates: Partial<Client>) => {
      setClients((prev) => {
        const updated = prev.map((c) =>
          c.id === id ? { ...c, ...updates } : c,
        );
        save(clientsKey, updated);
        return updated;
      });
    },
    [clientsKey],
  );

  const deleteClient = useCallback(
    (id: string) => {
      setClients((prev) => {
        const updated = prev.filter((c) => c.id !== id);
        save(clientsKey, updated);
        return updated;
      });
      setTransactions((prev) => {
        const updated = prev.filter((t) => t.clientId !== id);
        save(transactionsKey, updated);
        return updated;
      });
    },
    [clientsKey, transactionsKey],
  );

  const addTransaction = useCallback(
    (tx: Omit<Transaction, "id" | "createdAt">) => {
      const newTx: Transaction = {
        ...tx,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      setTransactions((prev) => {
        const updated = [...prev, newTx];
        save(transactionsKey, updated);
        return updated;
      });
      return newTx;
    },
    [transactionsKey],
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      setTransactions((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        save(transactionsKey, updated);
        return updated;
      });
    },
    [transactionsKey],
  );

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
        save(remindersKey, updated);
        return updated;
      });
      return newReminder;
    },
    [remindersKey],
  );

  const deletePersonalReminder = useCallback(
    (id: string) => {
      setPersonalReminders((prev) => {
        const updated = prev.filter((r) => r.id !== id);
        save(remindersKey, updated);
        return updated;
      });
    },
    [remindersKey],
  );

  const markReminderFired = useCallback(
    (id: string) => {
      setPersonalReminders((prev) => {
        const updated = prev.map((r) =>
          r.id === id ? { ...r, fired: true } : r,
        );
        save(remindersKey, updated);
        return updated;
      });
    },
    [remindersKey],
  );

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
