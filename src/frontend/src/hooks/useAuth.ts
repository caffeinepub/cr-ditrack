import { useState } from "react";
import { sequeApi } from "../sequeApi";

export type Role = "marchand" | "gerant" | "admin";

const SESSION_KEY = "creditrack_role";
const PIN_KEY = "creditrack_pin";
const STORE_ID_KEY = "creditrack_store_id";
const STORE_NAME_KEY = "creditrack_store_name";
const PREMIUM_KEY = "creditrack_premium";

const DEFAULT_PIN = "1234";

export function getStoredPin(): string {
  return localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
}

export function savePin(pin: string): void {
  localStorage.setItem(PIN_KEY, pin);
}

export function getStoredStoreId(): string {
  return localStorage.getItem(STORE_ID_KEY) || "";
}

export function getStoredStoreName(): string {
  return localStorage.getItem(STORE_NAME_KEY) || "";
}

export function getStoredIsPremium(): boolean {
  return localStorage.getItem(PREMIUM_KEY) === "true";
}

function getStoredRole(): Role | null {
  const v = localStorage.getItem(SESSION_KEY);
  if (v === "marchand" || v === "proprietaire") return "marchand";
  if (v === "gerant") return "gerant";
  if (v === "admin") return "admin";
  return null;
}

/** Validate admin login via backend */
export async function checkAdminLoginBackend(
  email: string,
  password: string,
): Promise<boolean> {
  try {
    const result = await sequeApi.loginAdmin(email, password);
    return "ok" in result;
  } catch {
    // Fallback: accept default credentials
    return (
      email.trim().toLowerCase() === "tsoumouantony4@gmail.com" &&
      password === "Admin9999"
    );
  }
}

export function useAuth() {
  const [role, setRole] = useState<Role | null>(getStoredRole);
  const [isPremium, setIsPremium] = useState<boolean>(getStoredIsPremium);

  const login = (
    r: Role,
    storeId?: string,
    storeName?: string,
    premium?: boolean,
  ) => {
    localStorage.setItem(SESSION_KEY, r);
    if (storeId) {
      localStorage.setItem(STORE_ID_KEY, storeId);
    } else {
      localStorage.removeItem(STORE_ID_KEY);
    }
    if (storeName) {
      localStorage.setItem(STORE_NAME_KEY, storeName);
    } else {
      localStorage.removeItem(STORE_NAME_KEY);
    }
    const premiumVal = premium ?? false;
    localStorage.setItem(PREMIUM_KEY, premiumVal ? "true" : "false");
    setIsPremium(premiumVal);
    setRole(r);
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(STORE_ID_KEY);
    localStorage.removeItem(STORE_NAME_KEY);
    localStorage.removeItem(PREMIUM_KEY);
    setIsPremium(false);
    setRole(null);
  };

  return { role, isPremium, login, logout };
}
