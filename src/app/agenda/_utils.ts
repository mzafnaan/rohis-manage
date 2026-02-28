import type { Timestamp } from "firebase/firestore";

/**
 * Safely convert a Firestore Timestamp or Date to a JS Date.
 */
export const getAgendaDate = (timestamp: Timestamp | Date): Date => {
  return "toDate" in timestamp
    ? (timestamp as Timestamp).toDate()
    : new Date(timestamp);
};

/**
 * Format a Date using native Intl to avoid eagerly loading date-fns.
 */
export const formatDate = (date: Date, fmt: string): string => {
  if (fmt === "MMM") {
    return date.toLocaleDateString("id-ID", { month: "short" }).toUpperCase();
  }
  if (fmt === "dd") {
    return date.toLocaleDateString("id-ID", { day: "2-digit" });
  }
  if (fmt === "yyyy") {
    return date.getFullYear().toString();
  }
  if (fmt === "full") {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  if (fmt === "short") {
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return date.toLocaleDateString("id-ID");
};
