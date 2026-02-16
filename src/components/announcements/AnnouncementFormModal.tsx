import SelectInput from "@/components/ui/SelectInput";
import {
  Announcement,
  AnnouncementCategory,
  AnnouncementUrgency,
  TargetAudience,
} from "@/types/announcement";
import { Dialog, Transition } from "@headlessui/react";
import { Loader2, X } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface AnnouncementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Announcement>) => Promise<void>;
  initialData?: Announcement | null;
  isLoading?: boolean;
}

const CATEGORIES: AnnouncementCategory[] = [
  "Penting",
  "Kegiatan",
  "Sosial",
  "Informasi Umum",
  "Keuangan",
];

const URGENCIES: AnnouncementUrgency[] = ["Mendesak", "Penting", "Biasa"];

const TARGET_AUDIENCES: TargetAudience[] = [
  "Seluruh Anggota",
  "Pengurus",
  "Panitia Kegiatan",
  "Anggota Baru",
];

export default function AnnouncementFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: AnnouncementFormModalProps) {
  const [formData, setFormData] = useState<Partial<Announcement>>({
    title: "",
    content: "",
    category: "Informasi Umum",
    urgency: "Biasa",
    targetAudience: ["Seluruh Anggota"],
    externalLink: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          title: "",
          content: "",
          category: "Informasi Umum",
          urgency: "Biasa",
          targetAudience: ["Seluruh Anggota"],
        });
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast.error("Judul dan isi pengumuman wajib diisi");
      return;
    }

    const finalPayload = { ...formData };
    if (!finalPayload.externalLink) delete finalPayload.externalLink;

    setIsSubmitting(true);
    try {
      await onSubmit(finalPayload);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Gagal menyimpan pengumuman");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAudience = (audience: TargetAudience) => {
    const current = formData.targetAudience || [];
    if (current.includes(audience)) {
      setFormData({
        ...formData,
        targetAudience: current.filter((a) => a !== audience),
      });
    } else {
      setFormData({ ...formData, targetAudience: [...current, audience] });
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold text-gray-900"
                  >
                    {initialData ? "Edit Pengumuman" : "Buat Pengumuman Baru"}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Judul Pengumuman
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      placeholder="Contoh: Rapat Evaluasi Bulanan"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Isi Pengumuman
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
                      placeholder="Tulis detail pengumuman di sini..."
                    />
                  </div>

                  {/* Row: Category & Urgency */}
                  <div className="grid grid-cols-2 gap-4">
                    <SelectInput
                      label="Kategori"
                      value={formData.category || "Informasi Umum"}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
                          category: value as AnnouncementCategory,
                        })
                      }
                      options={CATEGORIES}
                    />

                    <SelectInput
                      label="Tingkat Urgensi"
                      value={formData.urgency || "Biasa"}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
                          urgency: value as AnnouncementUrgency,
                        })
                      }
                      options={URGENCIES}
                    />
                  </div>

                  {/* Target Audience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Audiens
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {TARGET_AUDIENCES.map((audience) => {
                        const isSelected =
                          formData.targetAudience?.includes(audience);
                        return (
                          <button
                            key={audience}
                            type="button"
                            onClick={() => toggleAudience(audience)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                              isSelected
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {audience}
                          </button>
                        );
                      })}
                    </div>
                    {(!formData.targetAudience ||
                      formData.targetAudience.length === 0) && (
                      <p className="text-xs text-red-500 mt-1">
                        Pilih minimal satu target audiens
                      </p>
                    )}
                  </div>

                  {/* External Link */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Link Eksternal (Opsional)
                    </label>
                    <input
                      type="url"
                      value={formData.externalLink || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          externalLink: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      placeholder="https://..."
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                      disabled={isLoading}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={
                        isLoading ||
                        isSubmitting ||
                        !formData.title ||
                        !formData.content ||
                        formData.targetAudience?.length === 0
                      }
                      className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {(isLoading || isSubmitting) && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      {initialData ? "Simpan Perubahan" : "Publikasikan"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
