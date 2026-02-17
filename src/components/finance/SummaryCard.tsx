import React from "react";

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: React.ElementType;
  className?: string; // Expect full class strings for flexibility
  delay?: number;
}

export const SummaryCard = ({
  title,
  amount,
  icon: Icon,
  className = "bg-emerald-50 text-emerald-600",
  delay = 0,
}: SummaryCardProps) => (
  <div
    className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-100/50 flex items-center gap-5 hover:shadow-md transition-shadow group animate-fadeInUp"
    style={{ animationDelay: `${delay}s` }}
  >
    <div
      className={`p-4 rounded-2xl bg-opacity-10 group-hover:scale-110 transition-transform duration-300 ${className}`}
    >
      <Icon className="w-8 h-8" />
    </div>
    <div>
      <p className="text-sm font-semibold text-gray-400 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
        Rp {amount.toLocaleString("id-ID")}
      </h3>
    </div>
  </div>
);
