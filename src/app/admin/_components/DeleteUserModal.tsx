import { AlertTriangle } from "lucide-react";
import { UserData } from "../types";

interface DeleteUserModalProps {
  deletingUser: UserData;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteUserModal({
  deletingUser,
  onClose,
  onConfirm,
}: DeleteUserModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-scaleIn">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4 mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-lg text-center mb-2">Hapus User?</h3>
        <p className="text-center text-gray-500 text-sm mb-6">
          Apakah Anda yakin ingin menghapus user{" "}
          <strong>{deletingUser.name}</strong>? Tindakan ini hanya menghapus
          data profil, akun login mungkin masih aktif.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors shadow-sm"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
