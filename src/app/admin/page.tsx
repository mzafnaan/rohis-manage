"use client";

import { firebaseConfig, getFirebaseDb } from "@/lib/firebase";
import {
  AlertTriangle,
  Check,
  Edit,
  Loader2,
  Search,
  Shield,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface UserData {
  uid: string;
  id?: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [newRole, setNewRole] = useState("");

  // Delete State
  const [deletingUser, setDeletingUser] = useState<UserData | null>(null);

  // Add User State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("anggota");
  const [isAddingUser, setIsAddingUser] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const db = await getFirebaseDb();
      const { collection, onSnapshot, query } =
        await import("firebase/firestore");
      const q = query(collection(db, "users"));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const usersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          uid: doc.id,
          ...doc.data(),
        })) as UserData[];
        setUsers(usersData);
        setLoading(false);
      });
    })();

    return () => unsubscribe?.();
  }, []);

  const handleUpdateRole = async () => {
    if (!editingUser || !newRole) return;
    try {
      const db = await getFirebaseDb();
      const { doc, updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(db, "users", editingUser.id || editingUser.uid), {
        role: newRole,
      });
      setEditingUser(null);
      setNewRole("");
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Gagal mengubah role user.");
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      const db = await getFirebaseDb();
      const { doc, deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "users", deletingUser.id || deletingUser.uid));
      setDeletingUser(null);
      alert("User berhasil dihapus dari database aplikasi.");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Gagal menghapus user.");
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingUser(true);

    let secondaryApp;
    try {
      const { deleteApp, initializeApp } = await import("firebase/app");
      const { createUserWithEmailAndPassword, getAuth, signOut } =
        await import("firebase/auth");
      const db = await getFirebaseDb();
      const { doc, serverTimestamp, setDoc } =
        await import("firebase/firestore");

      // 1. Initialize secondary app to create user without logging out admin
      secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
      const secondaryAuth = getAuth(secondaryApp);

      // 2. Create user in Auth
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        newUserEmail,
        newUserPassword,
      );
      const newUser = userCredential.user;

      // 3. Create user doc in Firestore using PRIMARY app's db instance
      await setDoc(doc(db, "users", newUser.uid), {
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        createdAt: serverTimestamp(),
      });

      // 4. Sign out from secondary auth to be safe
      await signOut(secondaryAuth);

      // 5. Cleanup secondary app
      await deleteApp(secondaryApp);
      secondaryApp = undefined;

      // 6. Reset Form
      setIsAddUserOpen(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("anggota");
      alert("User berhasil ditambahkan!");
    } catch (error) {
      console.error("Error adding user:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      alert("Gagal menambahkan user: " + message);
    } finally {
      // Delete secondary app instance if it wasn't already cleaned up
      if (secondaryApp) {
        const { deleteApp } = await import("firebase/app");
        await deleteApp(secondaryApp);
      }
      setIsAddingUser(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
          <p className="text-gray-500 text-sm">
            Kelola akun anggota dan pengurus.
          </p>
        </div>

        <button
          onClick={() => setIsAddUserOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm shadow-sm md:w-auto w-full"
        >
          <UserPlus className="w-5 h-5" />
          <span>Tambah User</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Stats */}
        <div className="flex gap-4">
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm text-center">
            <span className="block text-2xl font-bold text-emerald-600">
              {users.length}
            </span>
            <span className="text-xs text-gray-500">Total User</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm text-center">
            <span className="block text-2xl font-bold text-blue-600">
              {users.filter((u) => u.role !== "anggota").length}
            </span>
            <span className="text-xs text-gray-500">Pengurus</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Memuat data user...
            </div>
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
                          <div className="font-medium text-gray-900">
                            {u.name}
                          </div>
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
                        {u.role === "admin" && (
                          <Shield className="w-3 h-3 mr-1" />
                        )}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setNewRole(u.role);
                          }}
                          className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit Role"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingUser(u)}
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
      </div>

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-scaleIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Edit Role User</h3>
              <button
                onClick={() => setEditingUser(null)}
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
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${newRole === role ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-gray-200 hover:bg-gray-50"}`}
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
                      <span className="capitalize text-sm font-medium">
                        {role}
                      </span>
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
                onClick={() => setEditingUser(null)}
                className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateRole}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-sm"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
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
                onClick={() => setDeletingUser(null)}
                className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors shadow-sm"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl">Tambah User Baru</h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
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
                      className={`flex items-center justify-center p-2 rounded-lg border cursor-pointer transition-all text-sm ${newUserRole === role ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-medium" : "border-gray-200 hover:bg-gray-50 text-gray-600"}`}
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
                  onClick={() => setIsAddUserOpen(false)}
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
      )}
    </div>
  );
}
