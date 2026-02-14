export default function ActivityLoading() {
  return (
    <div className="max-w-6xl mx-auto py-8 md:py-16 px-4 md:px-10 space-y-6 animate-pulse">
      <div className="space-y-3">
        <div className="h-4 w-20 bg-white/5 rounded-full" />
        <div className="h-12 w-64 bg-white/5 rounded" />
        <div className="h-4 w-96 bg-white/5 rounded" />
      </div>
      <div className="glass rounded-2xl border-white/5 p-4 h-14" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl border-white/5 p-4 h-16" />
        ))}
      </div>
    </div>
  );
}
