export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-2xl bg-gray-100"
          />
        ))}
      </div>

      {/* Donut + Bar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-72 rounded-2xl bg-gray-100" />
        <div className="h-72 rounded-2xl bg-gray-100" />
      </div>

      {/* Line Chart */}
      <div className="h-72 rounded-2xl bg-gray-100" />
    </div>
  );
}