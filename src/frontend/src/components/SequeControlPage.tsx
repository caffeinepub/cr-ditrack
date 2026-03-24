import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  Crown,
  Eye,
  EyeOff,
  List,
  LogOut,
  MapPin,
  Plus,
  Shield,
  Star,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { sequeApi } from "../sequeApi";
import type { Boutique } from "../sequeApi";

interface Props {
  onLogout: () => void;
  onOpenTransactions: () => void;
}

function formatFCFA(n: number) {
  return `${new Intl.NumberFormat("fr-FR").format(n)} FCFA`;
}

function getISOWeek(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return `${d.getFullYear()}-W${String(1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)).padStart(2, "0")}`;
}

function useStoreStats(storeId: string) {
  return useQuery({
    queryKey: ["store-stats", storeId],
    queryFn: () => sequeApi.getStoreStats(storeId),
    staleTime: 60_000,
  });
}

function BoutiqueCard({
  b,
  index,
  onToggle,
  onUpgrade,
  onDowngrade,
  onDelete,
  onUpdatePaymentDate,
}: {
  b: Boutique;
  index: number;
  onToggle: () => void;
  onUpgrade: () => void;
  onDowngrade: () => void;
  onDelete: () => void;
  onUpdatePaymentDate: (date: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showDateInput, setShowDateInput] = useState(false);
  const [newDate, setNewDate] = useState("");
  const statsQuery = useStoreStats(b.id);
  const stats = statsQuery.data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 space-y-3"
      style={{ background: "oklch(var(--forest-card))" }}
      data-ocid={`seque_control.item.${index + 1}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-foreground truncate">{b.nom}</span>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{
                background: b.premium
                  ? "oklch(var(--gold))"
                  : "oklch(var(--forest-light))",
                color: b.premium
                  ? "oklch(var(--forest))"
                  : "oklch(var(--muted-foreground))",
              }}
            >
              {b.premium ? (
                <>
                  <Star className="w-2.5 h-2.5 mr-1" />
                  PREMIUM
                </>
              ) : (
                "GRATUIT"
              )}
            </span>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{
                background: b.active
                  ? "oklch(var(--emerald) / 0.15)"
                  : "oklch(var(--orange) / 0.15)",
                color: b.active
                  ? "oklch(var(--emerald))"
                  : "oklch(var(--orange))",
              }}
            >
              {b.active ? (
                <>
                  <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                  ACTIF
                </>
              ) : (
                <>
                  <XCircle className="w-2.5 h-2.5 mr-1" />
                  INACTIF
                </>
              )}
            </span>
          </div>
          {b.proprietaire && (
            <p className="text-muted-foreground text-xs mt-1">
              {b.proprietaire}
            </p>
          )}
          {b.ville && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin
                className="w-3 h-3"
                style={{ color: "oklch(var(--emerald))" }}
              />
              <span className="text-muted-foreground text-xs">{b.ville}</span>
            </div>
          )}
        </div>
      </div>

      {/* Access code */}
      <div className="flex items-center gap-2">
        <div
          className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: "oklch(var(--forest-light))" }}
        >
          <Shield className="w-3 h-3" style={{ color: "oklch(var(--gold))" }} />
          <span
            className="text-xs font-mono"
            style={{ color: "oklch(var(--gold))" }}
          >
            {showCode ? b.codeAcces : b.codeAcces.replace(/./g, "•")}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowCode(!showCode)}
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "oklch(var(--forest-light))" }}
          data-ocid={`seque_control.eye_toggle.${index + 1}`}
        >
          {showCode ? (
            <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-2">
          <div
            className="rounded-xl p-2 text-center"
            style={{ background: "oklch(var(--forest-light))" }}
          >
            <p className="text-xs font-bold text-foreground">
              {Number(stats.totalClients)}
            </p>
            <p className="text-[10px] text-muted-foreground">Clients</p>
          </div>
          <div
            className="rounded-xl p-2 text-center"
            style={{ background: "oklch(var(--forest-light))" }}
          >
            <p
              className="text-xs font-bold"
              style={{ color: "oklch(var(--orange))" }}
            >
              {new Intl.NumberFormat("fr-FR").format(stats.totalDettes)}
            </p>
            <p className="text-[10px] text-muted-foreground">Dettes FCFA</p>
          </div>
          <div
            className="rounded-xl p-2 text-center"
            style={{ background: "oklch(var(--forest-light))" }}
          >
            <p
              className="text-xs font-bold"
              style={{ color: "oklch(var(--emerald))" }}
            >
              {new Intl.NumberFormat("fr-FR").format(stats.totalPaiements)}
            </p>
            <p className="text-[10px] text-muted-foreground">Payé FCFA</p>
          </div>
        </div>
      )}

      {/* Payment date */}
      <div className="flex items-center gap-2">
        <Calendar className="w-3 h-3 text-muted-foreground flex-shrink-0" />
        {showDateInput ? (
          <div className="flex-1 flex gap-2">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="flex-1 rounded-lg px-2 py-1 text-xs outline-none"
              style={{
                background: "oklch(var(--forest-light))",
                color: "oklch(var(--foreground))",
                border: "1px solid oklch(var(--border))",
              }}
            />
            <button
              type="button"
              onClick={() => {
                if (newDate) {
                  onUpdatePaymentDate(newDate);
                  setShowDateInput(false);
                  toast.success("Date mise à jour");
                }
              }}
              className="text-xs px-2 py-1 rounded-lg font-bold"
              style={{
                background: "oklch(var(--emerald))",
                color: "oklch(var(--forest))",
              }}
            >
              OK
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowDateInput(true)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Dernier paiement : {"—"}
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={onToggle}
          className="flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
          style={{
            background: b.active
              ? "oklch(var(--orange) / 0.15)"
              : "oklch(var(--emerald) / 0.15)",
            color: b.active ? "oklch(var(--orange))" : "oklch(var(--emerald))",
            border: `1px solid ${b.active ? "oklch(var(--orange) / 0.3)" : "oklch(var(--emerald) / 0.3)"}`,
          }}
          data-ocid={`seque_control.toggle.${index + 1}`}
        >
          {b.active ? "Désactiver Store" : "Activer Store"}
        </button>
        <button
          type="button"
          onClick={b.premium ? onDowngrade : onUpgrade}
          className="flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
          style={{
            background: b.premium
              ? "oklch(var(--forest-light))"
              : "oklch(var(--gold) / 0.15)",
            color: b.premium
              ? "oklch(var(--muted-foreground))"
              : "oklch(var(--gold))",
          }}
          data-ocid={`seque_control.premium_toggle.${index + 1}`}
        >
          <Crown className="w-3 h-3 inline mr-1" />
          {b.premium ? "Gratuit" : "Premium"}
        </button>
        {confirmDelete ? (
          <div className="w-full flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="flex-1 py-2 rounded-xl text-xs font-bold"
              style={{
                background: "oklch(var(--forest-light))",
                color: "oklch(var(--muted-foreground))",
              }}
              data-ocid={`seque_control.cancel_button.${index + 1}`}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => {
                onDelete();
                setConfirmDelete(false);
              }}
              className="flex-1 py-2 rounded-xl text-xs font-bold"
              style={{
                background: "oklch(var(--destructive))",
                color: "white",
              }}
              data-ocid={`seque_control.confirm_button.${index + 1}`}
            >
              Confirmer
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "oklch(var(--destructive) / 0.15)" }}
            data-ocid={`seque_control.delete_button.${index + 1}`}
          >
            <Trash2
              className="w-3.5 h-3.5"
              style={{ color: "oklch(var(--destructive))" }}
            />
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function SequeControlPage({
  onLogout,
  onOpenTransactions,
}: Props) {
  const queryClient = useQueryClient();

  const boutiquesQuery = useQuery({
    queryKey: ["boutiques"],
    queryFn: () => sequeApi.getBoutiques(),
    staleTime: 30_000,
  });

  const globalStatsQuery = useQuery({
    queryKey: ["global-stats"],
    queryFn: () => sequeApi.getGlobalStats(),
    staleTime: 60_000,
  });

  const allTransactionsQuery = useQuery({
    queryKey: ["all-transactions-admin"],
    queryFn: () => sequeApi.getAllTransactionsAdmin(),
    staleTime: 60_000,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["boutiques"] });
    queryClient.invalidateQueries({ queryKey: ["global-stats"] });
  };

  const addMutation = useMutation({
    mutationFn: (boutique: import("../sequeApi").Boutique) =>
      sequeApi.addBoutique(boutique),
    onSuccess: () => invalidate(),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      sequeApi.updateBoutiqueStatus(id, active),
    onSuccess: () => invalidate(),
  });

  const premiumMutation = useMutation({
    mutationFn: ({ id, premium }: { id: string; premium: boolean }) =>
      sequeApi.updateBoutiquePremium(id, premium),
    onSuccess: () => invalidate(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sequeApi.deleteBoutique(id),
    onSuccess: () => invalidate(),
  });

  const boutiques = boutiquesQuery.data ?? [];
  const globalStats = globalStatsQuery.data;
  const allTxAdmin = allTransactionsQuery.data ?? [];

  // ========== SURVEILLANCE RÉSEAU ==========
  const nowNs = BigInt(Date.now()) * 1_000_000n;
  const oneDayNs = 86_400_000_000_000n;
  const threeDaysNs = 3n * oneDayNs;

  // Dettes created in the last 24h
  const dettesTodayCount = allTxAdmin.filter((tx) => {
    const createdAt = BigInt(tx.dette.createdAt);
    return createdAt > 0n && nowNs - createdAt < oneDayNs;
  }).length;

  // Per-boutique last activity (most recent dette createdAt)
  const lastActivityByBoutique: Record<string, bigint> = {};
  for (const tx of allTxAdmin) {
    const storeId = tx.dette.storeId;
    const createdAt = BigInt(tx.dette.createdAt);
    if (createdAt > 0n) {
      const prev = lastActivityByBoutique[storeId] ?? 0n;
      if (createdAt > prev) lastActivityByBoutique[storeId] = createdAt;
    }
  }

  // Boutiques inactive for 3+ days (active boutiques with no recent activity)
  const inactiveBoutiques = boutiques.filter((b) => {
    if (!b.active) return false;
    const lastAct = lastActivityByBoutique[b.id];
    if (!lastAct || lastAct === 0n) return false; // no data = new boutique, skip
    return nowNs - lastAct > threeDaysNs;
  });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    quartier: "",
    phone: "",
    accessCode: "",
    owner: "",
  });

  const resetForm = () =>
    setForm({ name: "", quartier: "", phone: "", accessCode: "", owner: "" });

  const handleAdd = async () => {
    if (!form.name.trim() || !form.quartier.trim()) {
      toast.error("Nom et Ville/Quartier sont obligatoires.");
      return;
    }
    if (form.accessCode.length !== 6 || !/^\d{6}$/.test(form.accessCode)) {
      toast.error("Le code d'accès doit être exactement 6 chiffres.");
      return;
    }
    const newBoutique: Boutique = {
      id: `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      nom: form.name.trim(),
      codeAcces: form.accessCode,
      proprietaire: form.owner.trim(),
      ville: form.quartier.trim(),
      active: true,
      premium: false,
      createdAt: BigInt(0),
    };
    try {
      const result = await addMutation.mutateAsync(newBoutique);
      if ("duplicateCode" in result) {
        toast.error("Ce code d'accès est déjà utilisé par une autre boutique.");
        return;
      }
      toast.success("Boutique ajoutée !");
      resetForm();
      setShowAdd(false);
    } catch {
      toast.error("Erreur lors de l'ajout");
    }
  };

  // Weekly growth from boutiques createdAt
  const weeklyData = (() => {
    const weeks: string[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      weeks.push(getISOWeek(d));
    }
    const weekMap: Record<string, number> = {};
    for (const b of boutiques) {
      const createdDate = new Date(Number(b.createdAt) / 1_000_000); // nanoseconds to ms
      const w = getISOWeek(createdDate);
      weekMap[w] = (weekMap[w] || 0) + 1;
    }
    const oldCount = boutiques.filter((b) => {
      const w = getISOWeek(new Date(Number(b.createdAt) / 1_000_000));
      return !weeks.includes(w);
    }).length;
    let cumulative = oldCount;
    return weeks.map((w, i) => {
      const count = weekMap[w] || 0;
      cumulative += count;
      return { week: `S${i + 1}`, count, cumulative };
    });
  })();

  // City distribution
  const cityCounts = boutiques.reduce(
    (acc, b) => {
      if (b.ville) {
        const city = b.ville.split(",")[0].trim();
        acc[city] = (acc[city] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const stats = {
    totalBoutiques: globalStats
      ? Number(globalStats.totalBoutiques)
      : boutiques.length,
    activeBoutiques: globalStats
      ? Number(globalStats.totalBoutiquesActives)
      : boutiques.filter((b) => b.active).length,
    premiumBoutiques: boutiques.filter((b) => b.premium).length,
    totalAmountFCFA: globalStats ? globalStats.totalArgentGere : 0,
  };

  const STAT_CARDS = [
    {
      label: "Total Boutiques",
      value: stats.totalBoutiques,
      icon: Building2,
      color: "var(--emerald)",
    },
    {
      label: "Boutiques Actives",
      value: stats.activeBoutiques,
      icon: CheckCircle2,
      color: "var(--emerald)",
    },
    {
      label: "Premium",
      value: stats.premiumBoutiques,
      icon: Crown,
      color: "var(--gold)",
    },
    {
      label: "Argent Géré",
      value: formatFCFA(stats.totalAmountFCFA),
      icon: Wallet,
      color: "var(--gold)",
    },
  ];

  return (
    <div
      className="min-h-screen max-w-[480px] mx-auto px-4 pb-10"
      style={{ background: "oklch(var(--forest))" }}
      data-ocid="seque_control.page"
    >
      {/* Header */}
      <header className="flex items-center justify-between py-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "oklch(var(--gold))" }}
          >
            <Shield
              className="w-5 h-5"
              style={{ color: "oklch(var(--forest))" }}
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              SÉQUÉ-CONTROL
            </h1>
            <p className="text-muted-foreground text-xs">
              Interface Administrateur
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenTransactions}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
            style={{
              background: "oklch(var(--emerald) / 0.15)",
              color: "oklch(var(--emerald))",
              border: "1px solid oklch(var(--emerald) / 0.3)",
            }}
            data-ocid="seque_control.link"
          >
            <List className="w-4 h-4" />
            Transactions
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95"
            style={{
              background: "oklch(var(--forest-card))",
              color: "oklch(var(--muted-foreground))",
            }}
            data-ocid="seque_control.logout_button"
          >
            <LogOut className="w-4 h-4" />
            Quitter
          </button>
        </div>
      </header>

      {/* Stat cards */}
      <div
        className="grid grid-cols-2 gap-3 mb-6"
        data-ocid="seque_control.panel"
      >
        {STAT_CARDS.map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4"
            style={{
              background: "oklch(var(--forest-card))",
              border:
                s.color === "var(--gold)"
                  ? "1px solid oklch(var(--gold) / 0.3)"
                  : "none",
            }}
          >
            <s.icon
              className="w-4 h-4 mb-2"
              style={{ color: `oklch(${s.color})` }}
            />
            <p
              className="text-lg font-bold"
              style={{ color: `oklch(${s.color})` }}
            >
              {s.value}
            </p>
            <p className="text-muted-foreground text-xs mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ===== SURVEILLANCE RÉSEAU ===== */}
      <div
        className="rounded-2xl p-4 mb-5"
        style={{ background: "oklch(var(--forest-card))" }}
        data-ocid="seque_control.surveillance"
      >
        <div className="flex items-center gap-2 mb-3">
          <BarChart3
            className="w-4 h-4"
            style={{ color: "oklch(var(--emerald))" }}
          />
          <h2 className="text-sm font-bold text-foreground">
            Surveillance Réseau
          </h2>
        </div>

        {/* Daily report */}
        <div
          className="rounded-xl px-4 py-3 mb-3"
          style={{ background: "oklch(var(--emerald) / 0.1)" }}
        >
          <p
            className="text-sm font-semibold"
            style={{ color: "oklch(var(--emerald))" }}
          >
            📊 Rapport du Jour
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="font-bold text-foreground">
              {dettesTodayCount}
            </span>{" "}
            nouvelle{dettesTodayCount !== 1 ? "s" : ""} dette
            {dettesTodayCount !== 1 ? "s" : ""} enregistrée
            {dettesTodayCount !== 1 ? "s" : ""} aujourd'hui dans le réseau.
          </p>
        </div>

        {/* Inactivity alerts */}
        {inactiveBoutiques.length > 0 ? (
          <div className="space-y-2">
            {inactiveBoutiques.map((b) => (
              <div
                key={b.id}
                className="rounded-xl px-4 py-3 flex items-start gap-2"
                style={{
                  background: "oklch(var(--orange) / 0.1)",
                  border: "1px solid oklch(var(--orange) / 0.25)",
                }}
                data-ocid="seque_control.inactivity_alert"
              >
                <AlertTriangle
                  className="w-4 h-4 flex-shrink-0 mt-0.5"
                  style={{ color: "oklch(var(--orange))" }}
                />
                <div>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "oklch(var(--orange))" }}
                  >
                    ⚠️ Boutique inactive
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {b.nom} n'a enregistré aucune activité récemment.
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            ✓ Toutes les boutiques actives ont été récemment actives.
          </p>
        )}
      </div>

      {/* Network by city */}
      {Object.keys(cityCounts).length > 0 && (
        <div
          className="rounded-2xl p-4 mb-5"
          style={{ background: "oklch(var(--forest-card))" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <MapPin
              className="w-4 h-4"
              style={{ color: "oklch(var(--emerald))" }}
            />
            <h2 className="text-sm font-bold text-foreground">
              Réseau par Ville
            </h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(cityCounts).map(([city, count]) => (
              <span
                key={city}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold"
                style={{
                  background: "oklch(var(--emerald) / 0.15)",
                  color: "oklch(var(--emerald))",
                  border: "1px solid oklch(var(--emerald) / 0.3)",
                }}
              >
                {city} ({count})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Growth chart */}
      <div
        className="rounded-2xl p-4 mb-6"
        style={{ background: "oklch(var(--forest-card))" }}
        data-ocid="seque_control.chart_point"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp
            className="w-4 h-4"
            style={{ color: "oklch(var(--emerald))" }}
          />
          <h2 className="text-sm font-bold text-foreground">
            Croissance des Boutiques Partenaires
          </h2>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart
            data={weeklyData}
            margin={{ top: 4, right: 4, bottom: 0, left: -24 }}
          >
            <defs>
              <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
            />
            <XAxis
              dataKey="week"
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "#081a10",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: 12,
              }}
              formatter={(val: number) => [
                `${val} boutique${val !== 1 ? "s" : ""}`,
                "Cumulatif",
              ]}
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#emeraldGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Add button */}
      <Button
        onClick={() => setShowAdd(true)}
        className="w-full mb-4 rounded-xl py-5 font-bold text-sm"
        style={{
          background: "oklch(var(--emerald))",
          color: "oklch(var(--forest))",
        }}
        data-ocid="seque_control.open_modal_button"
      >
        <Plus className="w-4 h-4 mr-2" />
        Ajouter une Boutique
      </Button>

      {/* Boutiques list */}
      <div className="space-y-3" data-ocid="seque_control.list">
        {boutiquesQuery.isLoading ? (
          <div
            className="text-center py-8 text-muted-foreground"
            data-ocid="seque_control.loading_state"
          >
            Chargement...
          </div>
        ) : boutiques.length === 0 ? (
          <div
            className="text-center py-14 text-muted-foreground text-sm"
            data-ocid="seque_control.empty_state"
          >
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Aucune boutique enregistrée.</p>
            <p className="text-xs mt-1">
              Ajoutez votre première boutique partenaire.
            </p>
          </div>
        ) : (
          boutiques.map((b, i) => (
            <BoutiqueCard
              key={b.id}
              b={b}
              index={i}
              onToggle={async () => {
                await toggleMutation.mutateAsync({
                  id: b.id,
                  active: !b.active,
                });
                toast.success(
                  b.active ? "Boutique désactivée" : "Boutique activée",
                );
              }}
              onUpgrade={async () => {
                await premiumMutation.mutateAsync({ id: b.id, premium: true });
                toast.success("Passée en Premium !");
              }}
              onDowngrade={async () => {
                await premiumMutation.mutateAsync({ id: b.id, premium: false });
                toast.info("Repassée en Gratuit");
              }}
              onDelete={async () => {
                await deleteMutation.mutateAsync(b.id);
                toast.success("Boutique supprimée");
              }}
              onUpdatePaymentDate={(_date) => {
                // TODO: store payment date in boutique metadata if needed
              }}
            />
          ))
        )}
      </div>

      {/* Add boutique dialog */}
      <Dialog
        open={showAdd}
        onOpenChange={(v) => {
          if (!v) {
            resetForm();
            setShowAdd(false);
          }
        }}
      >
        <DialogContent
          className="max-w-[420px] rounded-2xl border-0"
          style={{ background: "oklch(var(--forest-card))" }}
          data-ocid="seque_control.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Nouvelle Boutique Partenaire
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 block">
                Nom de la boutique{" "}
                <span style={{ color: "oklch(var(--orange))" }}>*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Ex: Boutique Mama Lucie"
                className="border-border text-foreground"
                style={{ background: "oklch(var(--forest-light))" }}
                data-ocid="seque_control.input"
              />
            </div>
            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 block">
                Ville / Quartier{" "}
                <span style={{ color: "oklch(var(--orange))" }}>*</span>
              </Label>
              <Input
                value={form.quartier}
                onChange={(e) =>
                  setForm((f) => ({ ...f, quartier: e.target.value }))
                }
                placeholder="Ex: Brazzaville, Marché Total"
                className="border-border text-foreground"
                style={{ background: "oklch(var(--forest-light))" }}
                data-ocid="seque_control.input"
              />
            </div>
            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 block">
                Propriétaire
              </Label>
              <Input
                value={form.owner}
                onChange={(e) =>
                  setForm((f) => ({ ...f, owner: e.target.value }))
                }
                placeholder="Ex: Jean-Baptiste Kouassi"
                className="border-border text-foreground"
                style={{ background: "oklch(var(--forest-light))" }}
                data-ocid="seque_control.input"
              />
            </div>
            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 block">
                Code d'accès (6 chiffres){" "}
                <span style={{ color: "oklch(var(--orange))" }}>*</span>
              </Label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={form.accessCode}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    accessCode: e.target.value.replace(/\D/g, "").slice(0, 6),
                  }))
                }
                placeholder="123456"
                className="border-border text-foreground font-mono text-xl tracking-widest"
                style={{ background: "oklch(var(--forest-light))" }}
                data-ocid="seque_control.input"
              />
              <p className="text-muted-foreground text-xs mt-1">
                {form.accessCode.length}/6 chiffres
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                resetForm();
                setShowAdd(false);
              }}
              className="text-muted-foreground"
              data-ocid="seque_control.cancel_button"
            >
              Annuler
            </Button>
            <Button
              onClick={handleAdd}
              disabled={addMutation.isPending}
              style={{
                background: "oklch(var(--emerald))",
                color: "oklch(var(--forest))",
              }}
              data-ocid="seque_control.submit_button"
            >
              {addMutation.isPending ? "Ajout..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
