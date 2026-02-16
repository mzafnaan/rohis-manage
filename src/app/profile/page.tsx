"use client";

import ChangePasswordModal from "@/components/profile/ChangePasswordModal";
import AnimatedCard from "@/components/ui/AnimatedCard";
import { useAuth } from "@/context/AuthContext";
import { Lock, LogOut, Mail, Shield, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Generate initials
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <main className="min-h-screen bg-gray-50 pb-20 md:pb-0 p-6 md:p-8 flex items-center justify-center md:block">
      <div className="max-w-xl mx-auto space-y-8 w-full">
        <header className="hidden md:block">
          <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
        </header>

        {/* Profile Card */}
        <AnimatedCard className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-20 z-0"></div>

          <div className="relative z-10 w-32 h-32 bg-white rounded-full p-2 mb-4 shadow-sm mt-8">
            <div className="w-full h-full bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-3xl font-bold">
              {initials}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 relative z-10">
            {user.name}
          </h2>

          <div className="mt-2 mb-6 relative z-10">
            <span
              className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide
              ${
                user.role === "admin"
                  ? "bg-red-100 text-red-700"
                  : user.role === "ketua"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              <Shield className="w-4 h-4 mr-1.5" />
              {user.role}
            </span>
          </div>

          <div className="w-full space-y-4 relative z-10">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="p-2 bg-white rounded-lg shadow-sm text-gray-500">
                <Mail className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <p className="text-xs text-gray-500 font-medium">Email</p>
                <p className="text-gray-900 font-medium break-all">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="p-2 bg-white rounded-lg shadow-sm text-gray-500">
                <User className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <p className="text-xs text-gray-500 font-medium">User ID</p>
                <p className="text-gray-900 font-medium text-xs font-mono">
                  {user.uid}
                </p>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Admin Menu (Only for Admin) */}
        {user.role === "admin" && (
          <AnimatedCard delay={0.2} className="block">
            <Link
              href="/admin"
              className="flex items-center gap-4 bg-white rounded-2xl p-6 shadow-sm border border-orange-200 hover:border-orange-400 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                <Shield className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900">Admin Panel</h3>
                <p className="text-sm text-gray-500">
                  Kelola data user, role, dan konfigurasi aplikasi.
                </p>
              </div>
            </Link>
          </AnimatedCard>
        )}

        {/* Actions */}
        <AnimatedCard delay={0.3} className="space-y-3">
          <button
            onClick={() => setIsChangePasswordOpen(true)}
            className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
          >
            <Lock className="w-5 h-5" />
            Ubah Kata Sandi
          </button>

          <button
            onClick={() => logout()}
            className="w-full bg-white border border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
          >
            <LogOut className="w-5 h-5" />
            Keluar dari Aplikasi
          </button>
        </AnimatedCard>

        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
        />

        <div className="text-center text-xs text-gray-400 pb-6">
          Versi Aplikasi 1.0.0
        </div>
      </div>
    </main>
  );
}
