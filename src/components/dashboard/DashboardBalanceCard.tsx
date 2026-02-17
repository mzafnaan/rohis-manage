"use client";

import { useAuth } from "@/context/AuthContext";
import { getFirebaseDb } from "@/lib/firebase";
import { Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardBalanceCard() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return; // Wait for auth
    const fetchBalance = async () => {
      try {
        const db = await getFirebaseDb();
        const { collection, getDocs, query } =
          await import("firebase/firestore");

        const txSnap = await getDocs(query(collection(db, "transactions")));
        let income = 0;
        let expense = 0;
        txSnap.docs.forEach((doc) => {
          const d = doc.data();
          // Filter out Infak transactions
          if (d.fundType === "infak") return;

          if (d.type === "income") income += Number(d.amount);
          else if (d.type === "expense") expense += Number(d.amount);
        });
        setBalance(income - expense);
      } catch (error) {
        console.error("Error fetching balance:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, [user]);

  if (loading) {
    return (
      <Link href="/finance">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full animate-pulse">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gray-200 rounded-lg" />
            <div className="w-16 h-3 bg-gray-200 rounded" />
          </div>
          <div className="w-2/3 h-8 bg-gray-200 rounded mb-4" />
          <div className="w-20 h-3 bg-gray-100 rounded" />
        </div>
      </Link>
    );
  }

  return (
    <Link href="/finance">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:-translate-y-1 transition-transform duration-200 flex flex-col justify-between p-6 h-full min-h-[180px] cursor-pointer hover:border-emerald-300 group">
        <div>
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
              <Wallet className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-sm font-medium group-hover:text-emerald-700 transition-colors">
              Kas Rohis
            </span>
          </div>
          <span className="text-3xl font-bold text-gray-900 tracking-tight group-hover:text-emerald-800 transition-colors">
            Rp {balance.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Data Realtime</span>
        </div>
      </div>
    </Link>
  );
}
