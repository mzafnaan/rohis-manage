"use client";

import { useAuth } from "@/context/AuthContext";
import clsx from "clsx";
import {
  Calendar,
  ClipboardList,
  HeartHandshake,
  LayoutDashboard,
  Megaphone,
  Package,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/finance", label: "Kas", icon: Wallet },
  { href: "/finance/infak", label: "Infak", icon: HeartHandshake },
  { href: "/announcements", label: "Info", icon: Megaphone },
  { href: "/tasks", label: "Tugas", icon: ClipboardList },
  { href: "/inventory", label: "Barang", icon: Package },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.href === "/finance" || item.href === "/finance/infak") {
      return ["bendahara", "ketua", "admin", "sekretaris"].includes(
        user?.role || "",
      );
    }
    return true;
  });

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive
                  ? "text-emerald-600"
                  : "text-gray-400 hover:text-gray-600",
              )}
            >
              {isActive && (
                <div className="absolute -top-0.5 w-12 h-1 bg-emerald-600 rounded-b-full transition-all duration-300" />
              )}
              <div
                className={clsx(
                  "transition-transform duration-200 active:scale-90",
                  isActive ? "scale-110" : "scale-100",
                )}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
