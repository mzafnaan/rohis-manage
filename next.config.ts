import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "firebase/firestore",
      "firebase/auth",
      "firebase/app",
      "firebase/storage",
      "react-hot-toast",
      "@headlessui/react",
      "clsx",
      "tailwind-merge",
    ],
  },
};

export default nextConfig;
