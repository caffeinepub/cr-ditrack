import { Status } from "../backend";

export function formatFCFA(amount: number): string {
  return `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(amount)} FCFA`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "\u2014";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function getStatusLabel(status: Status): string {
  switch (status) {
    case Status.pending:
      return "En attente";
    case Status.paid:
      return "Pay\u00e9";
    case Status.overdue:
      return "En retard";
    default:
      return status;
  }
}

export function getStatusClass(status: Status): string {
  switch (status) {
    case Status.pending:
      return "bg-[oklch(0.95_0.05_163)] text-[oklch(0.45_0.14_163)] border-0 font-medium text-xs";
    case Status.paid:
      return "bg-muted text-muted-foreground border-0 font-medium text-xs";
    case Status.overdue:
      return "bg-[oklch(0.95_0.05_50)] text-[oklch(0.50_0.14_45)] border-0 font-medium text-xs";
    default:
      return "bg-muted text-muted-foreground border-0 font-medium text-xs";
  }
}

/**
 * Ensures a phone number starts with +242 (Congo-Brazzaville).
 * Congo numbers start with 0 (e.g. 065123456 → +242065123456).
 */
export function formatPhone242(phone: string): string {
  let cleaned = phone.replace(/\s+/g, "");
  if (cleaned.startsWith("+242")) return cleaned;
  if (cleaned.startsWith("00242")) return `+${cleaned.slice(2)}`;
  if (cleaned.startsWith("242")) return `+${cleaned}`;
  // Keep leading zero — Congo numbers start with 0 (e.g. 065123456 → +242065123456)
  return `+242${cleaned}`;
}
