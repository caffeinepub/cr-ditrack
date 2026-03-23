import { useEffect, useRef, useState } from "react";
import type { Client, PersonalReminder, Transaction } from "./useStore";

interface Props {
  clients: Client[];
  transactions: Transaction[];
  personalReminders: PersonalReminder[];
  markReminderFired: (id: string) => void;
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

export function useReminderScheduler({
  clients,
  transactions,
  personalReminders,
  markReminderFired,
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
  clientsRef.current = clients;
  transactionsRef.current = transactions;
  personalRemindersRef.current = personalReminders;
  markReminderFiredRef.current = markReminderFired;

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const today = now.toISOString().split("T")[0];

      // Check transaction-linked reminders
      for (const tx of transactionsRef.current) {
        if (tx.type !== "dette" || !tx.reminderTime) continue;
        if (tx.reminderTime !== currentTime) continue;

        const client = clientsRef.current.find((c) => c.id === tx.clientId);
        if (!client) continue;

        const balance = getClientBalance(tx.clientId, transactionsRef.current);
        if (balance <= 0) continue;

        const sessionKey = `reminder_sent_${tx.clientId}_${today}_${currentTime}`;
        if (sessionStorage.getItem(sessionKey)) continue;

        const msg = `Bonjour ${client.name}, il est ${currentTime}, votre solde impayé est de ${formatFCFA(balance)}. Merci de régulariser. — CrédiTrack`;
        const encodedMsg = encodeURIComponent(msg);
        const phone = client.phone.replace(/\s+/g, "");
        const smsUrl = `sms:${phone}?body=${encodedMsg}`;

        if (
          typeof Notification !== "undefined" &&
          Notification.permission === "granted"
        ) {
          const notif = new Notification("📩 Rappel CrédiTrack", {
            body: `${client.name} — ${formatFCFA(balance)} impayé`,
            icon: "/favicon.ico",
          });
          notif.onclick = () => {
            const a = document.createElement("a");
            a.href = smsUrl;
            a.target = "_blank";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          };
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

      // Check personal reminders
      for (const reminder of personalRemindersRef.current) {
        if (reminder.fired) continue;

        const isOverdue = reminder.reminderDate < today;
        const isDueNow =
          reminder.reminderDate === today &&
          reminder.reminderTime === currentTime;

        if (!isOverdue && !isDueNow) continue;

        // For overdue: fire immediately (once per session)
        const sessionKey = `personal_reminder_${reminder.id}_fired`;
        if (sessionStorage.getItem(sessionKey)) continue;

        const client = reminder.clientId
          ? clientsRef.current.find((c) => c.id === reminder.clientId)
          : null;

        let body = reminder.title;
        if (client) body += ` — Client: ${client.name}`;
        if (reminder.note) body += `\n${reminder.note}`;

        if (
          typeof Notification !== "undefined" &&
          Notification.permission === "granted"
        ) {
          new Notification("🔔 Rappel Personnel", {
            body,
            icon: "/favicon.ico",
          });
        }

        sessionStorage.setItem(sessionKey, "1");
        markReminderFiredRef.current(reminder.id);
      }
    };

    // Check immediately, then every 60 seconds
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, []);

  const scheduledCount = transactions.filter((tx) => {
    if (tx.type !== "dette" || !tx.reminderTime) return false;
    const balance = getClientBalance(tx.clientId, transactions);
    return balance > 0;
  }).length;

  return { notifPermission, scheduledCount };
}
