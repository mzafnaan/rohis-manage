"use client";

import { useAuth } from "@/context/AuthContext";
import { ClipboardList } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

// Skeleton placeholders shown while lazy components load
function AgendaSkeleton() {
  return (
    <div className="bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-600/20 p-6 h-full min-h-[180px] animate-pulse">
      <div className="flex items-center gap-2 mb-4 opacity-60">
        <div className="w-4 h-4 bg-white/30 rounded" />
        <div className="w-24 h-3 bg-white/30 rounded" />
      </div>
      <div className="w-3/4 h-6 bg-white/30 rounded mb-2" />
      <div className="w-1/2 h-4 bg-white/20 rounded mt-4" />
    </div>
  );
}

function BalanceSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full min-h-[180px] animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-gray-200 rounded-lg" />
        <div className="w-16 h-3 bg-gray-200 rounded" />
      </div>
      <div className="w-2/3 h-8 bg-gray-200 rounded mb-4" />
      <div className="w-20 h-3 bg-gray-100 rounded" />
    </div>
  );
}

function AnnouncementSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full min-h-[200px] animate-pulse">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-9 h-9 bg-gray-200 rounded-lg" />
        <div className="w-24 h-4 bg-gray-200 rounded" />
      </div>
      <div className="bg-gray-100 rounded-xl p-4 space-y-2">
        <div className="w-3/4 h-4 bg-gray-200 rounded" />
        <div className="w-full h-3 bg-gray-200 rounded" />
        <div className="w-1/2 h-3 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

// Lazy-load dashboard cards — Firebase SDK only loads when these render
const DashboardAgendaCard = dynamic(
  () => import("@/components/dashboard/DashboardAgendaCard"),
  { ssr: false, loading: () => <AgendaSkeleton /> },
);

const DashboardBalanceCard = dynamic(
  () => import("@/components/dashboard/DashboardBalanceCard"),
  { ssr: false, loading: () => <BalanceSkeleton /> },
);

const DashboardAnnouncementCard = dynamic(
  () => import("@/components/dashboard/DashboardAnnouncementCard"),
  { ssr: false, loading: () => <AnnouncementSkeleton /> },
);

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const dateString = useMemo(() => {
    return new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  if (!loading && !user) {
    return null; // Redirecting...
  }

  // Optimistic rendering: Render layout immediately even if loading
  // Skeletons will handle loading states for content

  return (
    <main className="min-h-screen pb-24 md:pb-0 bg-gray-50/50">
      {/* Header — renders instantly, no data dependency */}
      <header className="bg-white/80 backdrop-blur-md px-4 py-6 md:px-8 border-b border-gray-100 sticky top-0 z-10 w-full">
        <div className="max-w-4xl mx-auto md:mx-0">
          <p className="text-gray-500 text-sm mb-1 font-medium">{dateString}</p>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Assalamu&apos;alaikum,{" "}
              {loading || !user ? (
                <span className="inline-block w-32 h-8 bg-gray-200 rounded-lg animate-pulse" />
              ) : (
                <span className="text-emerald-600">
                  {user.name.split(" ")[0]}
                </span>
              )}
            </h1>
          </div>
        </div>
      </header>

      <div className="p-6 md:p-8 max-w-4xl space-y-6">
        {/* Primary Cards — lazy-loaded independently */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashboardAgendaCard />
          <DashboardBalanceCard />
        </div>

        {/* Secondary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tugas Anda — fully static, zero JS overhead */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900">Tugas Anda</h3>
              </div>
              <Link
                href="/tasks"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
              >
                Lihat Semua
              </Link>
            </div>

            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 cursor-pointer group"
                >
                  <div className="mt-1 min-w-[1.25rem] h-5 rounded-md border-2 border-gray-300 group-hover:border-blue-500 transition-colors flex items-center justify-center" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      Membuat Flyer Kajian Jumat
                    </h4>
                    <span className="text-xs text-red-500 font-medium">
                      Tenggat: Hari Ini, 15:00
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lazy-loaded announcement */}
          <DashboardAnnouncementCard />
        </div>
      </div>

      <div className="h-20 md:hidden" />
    </main>
  );
}
