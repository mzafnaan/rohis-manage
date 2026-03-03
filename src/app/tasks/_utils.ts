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
 * Format a Date for display in the task card.
 */
export const formatTaskDate = (date: Date): string => {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/**
 * Capitalize the first letter of a role name for display.
 */
export const capitalizeRole = (role: string): string => {
  return role.charAt(0).toUpperCase() + role.slice(1);
};
