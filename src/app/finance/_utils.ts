import type { Timestamp } from "firebase/firestore";

export function formatDate(timestamp: Timestamp): string {
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
