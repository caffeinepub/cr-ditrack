import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpDown, CreditCard, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { sequeApi } from "../sequeApi";
import type { Boutique } from "../sequeApi";

interface Props {
  boutiques: Boutique[];
  onBack: () => void;
}

function formatFCFA(n: number) {
  return `${new Intl.NumberFormat("fr-FR").format(n)} FCFA`;
}

export default function AdminTransactionsPage({ boutiques, onBack }: Props) {
  const [filterStore, setFilterStore] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const txQuery = useQuery({
    queryKey: ["admin-transactions"],
    queryFn: () => sequeApi.getAllTransactionsAdmin(),
    staleTime: 30_000,
  });

  const allTx = txQuery.data ?? [];

  const filtered = useMemo(() => {
    let txs =
      filterStore === "all"
        ? allTx
        : allTx.filter((t) => t.dette.storeId === filterStore);
    if (sortOrder === "asc") txs = [...txs].reverse();
    return txs;
  }, [allTx, filterStore, sortOrder]);

  const totalDettes = allTx.reduce((sum, t) => sum + t.dette.montant, 0);

  return (
    <div
      className="min-h-screen max-w-[480px] mx-auto px-4 pb-10"
      style={{ background: "oklch(var(--forest))" }}
      data-ocid="transactions.page"
    >
      <header className="flex items-center gap-3 py-5">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
          style={{ background: "oklch(var(--forest-card))" }}
          data-ocid="transactions.close_button"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-foreground">
            Transactions Mondiales
          </h1>
          <p className="text-muted-foreground text-xs">
            {allTx.length} transaction{allTx.length !== 1 ? "s" : ""} • Réseau
            SÉQUÉ-APP
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div
          className="rounded-2xl p-4"
          style={{ background: "oklch(var(--forest-card))" }}
        >
          <TrendingUp
            className="w-4 h-4 mb-1"
            style={{ color: "oklch(var(--orange))" }}
          />
          <p
            className="text-lg font-bold"
            style={{ color: "oklch(var(--orange))" }}
          >
            {formatFCFA(totalDettes)}
          </p>
          <p className="text-muted-foreground text-xs">Total Dettes</p>
        </div>
        <div
          className="rounded-2xl p-4"
          style={{ background: "oklch(var(--forest-card))" }}
        >
          <CreditCard
            className="w-4 h-4 mb-1"
            style={{ color: "oklch(var(--gold))" }}
          />
          <p
            className="text-lg font-bold"
            style={{ color: "oklch(var(--gold))" }}
          >
            {allTx.length}
          </p>
          <p className="text-muted-foreground text-xs">Transactions</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <select
          value={filterStore}
          onChange={(e) => setFilterStore(e.target.value)}
          className="flex-1 rounded-xl px-3 py-2 text-sm font-semibold outline-none"
          style={{
            background: "oklch(var(--forest-card))",
            color: "oklch(var(--foreground))",
            border: "1px solid oklch(var(--border))",
          }}
          data-ocid="transactions.select"
        >
          <option value="all">Toutes les boutiques</option>
          {boutiques.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nom}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setSortOrder((s) => (s === "desc" ? "asc" : "desc"))}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
          style={{
            background: "oklch(var(--forest-card))",
            color: "oklch(var(--muted-foreground))",
          }}
          data-ocid="transactions.toggle"
        >
          <ArrowUpDown className="w-4 h-4" />
          {sortOrder === "desc" ? "Plus récent" : "Plus ancien"}
        </button>
      </div>

      {txQuery.isLoading ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="transactions.loading_state"
        >
          Chargement...
        </div>
      ) : (
        <div className="space-y-2" data-ocid="transactions.list">
          {filtered.length === 0 && (
            <div
              className="text-center py-14 text-muted-foreground text-sm"
              data-ocid="transactions.empty_state"
            >
              Aucune transaction
            </div>
          )}
          {filtered.map((tx, i) => (
            <motion.div
              key={tx.dette.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl p-4 flex items-start gap-3"
              style={{ background: "oklch(var(--forest-card))" }}
              data-ocid={`transactions.item.${i + 1}`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "oklch(var(--orange) / 0.15)" }}
              >
                <TrendingUp
                  className="w-4 h-4"
                  style={{ color: "oklch(var(--orange))" }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-foreground text-sm font-semibold truncate">
                      {tx.clientNom}
                    </p>
                    <p className="text-muted-foreground text-xs truncate">
                      {tx.dette.description}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {tx.boutiqueNom}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p
                      className="text-sm font-bold"
                      style={{ color: "oklch(var(--orange))" }}
                    >
                      {formatFCFA(tx.dette.montant)}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {tx.dette.date}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
