import { useState } from "react";

export type Role = "marchand" | "gerant";

const SESSION_KEY = "creditrack_role";
const PIN_KEY = "creditrack_pin";
const DEFAULT_PIN = "1234";

function getStoredRole(): Role | null {
  const v = sessionStorage.getItem(SESSION_KEY);
  // backward compat: treat legacy "proprietaire" as "marchand"
  if (v === "marchand" || v === "proprietaire") return "marchand";
  if (v === "gerant") return "gerant";
  return null;
}

export function getStoredPin(): string {
  return localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
}

export function savePin(pin: string): void {
  localStorage.setItem(PIN_KEY, pin);
}

export function useAuth() {
  const [role, setRole] = useState<Role | null>(getStoredRole);

  const login = (r: Role) => {
    sessionStorage.setItem(SESSION_KEY, r);
    setRole(r);
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setRole(null);
  };

  return { role, login, logout };
}
