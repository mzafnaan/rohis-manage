import type { Timestamp } from "firebase/firestore";

export function formatDateShort(timestamp: Timestamp): string {
  if (!timestamp) return "-";
  try {
    const date = timestamp.toDate();
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

export function formatDateLong(timestamp: Timestamp): string {
  if (!timestamp) return "-";
  try {
    const date = timestamp.toDate();
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}
