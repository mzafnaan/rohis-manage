import { InfakSession } from "@/types/finance";
import { CheckCircle } from "lucide-react";

interface SessionInfoProps {
  session: InfakSession;
}

export default function SessionInfo({ session }: SessionInfoProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-gray-200/50">
        <h3 className="font-bold text-gray-900 mb-4">Informasi Sesi</h3>
        <div className="space-y-4 text-sm">
          <div>
            <span className="block text-gray-400 text-xs mb-1">ID Sesi</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono text-xs block truncate">
              {session.id}
            </code>
          </div>
          <div>
            <span className="block text-gray-400 text-xs mb-1">
              Dibuat Oleh
            </span>
            <span className="text-gray-700 font-medium block">
              {session.createdByName || session.createdBy || "-"}
            </span>
          </div>
          <div>
            <span className="block text-gray-400 text-xs mb-1">Status</span>
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                session.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {session.status === "completed" ? "SUDAH FINAL" : "DRAFT"}
            </span>
          </div>
          {session.transactionId && (
            <div>
              <span className="block text-gray-400 text-xs mb-1">
                ID Transaksi
              </span>
              <code className="bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono text-xs block truncate">
                {session.transactionId}
              </code>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100">
        <h4 className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Panduan
        </h4>
        <ul className="text-xs text-blue-700/80 space-y-2 list-disc list-inside">
          <li>
            Isi judul dengan format yang jelas (misal: &quot;Infak Jumat 17
            Feb&quot;).
          </li>
          <li>Tambahkan kelas satu per satu.</li>
          <li>
            Klik <strong>Simpan Draft</strong> jika belum selesai.
          </li>
          <li>
            Klik <strong>Finalisasi</strong> jika semua data sudah benar.
          </li>
        </ul>
      </div>
    </div>
  );
}
