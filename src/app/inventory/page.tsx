"use client";

import AnimatedCard from "@/components/ui/AnimatedCard";
import { useAuth } from "@/context/AuthContext";
import { getFirebaseDb } from "@/lib/firebase";
import type { Timestamp } from "firebase/firestore";
import {
  AlertCircle,
  Archive,
  Box,
  Clock,
  Edit,
  History,
  Package,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Lazy toast helper
const showToast = async (type: "success" | "error", message: string) => {
  const { toast } = await import("react-hot-toast");
  toast[type](message);
};

// Types
interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  status: "available" | "borrowed" | "damaged";
  updatedAt: Timestamp;
}

interface InventoryLog {
  id: string;
  action: "ADD" | "BORROW" | "RETURN" | "DAMAGE" | "REPAIR" | "UPDATE";
  itemName: string;
  itemId?: string;
  description: string;
  userId: string;
  userName: string;
  timestamp: Timestamp;
}

export default function InventoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Check auth
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Fetch Inventory
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const db = await getFirebaseDb();
      const { collection, onSnapshot, orderBy, query } =
        await import("firebase/firestore");
      const q = query(collection(db, "inventory"), orderBy("name"));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const itemsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as InventoryItem[];
        setItems(itemsData);
      });
    })();

    return () => unsubscribe?.();
  }, []);

  // Fetch Logs
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const db = await getFirebaseDb();
      const { collection, onSnapshot, orderBy, query } =
        await import("firebase/firestore");
      const q = query(
        collection(db, "inventory_logs"),
        orderBy("timestamp", "desc"),
      );
      unsubscribe = onSnapshot(q, (snapshot) => {
        const logsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as InventoryLog[];
        setLogs(logsData);
      });
    })();

    return () => unsubscribe?.();
  }, []);

  const canEdit = user?.role === "perlengkapan" || user?.role === "admin";

  const addLog = async (
    action: InventoryLog["action"],
    itemName: string,
    description: string,
    itemId?: string,
  ) => {
    if (!user) return;
    const db = await getFirebaseDb();
    const { addDoc, collection, serverTimestamp } =
      await import("firebase/firestore");
    await addDoc(collection(db, "inventory_logs"), {
      action,
      itemName,
      itemId,
      description,
      userId: user.uid,
      userName: user.name,
      timestamp: serverTimestamp(),
    });
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !user) return;
    setSubmitting(true);
    try {
      const db = await getFirebaseDb();
      const { addDoc, collection, doc, serverTimestamp, updateDoc } =
        await import("firebase/firestore");

      if (editingItem) {
        await updateDoc(doc(db, "inventory", editingItem.id), {
          name: newItemName,
          quantity: newItemQty,
          updatedAt: serverTimestamp(),
        });
        await addLog(
          "UPDATE",
          newItemName,
          `Mengupdate barang: ${newItemName} (${newItemQty})`,
          editingItem.id,
        );
        await showToast("success", "Barang berhasil diperbarui");
      } else {
        const docRef = await addDoc(collection(db, "inventory"), {
          name: newItemName,
          quantity: newItemQty,
          status: "available",
          updatedAt: serverTimestamp(),
        });
        await addLog(
          "ADD",
          newItemName,
          `Menambahkan barang baru: ${newItemName} (${newItemQty})`,
          docRef.id,
        );
        await showToast("success", "Barang berhasil ditambahkan");
      }

      setNewItemName("");
      setNewItemQty(1);
      setEditingItem(null);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error saving item:", error);
      await showToast("error", "Gagal menyimpan barang");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (item: InventoryItem) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${item.name}"?`)) return;
    if (!user) return;

    try {
      const db = await getFirebaseDb();
      const { doc, deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "inventory", item.id));
      await addLog(
        "DAMAGE",
        item.name,
        "Menghapus barang dari inventaris",
        item.id,
      );
      await showToast("success", "Barang berhasil dihapus");
    } catch (error) {
      console.error("Error deleting item:", error);
      await showToast("error", "Gagal menghapus barang");
    }
  };

  const handleStatusChange = async (
    item: InventoryItem,
    newStatus: InventoryItem["status"],
    action: InventoryLog["action"],
    descriptionPrompt: string,
  ) => {
    if (!canEdit) return;

    const description = prompt(descriptionPrompt);
    if (description === null) return;

    try {
      const db = await getFirebaseDb();
      const { doc, serverTimestamp, updateDoc } =
        await import("firebase/firestore");
      await updateDoc(doc(db, "inventory", item.id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      await addLog(
        action,
        item.name,
        description || `${action} barang`,
        item.id,
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Stats
  const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const borrowedItems = items.filter((i) => i.status === "borrowed").length;
  const damagedItems = items.filter((i) => i.status === "damaged").length;

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20 md:pb-0 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-8 h-8 text-emerald-600" />
              Inventaris & Perlengkapan
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Kelola aset Rohis dengan mudah dan transparan.
            </p>
          </div>
          {canEdit && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm shadow-sm md:w-auto w-full"
            >
              <Plus className="w-5 h-5" />
              Tambah Barang
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AnimatedCard
            delay={0.1}
            className="p-4 border-l-4 border-l-blue-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Aset</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {totalItems}
                </h3>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Box className="w-6 h-6" />
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard
            delay={0.2}
            className="p-4 border-l-4 border-l-yellow-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Sedang Dipinjam
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {borrowedItems}
                </h3>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.3} className="p-4 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Perlu Perbaikan
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {damagedItems}
                </h3>
              </div>
              <div className="p-2 bg-red-50 rounded-lg text-red-600">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari barang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inventory List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Daftar Barang</h2>
              <span className="text-sm text-gray-500">
                {filteredItems.length} Item
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <>
                {filteredItems.map((item) => (
                  <AnimatedCard
                    key={item.id}
                    className="p-4 hover:shadow-md transition-all border border-gray-100"
                  >
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                            item.status === "available"
                              ? "bg-emerald-100 text-emerald-600"
                              : item.status === "borrowed"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-red-100 text-red-600"
                          }`}
                        >
                          <Archive className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                              Qty: {item.quantity}
                            </span>
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                                item.status === "available"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : item.status === "borrowed"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {item.status === "available"
                                ? "Tersedia"
                                : item.status === "borrowed"
                                  ? "Dipinjam"
                                  : "Rusak"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {canEdit && (
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setNewItemName(item.name);
                              setNewItemQty(item.quantity);
                              setIsAddModalOpen(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Barang"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Barang"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="w-px h-6 bg-gray-200 mx-1"></div>
                          {item.status === "available" && (
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  item,
                                  "borrowed",
                                  "BORROW",
                                  "Nama peminjam & kegiatan:",
                                )
                              }
                              className="text-sm px-3 py-1.5 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-lg font-medium transition-colors"
                            >
                              Pinjamkan
                            </button>
                          )}
                          {item.status === "borrowed" && (
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  item,
                                  "available",
                                  "RETURN",
                                  "Diterima oleh & kondisi:",
                                )
                              }
                              className="text-sm px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-medium transition-colors"
                            >
                              Kembalikan
                            </button>
                          )}
                          {item.status !== "damaged" && (
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  item,
                                  "damaged",
                                  "DAMAGE",
                                  "Detail kerusakan:",
                                )
                              }
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Lapor Rusak"
                            >
                              <AlertCircle className="w-4 h-4" />
                            </button>
                          )}
                          {item.status === "damaged" && (
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  item,
                                  "available",
                                  "REPAIR",
                                  "Catatan perbaikan:",
                                )
                              }
                              className="text-sm px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition-colors"
                            >
                              Selesai Perbaikan
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </AnimatedCard>
                ))}
              </>

              {filteredItems.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    Belum ada barang yang dicatat.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Activity Log */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <History className="w-5 h-5 text-gray-500" />
              Riwayat Aktivitas
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 max-h-[600px] overflow-y-auto space-y-6">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="relative pl-6 pb-6 last:pb-0 border-l border-gray-100 last:border-0"
                >
                  <div
                    className={`absolute -left-1.5 top-0 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                      log.action === "ADD"
                        ? "bg-blue-500"
                        : log.action === "BORROW"
                          ? "bg-yellow-500"
                          : log.action === "RETURN"
                            ? "bg-emerald-500"
                            : "bg-red-500"
                    }`}
                  ></div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-gray-400 font-medium">
                      {log.timestamp?.toDate().toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {log.userName}{" "}
                      <span className="font-normal text-gray-600">
                        {log.action === "ADD" && "menambahkan"}
                        {log.action === "BORROW" && "meminjamkan"}
                        {log.action === "RETURN" && "menerima item"}
                        {log.action === "DAMAGE" && "melaporkan rusak"}
                        {log.action === "REPAIR" && "memperbaiki"}
                      </span>{" "}
                      {log.itemName}
                    </p>
                    <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg italic">
                      &quot;{log.description}&quot;
                    </p>
                  </div>
                </div>
              ))}

              {logs.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-4">
                  Belum ada aktivitas tercatat.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-scaleIn">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? "Edit Barang" : "Tambah Barang Baru"}
            </h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Barang
                </label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Contoh: Sound Portable"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah (Qty)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingItem(null);
                    setNewItemName("");
                    setNewItemQty(1);
                  }}
                  className="flex-1 py-2 px-4 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 px-4 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 font-medium transition-colors disabled:opacity-70"
                >
                  {submitting
                    ? "Menyimpan..."
                    : editingItem
                      ? "Simpan Perubahan"
                      : "Simpan Barang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
