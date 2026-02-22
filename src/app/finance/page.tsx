"use client";

import { useAuth } from "@/context/AuthContext";
import { getFirebaseDb } from "@/lib/firebase";
import { FundType, Transaction } from "@/types/finance";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import KasHeader from "./_components/KasHeader";
import KasSummaryCards from "./_components/KasSummaryCards";
import TransactionFormDialog from "./_components/TransactionFormDialog";
import TransactionTable from "./_components/TransactionTable";
import { allowedRoles } from "./_constants";
import { formatDate } from "./_utils";

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

  // Derived data
  const kasTransactions = transactions.filter(
    (t) => !t.fundType || t.fundType === "kas",
  );
  const infakTransactions = transactions.filter((t) => t.fundType === "infak");

  const kasIncome = kasTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const kasExpense = kasTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const kasBalance = kasIncome - kasExpense;

  const infakIncome = infakTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const infakExpense = infakTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const infakBalance = infakIncome - infakExpense;

  const filteredTransactions = transactions.filter((t) =>
    t.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBendahara) return;

    const amount = Number(formData.amount);

    // Validasi saldo tidak boleh minus saat pengeluaran
    if (formData.type === "expense") {
      const currentBalance =
        formData.fundType === "kas" ? kasBalance : infakBalance;
      let effectiveBalance = currentBalance;

      // Saat edit, kembalikan dulu dampak transaksi lama
      if (editingId) {
        const oldTx = transactions.find((t) => t.id === editingId);
        if (oldTx) {
          const sameFund =
            (formData.fundType === "kas" &&
              (!oldTx.fundType || oldTx.fundType === "kas")) ||
            formData.fundType === oldTx.fundType;
          if (sameFund) {
            effectiveBalance +=
              oldTx.type === "expense" ? oldTx.amount : -oldTx.amount;
          }
        }
      }

      if (amount > effectiveBalance) {
        const fundLabel = formData.fundType === "kas" ? "Kas" : "Infak";
        alert(
          `Saldo ${fundLabel} tidak mencukupi!\nSaldo tersedia: Rp ${effectiveBalance.toLocaleString("id-ID")}\nPengeluaran: Rp ${amount.toLocaleString("id-ID")}`,
        );
        return;
      }
    }

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
      <KasHeader
        isBendahara={isBendahara}
        onAddTransaction={() => {
          resetForm();
          setIsDialogOpen(true);
        }}
      />

      <KasSummaryCards
        kasBalance={kasBalance}
        totalIncome={kasIncome}
        totalExpense={kasExpense}
      />

      <TransactionTable
        transactions={filteredTransactions}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isBendahara={isBendahara}
        onEdit={openEdit}
        onDelete={handleDelete}
        formatDate={formatDate}
      />

      <TransactionFormDialog
        isOpen={isDialogOpen}
        editingId={editingId}
        formData={formData}
        isSubmitting={isSubmitting}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmit}
        onFormChange={setFormData}
      />
    </div>
  );
}
