import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Transaction } from "../backend";
import { Status } from "../backend";
import { useActor } from "./useActor";

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface ClientSummary {
  clientName: string;
  totalOwed: number;
  lastTransaction: string;
  transactionCount: number;
}

export function useAllTransactions() {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTotalBalance() {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["totalBalance"],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getTotalBalance();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useClientTransactions(clientName: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["transactions", "client", clientName],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactionsByClientName(clientName);
    },
    enabled: !!actor && !isFetching && !!clientName,
  });
}

export function useClientSummaries(): {
  data: ClientSummary[];
  isLoading: boolean;
} {
  const { data: transactions = [], isLoading } = useAllTransactions();
  const summaryMap = new Map<string, ClientSummary>();

  for (const tx of transactions) {
    if (tx.status === Status.paid) continue;
    const existing = summaryMap.get(tx.clientName);
    if (existing) {
      existing.totalOwed += tx.amount;
      if (tx.transactionDate > existing.lastTransaction) {
        existing.lastTransaction = tx.transactionDate;
      }
      existing.transactionCount += 1;
    } else {
      summaryMap.set(tx.clientName, {
        clientName: tx.clientName,
        totalOwed: tx.amount,
        lastTransaction: tx.transactionDate,
        transactionCount: 1,
      });
    }
  }

  return { data: Array.from(summaryMap.values()), isLoading };
}

export function useAddTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      clientName: string;
      amount: number;
      product: string;
      transactionDate: string;
      reminderDate: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const transaction: Transaction = {
        id: generateId(),
        clientName: params.clientName,
        amount: params.amount,
        product: params.product,
        transactionDate: params.transactionDate,
        reminderDate: params.reminderDate,
        status: Status.pending,
        createdAt: BigInt(Date.now()) * BigInt(1_000_000),
      };
      await actor.addTransaction(transaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["totalBalance"] });
    },
  });
}

export function useMarkAsPaid() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.markTransactionAsPaid(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["totalBalance"] });
    },
  });
}

export function useDeleteTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteTransaction(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["totalBalance"] });
    },
  });
}
