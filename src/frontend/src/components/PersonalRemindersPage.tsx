import { Bell, ChevronLeft, Clock, Trash2, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Client, PersonalReminder } from "../hooks/useStore";
import AddPersonalReminderModal from "./AddPersonalReminderModal";

interface Props {
  personalReminders: PersonalReminder[];
  clients: Client[];
  onBack: () => void;
  onAdd: (
    reminder: Omit<PersonalReminder, "id" | "fired" | "createdAt">,
  ) => void;
  onDelete: (id: string) => void;
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export default function PersonalRemindersPage({
  personalReminders,
  clients,
  onBack,
  onAdd,
  onDelete,
}: Props) {
  const [showAdd, setShowAdd] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const sorted = [...personalReminders].sort(
    (a, b) =>
      a.reminderDate.localeCompare(b.reminderDate) ||
      a.reminderTime.localeCompare(b.reminderTime),
  );

  const upcoming = sorted.filter((r) => r.reminderDate >= today);
  const past = sorted.filter((r) => r.reminderDate < today);

  const getClientName = (id?: string) => {
    if (!id) return null;
    return clients.find((c) => c.id === id)?.name ?? null;
  };

  const ReminderCard = ({
    reminder,
    index,
  }: { reminder: PersonalReminder; index: number }) => {
    const clientName = getClientName(reminder.clientId);
    const isPast = reminder.reminderDate < today;

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        data-ocid={`reminders.item.${index + 1}`}
        className="rounded-2xl p-4 shadow-card"
        style={{
          background: "oklch(var(--navy-card))",
          borderLeft: `3px solid ${isPast ? "oklch(var(--muted-foreground))" : "oklch(var(--orange))"}`,
          opacity: reminder.fired ? 0.6 : 1,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Bell
                className="w-4 h-4 flex-shrink-0"
                style={{
                  color: isPast
                    ? "oklch(var(--muted-foreground))"
                    : "oklch(var(--orange))",
                }}
              />
              <p className="font-semibold text-foreground text-sm truncate">
                {reminder.title}
              </p>
              {reminder.fired && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
                  style={{
                    background: "oklch(var(--emerald) / 0.15)",
                    color: "oklch(var(--emerald))",
                  }}
                >
                  Envoyé
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>
                {formatDate(reminder.reminderDate)} à {reminder.reminderTime}
              </span>
            </div>
            {clientName && (
              <div
                className="flex items-center gap-1.5 text-xs mt-1"
                style={{ color: "oklch(var(--emerald))" }}
              >
                <User className="w-3 h-3" />
                <span>{clientName}</span>
              </div>
            )}
            {reminder.note && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                {reminder.note}
              </p>
            )}
          </div>
          <button
            type="button"
            data-ocid={`reminders.delete_button.${index + 1}`}
            onClick={() => onDelete(reminder.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
            style={{ background: "oklch(var(--navy-light))" }}
          >
            <Trash2
              className="w-4 h-4"
              style={{ color: "oklch(var(--orange))" }}
            />
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div
      className="min-h-screen max-w-[480px] mx-auto px-4 pb-8"
      data-ocid="reminders.page"
    >
      {/* Header */}
      <header className="flex items-center gap-3 py-5">
        <button
          type="button"
          data-ocid="reminders.back_button"
          onClick={onBack}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95"
          style={{ background: "oklch(var(--navy-card))" }}
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Rappels Personnels
          </h1>
          <p className="text-xs text-muted-foreground">
            {personalReminders.length} rappel
            {personalReminders.length !== 1 ? "s" : ""} programmé
            {personalReminders.length !== 1 ? "s" : ""}
          </p>
        </div>
      </header>

      {/* Empty state */}
      {personalReminders.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          data-ocid="reminders.empty_state"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "oklch(var(--navy-card))" }}
          >
            <Bell className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">
            Aucun rappel programmé
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            Appuyez sur + pour en créer un
          </p>
        </div>
      )}

      {/* À venir */}
      {upcoming.length > 0 && (
        <div className="mb-6">
          <h2
            className="text-xs font-bold uppercase tracking-wider mb-3 px-1"
            style={{ color: "oklch(var(--orange))" }}
          >
            À venir
          </h2>
          <div className="space-y-3" data-ocid="reminders.list">
            {upcoming.map((r, i) => (
              <ReminderCard key={r.id} reminder={r} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Passés */}
      {past.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-3 px-1 text-muted-foreground">
            Passés
          </h2>
          <div className="space-y-3">
            {past.map((r, i) => (
              <ReminderCard
                key={r.id}
                reminder={r}
                index={upcoming.length + i}
              />
            ))}
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        type="button"
        data-ocid="reminders.open_modal_button"
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all active:scale-95 z-30 text-2xl font-bold"
        style={{ background: "oklch(var(--orange))" }}
      >
        +
      </button>

      <AddPersonalReminderModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        clients={clients}
        onAdd={onAdd}
      />
    </div>
  );
}
