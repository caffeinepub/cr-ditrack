import { Bell, ChevronLeft, Clock, Loader2, Trash2, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Client, PersonalReminder } from "../hooks/useBackendStore";
import AddPersonalReminderModal from "./AddPersonalReminderModal";

interface Props {
  personalReminders: PersonalReminder[];
  clients: Client[];
  onBack: () => void;
  onAdd: (
    reminder: Omit<PersonalReminder, "id" | "fired" | "createdAt">,
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } catch {
      // silent
    }
    setDeletingId(null);
  };

  const ReminderCard = ({
    reminder,
    index,
  }: { reminder: PersonalReminder; index: number }) => {
    const clientName = getClientName(reminder.clientId);
    const isPast = reminder.reminderDate < today;
    const isDeleting = deletingId === reminder.id;

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        data-ocid={`reminders.item.${index + 1}`}
        className="rounded-2xl p-4 shadow-card"
        style={{
          background: "oklch(var(--forest-card))",
          opacity: isPast ? 0.6 : 1,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground text-sm truncate">
              {reminder.title}
            </p>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <div className="flex items-center gap-1">
                <Bell
                  className="w-3 h-3"
                  style={{ color: "oklch(var(--orange))" }}
                />
                <span className="text-muted-foreground text-xs">
                  {formatDate(reminder.reminderDate)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock
                  className="w-3 h-3"
                  style={{ color: "oklch(var(--emerald))" }}
                />
                <span className="text-muted-foreground text-xs">
                  {reminder.reminderTime}
                </span>
              </div>
              {clientName && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground text-xs">
                    {clientName}
                  </span>
                </div>
              )}
            </div>
            {reminder.note && (
              <p className="text-muted-foreground text-xs mt-1.5 line-clamp-2">
                {reminder.note}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => handleDelete(reminder.id)}
            disabled={isDeleting}
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
            style={{ background: "oklch(var(--orange) / 0.15)" }}
            data-ocid={`reminders.delete_button.${index + 1}`}
          >
            {isDeleting ? (
              <Loader2
                className="w-4 h-4 animate-spin"
                style={{ color: "oklch(var(--orange))" }}
              />
            ) : (
              <Trash2
                className="w-4 h-4"
                style={{ color: "oklch(var(--orange))" }}
              />
            )}
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div
      className="min-h-screen max-w-[480px] mx-auto px-4 pb-10"
      style={{ background: "oklch(var(--forest))" }}
      data-ocid="reminders.page"
    >
      <header className="flex items-center gap-3 py-5">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
          style={{ background: "oklch(var(--forest-card))" }}
          data-ocid="reminders.close_button"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-foreground">
            Rappels Personnels
          </h1>
          <p className="text-muted-foreground text-xs">
            {personalReminders.length} rappel
            {personalReminders.length !== 1 ? "s" : ""} enregistré
            {personalReminders.length !== 1 ? "s" : ""}
          </p>
        </div>
      </header>

      <button
        type="button"
        onClick={() => setShowAdd(true)}
        className="w-full py-3.5 rounded-xl font-bold text-sm mb-6 transition-all active:scale-95"
        style={{
          background: "oklch(var(--emerald))",
          color: "oklch(var(--forest))",
        }}
        data-ocid="reminders.open_modal_button"
      >
        + Ajouter un rappel
      </button>

      {personalReminders.length === 0 && (
        <div
          className="text-center py-14 text-muted-foreground"
          data-ocid="reminders.empty_state"
        >
          <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Aucun rappel enregistré</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            À venir
          </p>
          <div className="space-y-3">
            {upcoming.map((r, i) => (
              <ReminderCard key={r.id} reminder={r} index={i} />
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Passés
          </p>
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

      <AddPersonalReminderModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        clients={clients}
        onAdd={async (r) => {
          await onAdd(r);
          setShowAdd(false);
        }}
      />
    </div>
  );
}
