import { InfakSession } from "@/types/finance";
import { Timestamp } from "firebase/firestore";
import { Calendar, HeartHandshake, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import InfakStatusBadge from "./InfakStatusBadge";

interface InfakSessionTableProps {
  sessions: InfakSession[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isBendahara: boolean;
  onDelete: (id: string, status: string) => void;
  formatDate: (timestamp: Timestamp) => string;
}

export default function InfakSessionTable({
  sessions,
  searchTerm,
  onSearchChange,
  isBendahara,
  onDelete,
  formatDate,
}: InfakSessionTableProps) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200/50 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/50">
        <h2 className="text-xl font-bold text-gray-800">Daftar Sesi Infak</h2>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari sesi..."
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
              <th className="px-6 py-4">Judul Sesi</th>
              <th className="px-6 py-4">Total Terkumpul</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sessions.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <HeartHandshake className="w-6 h-6 text-gray-400" />
                    </div>
                    <p>Belum ada sesi infak</p>
                  </div>
                </td>
              </tr>
            ) : (
              sessions.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-gray-50/80 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(s.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {s.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">
                    Rp {s.total.toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <InfakStatusBadge status={s.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/finance/infak/${s.id}`}
                        className="text-emerald-600 hover:text-emerald-900 font-bold hover:underline"
                      >
                        Detail
                      </Link>
                      {isBendahara && (
                        <button
                          onClick={() => onDelete(s.id, s.status)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Hapus Sesi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
