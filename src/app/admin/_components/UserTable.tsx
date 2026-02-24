import { Edit, Shield, Trash2 } from "lucide-react";
import { UserData } from "../types";

interface UserTableProps {
  users: UserData[];
  loading: boolean;
  searchTerm: string;
  onEditRole: (user: UserData) => void;
  onDeleteUser: (user: UserData) => void;
}

export default function UserTable({
  users,
  loading,
  searchTerm,
  onEditRole,
  onDeleteUser,
}: UserTableProps) {
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="overflow-x-auto">
      {loading ? (
        <div className="p-8 text-center text-gray-500">Memuat data user...</div>
      ) : (
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 w-1/3">User</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((u) => (
              <tr
                key={u.uid}
                className="hover:bg-gray-50/50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{u.name}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border
                    ${
                      u.role === "admin"
                        ? "bg-red-50 text-red-700 border-red-100"
                        : u.role === "ketua"
                          ? "bg-blue-50 text-blue-700 border-blue-100"
                          : u.role === "sekretaris"
                            ? "bg-purple-50 text-purple-700 border-purple-100"
                            : u.role === "bendahara"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-100"
                              : u.role === "perlengkapan"
                                ? "bg-orange-50 text-orange-700 border-orange-100"
                                : "bg-gray-50 text-gray-600 border-gray-100"
                    }`}
                  >
                    {u.role === "admin" && <Shield className="w-3 h-3 mr-1" />}
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditRole(u)}
                      className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Edit Role"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteUser(u)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && filteredUsers.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          Tidak ada user ditemukan.
        </div>
      )}
    </div>
  );
}
