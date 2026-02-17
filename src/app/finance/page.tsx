"use client";

import { useAuth } from "@/context/AuthContext";
import { getFirebaseDb } from "@/lib/firebase";
import { FundType, Transaction } from "@/types/finance";
import type { Timestamp } from "firebase/firestore";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Edit,
  HeartHandshake,
  Loader2,
  Plus,
  Search,
  Trash2,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";

import { SummaryCard } from "@/components/finance/SummaryCard";

const allowedRoles = ["bendahara", "ketua", "admin", "sekretaris", "anggota"];

export default function FinancePage() {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "income" as "income" | "expense",
    fundType: "kas" as FundType,
  });

  // Permissions
  const isBendahara = user?.role === "bendahara";

  useEffect(() => {
    if (!authLoading && user && !allowedRoles.includes(user.role)) {
      // Handle unauthorized access or just render specific view
    }
  }, [user, authLoading]);

  // Fetch Transactions
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const db = await getFirebaseDb();
      const { collection, onSnapshot, orderBy, query } =
        await import("firebase/firestore");
      const q = query(collection(db, "transactions"), orderBy("date", "desc"));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Transaction[];
        setTransactions(docs);
        setLoading(false);
      });
    })();

    return () => unsubscribe?.();
  }, []);

  const kasTransactions = transactions.filter(
    (t) => !t.fundType || t.fundType === "kas",
  );
  // const infakTransactions = transactions.filter((t) => t.fundType === "infak");

  // Kas Balance
  const kasIncome = kasTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const kasExpense = kasTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const kasBalance = kasIncome - kasExpense;

  // Infak Balance calculation removed as card is removed
  // const infakIncome = ...
  // const infakBalance = ...

  // Global Totals (for other cards if needed, or we just show Kas vs Infak)
  // Request says "Add summary of Infak Balance".
  // And "Don't change main card structure drastically".
  // Existing: Saldo Kas, Total Pemasukan, Total Pengeluaran.
  // We can keep Total Pemasukan/Pengeluaran as Global (Kas + Infak) or just Kas.
  // Let's make them Global for now, or per convention.
  // "Menghitung total pemasukan dan pengeluaran per jenis dana." -> implies separation.
  // But the UI only has 3 cards. I will add a 4th card for "Saldo Infak".

  const totalIncome = kasTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = kasTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const filteredTransactions = transactions.filter((t) =>
    t.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBendahara) return;
    setIsSubmitting(true);

    try {
      const db = await getFirebaseDb();
      const { addDoc, collection, doc, serverTimestamp, updateDoc } =
        await import("firebase/firestore");

      const data = {
        description: formData.description,
        amount: Number(formData.amount),
        type: formData.type,
        fundType: formData.fundType,
        date: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "transactions", editingId), data);
      } else {
        await addDoc(collection(db, "transactions"), {
          ...data,
          createdBy: user?.uid,
          createdAt: serverTimestamp(),
        });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) return;
    try {
      const db = await getFirebaseDb();
      const { doc, deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "transactions", id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const openEdit = (t: Transaction) => {
    setEditingId(t.id);
    setFormData({
      description: t.description,
      amount: t.amount.toString(),
      type: t.type,
      fundType: t.fundType || "kas",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      description: "",
      amount: "",
      type: "income",
      fundType: "kas",
    });
  };

  // Format date using native Intl API instead of heavy date-fns
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "-";
    try {
      const date = timestamp.toDate();
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Akses Ditolak</h1>
        <p className="text-gray-500 mt-2">
          Anda tidak memiliki izin untuk melihat halaman ini.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="w-8 h-8 text-emerald-600" />
            Kas & Keuangan
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola pemasukan dan pengeluaran kas organisasi
          </p>
        </div>
        {isBendahara && (
          <button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm shadow-sm md:w-auto w-full"
          >
            <Plus className="w-4 h-4" />
            Tambah Transaksi
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Saldo Kas Utama"
          amount={kasBalance}
          icon={Wallet}
          className="bg-blue-50 text-blue-600"
          delay={0}
        />
        <SummaryCard
          title="Total Pemasukan (Kas Utama)"
          amount={totalIncome}
          icon={ArrowDownCircle}
          className="bg-emerald-50 text-emerald-600"
          delay={0.1}
        />
        <SummaryCard
          title="Total Pengeluaran (Kas Utama)"
          amount={totalExpense}
          icon={ArrowUpCircle}
          className="bg-red-50 text-red-600"
          delay={0.2}
        />
      </div>

      {/* Transactions */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200/50 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/50">
          <h2 className="text-xl font-bold text-gray-800">Riwayat Transaksi</h2>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all bg-gray-50/50 focus:bg-white"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Keterangan</th>
                <th className="px-6 py-4">Dana</th>
                <th className="px-6 py-4">Jenis</th>
                <th className="px-6 py-4">Nominal</th>
                {isBendahara && <th className="px-6 py-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-gray-400" />
                      </div>
                      <p>Belum ada transaksi</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(t.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {t.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          t.fundType === "infak"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {t.fundType === "infak" ? "Infak" : "Kas"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          t.type === "income"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        {t.type === "income" ? "Pemasukan" : "Pengeluaran"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                      <span
                        className={
                          t.type === "income"
                            ? "text-emerald-600"
                            : "text-red-600"
                        }
                      >
                        {t.type === "income" ? "+" : "-"} Rp{" "}
                        {t.amount.toLocaleString("id-ID")}
                      </span>
                    </td>
                    {isBendahara && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(t)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 animate-scaleIn">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">
                {editingId ? "Edit Transaksi" : "Tambah Transaksi"}
              </h3>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors bg-white hover:bg-gray-100 p-2 rounded-full shadow-sm border border-gray-200"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
                        setFormData({ ...formData, fundType: "kas" })
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
                        setFormData({ ...formData, fundType: "infak" })
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
                      onChange={() =>
                        setFormData({ ...formData, type: "income" })
                      }
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
                        setFormData({ ...formData, type: "expense" })
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
                    setFormData({ ...formData, description: e.target.value })
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
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
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
      )}
    </div>
  );
}
