import { ArrowLeft, TrendingDown, TrendingUp, Users } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import type { BackendStore } from "../hooks/useBackendStore";

interface Props {
  store: BackendStore;
  onBack: () => void;
}

function formatFCFA(amount: number) {
  return `${new Intl.NumberFormat("fr-FR").format(amount)} FCFA`;
}

export default function StatisticsPage({ store, onBack }: Props) {
  const total = store.getTotalReceivable();

  const clientsWithDebt = store.clients.filter(
    (c) => store.getClientBalance(c.id) > 0,
  ).length;
  const clientsCleared = store.clients.length - clientsWithDebt;

  const top5 = useMemo(() => {
    return store.clients
      .map((c) => ({ client: c, balance: store.getClientBalance(c.id) }))
      .filter((x) => x.balance > 0)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 5);
  }, [store.clients, store.getClientBalance]);

  const totalDettes = store.transactions
    .filter((t) => t.type === "dette")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalPaiements = store.transactions
    .filter((t) => t.type === "paiement")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div
      className="min-h-screen max-w-[480px] mx-auto px-4 pb-8"
      style={{ background: "oklch(var(--forest))" }}
      data-ocid="statistics.page"
    >
      <header className="flex items-center gap-3 py-5">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95"
          style={{ background: "oklch(var(--forest-card))" }}
          data-ocid="statistics.back_button"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Statistiques</h1>
      </header>

      <div className="space-y-4">
        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5"
          style={{ background: "oklch(var(--forest-card))" }}
        >
          <p className="text-muted-foreground text-sm mb-3">Résumé Global</p>
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-xl p-3"
              style={{ background: "oklch(var(--orange) / 0.12)" }}
            >
              <TrendingUp
                className="w-4 h-4 mb-1"
                style={{ color: "oklch(var(--orange))" }}
              />
              <p
                className="text-sm font-bold"
                style={{ color: "oklch(var(--orange))" }}
              >
                {formatFCFA(totalDettes)}
              </p>
              <p className="text-muted-foreground text-xs">Total Dettes</p>
            </div>
            <div
              className="rounded-xl p-3"
              style={{ background: "oklch(var(--emerald) / 0.12)" }}
            >
              <TrendingDown
                className="w-4 h-4 mb-1"
                style={{ color: "oklch(var(--emerald))" }}
              />
              <p
                className="text-sm font-bold"
                style={{ color: "oklch(var(--emerald))" }}
              >
                {formatFCFA(totalPaiements)}
              </p>
              <p className="text-muted-foreground text-xs">Total Paiements</p>
            </div>
          </div>
          <div
            className="mt-3 rounded-xl p-4 text-center"
            style={{ background: "oklch(var(--gold) / 0.1)" }}
          >
            <p className="text-muted-foreground text-xs mb-1">Argent Dehors</p>
            <p
              className="text-2xl font-bold"
              style={{ color: "oklch(var(--gold))" }}
            >
              {formatFCFA(total)}
            </p>
          </div>
        </motion.div>

        {/* Clients */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5"
          style={{ background: "oklch(var(--forest-card))" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Users
              className="w-4 h-4"
              style={{ color: "oklch(var(--emerald))" }}
            />
            <p className="text-sm font-bold text-foreground">Clients</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-xl p-3 text-center"
              style={{ background: "oklch(var(--orange) / 0.12)" }}
            >
              <p
                className="text-xl font-bold"
                style={{ color: "oklch(var(--orange))" }}
              >
                {clientsWithDebt}
              </p>
              <p className="text-muted-foreground text-xs">Avec dette</p>
            </div>
            <div
              className="rounded-xl p-3 text-center"
              style={{ background: "oklch(var(--emerald) / 0.12)" }}
            >
              <p
                className="text-xl font-bold"
                style={{ color: "oklch(var(--emerald))" }}
              >
                {clientsCleared}
              </p>
              <p className="text-muted-foreground text-xs">Soldés</p>
            </div>
          </div>
        </motion.div>

        {/* Top 5 */}
        {top5.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl p-5"
            style={{ background: "oklch(var(--forest-card))" }}
          >
            <p className="text-sm font-bold text-foreground mb-3">
              Top 5 Clients (solde le plus élevé)
            </p>
            <div className="space-y-2">
              {top5.map(({ client, balance }, i) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between py-2"
                  data-ocid={`statistics.item.${i + 1}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background:
                          i === 0
                            ? "oklch(var(--gold))"
                            : "oklch(var(--forest-light))",
                        color:
                          i === 0
                            ? "oklch(var(--forest))"
                            : "oklch(var(--muted-foreground))",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-foreground text-sm font-semibold">
                      {client.name}
                    </span>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{ color: "oklch(var(--orange))" }}
                  >
                    {formatFCFA(balance)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
