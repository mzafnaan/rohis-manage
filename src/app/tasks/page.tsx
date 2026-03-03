"use client";

import { useAuth } from "@/context/AuthContext";
import { getFirebaseDb } from "@/lib/firebase";
import { Agenda } from "@/types/agenda";
import { CheckSquare, ClipboardList, Inbox } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getAgendaDate } from "./_utils";

import PicketScheduleTable from "@/components/tasks/PicketScheduleTable";
import AnimatedCard from "@/components/ui/AnimatedCard";

const TaskCard = dynamic(() => import("./_components/TaskCard"), {
  ssr: false,
});

export default function TasksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch all agendas that have tasks assigned
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const db = await getFirebaseDb();
      const { collection, onSnapshot, orderBy, query } =
        await import("firebase/firestore");

      const q = query(collection(db, "agendas"), orderBy("date", "asc"));

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const agendaList = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              date: data.date,
            };
          }) as Agenda[];
          setAgendas(agendaList);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching agendas:", error);
          setLoading(false);
        },
      );
    })();

    return () => unsubscribe?.();
  }, []);

  // Filter tasks for current user's role and sort by nearest date
  const myTasks = useMemo(() => {
    if (!user?.role) return [];

    return agendas
      .filter((agenda) => {
        if (!agenda.tasks || agenda.tasks.length === 0) return false;
        const hasMyTask = agenda.tasks.some(
          (t) => t.role.toLowerCase() === user.role.toLowerCase(),
        );
        const isActive = !agenda.status || agenda.status === "active";
        return hasMyTask && isActive;
      })
      .sort((a, b) => {
        const dateA = getAgendaDate(a.date).getTime();
        const dateB = getAgendaDate(b.date).getTime();
        return dateA - dateB;
      });
  }, [agendas, user?.role]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const canEditSchedule = ["sekretaris", "admin", "ketua"].includes(
    user?.role || "",
  );

  return (
    <main className="min-h-screen pb-20 md:pb-0 bg-gray-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
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

        {/* Section 2: Tugas Saya */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
            <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-emerald-600" />
              Tugas Saya
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-500 text-sm">Memuat tugas...</p>
            </div>
          ) : myTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 text-center px-6">
              <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Inbox className="w-7 h-7 text-gray-300" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-1">
                Tidak ada tugas aktif saat ini.
              </h3>
              <p className="text-gray-400 text-sm max-w-xs">
                Semua tugas Anda sudah selesai atau belum ada agenda yang
                membutuhkan tindakan dari peran Anda.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {myTasks.map((agenda, index) => {
                const myTask = agenda.tasks!.find(
                  (t) => t.role.toLowerCase() === user.role.toLowerCase(),
                );
                return (
                  <TaskCard
                    key={agenda.id}
                    agenda={agenda}
                    userRole={user.role}
                    taskDescription={myTask?.description || ""}
                    index={index}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
