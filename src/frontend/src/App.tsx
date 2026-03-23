import { Toaster } from "@/components/ui/sonner";
import { X } from "lucide-react";
import { useState } from "react";
import BottomNav from "./components/BottomNav";
import ClientDetailPage from "./components/ClientDetailPage";
import Dashboard from "./components/Dashboard";
import LoginPage from "./components/LoginPage";
import PersonalRemindersPage from "./components/PersonalRemindersPage";
import StatisticsPage from "./components/StatisticsPage";
import { useAuth } from "./hooks/useAuth";
import { useReminderScheduler } from "./hooks/useReminderScheduler";
import { useStore } from "./hooks/useStore";

export type Page =
  | { name: "dashboard" }
  | { name: "client-detail"; clientId: string }
  | { name: "statistics" }
  | { name: "rappels" };

export default function App() {
  const auth = useAuth();
  const store = useStore();
  const [page, setPage] = useState<Page>({ name: "dashboard" });
  const [notifWarningDismissed, setNotifWarningDismissed] = useState(false);

  const { notifPermission, scheduledCount } = useReminderScheduler({
    clients: store.clients,
    transactions: store.transactions,
    personalReminders: store.personalReminders,
    markReminderFired: store.markReminderFired,
  });

  const today = new Date().toISOString().split("T")[0];
  const todayReminderCount = store.personalReminders.filter(
    (r) => !r.fired && r.reminderDate === today,
  ).length;

  if (!auth.role) {
    return (
      <>
        <LoginPage onLogin={auth.login} />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Notification permission warning */}
      {notifPermission === "denied" && !notifWarningDismissed && (
        <div
          className="flex items-center justify-between gap-2 px-4 py-2 text-sm"
          style={{
            background: "oklch(var(--orange) / 0.15)",
            color: "oklch(var(--orange))",
          }}
          data-ocid="app.notif_warning"
        >
          <span>
            ⚠️ Notifications désactivées — les rappels auto ne s'afficheront pas.
            Activez-les dans les paramètres du navigateur.
          </span>
          <button
            type="button"
            onClick={() => setNotifWarningDismissed(true)}
            className="flex-shrink-0"
            data-ocid="app.notif_warning_close_button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Active reminders badge */}
      {scheduledCount > 0 && notifPermission === "granted" && (
        <div
          className="flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-semibold"
          style={{
            background: "oklch(var(--emerald) / 0.15)",
            color: "oklch(var(--emerald))",
          }}
          data-ocid="app.active_reminders_badge"
        >
          <span>✓</span>
          <span>
            {scheduledCount} rappel{scheduledCount > 1 ? "s" : ""} automatique
            {scheduledCount > 1 ? "s" : ""} actif{scheduledCount > 1 ? "s" : ""}
          </span>
        </div>
      )}

      <main className="flex-1 pb-20">
        {page.name === "dashboard" && (
          <Dashboard
            store={store}
            role={auth.role}
            todayReminderCount={todayReminderCount}
            onNavigateToClient={(id) =>
              setPage({ name: "client-detail", clientId: id })
            }
          />
        )}
        {page.name === "client-detail" && (
          <ClientDetailPage
            clientId={page.clientId}
            store={store}
            onBack={() => setPage({ name: "dashboard" })}
          />
        )}
        {page.name === "statistics" && (
          <StatisticsPage
            store={store}
            onBack={() => setPage({ name: "dashboard" })}
          />
        )}
        {page.name === "rappels" && (
          <PersonalRemindersPage
            personalReminders={store.personalReminders}
            clients={store.clients}
            onBack={() => setPage({ name: "dashboard" })}
            onAdd={store.addPersonalReminder}
            onDelete={store.deletePersonalReminder}
          />
        )}
      </main>
      <BottomNav
        role={auth.role}
        currentPage={page.name}
        onNavigate={(p) => setPage({ name: p } as Page)}
        onLogout={auth.logout}
        todayReminderCount={todayReminderCount}
      />
      <Toaster position="top-center" />
    </div>
  );
}
