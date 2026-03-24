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
import type { Client, PersonalReminder } from "../hooks/useBackendStore";

interface Props {
  open: boolean;
  onClose: () => void;
  clients: Client[];
  onAdd: (
    reminder: Omit<PersonalReminder, "id" | "fired" | "createdAt">,
  ) => void | Promise<void>;
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
  const [reminderTime, setReminderTime] = useState("08:00");
  const [error, setError] = useState("");

  const handleClose = () => {
    setTitle("");
    setClientId("");
    setNote("");
    setReminderDate("");
    setReminderTime("08:00");
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Le titre est obligatoire");
      return;
    }
    if (!reminderDate) {
      setError("La date est obligatoire");
      return;
    }
    if (!reminderTime) {
      setError("L'heure est obligatoire");
      return;
    }
    setError("");
    await onAdd({
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl p-6 space-y-4 max-w-[480px] mx-auto"
            style={{ background: "oklch(var(--forest-card))" }}
            data-ocid="personal_reminder.sheet"
          >
            <h2 className="text-xl font-bold text-foreground">
              Nouveau Rappel
            </h2>
            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 block">
                Titre *
              </Label>
              <Input
                data-ocid="personal_reminder.title_input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Appeler fournisseur"
                className="border-border text-foreground"
                style={{ background: "oklch(var(--forest-light))" }}
              />
            </div>

            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 block">
                Client lié (optionnel)
              </Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger
                  className="border-border text-foreground"
                  style={{ background: "oklch(var(--forest-light))" }}
                  data-ocid="personal_reminder.select"
                >
                  <SelectValue placeholder="Aucun client" />
                </SelectTrigger>
                <SelectContent
                  style={{ background: "oklch(var(--forest-card))" }}
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

            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 block">
                Note
              </Label>
              <Input
                data-ocid="personal_reminder.note_input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note supplémentaire..."
                className="border-border text-foreground"
                style={{ background: "oklch(var(--forest-light))" }}
              />
            </div>

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
                  style={{ background: "oklch(var(--forest-light))" }}
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
                  style={{ background: "oklch(var(--forest-light))" }}
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
