import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlarmClock,
  ArrowLeft,
  Calendar,
  CreditCard,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
  ZoomIn,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Role } from "../hooks/useAuth";
import type { BackendStore } from "../hooks/useBackendStore";
import { formatPhone242 } from "../utils/format";
import AddTransactionModal from "./AddTransactionModal";

interface Props {
  clientId: string;
  store: BackendStore;
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
  const [showPaySheet, setShowPaySheet] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [payNote, setPayNote] = useState("");
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);
  const [savingPay, setSavingPay] = useState(false);

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
    return `Bonjour ${client.name}, il est ${currentTime}, votre solde impayé est de ${formatFCFA(balance)}. Merci de régulariser avant le ${latestDette ? formatDate(latestDette.dueDate) : "prochainement"}. — Séqué-App`;
  };

  const buildWhatsAppMessage = () => {
    return `Bonjour ${client.name}, votre solde chez ${shopName} est de ${formatFCFA(resteAPayer > 0 ? resteAPayer : 0)} FCFA. Merci de passer régler. Séqué-App vous remercie !`;
  };

  const sendReminder = () => {
    const msg = buildSmsMessage();
    const phone = formatPhone242(client.phone);
    const smsUrl = `sms:${phone}?body=${encodeURIComponent(msg)}`;
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
    const phone = formatPhone242(client.phone).replace("+", "");
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    const a = document.createElement("a");
    a.href = waUrl;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("WhatsApp ouvert !");
  };

  const handleDelete = async (txId: string) => {
    try {
      await store.deleteTransaction(txId);
      toast.success("Transaction supprimée");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleQuickPayment = async () => {
    const amt = Number.parseFloat(payAmount);
    if (!amt || amt <= 0) {
      toast.error("Montant invalide");
      return;
    }
    setSavingPay(true);
    try {
      await store.addTransaction({
        clientId,
        type: "paiement",
        amount: amt,
        product: payNote.trim() || "Paiement enregistré",
        dueDate: payDate,
      });
      toast.success("Paiement enregistré !");
      setPayAmount("");
      setPayNote("");
      setPayDate(new Date().toISOString().split("T")[0]);
      setShowPaySheet(false);
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
    setSavingPay(false);
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
              <span className="text-xs text-muted-foreground font-medium">
                Quartier &amp; Point de repère
              </span>
            </div>
            <p className="text-foreground text-sm font-semibold">
              {client.localisation || client.quartier || "—"}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <a
                href={`tel:${formatPhone242(client.phone)}`}
                className="text-muted-foreground text-sm"
              >
                {formatPhone242(client.phone)}
              </a>
            </div>
          </div>
        </div>

        {/* Balance summary: 3 cards */}
        <div className="grid grid-cols-3 gap-2 mb-3">
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
              Argent dehors
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

        {/* Main balance */}
        <div
          className="rounded-xl p-4 text-center"
          style={{ background: "oklch(var(--navy-light))" }}
        >
          <p className="text-muted-foreground text-sm mb-1">Argent dehors</p>
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
              ✓ Dette Séquée !
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
              Relancer
            </button>
          </div>
        )}
        <button
          type="button"
          data-ocid="client_detail.register_payment_button"
          onClick={() => setShowPaySheet(true)}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm transition-all active:scale-95"
          style={{
            background: "oklch(var(--emerald))",
            color: "oklch(var(--navy))",
          }}
        >
          <CreditCard className="w-4 h-4" />
          Enregistrer un paiement
        </button>
        <button
          type="button"
          data-ocid="client_detail.add_transaction_button"
          onClick={() => setShowAddTx(true)}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm transition-all active:scale-95"
          style={{
            background: "oklch(var(--navy-card))",
            color: "oklch(var(--foreground))",
          }}
        >
          <Plus className="w-4 h-4" />
          Ajouter Transaction
        </button>
      </div>

      {/* History tabs */}
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
              data-ocid={`client_detail.${tab.key}_tab`}
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
            className="rounded-xl p-4 flex items-start gap-3"
            style={{ background: "oklch(var(--navy-card))" }}
            data-ocid={`client_detail.transaction.item.${i + 1}`}
          >
            <Badge
              className="flex-shrink-0 rounded-lg px-2 py-1 text-xs font-bold border-0 mt-0.5"
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
              {tx.photoBase64 && (
                <button
                  type="button"
                  className="mt-2 flex items-center gap-1.5 group"
                  onClick={() => setFullscreenPhoto(tx.photoBase64 ?? null)}
                  data-ocid={`client_detail.photo_preview.${i + 1}`}
                >
                  <img
                    src={tx.photoBase64}
                    alt="Preuve"
                    className="w-16 h-16 rounded-lg object-cover border-2 group-active:opacity-80 transition-opacity"
                    style={{ borderColor: "oklch(var(--emerald) / 0.5)" }}
                  />
                  <span
                    className="flex items-center gap-1 text-xs"
                    style={{ color: "oklch(var(--emerald))" }}
                  >
                    <ZoomIn className="w-3 h-3" />
                    Voir
                  </span>
                </button>
              )}
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

      {/* Quick Payment Sheet */}
      <Sheet
        open={showPaySheet}
        onOpenChange={(v) => !v && setShowPaySheet(false)}
      >
        <SheetContent
          side="bottom"
          className="rounded-t-2xl border-0 px-4 pb-8"
          style={{
            background: "oklch(var(--navy-card))",
            maxHeight: "70vh",
            overflowY: "auto",
          }}
          data-ocid="client_detail.payment_sheet"
        >
          <SheetHeader className="mb-6">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-foreground text-xl font-bold">
                Enregistrer un paiement
              </SheetTitle>
              <button
                type="button"
                onClick={() => setShowPaySheet(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "oklch(var(--navy-light))" }}
                data-ocid="client_detail.payment_close_button"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </SheetHeader>
          <div className="space-y-4">
            <div
              className="rounded-xl px-4 py-3"
              style={{ background: "oklch(var(--navy-light))" }}
            >
              <p className="text-muted-foreground text-xs">Client</p>
              <p className="text-foreground font-semibold">{client.name}</p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "oklch(var(--orange))" }}
              >
                Argent dehors : {formatFCFA(Math.max(0, resteAPayer))}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 block">
                Montant payé (FCFA)
              </Label>
              <Input
                data-ocid="client_detail.payment_amount_input"
                type="number"
                inputMode="numeric"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="0"
                className="border-border text-foreground text-lg font-bold"
                style={{ background: "oklch(var(--navy-light))" }}
                autoFocus
              />
            </div>
            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 block">
                Date du paiement
              </Label>
              <Input
                data-ocid="client_detail.payment_date_input"
                type="date"
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
                className="border-border text-foreground"
                style={{ background: "oklch(var(--navy-light))" }}
              />
            </div>
            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 block">
                Note (facultatif)
              </Label>
              <Input
                data-ocid="client_detail.payment_note_input"
                value={payNote}
                onChange={(e) => setPayNote(e.target.value)}
                placeholder="Ex: Remboursement partiel..."
                className="border-border text-foreground"
                style={{ background: "oklch(var(--navy-light))" }}
              />
            </div>
            <Button
              data-ocid="client_detail.payment_confirm_button"
              onClick={handleQuickPayment}
              disabled={savingPay}
              className="w-full rounded-xl py-6 font-bold text-base"
              style={{
                background: "oklch(var(--emerald))",
                color: "oklch(var(--navy))",
              }}
            >
              {savingPay ? "Enregistrement..." : "Confirmer le paiement"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Fullscreen photo overlay */}
      <AnimatePresence>
        {fullscreenPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.95)" }}
            onClick={() => setFullscreenPhoto(null)}
            data-ocid="client_detail.photo_modal"
          >
            <button
              type="button"
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center z-10"
              style={{ background: "oklch(var(--navy-card))" }}
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenPhoto(null);
              }}
              data-ocid="client_detail.photo_close_button"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={fullscreenPhoto}
              alt="Preuve de transaction"
              className="max-w-full max-h-full object-contain rounded-2xl"
              style={{ maxWidth: "95vw", maxHeight: "90vh" }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
