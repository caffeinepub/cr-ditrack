import { Bell, CheckCheck, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { StoreNotif } from "../sequeApi";

interface Props {
  open: boolean;
  onClose: () => void;
  notifications: StoreNotif[];
  onMarkAllRead: () => void;
}

function formatRelativeTime(createdAt: bigint): string {
  const ms = Number(createdAt) / 1_000_000;
  if (!ms || ms <= 0) return "Maintenant";
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Maintenant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

export default function NotificationCenterPanel({
  open,
  onClose,
  notifications,
  onMarkAllRead,
}: Props) {
  const sorted = [...notifications].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-[480px] mx-auto rounded-t-3xl overflow-hidden"
            style={{
              background: "oklch(var(--forest))",
              maxHeight: "80vh",
            }}
            data-ocid="notification_panel"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: "oklch(var(--forest-card))" }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-2">
                <Bell
                  className="w-5 h-5"
                  style={{ color: "oklch(var(--orange))" }}
                />
                <h2 className="text-foreground font-bold text-base">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      background: "oklch(var(--orange) / 0.15)",
                      color: "oklch(var(--orange))",
                    }}
                  >
                    {unreadCount} non lues
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllRead}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
                    style={{
                      background: "oklch(var(--emerald) / 0.15)",
                      color: "oklch(var(--emerald))",
                    }}
                    data-ocid="notification_panel.mark_read_button"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Tout marquer lu
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "oklch(var(--forest-card))" }}
                  data-ocid="notification_panel.close_button"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* List */}
            <div
              className="overflow-y-auto px-4 pb-8"
              style={{ maxHeight: "calc(80vh - 100px)" }}
            >
              {sorted.length === 0 ? (
                <div
                  className="text-center py-14 text-muted-foreground"
                  data-ocid="notification_panel.empty_state"
                >
                  <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Aucune notification</p>
                  <p className="text-xs mt-1 opacity-60">
                    Les alertes de paiement apparaîtront ici
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sorted.map((notif, i) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-2xl p-4 relative"
                      style={{
                        background: notif.read
                          ? "oklch(var(--forest-card))"
                          : notif.notifType === "payment_alert"
                            ? "oklch(var(--orange) / 0.12)"
                            : "oklch(var(--gold) / 0.1)",
                        border: notif.read
                          ? "none"
                          : `1px solid ${
                              notif.notifType === "payment_alert"
                                ? "oklch(var(--orange) / 0.3)"
                                : "oklch(var(--gold) / 0.3)"
                            }`,
                      }}
                      data-ocid={`notification_panel.item.${i + 1}`}
                    >
                      {/* Unread dot */}
                      {!notif.read && (
                        <span
                          className="absolute top-4 right-4 w-2 h-2 rounded-full"
                          style={{
                            background:
                              notif.notifType === "payment_alert"
                                ? "oklch(var(--orange))"
                                : "oklch(var(--gold))",
                          }}
                        />
                      )}

                      <p className="text-foreground text-sm font-medium pr-6 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-muted-foreground text-xs">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                        {notif.clientNom && (
                          <span
                            className="text-xs font-medium"
                            style={{
                              color:
                                notif.notifType === "payment_alert"
                                  ? "oklch(var(--emerald))"
                                  : "oklch(var(--gold))",
                            }}
                          >
                            {notif.clientNom}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
