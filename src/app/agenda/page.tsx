"use client";

import AnimatedCard from "@/components/ui/AnimatedCard";
import { useAuth } from "@/context/AuthContext";
import { getFirebaseDb } from "@/lib/firebase";
import { Agenda } from "@/types/agenda";
import type { Timestamp } from "firebase/firestore";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

// Lazy-load heavy components
const AgendaFormModal = dynamic(
  () => import("@/components/agenda/AgendaFormModal"),
  { ssr: false },
);

const AgendaCalendarPopover = dynamic(
  () =>
    import("@/components/agenda/AgendaCalendar").then((mod) => {
      // We'll wrap the calendar in the popover logic inline
      return { default: mod.default };
    }),
  { ssr: false },
);

export default function AgendaPage() {
  const { user } = useAuth();
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<Agenda | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);

  // Calendar & Filtering State
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Role-based permissions
  const isAdminOrSecretary = ["admin", "sekretaris"].includes(user?.role || "");
  const isChairman = ["ketua"].includes(user?.role || "");
  const canAdd = isAdminOrSecretary || isChairman;
  const canEdit = isAdminOrSecretary || isChairman;
  const canDelete = isAdminOrSecretary || isChairman;

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

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus agenda ini?")) return;
    try {
      const db = await getFirebaseDb();
      const { doc, deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "agendas", id));
    } catch (error) {
      console.error("Error deleting agenda:", error);
      alert("Gagal menghapus agenda");
    }
  };

  const handleEdit = (agenda: Agenda) => {
    setEditingAgenda(agenda);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingAgenda(null);
    setIsModalOpen(true);
  };

  const getAgendaDate = (timestamp: Timestamp | Date) => {
    return "toDate" in timestamp
      ? (timestamp as Timestamp).toDate()
      : new Date(timestamp);
  };

  // Lazy-load date-fns only for formatting
  const formatDate = (date: Date, fmt: string) => {
    // Use native Intl for basic formatting to avoid loading date-fns eagerly
    if (fmt === "MMM") {
      return date.toLocaleDateString("id-ID", { month: "short" }).toUpperCase();
    }
    if (fmt === "dd") {
      return date.toLocaleDateString("id-ID", { day: "2-digit" });
    }
    if (fmt === "yyyy") {
      return date.getFullYear().toString();
    }
    if (fmt === "full") {
      return date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    if (fmt === "short") {
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    return date.toLocaleDateString("id-ID");
  };

  // Filter Logic
  const filteredAgendas = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return agendas.filter((item) => {
      const itemDate = getAgendaDate(item.date);
      if (selectedDate) {
        return (
          itemDate.getFullYear() === selectedDate.getFullYear() &&
          itemDate.getMonth() === selectedDate.getMonth() &&
          itemDate.getDate() === selectedDate.getDate()
        );
      }
      return itemDate >= today;
    });
  }, [agendas, selectedDate]);

  // Extract dates that have agendas for the calendar markers
  const agendaDates = useMemo(
    () => agendas.map((a) => getAgendaDate(a.date)),
    [agendas],
  );

  return (
    <main className="min-h-screen bg-gray-50 pb-24 md:pb-8 p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="w-8 h-8 text-emerald-600" />
              Agenda Kegiatan
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Jadwal kegiatan Rohis mendatang.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Calendar Toggle Button — simple dropdown instead of @headlessui */}
            <div className="relative">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className={`
                  inline-flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm font-medium
                  ${
                    selectedDate
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }
                `}
              >
                <CalendarIcon className="w-4 h-4" />
                {selectedDate
                  ? formatDate(selectedDate, "short")
                  : "Pilih Tanggal"}
              </button>

              {selectedDate && (
                <button
                  onClick={() => setSelectedDate(null)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Hapus filter tanggal"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {showCalendar && (
                <div className="absolute left-0 md:left-auto md:right-0 z-30 mt-3 w-screen max-w-xs transform md:max-w-sm px-4 sm:px-0">
                  <div className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-black ring-opacity-5">
                    <AgendaCalendarPopover
                      selectedDate={selectedDate}
                      onSelectDate={(date: Date | null) => {
                        setSelectedDate(date);
                        setShowCalendar(false);
                      }}
                      highlightedDates={agendaDates}
                    />
                  </div>
                </div>
              )}
            </div>

            {canAdd && (
              <button
                onClick={handleAddNew}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden md:inline">Tambah</span>
              </button>
            )}
          </div>
        </header>

        {/* Selected Date Header */}
        {selectedDate && (
          <div className="flex items-center justify-between bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100">
            <span className="text-emerald-800 font-medium text-sm">
              Menampilkan agenda untuk:{" "}
              <strong>{formatDate(selectedDate, "full")}</strong>
            </span>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-xs text-emerald-600 hover:text-emerald-800 underline"
            >
              Tampilkan Semua
            </button>
          </div>
        )}

        {/* Content Section */}
        <section className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-500 text-sm">Memuat agenda...</p>
            </div>
          ) : filteredAgendas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 text-center px-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <CalendarIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {selectedDate
                  ? "Tidak ada agenda"
                  : "Belum ada agenda mendatang"}
              </h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                {selectedDate
                  ? `Tidak ada agenda kegiatan pada tanggal ${formatDate(selectedDate, "full")}.`
                  : "Belum ada jadwal kegiatan yang akan datang. Silakan cek kembali nanti atau tambahkan agenda baru."}
              </p>

              {selectedDate && (
                <button
                  onClick={() => setSelectedDate(null)}
                  className="mt-4 text-emerald-600 font-medium text-sm hover:underline"
                >
                  Lihat agenda mendatang lainnya
                </button>
              )}

              {!selectedDate && canAdd && (
                <button
                  onClick={handleAddNew}
                  className="mt-6 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Buat Agenda Baru
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredAgendas.map((item, index) => (
                <AnimatedCard
                  key={item.id}
                  delay={index * 0.05}
                  className="relative group p-5 border-l-4 border-l-emerald-500 hover:shadow-lg transition-all duration-300 bg-white rounded-xl border-y border-r border-gray-100"
                >
                  <div className="flex flex-col md:flex-row gap-5 justify-between items-start">
                    {/* Date Box */}
                    <div className="flex-shrink-0 flex md:flex-col flex-row items-center md:items-center justify-center bg-gray-50 rounded-lg p-3 md:w-20 w-full border border-gray-100 gap-2 md:gap-0">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        {formatDate(getAgendaDate(item.date), "MMM")}
                      </span>
                      <span className="text-2xl font-bold text-gray-800">
                        {formatDate(getAgendaDate(item.date), "dd")}
                      </span>
                      <span className="text-xs text-gray-400 md:hidden block">
                        {formatDate(getAgendaDate(item.date), "yyyy")}
                      </span>
                    </div>

                    <div className="space-y-2 flex-1 w-full">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                          {item.category}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {item.startTime} - {item.endTime}
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 leading-tight">
                        {item.title}
                      </h3>

                      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line line-clamp-2 group-hover:line-clamp-none transition-all">
                        {item.description}
                      </p>

                      <div className="pt-2 flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        {item.location}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {(canEdit || canDelete) && (
                    <div className="absolute top-4 right-4 flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      {canEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(item);
                          }}
                          title="Edit Agenda"
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          title="Hapus Agenda"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </AnimatedCard>
              ))}
            </div>
          )}
        </section>
      </div>

      {isModalOpen && (
        <AgendaFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={editingAgenda}
          onSuccess={() => setIsModalOpen(false)}
        />
      )}
    </main>
  );
}
