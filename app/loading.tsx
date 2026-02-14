export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto py-8 md:py-16 px-4 md:px-10 space-y-8 animate-pulse">
      {/* Briefing skeleton */}
      <div className="glass rounded-2xl border-white/5 p-5 md:p-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-white/5" />
          <div className="flex-1 space-y-3">
            <div className="h-3 w-24 bg-white/5 rounded" />
            <div className="h-4 w-3/4 bg-white/5 rounded" />
            <div className="h-3 w-48 bg-white/5 rounded" />
          </div>
        </div>
      </div>

      {/* Two-column skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <div key={i} className="glass rounded-2xl border-white/5 p-5 space-y-4">
            <div className="h-4 w-20 bg-white/5 rounded" />
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="rounded-xl bg-white/5 h-14" />
            ))}
          </div>
        ))}
      </div>

      {/* Heatmap skeleton */}
      <div className="glass rounded-2xl border-white/5 p-5">
        <div className="h-3 w-32 bg-white/5 rounded mb-4" />
        <div className="h-20 bg-white/5 rounded" />
      </div>
    </div>
  );
}
