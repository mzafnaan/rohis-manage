export default function SidebarSkeleton() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 p-4 hidden md:flex flex-col z-50">
      {/* Brand Skeleton - Matches Sidebar Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-center">
        <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Navigation Skeleton - Matches Sidebar Nav */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50/50 animate-pulse"
          >
            <div className="w-5 h-5 bg-gray-200 rounded" />
            <div className="w-24 h-4 bg-gray-200 rounded" />
          </div>
        ))}
      </nav>

      {/* Footer Skeleton */}
      <div className="pt-4 border-t border-gray-100 mt-auto">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          <div>
            <div className="w-20 h-3 bg-gray-200 rounded animate-pulse mb-1" />
            <div className="w-12 h-2 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </aside>
  );
}
