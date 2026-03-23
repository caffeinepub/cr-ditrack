import { Badge } from "@/components/ui/badge";
import {
  AlarmClock,
  ArrowLeft,
  Calendar,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { useStore } from "../hooks/useStore";
import AddTransactionModal from "./AddTransactionModal";

type Store = ReturnType<typeof useStore>;

interface Props {
  clientId: string;
  store: Store;
  onBack: () => void;
}

function formatFCFA(amount: number) {
  return `${new Intl.NumberFormat("fr-FR").format(amount)} FCFA`;
}

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ClientDetailPage({ clientId, store, onBack }: Props) {
  const [showAddTx, setShowAddTx] = useState(false);

  const client = store.clients.find((c) => c.id === clientId);
  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Client introuvable</p>
      </div>
    );
  }

  const balance = store.getClientBalance(clientId);
  const clientTxs = store.transactions
    .filter((t) => t.clientId === clientId)
    .sort((a, b) => b.createdAt - a.createdAt);

  const latestDette = clientTxs.find((t) => t.type === "dette" && t.dueDate);

  const sendReminder = () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const msg = `Bonjour ${client.name}, il est ${currentTime}, votre solde impayé est de ${formatFCFA(balance)}. Merci de régulariser avant le ${latestDette ? formatDate(latestDette.dueDate) : "prochainement"}. — CrédiTrack`;
    const encodedMsg = encodeURIComponent(msg);
    const phone = client.phone.replace(/\s+/g, "");
    const smsUrl = `sms:${phone}?body=${encodedMsg}`;

    // Use hidden anchor to avoid navigating away, allowing multiple sends
    const a = document.createElement("a");
    a.href = smsUrl;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Rappel SMS ouvert !");
  };

  const handleDelete = (txId: string) => {
    store.deleteTransaction(txId);
    toast.success("Transaction supprimée");
  };

  return (
    <div
      className="min-h-screen max-w-[480px] mx-auto px-4 pb-8"
      data-ocid="client_detail.page"
    >
      {/* Header */}
      <header className="flex items-center gap-3 py-5">
        <button
          type="button"
          data-ocid="client_detail.back_button"
          onClick={onBack}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95"
          style={{ background: "oklch(var(--navy-card))" }}
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground truncate">
          {client.name}
        </h1>
      </header>

      {/* Client info card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 mb-4 shadow-card"
        style={{ background: "oklch(var(--navy-card))" }}
        data-ocid="client_detail.info_card"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-foreground font-semibold">
                {client.quartier}
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              {client.localisation}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <a
                href={`tel:${client.phone}`}
                className="text-muted-foreground text-sm"
              >
                {client.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Balance */}
        <div
          className="rounded-xl p-4 text-center"
          style={{ background: "oklch(var(--navy-light))" }}
        >
          <p className="text-muted-foreground text-sm mb-1">Solde actuel</p>
          <p
            className="text-3xl font-bold"
            style={{
              color:
                balance > 0 ? "oklch(var(--orange))" : "oklch(var(--emerald))",
            }}
            data-ocid="client_detail.balance"
          >
            {formatFCFA(balance)}
          </p>
          {balance <= 0 && (
            <p
              className="text-emerald text-sm mt-1"
              style={{ color: "oklch(var(--emerald))" }}
            >
              ✓ Compte soldé
            </p>
          )}
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        {balance > 0 && (
          <button
            type="button"
            data-ocid="client_detail.send_reminder_button"
            onClick={sendReminder}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm text-white transition-all active:scale-95"
            style={{ background: "oklch(var(--orange))" }}
          >
            <MessageSquare className="w-4 h-4" />
            Envoyer Rappel SMS
          </button>
        )}
        <button
          type="button"
          data-ocid="client_detail.add_transaction_button"
          onClick={() => setShowAddTx(true)}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm transition-all active:scale-95"
          style={{
            background: "oklch(var(--emerald))",
            color: "oklch(var(--navy))",
          }}
        >
          <Plus className="w-4 h-4" />
          Ajouter Transaction
        </button>
      </div>

      {/* Transaction history */}
      <h2 className="text-foreground font-bold text-base mb-3">Historique</h2>
      <div className="space-y-2" data-ocid="client_detail.transaction_list">
        {clientTxs.length === 0 && (
          <div
            className="text-center py-8 text-muted-foreground text-sm"
            data-ocid="client_detail.empty_state"
          >
            Aucune transaction
          </div>
        )}
        {clientTxs.map((tx, i) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-xl p-4 flex items-center gap-3"
            style={{ background: "oklch(var(--navy-card))" }}
            data-ocid={`client_detail.transaction.item.${i + 1}`}
          >
            <Badge
              className="flex-shrink-0 rounded-lg px-2 py-1 text-xs font-bold border-0"
              style={{
                background:
                  tx.type === "dette"
                    ? "oklch(var(--orange) / 0.2)"
                    : "oklch(var(--emerald) / 0.2)",
                color:
                  tx.type === "dette"
                    ? "oklch(var(--orange))"
                    : "oklch(var(--emerald))",
              }}
            >
              {tx.type === "dette" ? "Dette" : "Paiement"}
            </Badge>
            <div className="flex-1 min-w-0">
              <p className="text-foreground text-sm font-semibold truncate">
                {tx.product}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="text-sm font-bold"
                  style={{
                    color:
                      tx.type === "dette"
                        ? "oklch(var(--orange))"
                        : "oklch(var(--emerald))",
                  }}
                >
                  {tx.type === "dette" ? "+" : "-"}
                  {formatFCFA(tx.amount)}
                </span>
                {tx.dueDate && (
                  <span className="text-muted-foreground text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(tx.dueDate)}
                  </span>
                )}
              </div>
              {tx.reminderTime && (
                <div className="flex items-center gap-1 mt-1">
                  <AlarmClock
                    className="w-3 h-3"
                    style={{ color: "oklch(var(--orange))" }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: "oklch(var(--orange))" }}
                  >
                    Rappel auto: {tx.reminderTime}
                  </span>
                </div>
              )}
              <p className="text-muted-foreground text-xs mt-0.5">
                {formatDate(new Date(tx.createdAt).toISOString().split("T")[0])}
              </p>
            </div>
            <button
              type="button"
              data-ocid={`client_detail.delete_button.${i + 1}`}
              onClick={() => handleDelete(tx.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
              style={{ background: "oklch(var(--destructive) / 0.15)" }}
            >
              <Trash2
                className="w-4 h-4"
                style={{ color: "oklch(var(--destructive))" }}
              />
            </button>
          </motion.div>
        ))}
      </div>

      <AddTransactionModal
        open={showAddTx}
        onClose={() => setShowAddTx(false)}
        clients={store.clients}
        getClientBalance={store.getClientBalance}
        onAdd={store.addTransaction}
        preselectedClientId={clientId}
      />
    </div>
  );
}
