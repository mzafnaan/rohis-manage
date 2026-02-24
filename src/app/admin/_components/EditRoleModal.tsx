import { Check, X } from "lucide-react";
import { UserData } from "../types";

interface EditRoleModalProps {
  editingUser: UserData;
  newRole: string;
  setNewRole: (role: string) => void;
  onClose: () => void;
  onSave: () => Promise<void>;
}

export default function EditRoleModal({
  editingUser,
  newRole,
  setNewRole,
  onClose,
  onSave,
}: EditRoleModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-scaleIn">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Edit Role User</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">
            User:{" "}
            <span className="font-medium text-gray-900">
              {editingUser.name}
            </span>
          </p>
          <div className="space-y-2">
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
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  newRole === role
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={newRole === role}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="capitalize text-sm font-medium">{role}</span>
                </div>
                {newRole === role && (
                  <Check className="w-4 h-4 text-emerald-600" />
                )}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onSave}
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-sm"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
