"use client";

import { SummaryCard } from "@/components/finance/SummaryCard";
import { useAuth } from "@/context/AuthContext";
import { getFirebaseDb } from "@/lib/firebase";
import { InfakSession } from "@/types/finance";
import { Timestamp } from "firebase/firestore";
import {
  Calendar,
  CheckCircle,
  Clock,
  HeartHandshake,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const allowedRoles = ["bendahara", "ketua", "admin", "sekretaris", "anggota"];

export default function InfakListPage() {
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<InfakSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const isBendahara = user?.role === "bendahara";

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const db = await getFirebaseDb();
      const { collection, onSnapshot, orderBy, query } =
        await import("firebase/firestore");
      const q = query(
        collection(db, "infak_sessions"),
        orderBy("date", "desc"),
      );
      unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as InfakSession[];
        setSessions(docs);
        setLoading(false);
      });
    })();

    return () => unsubscribe?.();
  }, []);

  const handleCreateSession = async () => {
    if (!isBendahara) return;
    setIsCreating(true);
    try {
      const db = await getFirebaseDb();
      const { addDoc, collection, serverTimestamp } =
        await import("firebase/firestore");

      const newSession = {
        title: "Sesi Infak Baru",
        date: serverTimestamp(),
        classes: [],
        total: 0,
        status: "draft",
        createdBy: user?.uid,
        createdByName: user?.name || user?.email || "Unknown",
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "infak_sessions"), newSession);
      window.location.href = `/finance/infak/${docRef.id}`;
    } catch (error) {
      console.error("Error creating session:", error);
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string, status: string) => {
    if (
      !confirm(
        status === "completed"
          ? "PERINGATAN: Menghapus sesi 'Selesai' akan menghapus transaksi terkait di Kas. Lanjutkan?"
          : "Hapus sesi ini?",
      )
    )
      return;

    try {
      const db = await getFirebaseDb();
      const { doc, deleteDoc, runTransaction } =
        await import("firebase/firestore");

      if (status === "completed") {
        await runTransaction(db, async (transaction) => {
          const sessionRef = doc(db, "infak_sessions", id);
          const sessionSnap = await transaction.get(sessionRef);
          if (!sessionSnap.exists()) throw new Error("Sesi tidak ditemukan");

          const sessionData = sessionSnap.data() as InfakSession;
          if (sessionData.transactionId) {
            const transRef = doc(db, "transactions", sessionData.transactionId);
            transaction.delete(transRef);
          }
          transaction.delete(sessionRef);
        });
      } else {
        await deleteDoc(doc(db, "infak_sessions", id));
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      alert("Gagal menghapus sesi");
    }
  };

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Calculate Total Infak from Completed Sessions
  const totalInfak = sessions
    .filter((s) => s.status === "completed")
    .reduce((acc, curr) => acc + (curr.total || 0), 0);

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
        <Link
          href="/"
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-screen pb-24 md:pb-8">
      {/* Header */}
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
            onClick={handleCreateSession}
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

      {/* Summary Card - Total Infak */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Total Dana Infak Terkumpul"
          amount={totalInfak}
          icon={HeartHandshake}
          className="bg-emerald-50 text-emerald-600"
          delay={0}
        />
      </div>

      {/* List */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200/50 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/50">
          <h2 className="text-xl font-bold text-gray-800">Daftar Sesi Infak</h2>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari sesi..."
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
                <th className="px-6 py-4">Judul Sesi</th>
                <th className="px-6 py-4">Total Terkumpul</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <HeartHandshake className="w-6 h-6 text-gray-400" />
                      </div>
                      <p>Belum ada sesi infak</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSessions.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDate(s.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {s.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">
                      Rp {s.total.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          s.status === "completed"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {s.status === "completed" ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {s.status === "completed" ? "Selesai" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/finance/infak/${s.id}`}
                          className="text-emerald-600 hover:text-emerald-900 font-bold hover:underline"
                        >
                          Detail
                        </Link>
                        {isBendahara && (
                          <button
                            onClick={() => handleDelete(s.id, s.status)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Hapus Sesi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
