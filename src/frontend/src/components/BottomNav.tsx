import { BarChart2, Bell, Home, LogOut } from "lucide-react";
import type { Role } from "../hooks/useAuth";

interface Props {
  role: Role;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  todayReminderCount?: number;
}

export default function BottomNav({
  role,
  currentPage,
  onNavigate,
  onLogout,
  todayReminderCount = 0,
}: Props) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border px-2 pb-safe"
      style={{ background: "oklch(var(--navy-card))", height: "68px" }}
      data-ocid="bottom_nav.panel"
    >
      <button
        type="button"
        data-ocid="bottom_nav.dashboard_link"
        onClick={() => onNavigate("dashboard")}
        className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all"
      >
        <Home
          className="w-6 h-6"
          style={{
            color:
              currentPage === "dashboard"
                ? "oklch(var(--emerald))"
                : "oklch(var(--muted-foreground))",
          }}
        />
        <span
          className="text-xs font-medium"
          style={{
            color:
              currentPage === "dashboard"
                ? "oklch(var(--emerald))"
                : "oklch(var(--muted-foreground))",
          }}
        >
          Accueil
        </span>
      </button>

      {/* Rappels — visible for both roles */}
      <button
        type="button"
        data-ocid="bottom_nav.rappels_link"
        onClick={() => onNavigate("rappels")}
        className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all relative"
      >
        <div className="relative">
          <Bell
            className="w-6 h-6"
            style={{
              color:
                currentPage === "rappels"
                  ? "oklch(var(--orange))"
                  : "oklch(var(--muted-foreground))",
            }}
          />
          {todayReminderCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
              style={{ background: "oklch(var(--orange))" }}
            >
              {todayReminderCount > 9 ? "9+" : todayReminderCount}
            </span>
          )}
        </div>
        <span
          className="text-xs font-medium"
          style={{
            color:
              currentPage === "rappels"
                ? "oklch(var(--orange))"
                : "oklch(var(--muted-foreground))",
          }}
        >
          Rappels
        </span>
      </button>

      {role === "marchand" && (
        <button
          type="button"
          data-ocid="bottom_nav.statistics_link"
          onClick={() => onNavigate("statistics")}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all"
        >
          <BarChart2
            className="w-6 h-6"
            style={{
              color:
                currentPage === "statistics"
                  ? "oklch(var(--emerald))"
                  : "oklch(var(--muted-foreground))",
            }}
          />
          <span
            className="text-xs font-medium"
            style={{
              color:
                currentPage === "statistics"
                  ? "oklch(var(--emerald))"
                  : "oklch(var(--muted-foreground))",
            }}
          >
            Stats
          </span>
        </button>
      )}

      <button
        type="button"
        data-ocid="bottom_nav.logout_button"
        onClick={onLogout}
        className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all"
      >
        <LogOut className="w-6 h-6 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          Quitter
        </span>
      </button>
    </nav>
  );
}
