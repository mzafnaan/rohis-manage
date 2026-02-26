"use client";

import AnnouncementCard from "@/components/announcements/AnnouncementCard";
import SelectInput from "@/components/ui/SelectInput";
import { useAuth } from "@/context/AuthContext";
import {
  createAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
} from "@/lib/announcements";
import { getFirebaseDb } from "@/lib/firebase";
import {
  Announcement,
  AnnouncementCategory,
  AnnouncementUrgency,
} from "@/types/announcement";
import { Filter, Megaphone, Plus, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Lazy-load modal components and react-hot-toast
const AnnouncementFormModal = dynamic(
  () => import("@/components/announcements/AnnouncementFormModal"),
  { ssr: false },
);

const AnnouncementDetailModal = dynamic(
  () => import("@/components/announcements/AnnouncementDetailModal"),
  { ssr: false },
);

// Lazy toast helper
const showToast = async (type: "success" | "error", message: string) => {
  const { toast } = await import("react-hot-toast");
  toast[type](message);
};

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<
    Announcement[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    AnnouncementCategory | "All"
  >("All");
  const [selectedUrgency, setSelectedUrgency] = useState<
    AnnouncementUrgency | "All"
  >("All");

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Permissions: Only Sekretaris can manage
  const canManage = user?.role === "sekretaris";

  // Real-time Fetch
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const db = await getFirebaseDb();
      const { collection, onSnapshot, orderBy, query } =
        await import("firebase/firestore");

      const q = query(
        collection(db, "announcements"),
        orderBy("createdAt", "desc"),
      );
      unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Announcement[];
        setAnnouncements(data);
        setIsLoading(false);
      });
    })();

    return () => unsubscribe?.();
  }, []);

  // Filtering Logic
  useEffect(() => {
    let result = announcements;

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(lowerQuery) ||
          a.content.toLowerCase().includes(lowerQuery),
      );
    }

    if (selectedCategory !== "All") {
      result = result.filter((a) => a.category === selectedCategory);
    }

    if (selectedUrgency !== "All") {
      result = result.filter((a) => a.urgency === selectedUrgency);
    }

    const sortedResult = [...result].sort((a, b) => {
      if (a.urgency === "Mendesak" && b.urgency !== "Mendesak") return -1;
      if (a.urgency !== "Mendesak" && b.urgency === "Mendesak") return 1;
      return 0;
    });

    setFilteredAnnouncements(sortedResult);
  }, [announcements, searchQuery, selectedCategory, selectedUrgency]);

  // Handlers
  const handleCreate = () => {
    setEditingAnnouncement(null);
    setIsFormOpen(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pengumuman ini?")) {
      try {
        await deleteAnnouncement(id);
        await showToast("success", "Pengumuman berhasil dihapus");
      } catch (error) {
        console.error(error);
        await showToast("error", "Gagal menghapus pengumuman");
      }
    }
  };

  const handleSubmitForm = async (data: Partial<Announcement>) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      if (editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement.id, data);
        await showToast("success", "Pengumuman diperbarui");
      } else {
        const creator = {
          uid: user.uid,
          name: user.name,
          role: user.role as
            | "admin"
            | "sekretaris"
            | "bendahara"
            | "ketua"
            | "anggota",
        };

        await createAnnouncement({
          ...data,
          createdBy: creator,
        } as Omit<Announcement, "id" | "createdAt">);
        await showToast("success", "Pengumuman diterbitkan");
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error(error);
      await showToast("error", "Gagal menyimpan pengumuman");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCardClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Standard Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-emerald-600" />
              Papan Pengumuman
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Informasi resmi dan kegiatan terbaru Rohis
            </p>
          </div>

          {canManage && (
            <button
              onClick={handleCreate}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm shadow-sm md:w-auto w-full"
            >
              <Plus className="w-5 h-5" />
              Buat Pengumuman
            </button>
          )}
        </div>

        {/* Filters Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari pengumuman..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="min-w-[200px]">
              <SelectInput
                icon={Filter}
                value={selectedCategory}
                onChange={(value) =>
                  setSelectedCategory(value as AnnouncementCategory | "All")
                }
                options={[
                  { value: "All", label: "Semua Kategori" },
                  { value: "Penting", label: "Penting" },
                  { value: "Kegiatan", label: "Kegiatan" },
                  { value: "Sosial", label: "Sosial" },
                  { value: "Informasi Umum", label: "Informasi Umum" },
                  { value: "Keuangan", label: "Keuangan" },
                ]}
              />
            </div>

            {/* Urgency Filter */}
            <div className="relative min-w-[180px]">
              {selectedUrgency === "Mendesak" && (
                <div className="absolute left-10 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500 pointer-events-none z-10"></div>
              )}
              <SelectInput
                value={selectedUrgency}
                onChange={(value) =>
                  setSelectedUrgency(value as AnnouncementUrgency | "All")
                }
                options={[
                  { value: "All", label: "Semua Urgensi" },
                  { value: "Mendesak", label: "Mendesak" },
                  { value: "Penting", label: "Penting" },
                  { value: "Biasa", label: "Biasa" },
                ]}
                className={selectedUrgency === "Mendesak" ? "pl-4" : ""}
              />
            </div>
          </div>
        </div>

        {/* List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <>
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 animate-pulse h-64 flex flex-col"
                >
                  <div className="flex justify-between items-start">
                    <div className="h-6 bg-gray-100 rounded-full w-24"></div>
                    <div className="h-4 bg-gray-100 rounded w-20"></div>
                  </div>
                  <div className="h-8 bg-gray-100 rounded-lg w-3/4 my-4"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-100 rounded w-4/6"></div>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                    <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-32"></div>
                  </div>
                </div>
              ))
            ) : filteredAnnouncements.length > 0 ? (
              filteredAnnouncements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  onClick={handleCardClick}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  canManage={canManage}
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 border-dashed">
                <div className="bg-emerald-50 p-6 rounded-full mb-6">
                  <Megaphone className="w-12 h-12 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Tidak ada pengumuman
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Belum ada pengumuman yang sesuai dengan kriteria pencarian
                  Anda.
                  {canManage &&
                    " Mulai buat pengumuman baru untuk memberitahu anggota."}
                </p>
                {canManage && (
                  <button
                    onClick={handleCreate}
                    className="mt-6 text-emerald-600 font-medium hover:underline hover:text-emerald-700"
                  >
                    Buat Pengumuman Baru &rarr;
                  </button>
                )}
              </div>
            )}
          </>
        </div>
      </div>

      {/* Modals — only rendered when opened */}
      {isFormOpen && (
        <AnnouncementFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSubmitForm}
          initialData={editingAnnouncement}
          isLoading={isSubmitting}
        />
      )}

      {isDetailOpen && (
        <AnnouncementDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          announcement={selectedAnnouncement}
          userRole={user?.role}
        />
      )}
    </div>
  );
}
