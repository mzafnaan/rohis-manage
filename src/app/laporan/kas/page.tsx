"use client";

import SelectInput from "@/components/ui/SelectInput";
import { useAuth } from "@/context/AuthContext";
import { getFirebaseDb } from "@/lib/firebase";
import { Transaction } from "@/types/finance";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { allowedRoles, MONTHS } from "../_constants";
import { generatePDF, getMonthName } from "../_utils";
import LaporanKasContent from "./_components/LaporanKasContent";

function LaporanKasInner() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const reportRef = useRef<HTMLDivElement>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const bulan = Number(searchParams.get("bulan")) || new Date().getMonth() + 1;
  const tahun = Number(searchParams.get("tahun")) || new Date().getFullYear();

  useEffect(() => {
    (async () => {
      try {
        const db = await getFirebaseDb();
        const { collection, getDocs, orderBy, query } =
          await import("firebase/firestore");
        const q = query(collection(db, "transactions"), orderBy("date", "asc"));
        const snapshot = await getDocs(q);
        const docs = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }) as Transaction)
          .filter((t) => {
            if (t.fundType && t.fundType !== "kas") return false;
            if (!t.date) return false;
            try {
              const d = t.date.toDate();
              return d.getMonth() + 1 === bulan && d.getFullYear() === tahun;
            } catch {
              return false;
            }
          });
        setTransactions(docs);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [bulan, tahun]);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const saldoAkhir = totalIncome - totalExpense;

  const handleDownload = useCallback(async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      await generatePDF(
        reportRef.current,
        `Laporan-Kas-${getMonthName(bulan)}-${tahun}.pdf`,
      );
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Gagal membuat PDF");
    } finally {
      setDownloading(false);
    }
  }, [bulan, tahun]);

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
          Anda tidak memiliki izin untuk melihat laporan ini.
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
    <div className="min-h-screen bg-gray-100 py-6 px-3 sm:py-8 sm:px-4">
      {/* Toolbar */}
      <div className="max-w-[800px] mx-auto mb-6 space-y-4">
        <Link
          href="/finance"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Kas
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative z-20">
                <SelectInput
                  value={String(bulan)}
                  onChange={(val) => {
                    const url = new URL(window.location.href);
                    url.searchParams.set("bulan", val);
                    window.location.href = url.toString();
                  }}
                  options={MONTHS.map((m, i) => ({
                    value: String(i + 1),
                    label: m,
                  }))}
                  buttonClassName="!py-2 !text-sm"
                />
              </div>
              <div className="relative z-10">
                <SelectInput
                  value={String(tahun)}
                  onChange={(val) => {
                    const url = new URL(window.location.href);
                    url.searchParams.set("tahun", val);
                    window.location.href = url.toString();
                  }}
                  options={Array.from({ length: 10 }, (_, i) => {
                    const y = new Date().getFullYear() - 5 + i;
                    return { value: String(y), label: String(y) };
                  })}
                  buttonClassName="!py-2 !text-sm"
                />
              </div>
            </div>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm disabled:opacity-60 w-full sm:w-auto"
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Report Preview */}
      <div
        ref={reportRef}
        className="max-w-[800px] mx-auto bg-white shadow-lg rounded-lg p-5 sm:p-8 md:px-12 md:py-10 overflow-x-auto"
      >
        <LaporanKasContent
          transactions={transactions}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          saldoAkhir={saldoAkhir}
          bulan={bulan}
          tahun={tahun}
        />
      </div>
    </div>
  );
}

export default function LaporanKasPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <LaporanKasInner />
    </Suspense>
  );
}
