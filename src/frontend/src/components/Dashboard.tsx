import { Input } from "@/components/ui/input";
import {
  Bell,
  MapPin,
  Phone,
  Plus,
  Search,
  Settings,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Role } from "../hooks/useAuth";
import { getStoredPin } from "../hooks/useAuth";
import type { BackendStore } from "../hooks/useBackendStore";
import type { StoreNotif } from "../sequeApi";
import AddClientModal from "./AddClientModal";
import AddTransactionModal from "./AddTransactionModal";
import NotificationBell from "./NotificationBell";
import NotificationCenterPanel from "./NotificationCenterPanel";
import PaywallBanner from "./PaywallBanner";
import SettingsModal from "./SettingsModal";

interface Props {
  store: BackendStore;
  role: Role;
  onNavigateToClient: (id: string) => void;
  todayReminderCount?: number;
  onShopNameChange?: (name: string) => void;
  isPremium?: boolean;
  storeName?: string;
  notifications?: StoreNotif[];
  unreadNotifCount?: number;
  onMarkAllNotifsRead?: () => void;
}

function formatFCFA(amount: number) {
  return `${new Intl.NumberFormat("fr-FR").format(amount)} FCFA`;
}

export default function Dashboard({
  store,
  role,
  onNavigateToClient,
  todayReminderCount = 0,
  onShopNameChange,
  isPremium = true,
  storeName,
  notifications = [],
  unreadNotifCount = 0,
  onMarkAllNotifsRead,
}: Props) {
  const [search, setSearch] = useState("");
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddTx, setShowAddTx] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const total = store.getTotalReceivable();
  const clientCount = store.clients.length;

  const filtered = store.clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.localisation.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      className="min-h-screen max-w-[480px] mx-auto px-4 pb-8"
      data-ocid="dashboard.page"
    >
      {/* Header */}
      <header className="flex items-center justify-between py-5">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "oklch(var(--gold))" }}
          >
            {storeName || "SÉQUÉ-APP"}
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="inline-block w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: "oklch(var(--emerald))" }}
            />
            <p className="text-muted-foreground text-xs">
              {role === "marchand" ? "Marchand" : "Gérant"}{" "}
              <span style={{ color: "oklch(var(--emerald))" }}>
                • Session active
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <NotificationBell
            unreadCount={unreadNotifCount}
            notifications={notifications}
            onClick={() => setShowNotifPanel(true)}
          />
          {role === "marchand" && (
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              title="Paramètres"
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95"
              style={{ background: "oklch(var(--forest-card))" }}
              data-ocid="dashboard.settings_button"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
          <div
            className="w-10 h-10 rounded-xl bg-card flex items-center justify-center"
            style={{ background: "oklch(var(--forest-card))" }}
          >
            <Wallet className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </header>

      {/* Total card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 mb-3 shadow-card"
        style={{
          background: "oklch(var(--forest-card))",
          border: "1px solid oklch(var(--gold) / 0.2)",
        }}
        data-ocid="dashboard.total_card"
      >
        <p className="text-muted-foreground text-sm mb-1">Argent dehors</p>
        <p
          className="text-3xl font-bold"
          style={{ color: "oklch(var(--gold))" }}
        >
          {formatFCFA(total)}
        </p>
        <p className="text-muted-foreground text-xs mt-2">
          {clientCount} client{clientCount !== 1 ? "s" : ""} enregistré
          {clientCount !== 1 ? "s" : ""}
          {!isPremium && (
            <span
              className="ml-2 font-semibold"
              style={{
                color:
                  clientCount >= 10
                    ? "oklch(var(--orange))"
                    : "oklch(var(--muted-foreground))",
              }}
            >
              ({clientCount}/10)
            </span>
          )}
        </p>
      </motion.div>

      <PaywallBanner isPremium={isPremium} clientCount={clientCount} />

      {/* Reminders badge */}
      {todayReminderCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 mb-5"
          style={{ background: "oklch(var(--orange) / 0.12)" }}
          data-ocid="dashboard.reminders_today_badge"
        >
          <Bell
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "oklch(var(--orange))" }}
          />
          <span
            className="text-sm font-semibold"
            style={{ color: "oklch(var(--orange))" }}
          >
            🔔 {todayReminderCount} rappel{todayReminderCount > 1 ? "s" : ""}{" "}
            aujourd'hui
          </span>
        </motion.div>
      )}
      {todayReminderCount === 0 && <div className="mb-5" />}

      {/* Search + Add */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="dashboard.search_input"
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border text-foreground placeholder:text-muted-foreground"
            style={{ background: "oklch(var(--forest-card))" }}
          />
        </div>
        {role !== "gerant" && (
          <button
            type="button"
            data-ocid="dashboard.add_client_button"
            onClick={() => setShowAddClient(true)}
            className="flex items-center gap-2 px-4 rounded-xl font-semibold text-sm transition-all active:scale-95 flex-shrink-0"
            style={{
              background: "oklch(var(--emerald))",
              color: "oklch(var(--forest))",
            }}
          >
            <Plus className="w-4 h-4" />
            Client
          </button>
        )}
      </div>

      {/* Loading state */}
      {store.isLoading && (
        <div
          className="text-center py-8 text-muted-foreground text-sm"
          data-ocid="dashboard.loading_state"
        >
          Chargement des clients...
        </div>
      )}

      {/* Client list */}
      {!store.isLoading && (
        <div className="space-y-3" data-ocid="dashboard.list">
          {filtered.length === 0 && (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="dashboard.empty_state"
            >
              {search ? "Aucun client trouvé" : "Aucun client enregistré"}
            </div>
          )}
          {filtered.map((client, i) => {
            const balance = store.getClientBalance(client.id);
            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                data-ocid={`dashboard.item.${i + 1}`}
              >
                <button
                  type="button"
                  className="w-full text-left rounded-2xl p-4 shadow-card transition-all active:scale-[0.98] block"
                  style={{ background: "oklch(var(--forest-card))" }}
                  onClick={() => onNavigateToClient(client.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-base truncate">
                        {client.name}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground text-xs truncate">
                          {client.localisation || client.quartier}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-3">
                      {balance > 0 ? (
                        <span
                          className="text-sm font-bold"
                          style={{ color: "oklch(var(--orange))" }}
                        >
                          {formatFCFA(balance)}
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{
                            background: "oklch(var(--emerald))",
                            color: "oklch(var(--forest))",
                          }}
                        >
                          SOLDÉ
                        </span>
                      )}
                      <a
                        href={`tel:${client.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95"
                        style={{ background: "oklch(var(--forest-light))" }}
                        data-ocid={`dashboard.phone.${i + 1}`}
                      >
                        <Phone className="w-4 h-4 text-muted-foreground" />
                      </a>
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* FAB */}
      <button
        type="button"
        data-ocid="dashboard.add_transaction_button"
        onClick={() => setShowAddTx(true)}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all active:scale-95 z-30"
        style={{ background: "oklch(var(--orange))" }}
      >
        <Plus className="w-7 h-7" />
      </button>

      <AddClientModal
        open={showAddClient}
        onClose={() => setShowAddClient(false)}
        onAdd={store.addClient}
        isPremium={isPremium}
        clientCount={clientCount}
      />
      <AddTransactionModal
        open={showAddTx}
        onClose={() => setShowAddTx(false)}
        clients={store.clients}
        getClientBalance={store.getClientBalance}
        onAdd={store.addTransaction}
      />
      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        currentPin={getStoredPin()}
        onShopNameChange={onShopNameChange}
      />
      <NotificationCenterPanel
        open={showNotifPanel}
        onClose={() => setShowNotifPanel(false)}
        notifications={notifications}
        onMarkAllRead={() => {
          onMarkAllNotifsRead?.();
          setShowNotifPanel(false);
        }}
      />
    </div>
  );
}
