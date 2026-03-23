import { ArrowLeft, TrendingDown, TrendingUp, Users } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import type { useStore } from "../hooks/useStore";

type Store = ReturnType<typeof useStore>;

interface Props {
  store: Store;
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
  }, [store]);

  const monthlySummary = useMemo(() => {
    const map: Record<string, { debt: number; payment: number }> = {};
    for (const tx of store.transactions) {
      const month = new Date(tx.createdAt).toLocaleDateString("fr-FR", {
        month: "short",
        year: "numeric",
      });
      if (!map[month]) map[month] = { debt: 0, payment: 0 };
      if (tx.type === "dette") map[month].debt += tx.amount;
      else map[month].payment += tx.amount;
    }
    return Object.entries(map)
      .sort(([a], [b]) => {
        const da = new Date(`1 ${a}`);
        const db = new Date(`1 ${b}`);
        return db.getTime() - da.getTime();
      })
      .slice(0, 6);
  }, [store.transactions]);

  return (
    <div
      className="min-h-screen max-w-[480px] mx-auto px-4 pb-8"
      data-ocid="statistics.page"
    >
      <header className="flex items-center gap-3 py-5">
        <button
          type="button"
          data-ocid="statistics.back_button"
          onClick={onBack}
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "oklch(var(--navy-card))" }}
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Statistiques</h1>
      </header>

      <div className="space-y-4">
        {/* Overview cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5"
          style={{ background: "oklch(var(--navy-card))" }}
          data-ocid="statistics.total_card"
        >
          <p className="text-muted-foreground text-sm">Total à percevoir</p>
          <p
            className="text-3xl font-bold mt-1"
            style={{ color: "oklch(var(--emerald))" }}
          >
            {formatFCFA(total)}
          </p>
        </motion.div>

        <div className="grid grid-cols-3 gap-3">
          <div
            className="rounded-2xl p-4"
            style={{ background: "oklch(var(--navy-card))" }}
          >
            <Users className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {store.clients.length}
            </p>
            <p className="text-muted-foreground text-xs">Clients</p>
          </div>
          <div
            className="rounded-2xl p-4"
            style={{ background: "oklch(var(--navy-card))" }}
          >
            <TrendingDown
              className="w-5 h-5 mb-2"
              style={{ color: "oklch(var(--orange))" }}
            />
            <p
              className="text-2xl font-bold"
              style={{ color: "oklch(var(--orange))" }}
            >
              {clientsWithDebt}
            </p>
            <p className="text-muted-foreground text-xs">En dette</p>
          </div>
          <div
            className="rounded-2xl p-4"
            style={{ background: "oklch(var(--navy-card))" }}
          >
            <TrendingUp
              className="w-5 h-5 mb-2"
              style={{ color: "oklch(var(--emerald))" }}
            />
            <p
              className="text-2xl font-bold"
              style={{ color: "oklch(var(--emerald))" }}
            >
              {clientsCleared}
            </p>
            <p className="text-muted-foreground text-xs">Soldés</p>
          </div>
        </div>

        {/* Top 5 debtors */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "oklch(var(--navy-card))" }}
          data-ocid="statistics.top5_card"
        >
          <h2 className="text-foreground font-bold mb-3">Top 5 Débiteurs</h2>
          <div className="space-y-3">
            {top5.length === 0 && (
              <p className="text-muted-foreground text-sm">
                Aucune dette en cours
              </p>
            )}
            {top5.map((item, i) => (
              <div
                key={item.client.id}
                className="flex items-center gap-3"
                data-ocid={`statistics.top5.item.${i + 1}`}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={
                    i === 0
                      ? { background: "oklch(var(--orange))", color: "white" }
                      : {
                          background: "oklch(var(--navy-light))",
                          color: "oklch(var(--muted-foreground))",
                        }
                  }
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm font-semibold truncate">
                    {item.client.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {item.client.quartier}
                  </p>
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: "oklch(var(--orange))" }}
                >
                  {formatFCFA(item.balance)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly summary */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "oklch(var(--navy-card))" }}
          data-ocid="statistics.monthly_card"
        >
          <h2 className="text-foreground font-bold mb-3">Résumé mensuel</h2>
          <div className="space-y-3">
            {monthlySummary.length === 0 && (
              <p className="text-muted-foreground text-sm">Aucune donnée</p>
            )}
            {monthlySummary.map(([month, data]) => (
              <div key={month}>
                <p className="text-muted-foreground text-xs mb-1 capitalize">
                  {month}
                </p>
                <div className="flex gap-2">
                  <div
                    className="flex-1 rounded-lg px-3 py-2"
                    style={{ background: "oklch(var(--orange) / 0.15)" }}
                  >
                    <p
                      className="text-xs"
                      style={{ color: "oklch(var(--orange))" }}
                    >
                      Dettes
                    </p>
                    <p
                      className="text-sm font-bold"
                      style={{ color: "oklch(var(--orange))" }}
                    >
                      {formatFCFA(data.debt)}
                    </p>
                  </div>
                  <div
                    className="flex-1 rounded-lg px-3 py-2"
                    style={{ background: "oklch(var(--emerald) / 0.15)" }}
                  >
                    <p
                      className="text-xs"
                      style={{ color: "oklch(var(--emerald))" }}
                    >
                      Paiements
                    </p>
                    <p
                      className="text-sm font-bold"
                      style={{ color: "oklch(var(--emerald))" }}
                    >
                      {formatFCFA(data.payment)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
