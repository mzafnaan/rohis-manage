import { SummaryCard } from "@/components/finance/SummaryCard";
import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";

interface KasSummaryCardsProps {
  kasBalance: number;
  totalIncome: number;
  totalExpense: number;
}

export default function KasSummaryCards({
  kasBalance,
  totalIncome,
  totalExpense,
}: KasSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SummaryCard
        title="Saldo Kas Utama"
        amount={kasBalance}
        icon={Wallet}
        className="bg-blue-50 text-blue-600"
        delay={0}
      />
      <SummaryCard
        title="Total Pemasukan (Kas Utama)"
        amount={totalIncome}
        icon={ArrowDownCircle}
        className="bg-emerald-50 text-emerald-600"
        delay={0.1}
      />
      <SummaryCard
        title="Total Pengeluaran (Kas Utama)"
        amount={totalExpense}
        icon={ArrowUpCircle}
        className="bg-red-50 text-red-600"
        delay={0.2}
      />
    </div>
  );
}
