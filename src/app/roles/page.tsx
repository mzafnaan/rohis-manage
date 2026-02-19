"use client";

import AnimatedCard from "@/components/ui/AnimatedCard";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  Eye,
  Megaphone,
  Package,
  Settings,
  Shield,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoleInfo {
  id: string;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ElementType;
  permissions: { label: string; icon: React.ElementType }[];
}

const roles: RoleInfo[] = [
  {
    id: "admin",
    label: "Admin",
    description:
      "Mengelola Admin Panel untuk mengatur data user, role, dan konfigurasi aplikasi.",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: Settings,
    permissions: [
      { label: "Admin Panel (kelola user & role)", icon: Users },
      { label: "Melihat semua halaman", icon: Eye },
    ],
  },
  {
    id: "ketua",
    label: "Ketua",
    description:
      "Mengawasi seluruh kegiatan Rohis. Dapat melihat semua halaman dan mengelola Agenda serta Tugas.",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: Shield,
    permissions: [
      { label: "Melihat semua halaman", icon: Eye },
      { label: "Mengelola Agenda", icon: Calendar },
      { label: "Mengelola Tugas", icon: ClipboardList },
    ],
  },
  {
    id: "sekretaris",
    label: "Sekretaris",
    description:
      "Bertanggung jawab atas administrasi dan komunikasi. Mengelola Agenda dan Pengumuman.",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    icon: Megaphone,
    permissions: [
      { label: "Melihat semua halaman", icon: Eye },
      { label: "Mengelola Agenda", icon: Calendar },
      { label: "Mengelola Pengumuman", icon: Megaphone },
    ],
  },
  {
    id: "bendahara",
    label: "Bendahara",
    description: "Mengelola keuangan Rohis, termasuk pencatatan Kas dan Infak.",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    icon: Wallet,
    permissions: [
      { label: "Melihat semua halaman", icon: Eye },
      { label: "Mengelola Kas (tambah/edit transaksi)", icon: Wallet },
      { label: "Mengelola Infak (tambah/edit catatan)", icon: Wallet },
    ],
  },
  {
    id: "perlengkapan",
    label: "Perlengkapan",
    description:
      "Mengelola inventaris dan perlengkapan Rohis, termasuk pencatatan barang masuk/keluar.",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    icon: Package,
    permissions: [
      { label: "Melihat semua halaman", icon: Eye },
      { label: "Mengelola Inventaris (tambah/edit/hapus)", icon: Package },
      { label: "Mengelola peminjaman & pengembalian", icon: ClipboardList },
    ],
  },
  {
    id: "anggota",
    label: "Anggota",
    description:
      "Anggota Rohis dengan akses untuk melihat seluruh informasi tanpa hak kelola.",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    icon: Users,
    permissions: [
      { label: "Melihat Dashboard", icon: Eye },
      { label: "Melihat Agenda", icon: Calendar },
      { label: "Melihat Pengumuman", icon: Megaphone },
      { label: "Melihat Keuangan (Kas & Infak)", icon: Wallet },
      { label: "Melihat Inventaris", icon: Package },
      { label: "Melihat Tugas", icon: ClipboardList },
    ],
  },
];

export default function RolesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

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

  return (
    <main className="min-h-screen bg-gray-50 pb-24 md:pb-0">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md px-4 py-6 md:px-8 border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto md:mx-0 flex items-center gap-3">
          <Link
            href="/profile"
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Peran & Hak Akses
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Penjelasan setiap peran di Rohis Manage
            </p>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-8 max-w-3xl space-y-4">
        {/* Current role banner */}
        <AnimatedCard className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-xl">
            <Shield className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-emerald-700 font-medium">
              Role kamu saat ini
            </p>
            <p className="text-lg font-bold text-emerald-800 capitalize">
              {user.role}
            </p>
          </div>
        </AnimatedCard>

        {/* Role cards */}
        {roles.map((role, index) => {
          const Icon = role.icon;
          const isCurrentRole = user.role === role.id;

          return (
            <AnimatedCard
              key={role.id}
              delay={index * 0.05}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                isCurrentRole
                  ? "border-emerald-300 ring-2 ring-emerald-100"
                  : "border-gray-100"
              }`}
            >
              {/* Role header */}
              <div
                className={`px-5 py-4 flex items-center gap-3 ${role.bgColor}`}
              >
                <div
                  className={`p-2.5 bg-white rounded-xl shadow-sm ${role.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className={`text-lg font-bold ${role.color}`}>
                      {role.label}
                    </h2>
                    {isCurrentRole && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        Kamu
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {role.description}
                  </p>
                </div>
              </div>

              {/* Permissions */}
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Hak Akses
                </p>
                <div className="space-y-2">
                  {role.permissions.map((perm, i) => {
                    const PermIcon = perm.icon;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 text-sm text-gray-700"
                      >
                        <PermIcon
                          className={`w-4 h-4 flex-shrink-0 ${role.color}`}
                        />
                        <span>{perm.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </AnimatedCard>
          );
        })}

        <div className="text-center text-xs text-gray-400 pt-4 pb-6">
          Hak akses diatur oleh Admin. Hubungi Admin jika ada pertanyaan.
        </div>
      </div>
    </main>
  );
}
