"use client";

import { SummaryCard } from "@/components/finance/SummaryCard";
import { useAuth } from "@/context/AuthContext";
import { getFirebaseDb } from "@/lib/firebase";
import { InfakSession } from "@/types/finance";
import { HeartHandshake, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import AccessDenied from "./_components/AccessDenied";
import InfakHeader from "./_components/InfakHeader";
import InfakSessionTable from "./_components/InfakSessionTable";
import { allowedRoles } from "./_constants";
import { formatDateShort } from "./_utils";

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

  const totalInfak = sessions
    .filter((s) => s.status === "completed")
    .reduce((acc, curr) => acc + (curr.total || 0), 0);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <AccessDenied />;
  }

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-screen pb-24 md:pb-8">
      <InfakHeader
        isBendahara={isBendahara}
        isCreating={isCreating}
        onCreateSession={handleCreateSession}
      />

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

      <InfakSessionTable
        sessions={filteredSessions}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isBendahara={isBendahara}
        onDelete={handleDelete}
        formatDate={formatDateShort}
      />
    </div>
  );
}
