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
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { Client, Transaction } from "../hooks/useBackendStore";

interface Props {
  open: boolean;
  onClose: () => void;
  clients: Client[];
  getClientBalance: (id: string) => number;
  onAdd: (tx: Omit<Transaction, "id" | "createdAt">) => Promise<void>;
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
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setClientId(preselectedClientId ?? "");
  }, [open, preselectedClientId]);

  const currentBalance = useMemo(
    () => (clientId ? getClientBalance(clientId) : null),
    [clientId, getClientBalance],
  );
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
    e.target.value = "";
  };

  const handleSubmit = async () => {
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
    if (type === "dette" && !photoBase64) {
      toast.error("La preuve photo est obligatoire pour une dette");
      return;
    }
    setSaving(true);
    try {
      await onAdd({
        clientId,
        type,
        amount: amountNum,
        product: product.trim(),
        dueDate,
        reminderTime: reminderTime || undefined,
        photoBase64,
      });
      toast.success(
        type === "dette" ? "Dette enregistrée !" : "Paiement enregistré !",
      );
      reset();
      onClose();
    } catch {
      toast.error("Erreur lors de l'enregistrement.");
    }
    setSaving(false);
  };

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
          background: "oklch(var(--forest-card))",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
        data-ocid="add_transaction.sheet"
      >
        <SheetHeader className="mb-5">
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
              style={{ background: "oklch(var(--forest-light))" }}
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </SheetHeader>

        <div className="space-y-4">
          {/* Client selector */}
          <div>
            <Label className="text-muted-foreground text-sm mb-1.5 block">
              Client <span style={{ color: "oklch(var(--orange))" }}>*</span>
            </Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger
                className="border-border text-foreground"
                style={{ background: "oklch(var(--forest-light))" }}
                data-ocid="add_transaction.select"
              >
                <SelectValue placeholder="Sélectionnez un client" />
              </SelectTrigger>
              <SelectContent
                style={{ background: "oklch(var(--forest-card))" }}
              >
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Balance preview */}
          {clientId && currentBalance !== null && (
            <div className="flex justify-between text-xs px-1">
              <span className="text-muted-foreground">Solde actuel :</span>
              <span
                style={{
                  color:
                    currentBalance > 0
                      ? "oklch(var(--orange))"
                      : "oklch(var(--emerald))",
                }}
              >
                {formatFCFA(currentBalance)}
              </span>
            </div>
          )}

          {/* Type */}
          <div>
            <Label className="text-muted-foreground text-sm mb-1.5 block">
              Type
            </Label>
            <div className="flex gap-2">
              {(["dette", "paiement"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background:
                      type === t
                        ? t === "dette"
                          ? "oklch(var(--orange))"
                          : "oklch(var(--emerald))"
                        : "oklch(var(--forest-light))",
                    color:
                      type === t ? "white" : "oklch(var(--muted-foreground))",
                  }}
                  data-ocid={`add_transaction.${t}_toggle`}
                >
                  {t === "dette" ? "🔴 Dette" : "🟢 Paiement"}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <Label className="text-muted-foreground text-sm mb-1.5 block">
              Montant (FCFA){" "}
              <span style={{ color: "oklch(var(--orange))" }}>*</span>
            </Label>
            <Input
              data-ocid="add_transaction.input"
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 5000"
              className="border-border text-foreground"
              style={{ background: "oklch(var(--forest-light))" }}
            />
            {newBalance !== null && amountNum > 0 && (
              <p
                className="text-xs mt-1"
                style={{ color: "oklch(var(--muted-foreground))" }}
              >
                Nouveau solde : {formatFCFA(newBalance)}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label className="text-muted-foreground text-sm mb-1.5 block">
              Description / Produit{" "}
              <span style={{ color: "oklch(var(--orange))" }}>*</span>
            </Label>
            <Input
              data-ocid="add_transaction.textarea"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="Ex: Sac de riz 50kg"
              className="border-border text-foreground"
              style={{ background: "oklch(var(--forest-light))" }}
            />
          </div>

          {/* Photo proof - required for dette */}
          {type === "dette" && (
            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 block">
                Preuve photo{" "}
                <span style={{ color: "oklch(var(--orange))" }}>
                  * (obligatoire)
                </span>
              </Label>
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
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-all"
                  style={{
                    borderColor: "oklch(var(--emerald) / 0.5)",
                    background: "oklch(var(--emerald) / 0.05)",
                  }}
                  data-ocid="add_transaction.upload_button"
                >
                  <Camera
                    className="w-6 h-6"
                    style={{ color: "oklch(var(--emerald))" }}
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "oklch(var(--emerald))" }}
                  >
                    Prendre une photo de la marchandise ou du reçu
                  </span>
                </button>
              ) : (
                <div className="relative">
                  <img
                    src={photoBase64}
                    alt="Preuve"
                    className="w-full h-32 object-cover rounded-xl"
                  />
                  <div className="absolute bottom-2 right-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPhotoBase64(undefined)}
                      className="text-xs px-3 py-1.5 rounded-lg"
                      style={{
                        background: "oklch(var(--orange) / 0.9)",
                        color: "white",
                      }}
                    >
                      Supprimer
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs px-3 py-1.5 rounded-lg"
                      style={{
                        background: "oklch(var(--forest-light))",
                        color: "oklch(var(--muted-foreground))",
                      }}
                    >
                      Changer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Due date */}
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
                style={{ background: "oklch(var(--forest-light))" }}
              />
            </div>
          )}

          {/* Reminder time */}
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
                style={{ background: "oklch(var(--forest-light))" }}
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
            disabled={saving}
            className="w-full rounded-xl py-6 font-bold text-base"
            style={{
              background:
                type === "dette"
                  ? "oklch(var(--orange))"
                  : "oklch(var(--emerald))",
              color: type === "dette" ? "white" : "oklch(var(--forest))",
            }}
          >
            {saving
              ? "Enregistrement..."
              : type === "dette"
                ? "Enregistrer la dette"
                : "Enregistrer le paiement"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
