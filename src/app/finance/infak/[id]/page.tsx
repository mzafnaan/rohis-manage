"use client";

import { useAuth } from "@/context/AuthContext";
import { getFirebaseDb } from "@/lib/firebase";
import { InfakClass, InfakSession } from "@/types/finance";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AccessDenied from "../_components/AccessDenied";
import { allowedRoles } from "../_constants";
import { formatDateLong } from "../_utils";
import ClassList from "./_components/ClassList";
import DetailHeader from "./_components/DetailHeader";
import SessionInfo from "./_components/SessionInfo";

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
          const transactionRef = doc(collection(db, "transactions"));
          transaction.set(transactionRef, {
            description: title,
            amount: total,
            type: "income",
            fundType: "infak",
            date: serverTimestamp(),
            createdBy: user?.uid,
            createdAt: serverTimestamp(),
            sessionId: session.id,
          });

          transaction.update(sessionRef, {
            title,
            classes,
            total,
            status: "completed",
            transactionId: transactionRef.id,
            updatedAt: serverTimestamp(),
          });
        });

        setSession({ ...session, status: "completed", total, title, classes });
      } else {
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

  const handleDeleteCompleted = async () => {
    if (!session) return;
    if (
      !confirm(
        "PERINGATAN: Menghapus sesi 'Selesai' akan menghapus transaksi terkait di Kas. Lanjutkan?",
      )
    )
      return;

    try {
      const db = await getFirebaseDb();
      const { doc, runTransaction } = await import("firebase/firestore");
      await runTransaction(db, async (transaction) => {
        const sessionRef = doc(db, "infak_sessions", session.id);
        if (session.transactionId) {
          const transRef = doc(db, "transactions", session.transactionId);
          transaction.delete(transRef);
        }
        transaction.delete(sessionRef);
      });
      router.push("/finance/infak");
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus sesi");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error && !session) {
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
    return <AccessDenied />;
  }

  if (!session) return null;

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-screen pb-24 md:pb-8 max-w-5xl mx-auto">
      <DetailHeader
        session={session}
        canEdit={canEdit ?? false}
        isBendahara={isBendahara}
        saving={saving}
        onSaveDraft={() => handleSave(false)}
        onFinalize={() => {
          if (
            confirm(
              "Finalisasi akan membuat data transaksi dan tidak bisa diubah lagi. Lanjutkan?",
            )
          ) {
            handleSave(true);
          }
        }}
        onDelete={handleDeleteCompleted}
        formatDate={formatDateLong}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Class List */}
        <div className="lg:col-span-2 space-y-6">
          <ClassList
            title={title}
            onTitleChange={setTitle}
            classes={classes}
            canEdit={canEdit ?? false}
            onAddClass={handleAddClass}
            onRemoveClass={handleRemoveClass}
            onClassChange={handleClassChange}
            calculateTotal={calculateTotal}
          />
        </div>

        {/* Right Column: Info */}
        <SessionInfo session={session} />
      </div>
    </div>
  );
}
