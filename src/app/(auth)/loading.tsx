export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="card p-8 animate-fade-in">
          {/* Logo skeleton */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-brand-100 rounded-xl animate-pulse" />
            <div className="h-6 w-24 bg-gray-200 rounded-lg animate-pulse" />
          </div>

          {/* Form skeleton */}
          <div className="space-y-5">
            <div>
              <div className="h-4 w-16 bg-gray-100 rounded animate-pulse mb-2" />
              <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse" />
            </div>
            <div>
              <div className="h-4 w-20 bg-gray-100 rounded animate-pulse mb-2" />
              <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse" />
            </div>
            <div className="h-12 w-full bg-brand-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
