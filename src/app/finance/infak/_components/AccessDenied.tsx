import Link from "next/link";

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-2xl font-bold text-gray-800">Akses Ditolak</h1>
      <p className="text-gray-500 mt-2">
        Anda tidak memiliki izin untuk melihat halaman ini.
      </p>
      <Link
        href="/"
        className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
