"use client";

import { useAuth } from "@/context/AuthContext";
import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        router.push("/");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null; // Or a forbidden page
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 flex items-center gap-3 text-red-800 text-sm">
          <ShieldAlert className="w-5 h-5" />
          <span className="font-medium">
            Admin Area - Hati-hati dalam mengubah data.
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
