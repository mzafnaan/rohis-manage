import { Announcement } from "@/types/announcement";
import { Dialog, Transition } from "@headlessui/react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  AlertCircle,
  Calendar,
  ExternalLink,
  Tag,
  Users,
  X,
} from "lucide-react";
import { Fragment } from "react";

interface AnnouncementDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: Announcement | null;
}

export default function AnnouncementDetailModal({
  isOpen,
  onClose,
  announcement,
}: AnnouncementDetailModalProps) {
  if (!announcement) return null;

  const formattedDate = announcement.createdAt
    ? format(announcement.createdAt.toDate(), "EEEE, d MMMM yyyy • HH:mm", {
        locale: id,
      })
    : "";

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
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                      {announcement.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Metadata Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 
                        ${
                          announcement.urgency === "Mendesak"
                            ? "bg-red-100 text-red-700"
                            : announcement.urgency === "Penting"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-emerald-100 text-emerald-700"
                        }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    {announcement.urgency}
                  </div>
                  <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium flex items-center gap-1.5">
                    <Tag className="w-4 h-4" />
                    {announcement.category}
                  </div>
                  <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {announcement.targetAudience.join(", ")}
                  </div>
                </div>

                {/* Content */}
                <div className="prose prose-emerald max-w-none mb-8">
                  <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {announcement.content}
                  </p>
                </div>

                {/* Extra Links/Attachments */}
                {announcement.externalLink && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Tautan Terkait
                    </h4>
                    <a
                      href={announcement.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-emerald-600 hover:underline break-all"
                    >
                      <ExternalLink className="w-4 h-4 flex-shrink-0" />
                      {announcement.externalLink}
                    </a>
                  </div>
                )}

                {/* Attachment */}
                {announcement.attachment && (
                  <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                        <Tag className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-emerald-900 text-sm">
                          Lampiran Dokumen
                        </p>
                        <p className="text-xs text-emerald-700 max-w-[200px] truncate">
                          {announcement.attachment.name}
                        </p>
                      </div>
                    </div>
                    <a
                      href={announcement.attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                      download
                    >
                      Download
                    </a>
                  </div>
                )}

                {/* Footer Author */}
                <div className="border-t pt-4 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                      {announcement.createdBy?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {announcement.createdBy?.name || "Admin"}
                      </p>
                      <p className="text-xs">
                        {announcement.createdBy?.role || "Sekretaris"}
                      </p>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
