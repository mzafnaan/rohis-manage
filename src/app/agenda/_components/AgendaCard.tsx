import AnimatedCard from "@/components/ui/AnimatedCard";
import { Agenda } from "@/types/agenda";
import { Clock, MapPin, Pencil, Trash2 } from "lucide-react";
import { formatDate, getAgendaDate } from "../_utils";
import AgendaShareButton from "./AgendaShareButton";

interface AgendaCardProps {
  agenda: Agenda;
  index: number;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  onEdit: (agenda: Agenda) => void;
  onDelete: (id: string) => void;
}

export default function AgendaCard({
  agenda,
  index,
  canEdit,
  canDelete,
  canShare,
  onEdit,
  onDelete,
}: AgendaCardProps) {
  const agendaDate = getAgendaDate(agenda.date);

  return (
    <AnimatedCard
      key={agenda.id}
      delay={index * 0.05}
      className="relative group p-5 border-l-4 border-l-emerald-500 hover:shadow-lg transition-all duration-300 bg-white rounded-xl border-y border-r border-gray-100"
    >
      <div className="flex flex-col md:flex-row gap-5 justify-between items-start">
        {/* Date Box */}
        <div className="flex-shrink-0 flex md:flex-col flex-row items-center md:items-center justify-center bg-gray-50 rounded-lg p-3 md:w-20 w-full border border-gray-100 gap-2 md:gap-0">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            {formatDate(agendaDate, "MMM")}
          </span>
          <span className="text-2xl font-bold text-gray-800">
            {formatDate(agendaDate, "dd")}
          </span>
          <span className="text-xs text-gray-400 md:hidden block">
            {formatDate(agendaDate, "yyyy")}
          </span>
        </div>

        <div className="space-y-2 flex-1 w-full">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              {agenda.category}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              {agenda.startTime} - {agenda.endTime}
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 leading-tight">
            {agenda.title}
          </h3>

          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line line-clamp-2 group-hover:line-clamp-none transition-all">
            {agenda.description}
          </p>

          <div className="pt-2 flex items-center justify-between text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              {agenda.location}
            </div>
            {canShare && <AgendaShareButton agenda={agenda} />}
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
                onEdit(agenda);
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
                onDelete(agenda.id);
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
  );
}
