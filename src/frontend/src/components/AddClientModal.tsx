import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Lock, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Client } from "../hooks/useStore";
import { formatPhone242 } from "../utils/format";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (client: Omit<Client, "id" | "createdAt">) => void;
  initialClientId?: string;
  isPremium?: boolean;
  clientCount?: number;
}

export default function AddClientModal({
  open,
  onClose,
  onAdd,
  isPremium = true,
  clientCount = 0,
}: Props) {
  const [name, setName] = useState("");
  const [phoneRaw, setPhoneRaw] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [notes, setNotes] = useState("");

  const atLimit = !isPremium && clientCount >= 10;

  const reset = () => {
    setName("");
    setPhoneRaw("");
    setLocalisation("");
    setNotes("");
  };

  const handleSubmit = () => {
    if (atLimit) {
      toast.error(
        "Limite de 10 clients atteinte. Passez en Premium pour continuer.",
      );
      return;
    }
    if (!name.trim()) {
      toast.error("Le nom est obligatoire");
      return;
    }
    if (!phoneRaw.trim()) {
      toast.error("Le téléphone est obligatoire");
      return;
    }
    const formattedPhone = formatPhone242(phoneRaw.trim());
    onAdd({
      name: name.trim(),
      phone: formattedPhone,
      quartier: "",
      localisation,
      notes,
    });
    toast.success("Client enregistré !");
    reset();
    onClose();
  };

  const phonePreview = phoneRaw.trim() ? formatPhone242(phoneRaw.trim()) : "";

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
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        data-ocid="add_client.sheet"
      >
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-foreground text-xl font-bold">
              Nouveau client
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

        {atLimit && (
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-3 mb-4"
            style={{
              background: "oklch(var(--orange) / 0.15)",
              border: "1px solid oklch(var(--orange) / 0.3)",
            }}
            data-ocid="add_client.error_state"
          >
            <Lock
              className="w-4 h-4 flex-shrink-0"
              style={{ color: "oklch(var(--orange))" }}
            />
            <p
              className="text-xs font-semibold"
              style={{ color: "oklch(var(--orange))" }}
            >
              Limite de 10 clients atteinte. Passez en Premium pour continuer.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label className="text-muted-foreground text-sm mb-1.5 block">
              Nom complet{" "}
              <span style={{ color: "oklch(var(--orange))" }}>*</span>
            </Label>
            <Input
              data-ocid="add_client.name_input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Kouassi Jean-Baptiste"
              className="border-border text-foreground"
              style={{ background: "oklch(var(--navy-light))" }}
              disabled={atLimit}
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-sm mb-1.5 block">
              Téléphone <span style={{ color: "oklch(var(--orange))" }}>*</span>
            </Label>
            <div className="flex gap-2 items-center">
              <span
                className="text-sm font-bold px-3 py-2 rounded-xl flex-shrink-0"
                style={{
                  background: "oklch(var(--navy-light))",
                  color: "oklch(var(--emerald))",
                }}
              >
                +242
              </span>
              <Input
                data-ocid="add_client.phone_input"
                type="tel"
                inputMode="numeric"
                value={phoneRaw}
                onChange={(e) => setPhoneRaw(e.target.value)}
                placeholder="065 123 456"
                className="border-border text-foreground flex-1"
                style={{ background: "oklch(var(--navy-light))" }}
                disabled={atLimit}
              />
            </div>
            {phonePreview && (
              <p
                className="text-xs mt-1"
                style={{ color: "oklch(var(--emerald))" }}
              >
                Format enregistré : {phonePreview}
              </p>
            )}
          </div>
          <div>
            <Label className="text-muted-foreground text-sm mb-1.5 block">
              Quartier &amp; Point de repère
            </Label>
            <Textarea
              data-ocid="add_client.localisation_input"
              value={localisation}
              onChange={(e) => setLocalisation(e.target.value)}
              placeholder="Ex: Derrière le marché Total, portail bleu"
              className="border-border text-foreground resize-none"
              style={{ background: "oklch(var(--navy-light))" }}
              rows={3}
              disabled={atLimit}
            />
            <p className="text-muted-foreground text-xs mt-1.5">
              Décrivez à l'aide de repères visibles : mosquée, marché, arbre,
              école, carrefour...
            </p>
          </div>
          <div>
            <Label className="text-muted-foreground text-sm mb-1.5 block">
              Notes
            </Label>
            <Textarea
              data-ocid="add_client.notes_textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informations supplémentaires..."
              className="border-border text-foreground resize-none"
              style={{ background: "oklch(var(--navy-light))" }}
              rows={3}
              disabled={atLimit}
            />
          </div>
          <Button
            data-ocid="add_client.submit_button"
            onClick={handleSubmit}
            className="w-full rounded-xl py-6 font-bold text-base"
            style={{
              background: atLimit
                ? "oklch(var(--navy-light))"
                : "oklch(var(--emerald))",
              color: atLimit
                ? "oklch(var(--muted-foreground))"
                : "oklch(var(--navy))",
            }}
          >
            {atLimit ? "🔒 Limite atteinte" : "Enregistrer le client"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
