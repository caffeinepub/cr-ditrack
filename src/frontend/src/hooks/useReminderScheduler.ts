import { useEffect, useRef, useState } from "react";
import type { Client, PersonalReminder, Transaction } from "./useBackendStore";

interface Props {
  clients: Client[];
  transactions: Transaction[];
  personalReminders: PersonalReminder[];
  markReminderFired: (id: string) => void;
  shopName?: string;
}

function formatFCFA(amount: number) {
  return `${new Intl.NumberFormat("fr-FR").format(amount)} FCFA`;
}

function getClientBalance(clientId: string, transactions: Transaction[]) {
  return transactions
    .filter((t) => t.clientId === clientId)
    .reduce(
      (sum, t) => (t.type === "dette" ? sum + t.amount : sum - t.amount),
      0,
    );
}

function buildWhatsAppUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/\s+/g, "").replace("+", "");
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

function safeNotify(
  title: string,
  options: NotificationOptions,
  onClick?: () => void,
) {
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  try {
    const notif = new Notification(title, options);
    if (onClick) notif.onclick = onClick;
  } catch {
    /* notifications non supportées sur cet appareil */
  }
}

export function useReminderScheduler({
  clients,
  transactions,
  personalReminders,
  markReminderFired,
  shopName = "SÉQUÉ-APP",
}: Props) {
  const [notifPermission, setNotifPermission] =
    useState<NotificationPermission>(
      typeof Notification !== "undefined" ? Notification.permission : "denied",
    );

  // Request permission on mount
  useEffect(() => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      Notification.requestPermission().then((perm) => {
        setNotifPermission(perm);
      });
    }
  }, []);

  // Keep refs so the interval always uses the latest data
  const clientsRef = useRef(clients);
  const transactionsRef = useRef(transactions);
  const personalRemindersRef = useRef(personalReminders);
  const markReminderFiredRef = useRef(markReminderFired);
  const shopNameRef = useRef(shopName);
  clientsRef.current = clients;
  transactionsRef.current = transactions;
  personalRemindersRef.current = personalReminders;
  markReminderFiredRef.current = markReminderFired;
  shopNameRef.current = shopName;

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const today = now.toISOString().split("T")[0];
      const hour = now.getHours();
      const minute = now.getMinutes();
      const isMorningCheck = hour === 8 && minute <= 5;

      // ========== DEBT DUE DATE REMINDERS ==========
      const clientsWithDueDettesToday = new Set<string>();
      for (const tx of transactionsRef.current) {
        if (tx.type !== "dette") continue;
        if (tx.dueDate !== today) continue;
        clientsWithDueDettesToday.add(tx.clientId);
      }

      for (const clientId of clientsWithDueDettesToday) {
        const balance = getClientBalance(clientId, transactionsRef.current);
        if (balance <= 0) continue;

        const client = clientsRef.current.find((c) => c.id === clientId);
        if (!client) continue;

        const sessionKey = `debt_due_notif_${clientId}_${today}`;
        if (sessionStorage.getItem(sessionKey)) continue;

        if (!isMorningCheck) {
          const startupKey = `debt_due_startup_${clientId}_${today}`;
          if (sessionStorage.getItem(startupKey)) continue;
          sessionStorage.setItem(startupKey, "1");
        } else {
          sessionStorage.setItem(sessionKey, "1");
        }

        const message = `🔔 Rappel : ${client.name} doit régler ${formatFCFA(balance)} aujourd'hui. Cliquez pour envoyer le rappel WhatsApp.`;
        const waMsg = `Bonjour ${client.name}, votre dette de ${formatFCFA(balance)} arrive à échéance aujourd'hui. Merci de passer régler. — ${shopNameRef.current}`;
        const waUrl = buildWhatsAppUrl(client.phone, waMsg);

        safeNotify(
          "🔔 Rappel Dette — SÉQUÉ-APP",
          { body: message, icon: "/favicon.ico", tag: `debt_due_${clientId}` },
          () => window.open(waUrl, "_blank"),
        );
      }

      // ========== TIME-BASED TRANSACTION REMINDERS ==========
      for (const tx of transactionsRef.current) {
        if (tx.type !== "dette" || !tx.reminderTime) continue;
        if (tx.reminderTime !== currentTime) continue;

        const client = clientsRef.current.find((c) => c.id === tx.clientId);
        if (!client) continue;

        const balance = getClientBalance(tx.clientId, transactionsRef.current);
        if (balance <= 0) continue;

        const sessionKey = `reminder_sent_${tx.clientId}_${today}_${currentTime}`;
        if (sessionStorage.getItem(sessionKey)) continue;

        const waMsg = `Bonjour ${client.name}, votre solde chez ${shopNameRef.current} est de ${formatFCFA(balance)} FCFA. Merci de passer régler. Séqué-App vous remercie !`;
        const waUrl = buildWhatsAppUrl(client.phone, waMsg);
        const phone = client.phone.replace(/\s+/g, "");
        const smsMsg = `Bonjour ${client.name}, il est ${currentTime}, votre solde impayé est de ${formatFCFA(balance)}. Merci de régulariser. — SÉQUÉ-APP`;
        const smsUrl = `sms:${phone}?body=${encodeURIComponent(smsMsg)}`;

        if (
          typeof Notification !== "undefined" &&
          Notification.permission === "granted"
        ) {
          safeNotify(
            "📩 Rappel SÉQUÉ-APP",
            {
              body: `${client.name} — ${formatFCFA(balance)} impayé`,
              icon: "/favicon.ico",
            },
            () => window.open(waUrl, "_blank"),
          );
        } else {
          const a = document.createElement("a");
          a.href = smsUrl;
          a.target = "_blank";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }

        sessionStorage.setItem(sessionKey, "1");
      }

      // ========== PERSONAL REMINDERS ==========
      for (const reminder of personalRemindersRef.current) {
        if (reminder.fired) continue;

        const isOverdue = reminder.reminderDate < today;
        const isDueNow =
          reminder.reminderDate === today &&
          reminder.reminderTime === currentTime;

        if (!isOverdue && !isDueNow) continue;

        const sessionKey = `personal_reminder_${reminder.id}_fired`;
        if (sessionStorage.getItem(sessionKey)) continue;

        const client = reminder.clientId
          ? clientsRef.current.find((c) => c.id === reminder.clientId)
          : null;

        let body = reminder.title;
        if (client) body += ` — Client: ${client.name}`;
        if (reminder.note) body += `\n${reminder.note}`;

        safeNotify("🔔 Rappel Personnel", { body, icon: "/favicon.ico" });

        sessionStorage.setItem(sessionKey, "1");
        markReminderFiredRef.current(reminder.id);
      }
    };

    // Check immediately (startup check for due debts), then every 60 seconds
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, []);

  const scheduledCount = transactions.filter((tx) => {
    if (tx.type !== "dette" || !tx.reminderTime) return false;
    const balance = getClientBalance(tx.clientId, transactions);
    return balance > 0;
  }).length;

  const dueTodayCount = (() => {
    const today = new Date().toISOString().split("T")[0];
    const clientsDue = new Set<string>();
    for (const tx of transactions) {
      if (tx.type === "dette" && tx.dueDate === today) {
        const balance = getClientBalance(tx.clientId, transactions);
        if (balance > 0) clientsDue.add(tx.clientId);
      }
    }
    return clientsDue.size;
  })();

  return { notifPermission, scheduledCount, dueTodayCount };
}
