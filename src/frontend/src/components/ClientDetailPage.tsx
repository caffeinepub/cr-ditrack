import { Badge } from "@/components/ui/badge";
import {
  AlarmClock,
  ArrowLeft,
  Calendar,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Role } from "../hooks/useAuth";
import type { useStore } from "../hooks/useStore";
import AddTransactionModal from "./AddTransactionModal";

type Store = ReturnType<typeof useStore>;

interface Props {
  clientId: string;
  store: Store;
  role: Role;
  onBack: () => void;
  shopName: string;
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

type TabType = "tout" | "dettes" | "avances";

export default function ClientDetailPage({
  clientId,
  store,
  role,
  onBack,
  shopName,
}: Props) {
  const [showAddTx, setShowAddTx] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("tout");

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

  const totalDettes = clientTxs
    .filter((t) => t.type === "dette")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalAvances = clientTxs
    .filter((t) => t.type === "paiement")
    .reduce((sum, t) => sum + t.amount, 0);
  const resteAPayer = totalDettes - totalAvances;

  const filteredTxs =
    activeTab === "tout"
      ? clientTxs
      : activeTab === "dettes"
        ? clientTxs.filter((t) => t.type === "dette")
        : clientTxs.filter((t) => t.type === "paiement");

  const buildSmsMessage = () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    return `Bonjour ${client.name}, il est ${currentTime}, votre solde impayé est de ${formatFCFA(balance)}. Merci de régulariser avant le ${latestDette ? formatDate(latestDette.dueDate) : "prochainement"}. — CrédiTrack`;
  };

  const buildWhatsAppMessage = () => {
    return `Bonjour ${client.name}, votre solde actuel chez ${shopName} est de ${formatFCFA(balance)} FCFA. Merci de passer régulariser dès que possible. Bonne journée !`;
  };

  const sendReminder = () => {
    const msg = buildSmsMessage();
    const encodedMsg = encodeURIComponent(msg);
    const phone = client.phone.replace(/\s+/g, "");
    const smsUrl = `sms:${phone}?body=${encodedMsg}`;
    const a = document.createElement("a");
    a.href = smsUrl;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Rappel SMS ouvert !");
  };

  const sendWhatsApp = () => {
    const msg = buildWhatsAppMessage();
    const encodedMsg = encodeURIComponent(msg);
    const phone = client.phone.replace(/\s+/g, "");
    const waUrl = `https://wa.me/${phone}?text=${encodedMsg}`;
    const a = document.createElement("a");
    a.href = waUrl;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("WhatsApp ouvert !");
  };

