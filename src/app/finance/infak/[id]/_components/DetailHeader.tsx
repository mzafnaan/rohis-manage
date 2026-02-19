import { InfakSession } from "@/types/finance";
import type { Timestamp } from "firebase/firestore";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  Lock,
  Save,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import InfakStatusBadge from "../../_components/InfakStatusBadge";

interface DetailHeaderProps {
  session: InfakSession;
  canEdit: boolean;
  isBendahara: boolean;
  saving: boolean;
  onSaveDraft: () => void;
  onFinalize: () => void;
  onDelete: () => void;
  formatDate: (timestamp: Timestamp) => string;
}

export default function DetailHeader({
  session,
  canEdit,
  isBendahara,
  saving,
  onSaveDraft,
  onFinalize,
  onDelete,
  formatDate,
}: DetailHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Link
          href="/finance/infak"
          className="p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Detail Sesi Infak
            </h1>
            <InfakStatusBadge status={session.status} />
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            {formatDate(session.date)}
          </div>
        </div>
      </div>

      {canEdit ? (
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={onSaveDraft}
            disabled={saving}
            className="flex-1 md:flex-none px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Simpan Draft
          </button>
          <button
            onClick={onFinalize}
            disabled={saving}
            className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm flex items-center justify-center gap-2 shadow-sm shadow-emerald-200"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Finalisasi
          </button>
        </div>
      ) : (
        session.status === "completed" && (
          <div className="flex gap-3">
            <div className="bg-gray-50 px-4 py-2 rounded-xl text-xs text-gray-500 flex items-center gap-2 border border-gray-100">
              <Lock className="w-3 h-3" />
              Data terkunci (Sudah difinalisasi)
            </div>
            {isBendahara && (
              <button
                onClick={onDelete}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Hapus
              </button>
            )}
          </div>
        )
      )}
    </div>
  );
}
