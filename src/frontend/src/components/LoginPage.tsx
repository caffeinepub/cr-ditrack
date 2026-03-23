import { Crown, UserRound } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Role } from "../hooks/useAuth";
import { getStoredPin } from "../hooks/useAuth";
import PinModal from "./PinModal";

interface Props {
  onLogin: (role: Role) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [showPin, setShowPin] = useState(false);

  return (
    <>
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: "oklch(var(--navy))" }}
        data-ocid="login.page"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 rounded-2xl bg-emerald flex items-center justify-center mx-auto mb-4 shadow-glow">
            <span className="text-3xl font-bold text-navy">CT</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            CrédiTrack
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Gestion de crédit client hors-ligne
          </p>
        </motion.div>

        {/* Role cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-sm space-y-4"
        >
          <p className="text-center text-muted-foreground text-sm mb-6">
            Choisissez votre profil
          </p>

          <button
            type="button"
            data-ocid="login.marchand_button"
            onClick={() => setShowPin(true)}
            className="w-full rounded-2xl p-6 flex items-center gap-4 transition-all active:scale-95"
            style={{ background: "oklch(var(--navy-card))" }}
          >
            <div className="w-14 h-14 rounded-xl bg-orange flex items-center justify-center flex-shrink-0">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <div className="text-foreground font-bold text-xl">Marchand</div>
              <div className="text-muted-foreground text-sm mt-0.5">
                Accès complet — stats & rapports
              </div>
            </div>
          </button>

          <button
            type="button"
            data-ocid="login.gerant_button"
            onClick={() => onLogin("gerant")}
            className="w-full rounded-2xl p-6 flex items-center gap-4 transition-all active:scale-95"
            style={{ background: "oklch(var(--navy-light))" }}
          >
            <div className="w-14 h-14 rounded-xl bg-emerald flex items-center justify-center flex-shrink-0">
              <UserRound className="w-7 h-7 text-navy" />
            </div>
            <div className="text-left">
              <div className="text-foreground font-bold text-xl">Gérant</div>
              <div className="text-muted-foreground text-sm mt-0.5">
                Ventes & paiements uniquement
              </div>
            </div>
          </button>
        </motion.div>

        <p className="text-muted-foreground text-xs mt-12 text-center">
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

      {showPin && (
        <PinModal
          storedPin={getStoredPin()}
          onSuccess={() => {
            setShowPin(false);
            onLogin("marchand");
          }}
          onCancel={() => setShowPin(false)}
        />
      )}
    </>
  );
}
