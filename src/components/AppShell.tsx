"use client";

import { useAuth } from "@/context/AuthContext";
import clsx from "clsx";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import SidebarSkeleton from "./SidebarSkeleton";

const BottomNav = dynamic(() => import("./BottomNav"), { ssr: false });
const Sidebar = dynamic(() => import("./Sidebar"), {
  ssr: false,
  loading: () => <SidebarSkeleton />,
});

const UserNav = dynamic(() => import("./UserNav"), { ssr: false });

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Optimistic navigation: Show nav structure on all pages except login
  // This prevents layout shifts while auth is loading
  const isLoginPage = pathname === "/login";
  const shouldShowNav = !isLoginPage;

  // Only render actual interactive components if auth is ready/confirmed
  // But always reserve space to correct CLS
  const showInteractiveNav = user && !loading && shouldShowNav;

  return (
    <>
      {shouldShowNav && (
        <>
          {/* Desktop Sidebar: Show skeleton while loading or real sidebar when ready */}
          {loading ? <SidebarSkeleton /> : showInteractiveNav && <Sidebar />}

          {/* Mobile Bottom Nav */}
          {showInteractiveNav && <BottomNav />}
        </>
      )}

      <div
        className={clsx(
          "min-h-screen bg-gray-50",
          shouldShowNav && "md:pl-64", // Always reserve space on desktop if nav is expected
          shouldShowNav && "pb-20 md:pb-0", // Reserve space for bottom nav on mobile
        )}
      >
        {children}

        {/* Top Right User Nav - Only on Home Page */}
        {showInteractiveNav && pathname === "/" && (
          <div className="fixed top-4 right-4 z-30 md:top-6 md:right-8">
            <UserNav />
          </div>
        )}
      </div>
    </>
  );
}
