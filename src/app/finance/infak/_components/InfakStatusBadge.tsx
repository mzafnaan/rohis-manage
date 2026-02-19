import { CheckCircle, Clock } from "lucide-react";

interface InfakStatusBadgeProps {
  status: "draft" | "completed";
}

export default function InfakStatusBadge({ status }: InfakStatusBadgeProps) {
  const isCompleted = status === "completed";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
        isCompleted
          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
          : "bg-amber-100 text-amber-800 border border-amber-200"
      }`}
    >
      {isCompleted ? (
        <CheckCircle className="w-3 h-3" />
      ) : (
        <Clock className="w-3 h-3" />
      )}
      {isCompleted ? "Selesai" : "Draft"}
    </span>
  );
}
