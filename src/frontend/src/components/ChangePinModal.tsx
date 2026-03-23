import { X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { savePin } from "../hooks/useAuth";

interface Props {
  open: boolean;
  onClose: () => void;
  currentPin: string;
}

const DIGITS: Array<{ id: string; value: string | null }> = [
  { id: "1", value: "1" },
  { id: "2", value: "2" },
  { id: "3", value: "3" },
  { id: "4", value: "4" },
  { id: "5", value: "5" },
  { id: "6", value: "6" },
  { id: "7", value: "7" },
  { id: "8", value: "8" },
  { id: "9", value: "9" },
  { id: "empty", value: null },
  { id: "0", value: "0" },
  { id: "del", value: "del" },
];

type Step = "current" | "new" | "confirm";

export default function ChangePinModal({ open, onClose, currentPin }: Props) {
  const [step, setStep] = useState<Step>("current");
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleClose = () => {
    setStep("current");
    setPin("");
    setNewPin("");
    setError("");
    onClose();
  };

  const handleDigit = (d: string) => {
    if (d === "del") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);

    if (next.length === 4) {
      if (step === "current") {
        if (next !== currentPin) {
          setError("Code actuel incorrect");
          setTimeout(() => {
            setPin("");
            setError("");
          }, 600);
        } else {
          setStep("new");
          setPin("");
          setError("");
        }
      } else if (step === "new") {
        setNewPin(next);
        setStep("confirm");
        setPin("");
        setError("");
      } else if (step === "confirm") {
        if (next !== newPin) {
          setError("Les codes ne correspondent pas");
          setTimeout(() => {
            setPin("");
            setError("");
          }, 600);
        } else {
          savePin(next);
          toast.success("Code PIN modifié avec succès");
          handleClose();
        }
      }
    }
  };

  const labels: Record<Step, { title: string; sub: string }> = {
    current: { title: "Code PIN actuel", sub: "Entrez votre code PIN actuel" },
    new: {
      title: "Nouveau code PIN",
      sub: "Choisissez un nouveau code à 4 chiffres",
    },
    confirm: {
      title: "Confirmer le PIN",
      sub: "Saisissez à nouveau le nouveau code",
    },
  };

  const steps: Step[] = ["current", "new", "confirm"];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ background: "oklch(var(--navy))" }}
    >
      <button
        type="button"
        onClick={handleClose}
        className="absolute top-6 left-6 text-muted-foreground"
      >
        <X className="w-6 h-6" />
      </button>

      <motion.div
        key={step}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl font-bold text-foreground">
          {labels[step].title}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">{labels[step].sub}</p>
      </motion.div>

      {/* Steps indicator */}
      <div className="flex gap-2 mb-8">
        {steps.map((s) => (
          <div
            key={s}
            className="h-1.5 w-10 rounded-full transition-all"
            style={{
              background:
                s === step
                  ? "oklch(var(--orange))"
                  : steps.indexOf(step) > steps.indexOf(s)
                    ? "oklch(var(--emerald))"
                    : "oklch(var(--navy-light))",
            }}
          />
        ))}
      </div>

      {/* Dots */}
      <motion.div
        animate={error ? { x: [-8, 8, -6, 6, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="flex gap-4 mb-4"
      >
        {["d0", "d1", "d2", "d3"].map((id, i) => (
          <div
            key={id}
            className="w-4 h-4 rounded-full transition-all duration-200"
            style={{
              background:
                pin.length > i
                  ? error
                    ? "oklch(var(--orange))"
                    : "oklch(var(--emerald))"
                  : "oklch(var(--navy-light))",
            }}
          />
        ))}
      </motion.div>

      {error && (
        <p className="text-sm mb-4" style={{ color: "oklch(var(--orange))" }}>
          {error}
        </p>
      )}
      {!error && <div className="h-6 mb-4" />}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        {DIGITS.map(({ id, value }) => {
          if (value === null) return <div key={id} />;
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleDigit(value)}
              className="h-16 rounded-2xl flex items-center justify-center text-2xl font-semibold text-foreground transition-all active:scale-90"
              style={{ background: "oklch(var(--navy-card))" }}
            >
              {value === "del" ? (
                <span style={{ fontSize: "1.3rem" }}>⌫</span>
              ) : (
                value
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
