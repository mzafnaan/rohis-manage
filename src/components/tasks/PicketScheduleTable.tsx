"use client";

import { getFirebaseDb } from "@/lib/firebase";
import { PicketSchedule } from "@/types/picket";
import { Edit2, Plus, Save, X } from "lucide-react";
import { useEffect, useState } from "react";

// Lazy toast helper
const showToast = async (type: "success" | "error", message: string) => {
  const { toast } = await import("react-hot-toast");
  toast[type](message);
};

interface PicketScheduleTableProps {
  canEdit: boolean;
}

const DAYS = ["senin", "selasa", "rabu", "kamis", "jumat"] as const;
const DAY_LABELS: Record<string, string> = {
  senin: "Senin",
  selasa: "Selasa",
  rabu: "Rabu",
  kamis: "Kamis",
  jumat: "Jumat",
};

export default function PicketScheduleTable({
  canEdit,
}: PicketScheduleTableProps) {
  const [schedule, setSchedule] = useState<PicketSchedule>({
    senin: [],
    selasa: [],
    rabu: [],
    kamis: [],
    jumat: [],
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newNames, setNewNames] = useState<Record<string, string>>({
    senin: "",
    selasa: "",
    rabu: "",
    kamis: "",
    jumat: "",
  });

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const db = await getFirebaseDb();
      const { doc, getDoc } = await import("firebase/firestore");
      const docRef = doc(db, "picket_schedules", "weekly");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setSchedule(docSnap.data() as PicketSchedule);
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
      await showToast("error", "Gagal memuat jadwal piket");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const db = await getFirebaseDb();
      const { doc, setDoc } = await import("firebase/firestore");
      const docRef = doc(db, "picket_schedules", "weekly");
      await setDoc(docRef, schedule);
      await showToast("success", "Jadwal piket berhasil disimpan");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving schedule:", error);
      await showToast("error", "Gagal menyimpan jadwal piket");
    }
  };

  const addName = (day: keyof PicketSchedule) => {
    if (!newNames[day].trim()) return;

    setSchedule((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), newNames[day].trim()],
    }));
    setNewNames((prev) => ({ ...prev, [day]: "" }));
  };

  const removeName = (day: keyof PicketSchedule, index: number) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-bold text-gray-800">Jadwal Piket Mingguan</h3>
        {canEdit && (
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isEditing
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4" />
                Simpan
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4" />
                Edit
              </>
            )}
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-medium">
            <tr>
              <th className="px-4 py-3 w-32">Hari</th>
              <th className="px-4 py-3">Petugas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {DAYS.map((day) => (
              <tr key={day} className="group hover:bg-gray-50/50">
                <td className="px-4 py-4 font-medium text-gray-900 align-top">
                  {DAY_LABELS[day]}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    {schedule[day]?.map((name, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                      >
                        {name}
                        {isEditing && (
                          <button
                            onClick={() => removeName(day, index)}
                            className="ml-1.5 text-blue-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                    {(!schedule[day] || schedule[day].length === 0) &&
                      !isEditing && (
                        <span className="text-gray-400 italic text-xs">
                          Belum ada petugas
                        </span>
                      )}
                  </div>

                  {isEditing && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={newNames[day]}
                        onChange={(e) =>
                          setNewNames((prev) => ({
                            ...prev,
                            [day]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addName(day);
                          }
                        }}
                        placeholder="Tambah nama..."
                        className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      <button
                        onClick={() => addName(day)}
                        disabled={!newNames[day].trim()}
                        className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
