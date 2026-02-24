"use client";

import { firebaseConfig, getFirebaseDb } from "@/lib/firebase";
import { UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import AddUserModal from "./_components/AddUserModal";
import DeleteUserModal from "./_components/DeleteUserModal";
import EditRoleModal from "./_components/EditRoleModal";
import UserTable from "./_components/UserTable";
import { UserData } from "./types";

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
            <UserTable
              users={users}
              loading={loading}
              searchTerm={searchTerm}
              onEditRole={(u) => {
                setEditingUser(u);
                setNewRole(u.role);
              }}
              onDeleteUser={(u) => setDeletingUser(u)}
            />
          </div>
        </div>
      </div>

      {/* Edit Role Modal */}
      {editingUser && (
        <EditRoleModal
          editingUser={editingUser}
          newRole={newRole}
          setNewRole={setNewRole}
          onClose={() => setEditingUser(null)}
          onSave={handleUpdateRole}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <DeleteUserModal
          deletingUser={deletingUser}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDeleteUser}
        />
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <AddUserModal
          onClose={() => setIsAddUserOpen(false)}
          onSubmit={handleAddUser}
          isAddingUser={isAddingUser}
          newUserName={newUserName}
          setNewUserName={setNewUserName}
          newUserEmail={newUserEmail}
          setNewUserEmail={setNewUserEmail}
          newUserPassword={newUserPassword}
          setNewUserPassword={setNewUserPassword}
          newUserRole={newUserRole}
          setNewUserRole={setNewUserRole}
        />
      )}
    </div>
  );
}
