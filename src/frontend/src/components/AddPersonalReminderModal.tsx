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
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Client, PersonalReminder } from "../hooks/useStore";

interface Props {
  open: boolean;
  onClose: () => void;
  clients: Client[];
  onAdd: (
    reminder: Omit<PersonalReminder, "id" | "fired" | "createdAt">,
  ) => void;
}

export default function AddPersonalReminderModal({
  open,
  onClose,
  clients,
  onAdd,
}: Props) {
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [note, setNote] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [error, setError] = useState("");

  const reset = () => {
    setTitle("");
    setClientId("");
    setNote("");
    setReminderDate("");
    setReminderTime("");
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setError("Le titre est obligatoire.");
      return;
    }
    if (!reminderDate) {
      setError("La date du rappel est obligatoire.");
      return;
    }
    if (!reminderTime) {
      setError("L'heure du rappel est obligatoire.");
      return;
    }
    onAdd({
      title: title.trim(),
      clientId: clientId || undefined,
      note: note.trim() || undefined,
      reminderDate,
      reminderTime,
    });
    handleClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={handleClose}
          />
          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl p-6 max-w-[480px] mx-auto shadow-xl"
            style={{ background: "oklch(var(--navy-card))" }}
            data-ocid="personal_reminder.modal"
          >
            <div
              className="w-10 h-1 rounded-full mx-auto mb-5"
              style={{ background: "oklch(var(--border))" }}
            />
            <h2 className="text-lg font-bold text-foreground mb-5">
              Nouveau Rappel Personnel
            </h2>

            <div className="space-y-4">
              {/* Titre */}
              <div>
                <Label className="text-muted-foreground text-sm mb-1.5 block">
                  Titre *
                </Label>
                <Input
                  data-ocid="personal_reminder.input"
                  placeholder="Ex: Vérifier paiement Kofi..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-border text-foreground placeholder:text-muted-foreground"
                  style={{ background: "oklch(var(--navy-light))" }}
                />
              </div>

              {/* Client lié */}
              <div>
                <Label className="text-muted-foreground text-sm mb-1.5 block">
                  Client lié (optionnel)
                </Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger
                    data-ocid="personal_reminder.select"
                    className="border-border text-foreground"
                    style={{ background: "oklch(var(--navy-light))" }}
                  >
                    <SelectValue placeholder="Choisir un client..." />
                  </SelectTrigger>
                  <SelectContent
                    style={{ background: "oklch(var(--navy-card))" }}
                  >
                    <SelectItem value="none">Aucun client</SelectItem>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Note */}
              <div>
                <Label className="text-muted-foreground text-sm mb-1.5 block">
                  Note (optionnel)
                </Label>
                <Input
                  data-ocid="personal_reminder.textarea"
                  placeholder="Détails supplémentaires..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="border-border text-foreground placeholder:text-muted-foreground"
                  style={{ background: "oklch(var(--navy-light))" }}
                />
              </div>

              {/* Date + Heure */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-muted-foreground text-sm mb-1.5 block">
                    Date *
                  </Label>
                  <Input
                    data-ocid="personal_reminder.date_input"
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="border-border text-foreground"
                    style={{ background: "oklch(var(--navy-light))" }}
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm mb-1.5 block">
                    Heure *
                  </Label>
                  <Input
                    data-ocid="personal_reminder.time_input"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="border-border text-foreground"
                    style={{ background: "oklch(var(--navy-light))" }}
                  />
                </div>
              </div>

              {error && (
                <p
                  className="text-sm font-medium"
                  style={{ color: "oklch(var(--orange))" }}
                  data-ocid="personal_reminder.error_state"
                >
                  {error}
                </p>
              )}

              <Button
                data-ocid="personal_reminder.submit_button"
                className="w-full font-bold text-base h-12 rounded-xl text-white mt-2"
                style={{ background: "oklch(var(--orange))" }}
                onClick={handleSubmit}
              >
                Ajouter le rappel
              </Button>
              <Button
                variant="ghost"
                data-ocid="personal_reminder.cancel_button"
                className="w-full text-muted-foreground"
                onClick={handleClose}
              >
                Annuler
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
