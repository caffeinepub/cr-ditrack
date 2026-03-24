import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { sequeApi } from "../sequeApi";
import type {
  Client as BackendClient,
  Dette,
  Paiement,
  Rappel,
} from "../sequeApi";

// UI-facing types (compatible with existing components)
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
  reminderDate: string;
  reminderTime: string;
  fired: boolean;
  createdAt: number;
}

function backendClientToUI(c: BackendClient): Client {
  return {
    id: c.id,
    name: c.nom,
    phone: c.telephone,
    quartier: c.quartier,
    localisation: c.quartier,
    notes: "",
    createdAt: Number(c.createdAt),
  };
}

function uiClientToBackend(
  c: Omit<Client, "id" | "createdAt">,
  storeId: string,
  id: string,
): BackendClient {
  return {
    id,
    storeId,
    nom: c.name,
    telephone: c.phone,
    quartier: c.localisation || c.quartier || "",
    createdAt: BigInt(0),
  };
}

function detteToTransaction(d: Dette): Transaction {
  return {
    id: d.id,
    clientId: d.clientId,
    type: "dette",
    amount: d.montant,
    product: d.description,
    dueDate: d.date,
    photoBase64: d.photoUrl || undefined,
    createdAt: Number(d.createdAt),
  };
}

function paiementToTransaction(p: Paiement): Transaction {
  return {
    id: p.id,
    clientId: p.clientId,
    type: "paiement",
    amount: p.montant,
    product: "Paiement enregistré",
    dueDate: p.date,
    createdAt: Number(p.createdAt),
  };
}

function rappelToPersonalReminder(r: Rappel): PersonalReminder {
  const parts = r.dateHeure.split("T");
  return {
    id: r.id,
    title: r.message,
    clientId: r.clientId || undefined,
    note: "",
    reminderDate: parts[0] || "",
    reminderTime: parts[1] || "08:00",
    fired: !r.active,
    createdAt: Number(r.createdAt),
  };
}

function genId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function formatFCFA(amount: number) {
  return `${new Intl.NumberFormat("fr-FR").format(amount)} FCFA`;
}

function handleMutationError(error: unknown) {
  const msg =
    error instanceof Error && error.message === "LIMIT_REACHED"
      ? "Limite de 10 clients atteinte. Passez en Premium pour continuer."
      : "Erreur de connexion, réessayez.";
  toast.error(msg);
}

