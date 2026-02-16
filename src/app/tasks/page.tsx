"use client";

import PicketScheduleTable from "@/components/tasks/PicketScheduleTable";
import AnimatedCard from "@/components/ui/AnimatedCard";
import { useAuth } from "@/context/AuthContext";
import { Calendar, CheckSquare, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TasksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const canEditSchedule = user.role === "sekretaris" || user.role === "admin";

  return (
    <main className="min-h-screen pb-20 md:pb-0 bg-gray-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckSquare className="w-8 h-8 text-emerald-600" />
            Daftar Tugas
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Pantau tugas pribadi dan kegiatan tim.
          </p>
        </header>

        {/* Section 1: Piket Mingguan */}
        <AnimatedCard delay={0.1}>
          <PicketScheduleTable canEdit={canEditSchedule} />
        </AnimatedCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 2: Tugas Pribadi */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
              <h2 className="font-bold text-gray-800 text-lg">Tugas Saya</h2>
            </div>

            <AnimatedCard
              delay={0.2}
              className="group bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-start gap-3 cursor-pointer"
            >
              <div className="pt-1">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300 cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                  Membuat Flyer Kajian Jumat
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-red-500" />
                  <p className="text-xs text-red-500 font-medium">
                    Tenggat: Hari Ini, 15:00
                  </p>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                BARU
              </span>
            </AnimatedCard>

            <AnimatedCard
              delay={0.3}
              className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3 opacity-60"
            >
              <div className="pt-1">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-gray-400 rounded border-gray-300"
                  checked
                  readOnly
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-500 line-through">
                  Rekap Presensi Rapat
                </h3>
                <p className="text-xs text-gray-400 mt-1">Selesai kemarin</p>
              </div>
            </AnimatedCard>
          </section>

          {/* Section 3: Tugas Kegiatan */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
              <h2 className="font-bold text-gray-800 text-lg">
                Tugas Kegiatan
              </h2>
            </div>

            <AnimatedCard
              delay={0.4}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                <h3 className="font-bold text-gray-800">
                  Kajian Jumat (27 Jan)
                </h3>
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>

              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full shrink-0"></div>
                  <span className="flex-1">Persiapan Sound System</span>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                    Logistik
                  </span>
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-400 rounded-full shrink-0"></div>
                  <span className="flex-1">Beli Snack Pemateri</span>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                    Bendahara
                  </span>
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full shrink-0"></div>
                  <span className="flex-1">Dokumentasi</span>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                    Humas
                  </span>
                </li>
              </ul>
            </AnimatedCard>
          </section>
        </div>
      </div>
    </main>
  );
}