  const handleDelete = (txId: string) => {
    store.deleteTransaction(txId);
    toast.success("Transaction supprimée");
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: "tout", label: "Tout" },
    { key: "dettes", label: "Dettes" },
    { key: "avances", label: "Avances" },
  ];

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

        {/* Balance summary: 3 cards */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {/* Total dettes */}
          <div
            className="rounded-xl p-3 flex flex-col items-center gap-1"
            style={{ background: "oklch(var(--orange) / 0.12)" }}
          >
            <TrendingUp
              className="w-4 h-4"
              style={{ color: "oklch(var(--orange))" }}
            />
            <p
              className="text-xs font-semibold text-center leading-tight"
              style={{ color: "oklch(var(--orange))" }}
            >
              Dettes
            </p>
            <p
              className="text-xs font-bold text-center leading-tight"
              style={{ color: "oklch(var(--orange))" }}
            >
              {formatFCFA(totalDettes)}
            </p>
          </div>

          {/* Total avances */}
          <div
            className="rounded-xl p-3 flex flex-col items-center gap-1"
            style={{ background: "oklch(var(--emerald) / 0.12)" }}
          >
            <TrendingDown
              className="w-4 h-4"
              style={{ color: "oklch(var(--emerald))" }}
            />
            <p
              className="text-xs font-semibold text-center leading-tight"
              style={{ color: "oklch(var(--emerald))" }}
            >
              Avances
            </p>
            <p
              className="text-xs font-bold text-center leading-tight"
              style={{ color: "oklch(var(--emerald))" }}
            >
              {formatFCFA(totalAvances)}
            </p>
          </div>

          {/* Reste à payer */}
          <div
            className="rounded-xl p-3 flex flex-col items-center gap-1"
            style={{
              background:
                resteAPayer <= 0
                  ? "oklch(var(--emerald) / 0.15)"
                  : "oklch(var(--navy-light))",
            }}
          >
            <Wallet
              className="w-4 h-4"
              style={{
                color:
                  resteAPayer <= 0
                    ? "oklch(var(--emerald))"
                    : "oklch(var(--orange))",
              }}
            />
            <p
              className="text-xs font-semibold text-center leading-tight"
              style={{
                color:
                  resteAPayer <= 0
                    ? "oklch(var(--emerald))"
                    : "oklch(var(--orange))",
              }}
            >
              Reste
            </p>
            <p
              className="text-xs font-bold text-center leading-tight"
              style={{
                color:
                  resteAPayer <= 0
                    ? "oklch(var(--emerald))"
                    : "oklch(var(--orange))",
              }}
            >
              {resteAPayer <= 0 ? "0 FCFA" : formatFCFA(resteAPayer)}
            </p>
          </div>
        </div>

        {/* Main balance display */}
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
            {formatFCFA(Math.max(0, resteAPayer))}
          </p>
          {resteAPayer <= 0 && (
            <span
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mt-2"
              style={{
                background: "oklch(var(--emerald))",
                color: "oklch(var(--navy))",
              }}
            >
              ✓ SOLDÉ
            </span>
          )}
          {totalAvances > 0 && resteAPayer < 0 && (
            <p
              className="text-xs mt-1 font-semibold"
              style={{ color: "oklch(var(--emerald))" }}
            >
              Crédit en avance : {formatFCFA(Math.abs(resteAPayer))}
            </p>
          )}
          {/* Calcul affiché */}
          {(totalDettes > 0 || totalAvances > 0) && (
            <p className="text-xs text-muted-foreground mt-2">
              {formatFCFA(totalDettes)} − {formatFCFA(totalAvances)} ={" "}
              <strong
                style={{
                  color:
                    resteAPayer <= 0
                      ? "oklch(var(--emerald))"
                      : "oklch(var(--orange))",
                }}
              >
                {resteAPayer <= 0 ? "0 FCFA" : formatFCFA(resteAPayer)}
              </strong>
            </p>
          )}
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-col gap-2 mb-6">
        {balance > 0 && (
          <div className="flex gap-2">
            <button
              type="button"
              data-ocid="client_detail.send_reminder_button"
              onClick={sendReminder}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm text-white transition-all active:scale-95"
              style={{ background: "oklch(var(--orange))" }}
            >
              <MessageSquare className="w-4 h-4" />
              Rappel SMS
            </button>
            <button
              type="button"
              data-ocid="client_detail.send_whatsapp_button"
              onClick={sendWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm text-white transition-all active:scale-95"
              style={{ background: "#25D366" }}
            >
              <MessageCircle className="w-4 h-4" />
              Rappel WhatsApp
            </button>
          </div>
        )}
        <button
          type="button"
          data-ocid="client_detail.add_transaction_button"
          onClick={() => setShowAddTx(true)}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm transition-all active:scale-95"
          style={{
            background: "oklch(var(--emerald))",
            color: "oklch(var(--navy))",
          }}
        >
          <Plus className="w-4 h-4" />
          Ajouter Transaction
        </button>
      </div>

      {/* Transaction history with tabs */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-foreground font-bold text-base">Historique</h2>
        <div
          className="flex rounded-xl overflow-hidden border"
          style={{ borderColor: "oklch(var(--navy-card))" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className="px-3 py-1.5 text-xs font-semibold transition-all"
              style={{
                background:
                  activeTab === tab.key
                    ? tab.key === "dettes"
                      ? "oklch(var(--orange))"
                      : tab.key === "avances"
                        ? "oklch(var(--emerald))"
                        : "oklch(var(--navy-card))"
                    : "transparent",
                color:
                  activeTab === tab.key
                    ? tab.key === "tout"
                      ? "oklch(var(--foreground))"
                      : "white"
                    : "oklch(var(--muted-foreground))",
              }}
            >
              {tab.label}
              {tab.key === "dettes" &&
                clientTxs.filter((t) => t.type === "dette").length > 0 && (
                  <span className="ml-1 opacity-80">
                    ({clientTxs.filter((t) => t.type === "dette").length})
                  </span>
                )}
              {tab.key === "avances" &&
                clientTxs.filter((t) => t.type === "paiement").length > 0 && (
                  <span className="ml-1 opacity-80">
                    ({clientTxs.filter((t) => t.type === "paiement").length})
                  </span>
                )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2" data-ocid="client_detail.transaction_list">
        {filteredTxs.length === 0 && (
          <div
            className="text-center py-8 text-muted-foreground text-sm"
            data-ocid="client_detail.empty_state"
          >
            {activeTab === "avances"
              ? "Aucune avance enregistrée"
              : "Aucune transaction"}
          </div>
        )}
        {filteredTxs.map((tx, i) => (
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
              {tx.type === "dette" ? "Dette" : "Avance"}
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
            {role !== "gerant" && (
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
            )}
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
