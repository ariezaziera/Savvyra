export default function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">

      {/* Quick Actions — 6 buttons grid */}
      <div>
        <div className="h-3 w-20 rounded-full bg-white/10 mb-4" />
        <div className="grid grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-3xl border border-white/8 bg-white/5 p-4 flex flex-col items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-white/10" />
              <div className="h-2.5 w-14 rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </div>

      {/* Net Worth + Stats */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="h-3 w-20 rounded-full bg-white/10 mb-2" />
        <div className="h-8 w-40 rounded-full bg-white/15 mb-4" />
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/8 bg-white/5 p-3">
              <div className="h-2 w-12 rounded-full bg-white/10 mb-2" />
              <div className="h-4 w-16 rounded-full bg-white/15" />
            </div>
          ))}
        </div>
      </div>

      {/* Commitments + Debt side by side */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex justify-between mb-4">
              <div className="h-3 w-24 rounded-full bg-white/10" />
              <div className="h-3 w-12 rounded-full bg-white/10" />
            </div>
            <div className="h-6 w-32 rounded-full bg-white/15 mb-3" />
            <div className="space-y-2">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex justify-between">
                  <div className="h-2.5 w-24 rounded-full bg-white/8" />
                  <div className="h-2.5 w-16 rounded-full bg-white/8" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Savings Goals Carousel */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="h-3 w-32 rounded-full bg-white/10 mb-4" />
        <div className="flex gap-3 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="min-w-[180px] rounded-2xl border border-white/8 bg-white/5 p-4 shrink-0">
              <div className="h-2.5 w-24 rounded-full bg-white/10 mb-3" />
              <div className="h-1.5 w-full rounded-full bg-white/10 mb-2" />
              <div className="h-2.5 w-16 rounded-full bg-white/15" />
            </div>
          ))}
        </div>
      </div>

      {/* Charts — side by side */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Expense donut */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="h-3 w-32 rounded-full bg-white/10 mb-2" />
          <div className="h-2 w-24 rounded-full bg-white/8 mb-6" />
          <div className="flex justify-center mb-5">
            <div className="h-36 w-36 rounded-full bg-white/8 flex items-center justify-center">
              <div className="h-20 w-20 rounded-full bg-[#16102e]" />
            </div>
          </div>
          <div className="space-y-2.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-white/15" />
                  <div className="h-2 w-20 rounded-full bg-white/10" />
                </div>
                <div className="h-2 w-12 rounded-full bg-white/10" />
              </div>
            ))}
          </div>
        </div>

        {/* Bar chart */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="h-3 w-36 rounded-full bg-white/10 mb-2" />
          <div className="h-2 w-28 rounded-full bg-white/8 mb-6" />
          <div className="flex items-end gap-3 h-40 px-2">
            {[50, 80, 60, 90, 45, 70].map((h, i) => (
              <div key={i} className="flex-1 flex gap-1 items-end">
                <div className="flex-1 rounded-t-lg bg-white/10" style={{ height: `${h}%` }} />
                <div className="flex-1 rounded-t-lg bg-white/8" style={{ height: `${h * 0.7}%` }} />
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4">
            <div className="h-2 w-12 rounded-full bg-white/10" />
            <div className="h-2 w-12 rounded-full bg-white/8" />
          </div>
        </div>
      </div>

      {/* Monthly trend */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="h-3 w-28 rounded-full bg-white/10 mb-2" />
        <div className="h-2 w-40 rounded-full bg-white/8 mb-6" />
        <div className="relative h-40">
          {/* Fake area chart lines */}
          <svg viewBox="0 0 400 120" className="w-full h-full opacity-20" preserveAspectRatio="none">
            <polyline points="0,80 60,50 120,65 180,30 240,55 300,20 360,45 400,35"
              fill="none" stroke="#C4B5FD" strokeWidth="2.5" />
            <polyline points="0,100 60,85 120,90 180,70 240,80 300,60 360,75 400,65"
              fill="none" stroke="#E8A0A0" strokeWidth="2.5" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-[#16102e]/80 to-transparent" />
        </div>
        <div className="flex gap-4 mt-2">
          <div className="h-2 w-12 rounded-full bg-white/10" />
          <div className="h-2 w-12 rounded-full bg-white/8" />
        </div>
      </div>

    </div>
  );
}
