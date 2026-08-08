export default function AdminLoading() {
  return (
    <div className="p-6 max-w-7xl animate-fade-in">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-7 w-40 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-4 w-56 bg-gray-100 rounded-lg animate-pulse mt-2" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card p-5">
            <div className="h-3 w-16 bg-gray-100 rounded animate-pulse mb-3" />
            <div className="h-8 w-12 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="card overflow-hidden">
        {/* Table header */}
        <div className="flex gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50/50">
          {[80, 120, 100, 60, 80, 60].map((w, i) => (
            <div key={i} className="h-3 bg-gray-200 rounded animate-pulse" style={{ width: w }} />
          ))}
        </div>
        {/* Table rows */}
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
            <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-36 bg-gray-100 rounded animate-pulse" />
              <div className="h-3 w-24 bg-gray-50 rounded animate-pulse" />
            </div>
            <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-7 w-20 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
