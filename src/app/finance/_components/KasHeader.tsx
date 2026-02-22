import { FileText, Plus, Wallet } from "lucide-react";
import Link from "next/link";

interface KasHeaderProps {
  isBendahara: boolean;
  onAddTransaction: () => void;
}

export default function KasHeader({
  isBendahara,
  onAddTransaction,
}: KasHeaderProps) {
  const now = new Date();
  const bulan = now.getMonth() + 1;
  const tahun = now.getFullYear();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Wallet className="w-8 h-8 text-emerald-600" />
          Kas &amp; Keuangan
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Kelola pemasukan dan pengeluaran kas organisasi
        </p>
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        <Link
          href={`/laporan/kas?bulan=${bulan}&tahun=${tahun}`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm flex-1 md:flex-none"
        >
          <FileText className="w-4 h-4" />
          Cetak Laporan
        </Link>
        {isBendahara && (
          <button
            onClick={onAddTransaction}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm shadow-sm flex-1 md:flex-none"
          >
            <Plus className="w-4 h-4" />
            Tambah Transaksi
          </button>
        )}
      </div>
    </div>
  );
}
