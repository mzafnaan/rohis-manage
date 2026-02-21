import { Transaction } from "@/types/finance";
import type { Timestamp } from "firebase/firestore";
import { Edit, Search, Trash2, Wallet } from "lucide-react";

interface TransactionTableProps {
  transactions: Transaction[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isBendahara: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  formatDate: (timestamp: Timestamp) => string;
}

export default function TransactionTable({
  transactions,
  searchTerm,
  onSearchChange,
  isBendahara,
  onEdit,
  onDelete,
  formatDate,
}: TransactionTableProps) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200/50 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/50">
        <h2 className="text-xl font-bold text-gray-800">Riwayat Transaksi</h2>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all bg-gray-50/50 focus:bg-white"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4">Keterangan</th>
              <th className="px-6 py-4">Dana</th>
              <th className="px-6 py-4">Jenis</th>
              <th className="px-6 py-4">Nominal</th>
              {isBendahara && <th className="px-6 py-4 text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-gray-400" />
                    </div>
                    <p>Belum ada transaksi</p>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-gray-50/80 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(t.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {t.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        t.fundType === "infak"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {t.fundType === "infak" ? "Infak" : "Kas"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        t.type === "income"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}
                    >
                      {t.type === "income" ? "Pemasukan" : "Pengeluaran"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                    <span
                      className={
                        t.type === "income"
                          ? "text-emerald-600"
                          : "text-red-600"
                      }
                    >
                      {t.type === "income" ? "+" : "-"} Rp{" "}
                      {t.amount.toLocaleString("id-ID")}
                    </span>
                  </td>
                  {isBendahara && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(t)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(t.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
