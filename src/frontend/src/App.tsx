import { Toaster } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useState } from "react";
import AdminTransactionsPage from "./components/AdminTransactionsPage";
import BottomNav from "./components/BottomNav";
import ClientDetailPage from "./components/ClientDetailPage";
import Dashboard from "./components/Dashboard";
import LoginPage from "./components/LoginPage";
import PersonalRemindersPage from "./components/PersonalRemindersPage";
import SequeControlPage from "./components/SequeControlPage";
import StatisticsPage from "./components/StatisticsPage";
import { getStoredStoreId, getStoredStoreName, useAuth } from "./hooks/useAuth";
import { useBackendStore } from "./hooks/useBackendStore";
import { useNotificationCenter } from "./hooks/useNotificationCenter";
import { useReminderScheduler } from "./hooks/useReminderScheduler";
import { getStoredShopName } from "./hooks/useShopName";

import { sequeApi } from "./sequeApi";

export type Page =
  | { name: "dashboard" }
  | { name: "client-detail"; clientId: string }
  | { name: "statistics" }
  | { name: "rappels" };

type AdminPage = "dashboard" | "transactions";

export default function App() {
  const auth = useAuth();
  const storeId = getStoredStoreId();
  const store = useBackendStore(storeId);

  const [page, setPage] = useState<Page>({ name: "dashboard" });
  const [adminPage, setAdminPage] = useState<AdminPage>("dashboard");
  const [notifWarningDismissed, setNotifWarningDismissed] = useState(false);
  const [shopName, setShopName] = useState(
    () => getStoredStoreName() || getStoredShopName(),
  );

  // Notification center (store-level)
  const notifCenter = useNotificationCenter(storeId);

  // Load boutiques for admin transactions page
  const boutiquesQuery = useQuery({
    queryKey: ["boutiques"],
    queryFn: () => sequeApi.getBoutiques(),
    enabled: auth.role === "admin",
    staleTime: 60_000,
  });

  const { notifPermission, scheduledCount, dueTodayCount } =
    useReminderScheduler({
      clients: store.clients,
      transactions: store.transactions,
      personalReminders: store.personalReminders,
      markReminderFired: store.markReminderFired,
      shopName: shopName || undefined,
    });

  const today = new Date().toISOString().split("T")[0];
  const todayReminderCount = Math.max(
    store.personalReminders.filter((r) => !r.fired && r.reminderDate === today)
      .length,
    dueTodayCount,
  );

  if (!auth.role) {
    return (
      <>
        <LoginPage onLogin={auth.login} />
        <Toaster position="top-center" />
      </>
    );
  }

  if (auth.role === "admin") {
    return (
      <>
        {adminPage === "transactions" ? (
          <AdminTransactionsPage
            boutiques={boutiquesQuery.data ?? []}
            onBack={() => setAdminPage("dashboard")}
          />
        ) : (
          <SequeControlPage
            onLogout={auth.logout}
            onOpenTransactions={() => setAdminPage("transactions")}
          />
        )}
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Notification warning */}
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
            onShopNameChange={setShopName}
            isPremium={auth.isPremium}
            storeName={shopName || undefined}
            notifications={notifCenter.notifications}
            unreadNotifCount={notifCenter.unreadCount}
            onMarkAllNotifsRead={notifCenter.markAllRead}
          />
        )}
        {page.name === "client-detail" && (
          <ClientDetailPage
            clientId={page.clientId}
            store={store}
            role={auth.role}
            onBack={() => setPage({ name: "dashboard" })}
            shopName={shopName}
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
