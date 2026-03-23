import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { savePin } from "../hooks/useAuth";
import { getStoredShopName, saveShopName } from "../hooks/useShopName";

interface Props {
  open: boolean;
  onClose: () => void;
  currentPin: string;
  onShopNameChange?: (name: string) => void;
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

type PinStep = "current" | "new" | "confirm";

export default function SettingsModal({
  open,
  onClose,
  currentPin,
  onShopNameChange,
}: Props) {
  const [shopName, setShopName] = useState(getStoredShopName);

  // PIN flow
  const [pinStep, setPinStep] = useState<PinStep>("current");
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [showPinSection, setShowPinSection] = useState(false);

  if (!open) return null;

  const handleClose = () => {
    setPinStep("current");
    setPin("");
    setNewPin("");
    setPinError("");
    setShowPinSection(false);
    onClose();
  };

  const handleSaveShopName = () => {
    const trimmed = shopName.trim() || "notre boutique";
    saveShopName(trimmed);
    setShopName(trimmed);
    onShopNameChange?.(trimmed);
    toast.success("Nom de boutique enregistré !");
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
      if (pinStep === "current") {
        if (next !== currentPin) {
          setPinError("Code actuel incorrect");
          setTimeout(() => {
            setPin("");
            setPinError("");
          }, 600);
        } else {
          setPinStep("new");
          setPin("");
          setPinError("");
        }
      } else if (pinStep === "new") {
        setNewPin(next);
        setPinStep("confirm");
        setPin("");
        setPinError("");
      } else if (pinStep === "confirm") {
        if (next !== newPin) {
          setPinError("Les codes ne correspondent pas");
          setTimeout(() => {
            setPin("");
            setPinError("");
          }, 600);
        } else {
          savePin(next);
          toast.success("Code PIN modifié avec succès");
          setPinStep("current");
          setPin("");
          setNewPin("");
          setPinError("");
          setShowPinSection(false);
        }
      }
    }
  };

  const pinLabels: Record<PinStep, { title: string; sub: string }> = {
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

  const pinSteps: PinStep[] = ["current", "new", "confirm"];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto"
      style={{ background: "oklch(var(--navy))" }}
      data-ocid="settings.modal"
    >
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-5 flex-shrink-0">
        <button
          type="button"
          onClick={handleClose}
          className="text-muted-foreground"
          data-ocid="settings.close_button"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-foreground">Paramètres</h2>
      </header>

      <div className="px-6 pb-10 space-y-8 max-w-[480px] w-full mx-auto">
        {/* Section 1: Nom de la boutique */}
        <section
          className="rounded-2xl p-5 space-y-4"
          style={{ background: "oklch(var(--navy-card))" }}
          data-ocid="settings.shop_name_section"
        >
          <div>
            <h3 className="text-foreground font-bold text-base">
              Nom de la boutique
            </h3>
            <p className="text-muted-foreground text-xs mt-0.5">
              Ce nom apparaît dans les messages de rappel WhatsApp
            </p>
          </div>
          <Input
            data-ocid="settings.shop_name_input"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="Nom de votre boutique"
            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            style={{ background: "oklch(var(--navy-light))" }}
          />
          <button
            type="button"
            data-ocid="settings.shop_name_save_button"
            onClick={handleSaveShopName}
            className="w-full rounded-xl py-3 font-semibold text-sm transition-all active:scale-95"
            style={{
              background: "oklch(var(--emerald))",
              color: "oklch(var(--navy))",
            }}
          >
            Enregistrer
          </button>
        </section>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Section 2: PIN */}
        <section
          className="rounded-2xl p-5 space-y-4"
          style={{ background: "oklch(var(--navy-card))" }}
          data-ocid="settings.pin_section"
        >
          <div>
            <h3 className="text-foreground font-bold text-base">Code PIN</h3>
            <p className="text-muted-foreground text-xs mt-0.5">
              Protège l'accès Propriétaire
            </p>
          </div>

          {!showPinSection ? (
            <button
              type="button"
              data-ocid="settings.change_pin_button"
              onClick={() => setShowPinSection(true)}
              className="w-full rounded-xl py-3 font-semibold text-sm transition-all active:scale-95"
              style={{
                background: "oklch(var(--orange) / 0.15)",
                color: "oklch(var(--orange))",
              }}
            >
              Modifier le code PIN
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center pt-2"
            >
              <motion.div
                key={pinStep}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
              >
                <h4 className="text-lg font-bold text-foreground">
                  {pinLabels[pinStep].title}
                </h4>
                <p className="text-muted-foreground text-sm mt-1">
                  {pinLabels[pinStep].sub}
                </p>
              </motion.div>

              {/* Steps indicator */}
              <div className="flex gap-2 mb-6">
                {pinSteps.map((s) => (
                  <div
                    key={s}
                    className="h-1.5 w-10 rounded-full transition-all"
                    style={{
                      background:
                        s === pinStep
                          ? "oklch(var(--orange))"
                          : pinSteps.indexOf(pinStep) > pinSteps.indexOf(s)
                            ? "oklch(var(--emerald))"
                            : "oklch(var(--navy-light))",
                    }}
                  />
                ))}
              </div>

              {/* Dots */}
              <motion.div
                animate={pinError ? { x: [-8, 8, -6, 6, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="flex gap-4 mb-3"
              >
                {["d0", "d1", "d2", "d3"].map((id, i) => (
                  <div
                    key={id}
                    className="w-4 h-4 rounded-full transition-all duration-200"
                    style={{
                      background:
                        pin.length > i
                          ? pinError
                            ? "oklch(var(--orange))"
                            : "oklch(var(--emerald))"
                          : "oklch(var(--navy-light))",
                    }}
                  />
                ))}
              </motion.div>

              {pinError ? (
                <p
                  className="text-sm mb-4"
                  style={{ color: "oklch(var(--orange))" }}
                >
                  {pinError}
                </p>
              ) : (
                <div className="h-6 mb-4" />
              )}

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
                {DIGITS.map(({ id, value }) => {
                  if (value === null) return <div key={id} />;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleDigit(value)}
                      className="h-14 rounded-2xl flex items-center justify-center text-xl font-semibold text-foreground transition-all active:scale-90"
                      style={{ background: "oklch(var(--navy-light))" }}
                    >
                      {value === "del" ? <span>⌫</span> : value}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowPinSection(false);
                  setPinStep("current");
                  setPin("");
                  setPinError("");
                }}
                className="mt-4 text-sm text-muted-foreground underline"
                data-ocid="settings.cancel_pin_button"
              >
                Annuler
              </button>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}
