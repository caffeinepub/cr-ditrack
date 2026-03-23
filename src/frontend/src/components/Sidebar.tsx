import { cn } from "@/lib/utils";
import {
  Banknote,
  BarChart2,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Tableau de bord", id: "dashboard" },
  { icon: BarChart2, label: "Analytiques", id: "analytics" },
  { icon: Users, label: "Clients", id: "clients" },
  { icon: CreditCard, label: "Paiements", id: "payments" },
  { icon: FileText, label: "Rapports", id: "reports" },
  { icon: Settings, label: "Param\u00e8tres", id: "settings" },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { clear } = useInternetIdentity();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleOverlayKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" || e.key === "Enter") setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-5 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <Banknote className="w-4 h-4 text-white" />
          </div>
          <span className="text-sidebar-foreground font-bold text-base leading-tight">
            CollectMerchant
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ icon: Icon, label, id }) => (
          <button
            type="button"
            key={id}
            data-ocid={`nav.${id}.link`}
            onClick={() => {
              onNavigate(id);
              setMobileOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              activePage === id
                ? "bg-white/10 text-white"
                : "text-sidebar-foreground/70 hover:bg-white/8 hover:text-sidebar-foreground",
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span>{label}</span>
            {activePage === id && (
              <motion.div
                layoutId="nav-indicator"
                className="ml-auto w-1.5 h-1.5 rounded-full bg-accent"
              />
            )}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          type="button"
          data-ocid="nav.logout.button"
          onClick={clear}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-white/8 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>D\u00e9connexion</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ background: "oklch(0.16 0.058 240)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <Banknote className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-sm">CollectMerchant</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="text-white p-1"
          aria-label="Menu"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <motion.div
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          exit={{ x: -280 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="md:hidden fixed top-14 left-0 bottom-0 w-64 z-30"
          style={{ background: "oklch(0.16 0.058 240)" }}
        >
          {sidebarContent}
        </motion.div>
      )}
      {mobileOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Fermer le menu"
          className="md:hidden fixed inset-0 bg-black/40 z-20 top-14"
          onClick={() => setMobileOpen(false)}
          onKeyDown={handleOverlayKeyDown}
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-60 flex-shrink-0 fixed top-0 left-0 bottom-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.16 0.058 240) 0%, oklch(0.19 0.062 240) 100%)",
        }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
