export default function QueueLoading() {
  return (
    <div className="max-w-6xl mx-auto py-8 md:py-16 px-4 md:px-10 space-y-6 animate-pulse">
      <div className="space-y-3">
        <div className="h-4 w-16 bg-white/5 rounded-full" />
        <div className="h-12 w-48 bg-white/5 rounded" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl border-white/5 p-5 h-20" />
        ))}
      </div>
    </div>
  );
}
