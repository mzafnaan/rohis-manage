"use client";

import { useAuth } from "@/context/AuthContext";
import { getFirebaseDb } from "@/lib/firebase";
import { InfakSession } from "@/types/finance";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { allowedRoles } from "../_constants";
import { generatePDF } from "../_utils";
import LaporanInfakContent from "./_components/LaporanInfakContent";

function LaporanInfakInner() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const reportRef = useRef<HTMLDivElement>(null);

  const [session, setSession] = useState<InfakSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get("id");

  useEffect(() => {
    if (!sessionId) {
      setError("ID sesi tidak ditemukan");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const db = await getFirebaseDb();
        const { doc, getDoc } = await import("firebase/firestore");
        const docRef = doc(db, "infak_sessions", sessionId);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          setSession({
            id: snapshot.id,
            ...snapshot.data(),
          } as InfakSession);
        } else {
          setError("Sesi infak tidak ditemukan");
        }
      } catch (err) {
        console.error("Error fetching session:", err);
        setError("Gagal memuat data sesi");
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  const handleDownload = useCallback(async () => {
    if (!reportRef.current || !session) return;
    setDownloading(true);
    try {
      const safeTitle = session.title.replace(/[^a-zA-Z0-9]/g, "-");
      await generatePDF(reportRef.current, `Laporan-Infak-${safeTitle}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Gagal membuat PDF");
    } finally {
      setDownloading(false);
    }
  }, [session]);

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

  if (error || !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-xl font-bold text-red-600 mb-2">
          Terjadi Kesalahan
        </h1>
        <p className="text-gray-600">{error || "Data tidak ditemukan"}</p>
        <Link
          href="/finance/infak"
          className="mt-4 text-emerald-600 hover:underline"
        >
          Kembali ke Daftar Infak
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-3 sm:py-8 sm:px-4">
      {/* Toolbar */}
      <div className="max-w-[800px] mx-auto mb-6 space-y-4">
        <Link
          href={`/finance/infak/${sessionId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Detail
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm disabled:opacity-60 w-full"
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

      {/* Report Preview */}
      <div
        ref={reportRef}
        className="max-w-[800px] mx-auto bg-white shadow-lg rounded-lg p-5 sm:p-8 md:px-12 md:py-10 overflow-x-auto"
      >
        <LaporanInfakContent session={session} />
      </div>
    </div>
  );
}

export default function LaporanInfakPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <LaporanInfakInner />
    </Suspense>
  );
}
