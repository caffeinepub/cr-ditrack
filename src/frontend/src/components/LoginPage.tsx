import { Shield } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import type { Role } from "../hooks/useAuth";
import { checkAdminLoginBackend } from "../hooks/useAuth";
import { getStoredPin } from "../hooks/useAuth";
import { sequeApi } from "../sequeApi";
import PinModal from "./PinModal";

interface Props {
  onLogin: (
    role: Role,
    storeId?: string,
    storeName?: string,
    premium?: boolean,
  ) => void;
}

type PinTarget = "marchand" | "gerant" | null;

const OTP_POSITIONS = ["p0", "p1", "p2", "p3", "p4", "p5"] as const;
type OtpPos = (typeof OTP_POSITIONS)[number];

export default function LoginPage({ onLogin }: Props) {
  const [pinTarget, setPinTarget] = useState<PinTarget>(null);
  const [digits, setDigits] = useState<Record<OtpPos, string>>({
    p0: "",
    p1: "",
    p2: "",
    p3: "",
    p4: "",
    p5: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingRole, setPendingRole] = useState<"marchand" | "gerant" | null>(
    null,
  );
  const [pendingStoreData, setPendingStoreData] = useState<{
    storeId: string;
    storeName: string;
    premium: boolean;
  } | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [_tapCount, setTapCount] = useState(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRefs = useRef<Record<OtpPos, HTMLInputElement | null>>({
    p0: null,
    p1: null,
    p2: null,
    p3: null,
    p4: null,
    p5: null,
  });

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);

  const storedPin = getStoredPin();
  const accessCode = OTP_POSITIONS.map((p) => digits[p]).join("");
  const isCodeComplete = accessCode.length === 6;

  const handleLogoTap = () => {
    setTapCount((prev) => {
      const next = prev + 1;
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      if (next >= 3) {
        setShowAdmin(true);
        return 0;
      }
      tapTimerRef.current = setTimeout(() => setTapCount(0), 1000);
      return next;
    });
  };

  const handleDigitChange = (pos: OtpPos, val: string) => {
    const clean = val.replace(/\D/g, "").slice(-1);
    setDigits((prev) => ({ ...prev, [pos]: clean }));
    setError("");
    if (clean) {
      const idx = OTP_POSITIONS.indexOf(pos);
      const next = OTP_POSITIONS[idx + 1];
      if (next) inputRefs.current[next]?.focus();
    }
  };

  const handleKeyDown = (
    pos: OtpPos,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !digits[pos]) {
      const idx = OTP_POSITIONS.indexOf(pos);
      const prev = OTP_POSITIONS[idx - 1];
      if (prev) {
        setDigits((d) => ({ ...d, [prev]: "" }));
        inputRefs.current[prev]?.focus();
      }
    }
  };

  const handleConnect = async (role: "marchand" | "gerant") => {
    if (!isCodeComplete || loading) return;
    setLoading(true);
    setError("");
    try {
      const result = await sequeApi.loginBoutique(accessCode);
      if ("notFound" in result) {
        setError("Code d'accès invalide. Vérifiez votre code.");
        setLoading(false);
        return;
      }
      if ("disabled" in result) {
        setError("Cette boutique est désactivée. Contactez l'administrateur.");
        setLoading(false);
        return;
      }
      if ("ok" in result) {
        const { storeId, nom, premium } = result.ok;
        setPendingStoreData({ storeId, storeName: nom, premium });
        setPendingRole(role);
        setPinTarget(role);
      }
    } catch {
      setError("Erreur de connexion. Vérifiez votre connexion internet.");
    }
    setLoading(false);
  };

  const handleAdminLogin = async () => {
    setAdminError("");
    setAdminLoading(true);
    try {
      const ok = await checkAdminLoginBackend(adminEmail, adminPassword);
      if (ok) {
        onLogin("admin");
      } else {
        setAdminError("Identifiants incorrects.");
      }
    } catch {
      setAdminError("Erreur de connexion.");
    }
    setAdminLoading(false);
  };

  return (
    <>
      <div
        className="min-h-screen flex flex-col items-center justify-between px-4 py-8"
        style={{ background: "oklch(var(--forest))" }}
      >
        {/* Admin button */}
        <div className="w-full flex justify-start h-8">
          <AnimatePresence>
            {showAdmin && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={() => setShowAdminForm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{
                  background: "oklch(var(--gold) / 0.15)",
                  color: "oklch(var(--gold))",
                  border: "1px solid oklch(var(--gold) / 0.3)",
                }}
                data-ocid="login.admin_button"
              >
                <Shield className="w-3 h-3" />
                Admin
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center gap-6 w-full max-w-sm flex-1 justify-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <button
              type="button"
              onClick={handleLogoTap}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl font-black text-3xl mb-4 select-none"
              style={{
                background: "oklch(var(--gold))",
                color: "oklch(var(--forest))",
              }}
            >
              SQ
            </button>
            <h1
              className="text-2xl font-black tracking-tight"
              style={{ color: "oklch(var(--foreground))" }}
            >
              SÉQUÉ-APP
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gestion des crédits clients
            </p>
            <div className="flex justify-center gap-1 mt-3">
              <span
                className="w-6 h-1 rounded-full"
                style={{ background: "oklch(var(--emerald))" }}
              />
              <span
                className="w-6 h-1 rounded-full"
                style={{ background: "oklch(var(--yellow))" }}
              />
              <span
                className="w-6 h-1 rounded-full"
                style={{ background: "oklch(var(--orange))" }}
              />
            </div>
          </motion.div>

          {/* OTP input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-sm"
          >
            <div
              className="rounded-2xl p-6 space-y-5"
              style={{ background: "oklch(var(--forest-card))" }}
            >
              <div>
                <p className="text-sm font-semibold text-foreground mb-3 text-center">
                  Code d'accès boutique
                </p>
                <div className="flex gap-2 justify-center">
                  {OTP_POSITIONS.map((pos) => {
                    const digit = digits[pos];
                    return (
                      <input
                        key={pos}
                        ref={(el) => {
                          inputRefs.current[pos] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(pos, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(pos, e)}
                        className="w-11 h-14 text-center text-xl font-bold rounded-xl outline-none transition-all"
                        style={{
                          background: "oklch(var(--forest-light))",
                          border: digit
                            ? "2px solid oklch(var(--gold))"
                            : "2px solid oklch(var(--border))",
                          color: "oklch(var(--foreground))",
                        }}
                        onFocus={(e) => {
                          e.target.style.border =
                            "2px solid oklch(var(--emerald))";
                        }}
                        onBlur={(e) => {
                          e.target.style.border = digit
                            ? "2px solid oklch(var(--gold))"
                            : "2px solid oklch(var(--border))";
                        }}
                        data-ocid={pos === "p0" ? "login.input" : undefined}
                      />
                    );
                  })}
                </div>
                <p className="text-muted-foreground text-xs text-center mt-2">
                  Entrez votre code à 6 chiffres
                </p>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-medium text-center"
                  style={{ color: "oklch(var(--orange))" }}
                  data-ocid="login.error_state"
                >
                  {error}
                </motion.p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleConnect("marchand")}
                  disabled={!isCodeComplete || loading}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-40"
                  style={{
                    background: "oklch(var(--gold))",
                    color: "oklch(var(--forest))",
                  }}
                  data-ocid="login.marchand_button"
                >
                  {loading ? "..." : "Connexion Marchand"}
                </button>
                <button
                  type="button"
                  onClick={() => handleConnect("gerant")}
                  disabled={!isCodeComplete || loading}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-40"
                  style={{
                    background: "oklch(var(--emerald))",
                    color: "oklch(var(--forest))",
                  }}
                  data-ocid="login.gerant_button"
                >
                  {loading ? "..." : "Connexion Gérant"}
                </button>
              </div>
            </div>

            <p className="text-muted-foreground text-xs text-center mt-4">
              Votre code d'accès vous est fourni par votre administrateur
            </p>
          </motion.div>
        </div>

        <p className="text-muted-foreground text-xs mt-6 mb-4 text-center">
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

      {/* Admin login modal */}
      <AnimatePresence>
        {showAdminForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowAdminForm(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="w-full max-w-sm rounded-2xl p-6 space-y-4"
              style={{ background: "oklch(var(--forest-card))" }}
              data-ocid="login.dialog"
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "oklch(var(--gold))" }}
                >
                  <Shield
                    className="w-5 h-5"
                    style={{ color: "oklch(var(--forest))" }}
                  />
                </div>
                <div>
                  <h2 className="text-base font-black text-foreground">
                    Accès Maître
                  </h2>
                  <p className="text-muted-foreground text-xs">SÉQUÉ-CONTROL</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="admin-email"
                    className="text-muted-foreground text-xs mb-1 block font-medium"
                  >
                    Adresse e-mail
                  </label>
                  <input
                    id="admin-email"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => {
                      setAdminEmail(e.target.value);
                      setAdminError("");
                    }}
                    placeholder="tsoumouantony4@gmail.com"
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "oklch(var(--forest-light))",
                      border: "1px solid oklch(var(--border))",
                      color: "oklch(var(--foreground))",
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAdminLogin();
                    }}
                    data-ocid="login.input"
                  />
                </div>
                <div>
                  <label
                    htmlFor="admin-password"
                    className="text-muted-foreground text-xs mb-1 block font-medium"
                  >
                    Mot de passe
                  </label>
                  <input
                    id="admin-password"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setAdminError("");
                    }}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "oklch(var(--forest-light))",
                      border: "1px solid oklch(var(--border))",
                      color: "oklch(var(--foreground))",
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAdminLogin();
                    }}
                    data-ocid="login.input"
                  />
                </div>
              </div>

              {adminError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-medium text-center"
                  style={{ color: "oklch(var(--orange))" }}
                  data-ocid="login.error_state"
                >
                  {adminError}
                </motion.p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminForm(false);
                    setAdminEmail("");
                    setAdminPassword("");
                    setAdminError("");
                  }}
                  className="flex-1 py-3 rounded-xl font-bold text-sm transition-all"
                  style={{
                    background: "oklch(var(--forest-light))",
                    color: "oklch(var(--muted-foreground))",
                  }}
                  data-ocid="login.cancel_button"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleAdminLogin}
                  disabled={adminLoading}
                  className="flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-60"
                  style={{
                    background: "oklch(var(--gold))",
                    color: "oklch(var(--forest))",
                  }}
                  data-ocid="login.submit_button"
                >
                  {adminLoading ? "..." : "Connexion Admin"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {pinTarget && (
        <PinModal
          storedPin={storedPin}
          onSuccess={() => {
            setPinTarget(null);
            if (pendingRole && pendingStoreData) {
              onLogin(
                pendingRole,
                pendingStoreData.storeId,
                pendingStoreData.storeName,
                pendingStoreData.premium,
              );
              setPendingRole(null);
              setPendingStoreData(null);
            }
          }}
          onCancel={() => {
            setPinTarget(null);
            setPendingRole(null);
            setPendingStoreData(null);
          }}
        />
      )}
    </>
  );
}
