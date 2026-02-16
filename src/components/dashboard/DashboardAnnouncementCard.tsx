"use client";

import { useAuth } from "@/context/AuthContext";
import { getLatestAnnouncement } from "@/lib/announcements";
import { Announcement } from "@/types/announcement";
import { ArrowRight, Megaphone } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardAnnouncementCard() {
  const { user } = useAuth();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return; // Wait for auth
    const fetch = async () => {
      try {
        const data = await getLatestAnnouncement();
        setAnnouncement(data);
      } catch (error) {
        console.error("Error fetching announcement:", error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  if (loading) {
    return (
      <Link href="/announcements">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full animate-pulse">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-gray-200 rounded-lg" />
            <div className="w-24 h-4 bg-gray-200 rounded" />
          </div>
          <div className="bg-gray-100 rounded-xl p-4 space-y-2">
            <div className="w-3/4 h-4 bg-gray-200 rounded" />
            <div className="w-full h-3 bg-gray-200 rounded" />
            <div className="w-1/2 h-3 bg-gray-200 rounded" />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href="/announcements">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:-translate-y-1 transition-transform duration-200 p-6 h-full min-h-[200px] cursor-pointer group hover:border-emerald-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Megaphone className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-bold text-gray-900">Info Terbaru</h3>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </div>

        {announcement ? (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 group-hover:bg-emerald-50/50 group-hover:border-emerald-100 transition-colors">
            {announcement.urgency === "Mendesak" && (
              <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full mb-2 inline-block">
                PENTING
              </span>
            )}
            <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">
              {announcement.title}
            </h4>
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">
              {announcement.content}
            </p>
            <div className="text-xs text-gray-400 font-medium">
              {announcement.createdAt?.toDate().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              })}{" "}
              • Oleh {announcement.createdBy?.role || "Sekretaris"}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-400 text-sm">
            Belum ada pengumuman terbaru.
          </div>
        )}
      </div>
    </Link>
  );
}
