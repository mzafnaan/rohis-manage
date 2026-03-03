"use client";

import AnimatedCard from "@/components/ui/AnimatedCard";
import { Agenda } from "@/types/agenda";
import { Calendar, ExternalLink, MapPin } from "lucide-react";
import { capitalizeRole, formatTaskDate, getAgendaDate } from "../_utils";

interface TaskCardProps {
  agenda: Agenda;
  userRole: string;
  taskDescription: string;
  index: number;
}

export default function TaskCard({
  agenda,
  userRole,
  taskDescription,
  index,
}: TaskCardProps) {
  const agendaDate = getAgendaDate(agenda.date);
  const isActive = agenda.status === "active";

  const handleShareWhatsApp = () => {
    const dateStr = formatTaskDate(agendaDate);
    const message = [
      `📋 *TUGAS - ${agenda.title.toUpperCase()}*`,
      "",
      `📅 Tanggal: ${dateStr}`,
      `⏰ Waktu: ${agenda.startTime} - ${agenda.endTime} WIB`,
      `📍 Lokasi: ${agenda.location}`,
      "",
      `👤 Role: ${capitalizeRole(userRole)}`,
      `📝 Tugas: ${taskDescription}`,
      "",
      `Status: ${isActive ? "🟢 Active" : "⚪ Done"}`,
    ].join("\n");

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <AnimatedCard
      delay={index * 0.06}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-visible"
    >
      <div className="p-5">
        {/* Top row: Title + Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-bold text-gray-900 leading-snug">
            {agenda.title}
          </h3>
          <span
            className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
              isActive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {isActive ? "Active" : "Done"}
          </span>
        </div>

        {/* Info rows */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>{formatTaskDate(agendaDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>{agenda.location}</span>
          </div>
        </div>

        {/* Role Badge */}
        <div className="mb-3">
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600">
            👤 {capitalizeRole(userRole)}
          </span>
        </div>

        {/* Task Description */}
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          {taskDescription}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
          <a
            href="/agenda"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Lihat Detail
          </a>
          <button
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </button>
        </div>
      </div>
    </AnimatedCard>
  );
}
