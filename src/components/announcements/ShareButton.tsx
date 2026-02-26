"use client";

import { Announcement } from "@/types/announcement";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Check, Copy, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ShareButtonProps {
  announcement: Announcement;
}

export default function ShareButton({ announcement }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const getAnnouncementUrl = () => {
    return `${window.location.origin}/announcements`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getAnnouncementUrl());
      setCopied(true);
      const { toast } = await import("react-hot-toast");
      toast.success("Link berhasil disalin!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const { toast } = await import("react-hot-toast");
      toast.error("Gagal menyalin link");
    }
    setIsOpen(false);
  };

  const handleShareWhatsApp = () => {
    const formattedDate = announcement.createdAt
      ? format(
          announcement.createdAt.toDate(),
          "EEEE, d MMMM yyyy • HH.mm 'WIB'",
          { locale: id },
        )
      : "";

    const contentSnippet =
      announcement.content.length > 150
        ? announcement.content.substring(0, 147) + "..."
        : announcement.content;

    const targetAudience = announcement.targetAudience?.length
      ? announcement.targetAudience.join(" & ")
      : "";

    const message = [
      "PENGUMUMAN",
      `*${announcement.title.toUpperCase()}*`,
      "",
      `Dibuat: ${formattedDate}`,
      `Kategori: ${announcement.category}`,
      `Urgensi: ${announcement.urgency}`,
      ...(targetAudience ? [`Target: ${targetAudience}`] : []),
      "",
      contentSnippet,
      "",
      "Selengkapnya:",
      getAnnouncementUrl(),
    ].join("\n");

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
        title="Bagikan"
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden sm:inline">Bagikan</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fadeInUp">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400" />
            )}
            Salin Tautan
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-4 h-4 text-green-500"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Share ke WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}