export function useBackendStore(storeId: string) {
  const queryClient = useQueryClient();

  // --- KEY FIX: 3 parallel queries instead of N+1 ---
  const storeDataQuery = useQuery({
    queryKey: ["store-data", storeId],
    queryFn: async () => {
      if (!storeId) return { clients: [], dettes: [], paiements: [] };
      // Fetch clients, dettes, and ALL paiements for the store in 3 parallel calls
      const [backendClients, dettes, paiements] = await Promise.all([
        sequeApi.getClients(storeId),
        sequeApi.getDettesParStore(storeId),
        sequeApi.getPaiementsParStore(storeId),
      ]);
      return { clients: backendClients, dettes, paiements };
    },
    enabled: !!storeId,
    staleTime: 30_000,
    retry: 2,
  });

  const rappelsQuery = useQuery({
    queryKey: ["rappels", storeId],
    queryFn: () =>
      storeId ? sequeApi.getRappels(storeId) : Promise.resolve([]),
    enabled: !!storeId,
    staleTime: 30_000,
    retry: 2,
  });

  const rawClients = storeDataQuery.data?.clients ?? [];
  const rawDettes = storeDataQuery.data?.dettes ?? [];
  const rawPaiements = storeDataQuery.data?.paiements ?? [];
  const rawRappels = rappelsQuery.data ?? [];

  const clients = useMemo(
    () => rawClients.map(backendClientToUI),
    [rawClients],
  );
  const transactions: Transaction[] = useMemo(
    () => [
      ...rawDettes.map(detteToTransaction),
      ...rawPaiements.map(paiementToTransaction),
    ],
    [rawDettes, rawPaiements],
  );
  const personalReminders = useMemo(
    () => rawRappels.map(rappelToPersonalReminder),
    [rawRappels],
  );

  const invalidateStore = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["store-data", storeId] });
  }, [queryClient, storeId]);

  const invalidateRappels = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["rappels", storeId] });
  }, [queryClient, storeId]);

  const invalidateNotifs = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["store-notifs", storeId] });
  }, [queryClient, storeId]);

  const addClientMutation = useMutation({
    mutationFn: async (data: Omit<Client, "id" | "createdAt">) => {
      const id = genId();
      const backendClient = uiClientToBackend(data, storeId, id);
      const result = await sequeApi.addClient(backendClient);
      if ("limitReached" in result) throw new Error("LIMIT_REACHED");
    },
    onSuccess: () => invalidateStore(),
    onError: handleMutationError,
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: { id: string; updates: Partial<Client> }) => {
      const existing = rawClients.find((c) => c.id === id);
      if (!existing) return;
      const merged: BackendClient = {
        ...existing,
        nom: updates.name ?? existing.nom,
        telephone: updates.phone ?? existing.telephone,
        quartier: updates.localisation ?? updates.quartier ?? existing.quartier,
      };
      await sequeApi.updateClient(merged);
    },
    onSuccess: () => invalidateStore(),
    onError: handleMutationError,
  });

  const deleteClientMutation = useMutation({
    mutationFn: (id: string) => sequeApi.deleteClient(id),
    onSuccess: () => invalidateStore(),
    onError: handleMutationError,
  });

  const addTransactionMutation = useMutation({
    mutationFn: async (tx: Omit<Transaction, "id" | "createdAt">) => {
      const id = genId();
      const today = new Date().toISOString().split("T")[0];
      if (tx.type === "dette") {
        const dette: Dette = {
          id,
          clientId: tx.clientId,
          storeId,
          montant: tx.amount,
          description: tx.product,
          date: tx.dueDate || today,
          photoUrl: tx.photoBase64 || "",
          createdAt: BigInt(0),
        };
        await sequeApi.addDette(dette);
      } else {
        const paiement: Paiement = {
          id,
          clientId: tx.clientId,
          storeId,
          montant: tx.amount,
          date: tx.dueDate || today,
          createdAt: BigInt(0),
        };
        await sequeApi.addPaiement(paiement);

        // Alert marchand if paiement > 10 000 FCFA
        if (tx.amount > 10000) {
          const clientName =
            rawClients.find((c) => c.id === tx.clientId)?.nom ||
            "Client inconnu";
          const notifMsg = `💰 Nouveau paiement reçu : ${formatFCFA(tx.amount)} de la part de ${clientName}.`;
          const notif = {
            id: genId(),
            storeId,
            notifType: "payment_alert",
            message: notifMsg,
            clientNom: clientName,
            montant: tx.amount,
            read: false,
            createdAt: BigInt(0),
          };
          // Wrapped in try-catch so it never crashes the main mutation
          try {
            await sequeApi.addStoreNotif(notif);
          } catch {
            /* ignore notification errors */
          }

          // Show browser notification immediately
          if (
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            try {
              new Notification("SÉQUÉ-APP — Paiement reçu", {
                body: notifMsg,
                icon: "/favicon.ico",
              });
            } catch {
              /* notifications non supportées */
            }
          }
        }
      }
    },
    onSuccess: () => {
      invalidateStore();
      invalidateNotifs();
    },
    onError: handleMutationError,
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      const isDette = rawDettes.some((d) => d.id === id);
      if (isDette) {
        await sequeApi.deleteDette(id);
      } else {
        await sequeApi.deletePaiement(id);
      }
    },
    onSuccess: () => invalidateStore(),
    onError: handleMutationError,
  });

  const addRappelMutation = useMutation({
    mutationFn: async (
      reminder: Omit<PersonalReminder, "id" | "fired" | "createdAt">,
    ) => {
      const rappel: Rappel = {
        id: genId(),
        storeId,
        message: reminder.title,
        dateHeure: `${reminder.reminderDate}T${reminder.reminderTime}`,
        clientId: reminder.clientId || "",
        active: true,
        createdAt: BigInt(0),
      };
      await sequeApi.addRappel(rappel);
    },
    onSuccess: () => invalidateRappels(),
    onError: handleMutationError,
  });

  const deleteRappelMutation = useMutation({
    mutationFn: (id: string) => sequeApi.deleteRappel(id),
    onSuccess: () => invalidateRappels(),
    onError: handleMutationError,
  });

  const getClientBalance = useCallback(
    (clientId: string) => {
      const dettes = rawDettes
        .filter((d) => d.clientId === clientId)
        .reduce((s, d) => s + d.montant, 0);
      const paiements = rawPaiements
        .filter((p) => p.clientId === clientId)
        .reduce((s, p) => s + p.montant, 0);
      return dettes - paiements;
    },
    [rawDettes, rawPaiements],
  );

  const getTotalReceivable = useCallback(() => {
    return clients.reduce((sum, c) => {
      const bal = getClientBalance(c.id);
      return bal > 0 ? sum + bal : sum;
    }, 0);
  }, [clients, getClientBalance]);

  const markReminderFired = useCallback(
    (id: string) => {
      sequeApi.deleteRappel(id).catch(console.error);
      invalidateRappels();
    },
    [invalidateRappels],
  );

  return {
    clients,
    transactions,
    personalReminders,
    isLoading: storeDataQuery.isLoading,
    isError: storeDataQuery.isError,
    addClient: (data: Omit<Client, "id" | "createdAt">) =>
      addClientMutation.mutateAsync(data),
    updateClient: (id: string, updates: Partial<Client>) =>
      updateClientMutation.mutateAsync({ id, updates }),
    deleteClient: (id: string) => deleteClientMutation.mutateAsync(id),
    addTransaction: (tx: Omit<Transaction, "id" | "createdAt">) =>
      addTransactionMutation.mutateAsync(tx),
    deleteTransaction: (id: string) =>
      deleteTransactionMutation.mutateAsync(id),
    getClientBalance,
    getTotalReceivable,
    addPersonalReminder: (
      r: Omit<PersonalReminder, "id" | "fired" | "createdAt">,
    ) => addRappelMutation.mutateAsync(r),
    deletePersonalReminder: (id: string) =>
      deleteRappelMutation.mutateAsync(id),
    markReminderFired,
  };
}

export type BackendStore = ReturnType<typeof useBackendStore>;
