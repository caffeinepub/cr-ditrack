import { AlertTriangle, CloudUpload } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

interface Props {
  clientCount: number;
  isPremium: boolean;
}

export default function PaywallBanner({ clientCount, isPremium }: Props) {
  if (isPremium) return null;

  const atLimit = clientCount >= 10;
  const nearLimit = clientCount === 9;

  if (!atLimit && !nearLimit) return null;

  const handleActivate = () => {
    const msg = encodeURIComponent(
      "Bonjour, je souhaite activer Séqué-Cloud Premium à 2 500 FCFA/mois. Merci.",
    );
    window.open(`https://wa.me/242000000000?text=${msg}`, "_blank");
    toast.info("Contactez l'administrateur pour activer votre abonnement.");
  };

  if (nearLimit) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 rounded-xl px-4 py-2.5 mb-3"
        style={{ background: "oklch(var(--yellow) / 0.15)" }}
        data-ocid="paywall.warning_banner"
      >
        <AlertTriangle
          className="w-4 h-4 flex-shrink-0"
          style={{ color: "oklch(var(--yellow))" }}
        />
        <span
          className="text-sm font-semibold"
          style={{ color: "oklch(var(--yellow))" }}
        >
          ⚠️ 9/10 clients — Passez en Premium pour continuer
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 mb-4"
      style={{
        background: "oklch(var(--orange) / 0.15)",
        border: "1px solid oklch(var(--orange) / 0.3)",
      }}
      data-ocid="paywall.limit_banner"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className="w-5 h-5 mt-0.5 flex-shrink-0"
          style={{ color: "oklch(var(--orange))" }}
        />
        <div className="flex-1">
          <p
            className="font-bold text-sm mb-1"
            style={{ color: "oklch(var(--orange))" }}
          >
            Limite atteinte : 10 clients (Version Gratuite)
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Protégez vos données ! Activez le Cloud pour 2 500 FCFA/mois via
            Mobile Money.
          </p>
          <button
            type="button"
            onClick={handleActivate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
            style={{
              background: "oklch(var(--emerald))",
              color: "oklch(var(--navy))",
            }}
            data-ocid="paywall.activate_button"
          >
            <CloudUpload className="w-4 h-4" />
            Activer Séqué-Cloud
          </button>
        </div>
      </div>
    </motion.div>
  );
}
