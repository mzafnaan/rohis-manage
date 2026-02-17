"use client";

import { useAuth } from "@/context/AuthContext";
import clsx from "clsx";
import {
  Calendar,
  ClipboardList,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Package,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/finance", label: "Kas", icon: Wallet },
  { href: "/finance/infak", label: "Infak", icon: HeartHandshake },
  { href: "/announcements", label: "Pengumuman", icon: Megaphone },
  { href: "/tasks", label: "Tugas", icon: ClipboardList },
  { href: "/inventory", label: "Perlengkapan", icon: Package },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.href === "/finance" || item.href === "/finance/infak") {
      return ["bendahara", "ketua", "admin", "sekretaris", "anggota"].includes(
        user?.role || "",
      );
    }
    return true;
  });

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 hidden md:flex flex-col z-20">
      <div className="p-6 border-b border-gray-100 flex items-center justify-center">
        <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
          Rohis manage
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 group font-medium",
                isActive
                  ? "text-emerald-600 bg-emerald-50"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <Icon
                className={clsx(
                  "relative z-10 w-5 h-5",
                  isActive
                    ? "text-emerald-600"
                    : "text-gray-400 group-hover:text-gray-600",
                )}
              />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
