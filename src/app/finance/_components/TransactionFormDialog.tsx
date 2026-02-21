import { FundType } from "@/types/finance";
import { HeartHandshake, Loader2, Plus, Wallet } from "lucide-react";

interface TransactionFormData {
  description: string;
  amount: string;
  type: "income" | "expense";
  fundType: FundType;
}

interface TransactionFormDialogProps {
  isOpen: boolean;
  editingId: string | null;
  formData: TransactionFormData;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (data: TransactionFormData) => void;
}

export default function TransactionFormDialog({
  isOpen,
  editingId,
  formData,
  isSubmitting,
  onClose,
  onSubmit,
  onFormChange,
}: TransactionFormDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 animate-scaleIn">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-900">
            {editingId ? "Edit Transaksi" : "Tambah Transaksi"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors bg-white hover:bg-gray-100 p-2 rounded-full shadow-sm border border-gray-200"
          >
            <Plus className="w-5 h-5 rotate-45" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sumber Dana
            </label>
            <div className="flex gap-4 mb-4">
              <label className="flex-1 cursor-pointer group">
                <input
                  type="radio"
                  name="fundType"
                  value="kas"
                  checked={formData.fundType === "kas"}
                  onChange={() =>
                    onFormChange({ ...formData, fundType: "kas" })
                  }
                  className="sr-only peer"
                />
                <div className="text-center py-3 rounded-xl border-2 border-gray-100 peer-checked:bg-blue-50 peer-checked:border-blue-500 peer-checked:text-blue-700 transition-all font-medium text-sm text-gray-500 group-hover:border-gray-200 flex items-center justify-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Kas Umum
                </div>
              </label>
              <label className="flex-1 cursor-pointer group">
                <input
                  type="radio"
                  name="fundType"
                  value="infak"
                  checked={formData.fundType === "infak"}
                  onChange={() =>
                    onFormChange({ ...formData, fundType: "infak" })
                  }
                  className="sr-only peer"
                />
                <div className="text-center py-3 rounded-xl border-2 border-gray-100 peer-checked:bg-purple-50 peer-checked:border-purple-500 peer-checked:text-purple-700 transition-all font-medium text-sm text-gray-500 group-hover:border-gray-200 flex items-center justify-center gap-2">
                  <HeartHandshake className="w-4 h-4" />
                  Dana Infak
                </div>
              </label>
            </div>

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Jenis Transaksi
            </label>
            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer group">
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={formData.type === "income"}
                  onChange={() => onFormChange({ ...formData, type: "income" })}
                  className="sr-only peer"
                />
                <div className="text-center py-3 rounded-xl border-2 border-gray-100 peer-checked:bg-emerald-50 peer-checked:border-emerald-500 peer-checked:text-emerald-700 transition-all font-medium text-sm text-gray-500 group-hover:border-gray-200">
                  Pemasukan
                </div>
              </label>
              <label className="flex-1 cursor-pointer group">
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={formData.type === "expense"}
                  onChange={() =>
                    onFormChange({ ...formData, type: "expense" })
                  }
                  className="sr-only peer"
                />
                <div className="text-center py-3 rounded-xl border-2 border-gray-100 peer-checked:bg-red-50 peer-checked:border-red-500 peer-checked:text-red-700 transition-all font-medium text-sm text-gray-500 group-hover:border-gray-200">
                  Pengeluaran
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Keterangan
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) =>
                onFormChange({ ...formData, description: e.target.value })
              }
              placeholder="Contoh: Iuran anggota, Beli konsumsi"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nominal (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                Rp
              </span>
              <input
                type="number"
                required
                min="0"
                value={formData.amount}
                onChange={(e) =>
                  onFormChange({ ...formData, amount: e.target.value })
                }
                placeholder="0"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl font-bold transition-all disabled:opacity-70 flex justify-center items-center shadow-lg shadow-emerald-200"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Simpan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
