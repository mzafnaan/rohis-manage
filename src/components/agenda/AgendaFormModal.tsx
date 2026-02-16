"use client";

import Modal from "@/components/ui/Modal";
import SelectInput from "@/components/ui/SelectInput";
import { useAuth } from "@/context/AuthContext";
import { getFirebaseDb } from "@/lib/firebase";
import { Agenda } from "@/types/agenda";
import { useEffect, useState } from "react";

interface AgendaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Agenda | null;
  onSuccess?: () => void;
}

export default function AgendaFormModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: AgendaFormModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "Kajian",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    description: "",
  });

  useEffect(() => {
    if (initialData) {
      // Convert Firestore Timestamp to YYYY-MM-DD for input
      let dateStr = "";
      if (initialData.date && typeof initialData.date.toDate === "function") {
        dateStr = initialData.date.toDate().toISOString().split("T")[0];
      } else if (typeof initialData.date === "string") {
        dateStr = initialData.date; // Fallback if it's already string
      }

      setFormData({
        title: initialData.title || "",
        category: initialData.category || "Kajian",
        date: dateStr,
        startTime: initialData.startTime || "",
        endTime: initialData.endTime || "",
        location: initialData.location || "",
        description: initialData.description || "",
      });
    } else {
      setFormData({
        title: "",
        category: "Kajian",
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        description: "",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const db = await getFirebaseDb();
      const { addDoc, collection, doc, serverTimestamp, Timestamp, updateDoc } =
        await import("firebase/firestore");

      // Create a Date object from the date string to store as Timestamp (Local Midnight)
      const dateObj = new Date(formData.date + "T00:00:00");

      const agendaData = {
        title: formData.title,
        category: formData.category,
        date: Timestamp.fromDate(dateObj),
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        description: formData.description,
        updatedAt: serverTimestamp(),
      };

      if (initialData?.id) {
        // Update existing
        await updateDoc(doc(db, "agendas", initialData.id), agendaData);
      } else {
        // Create new
        await addDoc(collection(db, "agendas"), {
          ...agendaData,
          createdAt: serverTimestamp(),
          createdBy: user?.uid,
        });
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving agenda:", error);
      alert("Terjadi kesalahan saat menyimpan agenda");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Agenda" : "Tambah Agenda Baru"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Judul Kegiatan
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Contoh: Kajian Rutin"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <SelectInput
              label="Jenis Kegiatan"
              value={formData.category}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, category: value }))
              }
              options={["Kajian", "Rapat", "Event", "Lainnya"]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal
            </label>
            <input
              type="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Waktu Mulai
            </label>
            <input
              type="time"
              name="startTime"
              required
              value={formData.startTime}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Waktu Selesai
            </label>
            <input
              type="time"
              name="endTime"
              required
              value={formData.endTime}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lokasi
          </label>
          <input
            type="text"
            name="location"
            required
            value={formData.location}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Contoh: Masjid Sekolah"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deskripsi
          </label>
          <textarea
            name="description"
            rows={3}
            required
            value={formData.description}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Deskripsi singkat kegiatan..."
          />
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? "Menyimpan..." : "Simpan Agenda"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
