"use client";

import Modal from "@/components/ui/Modal";
import SelectInput from "@/components/ui/SelectInput";
import { useAuth } from "@/context/AuthContext";
import { getFirebaseDb } from "@/lib/firebase";
import { Agenda, AgendaTask } from "@/types/agenda";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const ROLE_OPTIONS = [
  "bendahara",
  "sekretaris",
  "humas",
  "perlengkapan",
  "anggota",
  "ketua",
  "admin",
];

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
    status: "active" as "active" | "done",
  });
  const [tasks, setTasks] = useState<AgendaTask[]>([]);

  useEffect(() => {
    if (initialData) {
      let dateStr = "";
      if (initialData.date && typeof initialData.date.toDate === "function") {
        dateStr = initialData.date.toDate().toISOString().split("T")[0];
      } else if (typeof initialData.date === "string") {
        dateStr = initialData.date;
      }

      setFormData({
        title: initialData.title || "",
        category: initialData.category || "Kajian",
        date: dateStr,
        startTime: initialData.startTime || "",
        endTime: initialData.endTime || "",
        location: initialData.location || "",
        description: initialData.description || "",
        status: initialData.status || "active",
      });
      setTasks(initialData.tasks || []);
    } else {
      setFormData({
        title: "",
        category: "Kajian",
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        description: "",
        status: "active",
      });
      setTasks([]);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const db = await getFirebaseDb();
      const { addDoc, collection, doc, serverTimestamp, Timestamp, updateDoc } =
        await import("firebase/firestore");

      const dateObj = new Date(formData.date + "T00:00:00");

      const agendaData = {
        title: formData.title,
        category: formData.category,
        date: Timestamp.fromDate(dateObj),
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        description: formData.description,
        status: formData.status,
        tasks: tasks.filter((t) => t.role && t.description.trim()),
        updatedAt: serverTimestamp(),
      };

      if (initialData?.id) {
        await updateDoc(doc(db, "agendas", initialData.id), agendaData);
      } else {
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

  const addTask = () => {
    setTasks((prev) => [...prev, { role: "bendahara", description: "" }]);
  };

  const removeTask = (index: number) => {
    setTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTask = (
    index: number,
    field: keyof AgendaTask,
    value: string,
  ) => {
    setTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)),
    );
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <SelectInput
              label="Status Agenda"
              value={formData.status}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  status: value as "active" | "done",
                }))
              }
              options={["active", "done"]}
            />
          </div>
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

        {/* Task Assignments Section */}
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">
              Pembagian Tugas{" "}
              <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <button
              type="button"
              onClick={addTask}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Tugas
            </button>
          </div>

          {tasks.length > 0 && (
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 bg-gray-50 rounded-lg p-3 border border-gray-100"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                    <SelectInput
                      value={task.role}
                      onChange={(value) => updateTask(index, "role", value)}
                      options={ROLE_OPTIONS.map((role) => ({
                        value: role,
                        label: role.charAt(0).toUpperCase() + role.slice(1),
                      }))}
                      buttonClassName="py-1.5 text-sm"
                    />
                    <input
                      type="text"
                      value={task.description}
                      onChange={(e) =>
                        updateTask(index, "description", e.target.value)
                      }
                      placeholder="Deskripsi tugas..."
                      className="sm:col-span-2 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTask(index)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 mt-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
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
