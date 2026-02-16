"use client";

import { useAuth } from "@/context/AuthContext";
import { getFirebaseDb } from "@/lib/firebase";
import { Agenda } from "@/types/agenda";
import { Calendar, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardAgendaCard() {
  const { user } = useAuth();
  const [agenda, setAgenda] = useState<Agenda | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgenda = async () => {
      try {
        const db = await getFirebaseDb();
        const { collection, getDocs, limit, orderBy, query, Timestamp, where } =
          await import("firebase/firestore");

        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const agendaQuery = query(
          collection(db, "agendas"),
          where("date", ">=", Timestamp.fromDate(now)),
          orderBy("date", "asc"),
          limit(1),
        );
        const snap = await getDocs(agendaQuery);
        if (!snap.empty) {
          const doc = snap.docs[0];
          setAgenda({ id: doc.id, ...(doc.data() as Omit<Agenda, "id">) });
        }
      } catch (error) {
        console.error("Error fetching agenda:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgenda();
  }, [user]);

  if (loading) {
    return (
      <Link href="/agenda">
        <div className="bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-600/20 p-6 h-full animate-pulse">
          <div className="flex items-center gap-2 mb-4 opacity-60">
            <div className="w-4 h-4 bg-white/30 rounded" />
            <div className="w-24 h-3 bg-white/30 rounded" />
          </div>
          <div className="w-3/4 h-6 bg-white/30 rounded mb-2" />
          <div className="w-1/2 h-4 bg-white/20 rounded mt-4" />
        </div>
      </Link>
    );
  }

  return (
    <Link href="/agenda">
      <div className="bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-600/20 relative overflow-hidden group border-none h-full min-h-[180px] cursor-pointer">
        <div className="relative z-10 p-6 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 opacity-90">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Agenda Terdekat</span>
            </div>
            <h3 className="text-xl font-bold mb-1 line-clamp-2">
              {agenda ? agenda.title : "Belum ada agenda terdekat"}
            </h3>
          </div>
          {agenda && (
            <div className="flex items-center gap-2 text-emerald-100 text-sm mt-3">
              <Calendar className="w-4 h-4" />
              <span>{agenda.startTime || ""}</span>
              <span className="w-1 h-1 bg-emerald-300 rounded-full mx-1" />
              <MapPin className="w-4 h-4" />
              <span className="truncate">{agenda.location}</span>
            </div>
          )}
          {!agenda && (
            <p className="text-emerald-100 text-sm mt-2 opacity-80">
              Cek jadwal lengkap di menu Agenda.
            </p>
          )}
        </div>
        <Calendar className="absolute -right-6 -bottom-6 w-36 h-36 text-white/10 rotate-12 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </Link>
  );
}
