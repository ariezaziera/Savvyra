export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 relative overflow-hidden">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="h-3 w-24 rounded bg-gray-200" />
            <div className="mt-3 h-6 w-32 rounded bg-gray-300" />
          </div>
        ))}
      </div>

      {/* Donut + Bar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Donut Skeleton */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="h-4 w-40 rounded bg-gray-200" />
          <div className="mt-2 h-3 w-52 rounded bg-gray-100" />

          <div className="mt-6 flex items-center justify-center">
            <div className="h-32 w-32 rounded-full bg-gray-200" />
          </div>

          <div className="mt-6 space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 w-24 rounded bg-gray-200" />
                <div className="h-3 w-12 rounded bg-gray-300" />
              </div>
            ))}
          </div>
        </div>

        {/* Bar Skeleton */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="h-4 w-40 rounded bg-gray-200" />
          <div className="mt-2 h-3 w-52 rounded bg-gray-100" />

          <div className="mt-6 flex h-40 items-end gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-6 rounded bg-gray-200"
                style={{ height: `${40 + i * 15}px` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Line Chart Skeleton */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="h-4 w-40 rounded bg-gray-200" />
        <div className="mt-2 h-3 w-52 rounded bg-gray-100" />

        <div className="mt-6 h-40 w-full rounded bg-gray-200" />
      </div>
    </div>
  );
}
