export default function DashboardLoading() {
  return (
    <div className="max-w-4xl mx-auto py-6 px-4 animate-fade-in">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-7 w-48 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-4 w-32 bg-gray-100 rounded-lg animate-pulse mt-2" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="card p-6">
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mb-3" />
            <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-gray-50">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-24 bg-gray-50 rounded animate-pulse" />
              </div>
              <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
