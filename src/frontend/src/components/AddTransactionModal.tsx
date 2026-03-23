import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Camera, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { Client, Transaction } from "../hooks/useStore";

interface Props {
  open: boolean;
  onClose: () => void;
  clients: Client[];
  getClientBalance: (id: string) => number;
  onAdd: (tx: Omit<Transaction, "id" | "createdAt">) => void;
  preselectedClientId?: string;
}

function formatFCFA(amount: number) {
  return `${new Intl.NumberFormat("fr-FR").format(amount)} FCFA`;
}

export default function AddTransactionModal({
  open,
  onClose,
  clients,
  getClientBalance,
  onAdd,
  preselectedClientId,
}: Props) {
  const [clientId, setClientId] = useState(preselectedClientId ?? "");
  const [type, setType] = useState<"dette" | "paiement">("dette");
  const [amount, setAmount] = useState("");
  const [product, setProduct] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [photoBase64, setPhotoBase64] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentBalance = clientId ? getClientBalance(clientId) : null;
  const amountNum = Number.parseFloat(amount) || 0;
  const newBalance =
    currentBalance !== null
      ? type === "dette"
        ? currentBalance + amountNum
        : currentBalance - amountNum
      : null;

  const reset = () => {
    setClientId(preselectedClientId ?? "");
    setType("dette");
    setAmount("");
    setProduct("");
    setDueDate("");
    setReminderTime("");
    setPhotoBase64(undefined);
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be reselected
    e.target.value = "";
  };

  const handleSubmit = () => {
    if (!clientId) {
      toast.error("Choisissez un client");
      return;
    }
    if (!amountNum || amountNum <= 0) {
      toast.error("Montant invalide");
      return;
    }
    if (!product.trim()) {
      toast.error("Description requise");
      return;
    }
    onAdd({
      clientId,
      type,
      amount: amountNum,
      product: product.trim(),
      dueDate,
      reminderTime: reminderTime || undefined,
      photoBase64: photoBase64 || undefined,
    });
    toast.success(
      type === "dette" ? "Dette enregistrée !" : "Paiement enregistré !",
    );
    reset();
    onClose();
  };

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === clientId),
    [clients, clientId],
  );

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          reset();
          onClose();
        }
      }}
    >
      <SheetContent
        side="bottom"
        className="rounded-t-2xl border-0 px-4 pb-8"
        style={{
          background: "oklch(var(--navy-card))",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
        data-ocid="add_transaction.sheet"
      >
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-foreground text-xl font-bold">
              Nouvelle transaction
            </SheetTitle>
            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "oklch(var(--navy-light))" }}
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </SheetHeader>

        <div className="space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-xl overflow-hidden border border-border">
            <button
              type="button"
              data-ocid="add_transaction.dette_toggle"
              onClick={() => setType("dette")}
              className="flex-1 py-3 text-sm font-bold transition-all"
              style={{
                background:
                  type === "dette"
                    ? "oklch(var(--orange))"
                    : "oklch(var(--navy-light))",
                color:
                  type === "dette" ? "white" : "oklch(var(--muted-foreground))",
              }}
            >
              Dette
            </button>
            <button
              type="button"
              data-ocid="add_transaction.paiement_toggle"
              onClick={() => setType("paiement")}
              className="flex-1 py-3 text-sm font-bold transition-all"
              style={{
                background:
                  type === "paiement"
                    ? "oklch(var(--emerald))"
                    : "oklch(var(--navy-light))",
                color:
                  type === "paiement"
                    ? "oklch(var(--navy))"
                    : "oklch(var(--muted-foreground))",
              }}
            >
              Paiement
            </button>
          </div>

          {/* Client selector */}
          {!preselectedClientId && (
            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 block">
                Client
              </Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger
                  data-ocid="add_transaction.client_select"
                  className="border-border text-foreground"
                  style={{ background: "oklch(var(--navy-light))" }}
                >
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent
                  style={{ background: "oklch(var(--navy-card))" }}
                >
                  {clients.map((c) => (
                    <SelectItem
                      key={c.id}
                      value={c.id}
                      className="text-foreground"
                    >
                      {c.name} — {c.quartier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {preselectedClientId && selectedClient && (
            <div
              className="rounded-xl px-4 py-3"
              style={{ background: "oklch(var(--navy-light))" }}
            >
              <p className="text-muted-foreground text-xs">Client</p>
              <p className="text-foreground font-semibold">
                {selectedClient.name}
              </p>
            </div>
          )}

          {/* Amount */}
          <div>
            <Label className="text-muted-foreground text-sm mb-1.5 block">
              Montant (FCFA)
            </Label>
            <Input
              data-ocid="add_transaction.amount_input"
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="border-border text-foreground text-lg font-bold"
              style={{ background: "oklch(var(--navy-light))" }}
            />
          </div>

          {/* Real-time preview */}
          {currentBalance !== null && amountNum > 0 && (
            <div
              className="rounded-xl px-4 py-3"
              style={{ background: "oklch(var(--navy-light))" }}
            >
              <p className="text-muted-foreground text-xs mb-1">Aperçu</p>
              <p className="text-sm">
                <span className="text-muted-foreground">Solde actuel: </span>
                <span
                  style={{
                    color:
                      currentBalance > 0
                        ? "oklch(var(--orange))"
                        : "oklch(var(--emerald))",
                  }}
                  className="font-bold"
                >
                  {formatFCFA(currentBalance)}
                </span>
                <span className="text-muted-foreground"> → </span>
                <span
                  style={{
                    color:
                      (newBalance ?? 0) > 0
                        ? "oklch(var(--orange))"
                        : "oklch(var(--emerald))",
                  }}
                  className="font-bold"
                >
                  {formatFCFA(newBalance ?? 0)}
                </span>
              </p>
            </div>
          )}

          {/* Product */}
          <div>
            <Label className="text-muted-foreground text-sm mb-1.5 block">
              Produit / Description
            </Label>
            <Input
              data-ocid="add_transaction.product_input"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="Ex: Riz 25kg x2, Remboursement..."
              className="border-border text-foreground"
              style={{ background: "oklch(var(--navy-light))" }}
            />
          </div>

          {/* Photo proof — only for dette */}
          {type === "dette" && (
            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 block">
                📷 Preuve Photo
              </Label>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoCapture}
              />
              {!photoBase64 ? (
                <button
                  type="button"
                  data-ocid="add_transaction.upload_button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm transition-all active:scale-95"
                  style={{
                    background: "oklch(var(--emerald) / 0.18)",
                    color: "oklch(var(--emerald))",
                    border: "2px solid oklch(var(--emerald) / 0.5)",
                  }}
                >
                  <Camera className="w-4 h-4" />📷 Preuve Photo (recommandé)
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <img
                    src={photoBase64}
                    alt="Preuve"
                    className="w-16 h-16 rounded-xl object-cover border-2"
                    style={{ borderColor: "oklch(var(--emerald))" }}
                  />
                  <div className="flex-1">
                    <p
                      className="text-xs font-semibold"
                      style={{ color: "oklch(var(--emerald))" }}
                    >
                      ✓ Photo ajoutée
                    </p>
                    <button
                      type="button"
                      onClick={() => setPhotoBase64(undefined)}
                      className="text-xs mt-1"
                      style={{ color: "oklch(var(--destructive))" }}
                    >
                      Supprimer la photo
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs px-3 py-1.5 rounded-lg"
                    style={{
                      background: "oklch(var(--navy-light))",
                      color: "oklch(var(--muted-foreground))",
                    }}
                  >
                    Changer
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Due date (only for dette) */}
          {type === "dette" && (
            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 block">
                Date d'échéance
              </Label>
              <Input
                data-ocid="add_transaction.duedate_input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="border-border text-foreground"
                style={{ background: "oklch(var(--navy-light))" }}
              />
            </div>
          )}

          {/* Reminder time (only for dette) */}
          {type === "dette" && (
            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 block">
                ⏰ Heure de rappel automatique (optionnel)
              </Label>
              <Input
                data-ocid="add_transaction.reminder_time_input"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="border-border text-foreground"
                style={{ background: "oklch(var(--navy-light))" }}
              />
              {reminderTime && (
                <p
                  className="text-xs mt-1"
                  style={{ color: "oklch(var(--orange))" }}
                >
                  Un rappel SMS sera envoyé automatiquement à {reminderTime}{" "}
                  chaque jour
                </p>
              )}
            </div>
          )}

          <Button
            data-ocid="add_transaction.submit_button"
            onClick={handleSubmit}
            className="w-full rounded-xl py-6 font-bold text-base"
            style={{
              background:
                type === "dette"
                  ? "oklch(var(--orange))"
                  : "oklch(var(--emerald))",
              color: type === "dette" ? "white" : "oklch(var(--navy))",
            }}
          >
            {type === "dette"
              ? "Enregistrer la dette"
              : "Enregistrer le paiement"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
