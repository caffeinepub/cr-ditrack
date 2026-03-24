import { Bell, BellRing } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { StoreNotif } from "../sequeApi";

interface Props {
  unreadCount: number;
  notifications: StoreNotif[];
  onClick: () => void;
}

export default function NotificationBell({ unreadCount, onClick }: Props) {
  const hasUnread = unreadCount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95"
      style={{ background: "oklch(var(--forest-card))" }}
      data-ocid="notification_bell.button"
      aria-label={`Notifications${hasUnread ? ` (${unreadCount} non lues)` : ""}`}
    >
      {hasUnread ? (
        <BellRing
          className="w-5 h-5"
          style={{ color: "oklch(var(--orange))" }}
        />
      ) : (
        <Bell className="w-5 h-5 text-muted-foreground" />
      )}

      <AnimatePresence>
        {hasUnread && (
          <motion.span
            key="badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold px-1"
            style={{
              background: "oklch(var(--orange))",
              color: "white",
            }}
            data-ocid="notification_bell.badge"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
