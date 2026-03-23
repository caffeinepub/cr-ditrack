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
import {
  Building2,
  CheckCircle2,
  Crown,
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
import type { Boutique } from "../hooks/useBoutiqueStore";
import { useBoutiqueStore } from "../hooks/useBoutiqueStore";
import { formatPhone242 } from "../utils/format";

interface Props {
  onLogout: () => void;
}

function formatFCFA(n: number) {
  return `${new Intl.NumberFormat("fr-FR").format(n)} FCFA`;
}

function BoutiqueCard({
  b,
  onToggle,
  onUpgrade,
  onDowngrade,
  onDelete,
}: {
  b: Boutique;
  onToggle: () => void;
  onUpgrade: () => void;
  onDowngrade: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4"
      style={{ background: "oklch(var(--navy-card))" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-foreground truncate">{b.name}</span>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{
                background:
                  b.tier === "premium"
                    ? "oklch(var(--emerald))"
                    : "oklch(var(--navy-light))",
                color:
                  b.tier === "premium"
                    ? "oklch(var(--navy))"
                    : "oklch(var(--muted-foreground))",
              }}
            >
              {b.tier === "premium" ? (
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
                background: b.activated
                  ? "oklch(var(--emerald) / 0.15)"
                  : "oklch(var(--orange) / 0.15)",
                color: b.activated
                  ? "oklch(var(--emerald))"
                  : "oklch(var(--orange))",
              }}
            >
              {b.activated ? (
                <>
                  <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                  ACTIF
                </>
              ) : (
                <>
                  <XCircle className="w-2.5 h-2.5 mr-1" />
                  DÉSACTIVÉ
                </>
              )}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground">{b.quartier}</span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>{b.transactionCount} transactions</span>
            <span
              className="font-semibold"
              style={{ color: "oklch(var(--emerald))" }}
            >
              {formatFCFA(b.totalAmountFCFA)}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
          style={{ background: "oklch(var(--orange) / 0.15)" }}
          data-ocid="boutique.delete_button"
        >
          <Trash2
            className="w-4 h-4"
            style={{ color: "oklch(var(--orange))" }}
          />
        </button>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
          style={{
            background: b.activated
              ? "oklch(var(--orange) / 0.15)"
              : "oklch(var(--emerald) / 0.15)",
            color: b.activated
              ? "oklch(var(--orange))"
              : "oklch(var(--emerald))",
          }}
          data-ocid="boutique.toggle"
        >
          {b.activated ? "Désactiver" : "Activer"}
        </button>
        <button
          type="button"
          onClick={b.tier === "free" ? onUpgrade : onDowngrade}
          className="flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
          style={{
            background: "oklch(var(--navy-light))",
            color: "oklch(var(--foreground))",
          }}
          data-ocid="boutique.tier_toggle"
        >
          {b.tier === "free" ? "→ Premium" : "→ Gratuit"}
        </button>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent
          className="max-w-[340px] rounded-2xl border-0"
          style={{ background: "oklch(var(--navy-card))" }}
          data-ocid="boutique.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Supprimer la boutique ?
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Cette action est irréversible.
          </p>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(false)}
              className="flex-1"
              data-ocid="boutique.cancel_button"
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                setConfirmDelete(false);
                onDelete();
              }}
              className="flex-1"
              style={{ background: "oklch(var(--orange))", color: "white" }}
              data-ocid="boutique.confirm_button"
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export default function SequeControlPage({ onLogout }: Props) {
  const store = useBoutiqueStore();
  const stats = store.getGlobalStats();
  const weeklyData = store.getWeeklyGrowth();

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    quartier: "",
    phone: "",
    tier: "free" as "free" | "premium",
    activated: true,
    transactionCount: 0,
    totalAmountFCFA: 0,
  });

  const resetForm = () =>
    setForm({
      name: "",
      quartier: "",
      phone: "",
      tier: "free",
      activated: true,
      transactionCount: 0,
      totalAmountFCFA: 0,
    });

  const handleAdd = () => {
    if (!form.name.trim()) {
      toast.error("Nom requis");
      return;
    }
    if (!form.quartier.trim()) {
      toast.error("Quartier requis");
      return;
    }
    store.addBoutique({
      ...form,
      phone: form.phone.trim() ? formatPhone242(form.phone.trim()) : "",
    });
    toast.success("Boutique ajoutée !");
    resetForm();
    setShowAdd(false);
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
      color: "var(--yellow)",
    },
    {
      label: "Argent Géré",
      value: formatFCFA(stats.totalAmountFCFA),
      icon: Wallet,
      color: "var(--orange)",
    },
  ];

  return (
    <div
      className="min-h-screen max-w-[480px] mx-auto px-4 pb-10"
      style={{ background: "oklch(var(--navy))" }}
      data-ocid="seque_control.page"
    >
      {/* Header */}
      <header className="flex items-center justify-between py-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "oklch(var(--emerald))" }}
          >
            <Shield
              className="w-5 h-5"
              style={{ color: "oklch(var(--navy))" }}
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
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95"
          style={{
            background: "oklch(var(--navy-card))",
            color: "oklch(var(--muted-foreground))",
          }}
          data-ocid="seque_control.logout_button"
        >
          <LogOut className="w-4 h-4" />
          Quitter
        </button>
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
            style={{ background: "oklch(var(--navy-card))" }}
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

      {/* Growth chart */}
      <div
        className="rounded-2xl p-4 mb-6"
        style={{ background: "oklch(var(--navy-card))" }}
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
                background: "#0f2042",
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

      {/* Add boutique button */}
      <Button
        onClick={() => setShowAdd(true)}
        className="w-full mb-4 rounded-xl py-5 font-bold text-sm"
        style={{
          background: "oklch(var(--emerald))",
          color: "oklch(var(--navy))",
        }}
        data-ocid="seque_control.open_modal_button"
      >
        <Plus className="w-4 h-4 mr-2" />
        Ajouter une Boutique
      </Button>

      {/* Boutiques list */}
      <div className="space-y-3" data-ocid="seque_control.list">
        {store.boutiques.length === 0 ? (
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
          store.boutiques.map((b, i) => (
            <div key={b.id} data-ocid={`seque_control.item.${i + 1}`}>
              <BoutiqueCard
                b={b}
                onToggle={() => {
                  store.toggleActivation(b.id);
                  toast.success(
                    b.activated ? "Boutique désactivée" : "Boutique activée",
                  );
                }}
                onUpgrade={() => {
                  store.upgradeToPremium(b.id);
                  toast.success("Passée en Premium !");
                }}
                onDowngrade={() => {
                  store.downgradeToFree(b.id);
                  toast.info("Repassée en Gratuit");
                }}
                onDelete={() => {
                  store.deleteBoutique(b.id);
                  toast.success("Boutique supprimée");
                }}
              />
            </div>
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
          className="max-w-[420px] rounded-2xl border-0 px-5"
          style={{ background: "oklch(var(--navy-card))" }}
          data-ocid="seque_control.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Nouvelle boutique partenaire
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-muted-foreground text-xs mb-1 block">
                Nom boutique *
              </Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Ex: Boutique Mama Céleste"
                className="border-border text-foreground"
                style={{ background: "oklch(var(--navy-light))" }}
                data-ocid="seque_control.input"
              />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs mb-1 block">
                Quartier *
              </Label>
              <Input
                value={form.quartier}
                onChange={(e) =>
                  setForm((f) => ({ ...f, quartier: e.target.value }))
                }
                placeholder="Ex: Poto-Poto, Brazzaville"
                className="border-border text-foreground"
                style={{ background: "oklch(var(--navy-light))" }}
                data-ocid="seque_control.input"
              />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs mb-1 block">
                Téléphone
              </Label>
              <div className="flex gap-2">
                <span
                  className="text-xs font-bold px-3 py-2 rounded-xl flex-shrink-0"
                  style={{
                    background: "oklch(var(--navy-light))",
                    color: "oklch(var(--emerald))",
                  }}
                >
                  +242
                </span>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="065 000 000"
                  className="border-border text-foreground flex-1"
                  style={{ background: "oklch(var(--navy-light))" }}
                  data-ocid="seque_control.input"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="flex-1 rounded-xl px-3 py-2 flex items-center justify-between"
                style={{ background: "oklch(var(--navy-light))" }}
              >
                <span className="text-xs text-foreground">Abonnement</span>
                <div className="flex gap-1">
                  {(["free", "premium"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, tier: t }))}
                      className="px-2 py-1 rounded-lg text-xs font-bold transition-all"
                      style={{
                        background:
                          form.tier === t
                            ? "oklch(var(--emerald))"
                            : "transparent",
                        color:
                          form.tier === t
                            ? "oklch(var(--navy))"
                            : "oklch(var(--muted-foreground))",
                      }}
                    >
                      {t === "free" ? "Gratuit" : "Premium"}
                    </button>
                  ))}
                </div>
              </div>
              <div
                className="flex-1 rounded-xl px-3 py-2 flex items-center justify-between"
                style={{ background: "oklch(var(--navy-light))" }}
              >
                <span className="text-xs text-foreground">Activée</span>
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, activated: !f.activated }))
                  }
                  className="px-2 py-1 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: form.activated
                      ? "oklch(var(--emerald))"
                      : "oklch(var(--orange) / 0.3)",
                    color: form.activated
                      ? "oklch(var(--navy))"
                      : "oklch(var(--orange))",
                  }}
                  data-ocid="seque_control.toggle"
                >
                  {form.activated ? "Oui" : "Non"}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setShowAdd(false);
              }}
              className="flex-1"
              data-ocid="seque_control.cancel_button"
            >
              Annuler
            </Button>
            <Button
              onClick={handleAdd}
              className="flex-1"
              style={{
                background: "oklch(var(--emerald))",
                color: "oklch(var(--navy))",
              }}
              data-ocid="seque_control.submit_button"
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="text-muted-foreground text-xs mt-10 text-center">
        © {new Date().getFullYear()}. Construit avec ❤️ sur{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          caffeine.ai
        </a>
      </p>
    </div>
  );
}
