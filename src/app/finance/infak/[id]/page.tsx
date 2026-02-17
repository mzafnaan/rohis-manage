"use client";

import { useAuth } from "@/context/AuthContext";
import { getFirebaseDb } from "@/lib/firebase";
import { InfakClass, InfakSession } from "@/types/finance";
import type { Timestamp } from "firebase/firestore";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  HeartHandshake,
  Loader2,
  Lock,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const allowedRoles = [
  "bendahara",
  "ketua",
  "admin",
  "sekretaris",
  "anggota",
  "perlengkapan",
];

export default function InfakDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const { id } = useParams();
  const router = useRouter();

  const [session, setSession] = useState<InfakSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [classes, setClasses] = useState<InfakClass[]>([]);

  const isBendahara = user?.role === "bendahara";
  const canEdit = isBendahara && session?.status === "draft";

  useEffect(() => {
    if (!id) return;

    const fetchSession = async () => {
      try {
        const db = await getFirebaseDb();
        const { doc, getDoc } = await import("firebase/firestore");
        const docRef = doc(db, "infak_sessions", id as string);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const data = snapshot.data() as Omit<InfakSession, "id">;
          setSession({ ...data, id: snapshot.id });
          setTitle(data.title);
          setClasses(data.classes || []);
        } else {
          setError("Sesi tidak ditemukan");
        }
      } catch (err) {
        console.error(err);
        setError("Gagal memuat sesi");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id]);

  const handleAddClass = () => {
    setClasses([...classes, { className: "", amount: 0 }]);
  };

  const handleRemoveClass = (index: number) => {
    const newClasses = classes.filter((_, i) => i !== index);
    setClasses(newClasses);
  };

  const handleClassChange = (
    index: number,
    field: keyof InfakClass,
    value: string | number,
  ) => {
    const newClasses = [...classes];
    newClasses[index] = { ...newClasses[index], [field]: value };
    setClasses(newClasses);
  };

  const calculateTotal = () => {
    return classes.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  };

  const handleSave = async (finalize = false) => {
    if (!session || !isBendahara) return;
    setSaving(true);
    setError(null);

    try {
      const db = await getFirebaseDb();
      const { doc, updateDoc, serverTimestamp, runTransaction, collection } =
        await import("firebase/firestore");

      const total = calculateTotal();
      const sessionRef = doc(db, "infak_sessions", session.id);

      if (finalize) {
        if (total <= 0) {
          throw new Error("Total infak tidak boleh 0");
        }
        if (classes.length === 0) {
          throw new Error("Belum ada data kelas");
        }

        await runTransaction(db, async (transaction) => {
          // 1. Create Transaction Record
          const transactionRef = doc(collection(db, "transactions"));
          transaction.set(transactionRef, {
            description: title,
            amount: total,
            type: "income",
            fundType: "infak",
            date: serverTimestamp(), // Use server time for transaction date
            createdBy: user?.uid,
            createdAt: serverTimestamp(),
            sessionId: session.id, // Optional link back
          });

          // 2. Update Session Status
          transaction.update(sessionRef, {
            title,
            classes,
            total,
            status: "completed",
            transactionId: transactionRef.id,
            updatedAt: serverTimestamp(),
          });
        });

        // Update local state
        setSession({ ...session, status: "completed", total, title, classes });
      } else {
        // Just Save Draft
        await updateDoc(sessionRef, {
          title,
          classes,
          total,
          updatedAt: serverTimestamp(),
        });
        setSession({ ...session, total, title, classes });
      }
    } catch (err: unknown) {
      console.error(err);
      const errorMessage =
        err instanceof Error ? err.message : "Gagal menyimpan data";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "-";
    try {
      const date = timestamp.toDate();
      return date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-xl font-bold text-red-600 mb-2">
          Terjadi Kesalahan
        </h1>
        <p className="text-gray-600">{error}</p>
        <Link
          href="/finance/infak"
          className="mt-4 text-emerald-600 hover:underline"
        >
          Kembali ke Daftar
        </Link>
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

  if (!session) return null;

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-screen pb-24 md:pb-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/finance/infak"
            className="p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Detail Sesi Infak
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                  session.status === "completed"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-amber-100 text-amber-800 border border-amber-200"
                }`}
              >
                {session.status === "completed" ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                {session.status === "completed" ? "Selesai" : "Draft"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Calendar className="w-4 h-4" />
              {formatDate(session.date)}
            </div>
          </div>
        </div>

        {canEdit ? (
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex-1 md:flex-none px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Simpan Draft
            </button>
            <button
              onClick={() => {
                if (
                  confirm(
                    "Finalisasi akan membuat data transaksi dan tidak bisa diubah lagi. Lanjutkan?",
                  )
                ) {
                  handleSave(true);
                }
              }}
              disabled={saving}
              className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm flex items-center justify-center gap-2 shadow-sm shadow-emerald-200"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Finalisasi
            </button>
          </div>
        ) : (
          session.status === "completed" && (
            <div className="flex gap-3">
              <div className="bg-gray-50 px-4 py-2 rounded-xl text-xs text-gray-500 flex items-center gap-2 border border-gray-100">
                <Lock className="w-3 h-3" />
                Data terkunci (Sudah difinalisasi)
              </div>
              {isBendahara && (
                <button
                  onClick={async () => {
                    if (
                      confirm(
                        "PERINGATAN: Menghapus sesi 'Selesai' akan menghapus transaksi terkait di Kas. Lanjutkan?",
                      )
                    ) {
                      try {
                        const db = await getFirebaseDb();
                        const { doc, runTransaction } =
                          await import("firebase/firestore");
                        await runTransaction(db, async (transaction) => {
                          const sessionRef = doc(
                            db,
                            "infak_sessions",
                            session.id,
                          );
                          if (session.transactionId) {
                            const transRef = doc(
                              db,
                              "transactions",
                              session.transactionId,
                            );
                            transaction.delete(transRef);
                          }
                          transaction.delete(sessionRef);
                        });
                        router.push("/finance/infak");
                      } catch (e) {
                        console.error(e);
                        alert("Gagal menghapus sesi");
                      }
                    }
                  }}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
              )}
            </div>
          )
        )}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200/50 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-white/50 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-emerald-600" />
                  Rincian Per Kelas
                </h2>
                {canEdit && (
                  <button
                    onClick={handleAddClass}
                    className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Kelas
                  </button>
                )}
              </div>
              {/* Title Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Judul Kegiatan / Keterangan
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={!canEdit}
                  placeholder="Contoh: Infak Jumat 17 Februari"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-gray-900 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>

            <div className="p-0">
              {classes.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <p>Belum ada data kelas.</p>
                  {canEdit && (
                    <p className="text-sm mt-1">
                      Klik &quot;Tambah Kelas&quot; untuk memulai.
                    </p>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {classes.map((cls, index) => (
                    <div
                      key={index}
                      className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Kelas
                          </label>
                          <input
                            type="text"
                            value={cls.className}
                            onChange={(e) =>
                              handleClassChange(
                                index,
                                "className",
                                e.target.value,
                              )
                            }
                            disabled={!canEdit}
                            placeholder="Nama Kelas (X A)"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-gray-700 disabled:bg-gray-50 disabled:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Nominal
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                              Rp
                            </span>
                            <input
                              type="number"
                              value={cls.amount}
                              onChange={(e) =>
                                handleClassChange(
                                  index,
                                  "amount",
                                  Number(e.target.value),
                                )
                              }
                              disabled={!canEdit}
                              min="0"
                              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-gray-900 text-right disabled:bg-gray-50 disabled:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                      {canEdit && (
                        <button
                          onClick={() => handleRemoveClass(index)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Total */}
            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
              <span className="text-gray-500 font-medium">Total Terkumpul</span>
              <span className="text-2xl font-bold text-emerald-600">
                Rp {calculateTotal().toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-gray-200/50">
            <h3 className="font-bold text-gray-900 mb-4">Informasi Sesi</h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="block text-gray-400 text-xs mb-1">
                  ID Sesi
                </span>
                <code className="bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono text-xs block truncate">
                  {session.id}
                </code>
              </div>
              <div>
                <span className="block text-gray-400 text-xs mb-1">
                  Dibuat Oleh
                </span>
                <span className="text-gray-700 font-medium block">
                  {/* In real app, fetch user name */}
                  {session.createdByName || session.createdBy || "-"}
                </span>
              </div>
              <div>
                <span className="block text-gray-400 text-xs mb-1">Status</span>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                    session.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {session.status === "completed" ? "SUDAH FINAL" : "DRAFT"}
                </span>
              </div>
              {session.transactionId && (
                <div>
                  <span className="block text-gray-400 text-xs mb-1">
                    ID Transaksi
                  </span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono text-xs block truncate">
                    {session.transactionId}
                  </code>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100">
            <h4 className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Panduan
            </h4>
            <ul className="text-xs text-blue-700/80 space-y-2 list-disc list-inside">
              <li>
                Isi judul dengan format yang jelas (misal: &quot;Infak Jumat 17
                Feb&quot;).
              </li>
              <li>Tambahkan kelas satu per satu.</li>
              <li>
                Klik <strong>Simpan Draft</strong> jika belum selesai.
              </li>
              <li>
                Klik <strong>Finalisasi</strong> jika semua data sudah benar.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
