import { Delete, Lock, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
  storedPin: string;
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

export default function PinModal({ onSuccess, onCancel, storedPin }: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const shakeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === storedPin) {
        onSuccess();
      } else {
        setError(true);
        if (shakeRef.current) clearTimeout(shakeRef.current);
        shakeRef.current = setTimeout(() => {
          setPin("");
          setError(false);
        }, 600);
      }
    }
  }, [pin, storedPin, onSuccess]);

  const handleDigit = (d: string) => {
    if (d === "del") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (pin.length < 4) setPin((p) => p + d);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ background: "oklch(var(--navy))" }}
    >
      <button
        type="button"
        onClick={onCancel}
        className="absolute top-6 left-6 text-muted-foreground"
      >
        <X className="w-6 h-6" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="w-16 h-16 rounded-2xl bg-orange flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Code PIN</h2>
        <p className="text-muted-foreground text-sm mt-1">Propriétaire</p>
      </motion.div>

      <motion.div
        animate={error ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="flex gap-4 mb-10"
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
        <AnimatePresence>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm mb-6"
            style={{ color: "oklch(var(--orange))" }}
          >
            Code incorrect, réessayez
          </motion.p>
        </AnimatePresence>
      )}

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
              {value === "del" ? <Delete className="w-6 h-6" /> : value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
