import { Loader2, X } from "lucide-react";

interface AddUserModalProps {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isAddingUser: boolean;
  newUserName: string;
  setNewUserName: (val: string) => void;
  newUserEmail: string;
  setNewUserEmail: (val: string) => void;
  newUserPassword: string;
  setNewUserPassword: (val: string) => void;
  newUserRole: string;
  setNewUserRole: (val: string) => void;
}

export default function AddUserModal({
  onClose,
  onSubmit,
  isAddingUser,
  newUserName,
  setNewUserName,
  newUserEmail,
  setNewUserEmail,
  newUserPassword,
  setNewUserPassword,
  newUserRole,
  setNewUserRole,
}: AddUserModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-scaleIn">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl">Tambah User Baru</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Contoh: Ahmad Fauzan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Minimal 6 karakter"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Awal
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                "anggota",
                "ketua",
                "sekretaris",
                "bendahara",
                "perlengkapan",
                "humas",
                "admin",
              ].map((role) => (
                <label
                  key={role}
                  className={`flex items-center justify-center p-2 rounded-lg border cursor-pointer transition-all text-sm ${
                    newUserRole === role
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-medium"
                      : "border-gray-200 hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="newRole"
                    value={role}
                    checked={newUserRole === role}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="sr-only"
                  />
                  <span className="capitalize">{role}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isAddingUser}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isAddingUser ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Menambahkan...
                </>
              ) : (
                "Buat User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
