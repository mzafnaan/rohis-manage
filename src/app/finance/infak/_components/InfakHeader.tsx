import { HeartHandshake, Loader2, Plus } from "lucide-react";

interface InfakHeaderProps {
  isBendahara: boolean;
  isCreating: boolean;
  onCreateSession: () => void;
}

export default function InfakHeader({
  isBendahara,
  isCreating,
  onCreateSession,
}: InfakHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HeartHandshake className="w-8 h-8 text-emerald-600" />
          Manajemen Infak
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Kelola sesi pengumpulan infak (Jumat, harian, atau khusus)
        </p>
      </div>
      {isBendahara && (
        <button
          onClick={onCreateSession}
          disabled={isCreating}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm shadow-sm md:w-auto w-full disabled:opacity-70"
        >
          {isCreating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Buat Sesi Baru
        </button>
      )}
    </div>
  );
}
