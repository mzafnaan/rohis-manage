import { Announcement } from "@/types/announcement";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Edit, Pin, Trash2 } from "lucide-react";

interface AnnouncementCardProps {
  announcement: Announcement;
  onClick: (announcement: Announcement) => void;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (id: string) => void;
  canManage?: boolean;
}

export default function AnnouncementCard({
  announcement,
  onClick,
  onEdit,
  onDelete,
  canManage,
}: AnnouncementCardProps) {
  const isUrgent = announcement.urgency === "Mendesak";
  const isImportant = announcement.urgency === "Penting";

  // Safe formatting for Firestore Timestamp
  const formattedDate = announcement.createdAt
    ? format(announcement.createdAt.toDate(), "d MMM yyyy", { locale: id })
    : "";

  return (
    <div
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all duration-200 p-0 cursor-pointer relative group border border-gray-100 overflow-hidden flex flex-col h-full animate-fadeInUp"
      onClick={() => onClick(announcement)}
    >
      {/* Colored Top Strip based on Urgency */}
      <div
        className={`h-1.5 w-full ${
          isUrgent
            ? "bg-red-500"
            : isImportant
              ? "bg-orange-500"
              : "bg-emerald-500"
        }`}
      />

      <div className="p-5 flex flex-col flex-1">
        {/* Header: Category & Date */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isUrgent
                ? "bg-red-50 text-red-600"
                : isImportant
                  ? "bg-orange-50 text-orange-600"
                  : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {announcement.category}
          </span>
          {isUrgent && (
            <div className="flex items-center gap-1 text-red-500 animate-pulse">
              <Pin className="w-3.5 h-3.5 fill-current" />
              <span className="text-[10px] font-bold">MENDESAK</span>
            </div>
          )}
        </div>

        {/* Content Summary */}
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 leading-tight group-hover:text-emerald-700 transition-colors">
          {announcement.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-3 mb-6 leading-relaxed flex-1">
          {announcement.content}
        </p>

        {/* Footer: Date & Author */}
        <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white
                    ${isUrgent ? "bg-red-500" : isImportant ? "bg-orange-500" : "bg-emerald-500"}
                `}
            >
              {announcement.createdBy?.name?.charAt(0) || "A"}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-900 line-clamp-1 max-w-[80px]">
                {announcement.createdBy?.name || "Pengurus"}
              </span>
              <span className="text-[10px] text-gray-400">{formattedDate}</span>
            </div>
          </div>

          {/* Admin Actions */}
          {canManage && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(announcement);
                }}
                className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(announcement.id);
                }}
                className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                title="Hapus"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
