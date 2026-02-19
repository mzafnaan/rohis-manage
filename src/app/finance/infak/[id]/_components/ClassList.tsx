import { InfakClass } from "@/types/finance";
import { HeartHandshake, Plus, Trash2 } from "lucide-react";

interface ClassListProps {
  title: string;
  onTitleChange: (value: string) => void;
  classes: InfakClass[];
  canEdit: boolean;
  onAddClass: () => void;
  onRemoveClass: (index: number) => void;
  onClassChange: (
    index: number,
    field: keyof InfakClass,
    value: string | number,
  ) => void;
  calculateTotal: () => number;
}

export default function ClassList({
  title,
  onTitleChange,
  classes,
  canEdit,
  onAddClass,
  onRemoveClass,
  onClassChange,
  calculateTotal,
}: ClassListProps) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200/50 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-white/50 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-600" />
            Rincian Per Kelas
          </h2>
          {canEdit && (
            <button
              onClick={onAddClass}
              className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah Kelas
            </button>
          )}
        </div>
        {/* Title Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Judul Kegiatan / Keterangan
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            disabled={!canEdit}
            placeholder="Contoh: Infak Jumat 17 Februari"
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-gray-900 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>
      </div>

      <div className="p-0">
        {classes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>Belum ada data kelas.</p>
            {canEdit && (
              <p className="text-sm mt-1">
                Klik &quot;Tambah Kelas&quot; untuk memulai.
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {classes.map((cls, index) => (
              <div
                key={index}
                className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Kelas
                    </label>
                    <input
                      type="text"
                      value={cls.className}
                      onChange={(e) =>
                        onClassChange(index, "className", e.target.value)
                      }
                      disabled={!canEdit}
                      placeholder="Nama Kelas (X A)"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-gray-700 disabled:bg-gray-50 disabled:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Nominal
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                        Rp
                      </span>
                      <input
                        type="number"
                        value={cls.amount}
                        onChange={(e) =>
                          onClassChange(index, "amount", Number(e.target.value))
                        }
                        disabled={!canEdit}
                        min="0"
                        className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-gray-900 text-right disabled:bg-gray-50 disabled:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                {canEdit && (
                  <button
                    onClick={() => onRemoveClass(index)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Total */}
      <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
        <span className="text-gray-500 font-medium">Total Terkumpul</span>
        <span className="text-2xl font-bold text-emerald-600">
          Rp {calculateTotal().toLocaleString("id-ID")}
        </span>
      </div>
    </div>
  );
}
