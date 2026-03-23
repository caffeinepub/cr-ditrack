import { useState } from "react";

export type Role = "marchand" | "gerant" | "admin";

const SESSION_KEY = "creditrack_role";
const PIN_KEY = "creditrack_pin";
const ADMIN_PIN_KEY = "seque_admin_pin";
const DEFAULT_PIN = "1234";
const DEFAULT_ADMIN_PIN = "9999";

function getStoredRole(): Role | null {
  const v = sessionStorage.getItem(SESSION_KEY);
  if (v === "marchand" || v === "proprietaire") return "marchand";
  if (v === "gerant") return "gerant";
  if (v === "admin") return "admin";
  return null;
}

export function getStoredPin(): string {
  return localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
}

export function savePin(pin: string): void {
  localStorage.setItem(PIN_KEY, pin);
}

export function getStoredAdminPin(): string {
  return localStorage.getItem(ADMIN_PIN_KEY) || DEFAULT_ADMIN_PIN;
}

export function setStoredAdminPin(pin: string): void {
  localStorage.setItem(ADMIN_PIN_KEY, pin);
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
