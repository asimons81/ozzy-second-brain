export default function NoteLoading() {
  return (
    <div className="max-w-7xl mx-auto py-8 md:py-24 px-4 md:px-8 animate-pulse">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 md:gap-8">
        <div>
          <div className="mb-6 flex gap-2">
            <div className="h-6 w-14 bg-white/5 rounded-md" />
            <div className="h-6 w-20 bg-white/5 rounded-md" />
            <div className="h-6 w-32 bg-white/5 rounded-md" />
          </div>
          <div className="mb-12 space-y-4">
            <div className="h-5 w-24 bg-white/5 rounded" />
            <div className="h-16 w-3/4 bg-white/5 rounded" />
            <div className="flex gap-3">
              <div className="h-4 w-32 bg-white/5 rounded" />
              <div className="h-4 w-24 bg-white/5 rounded" />
            </div>
          </div>
          <div className="glass rounded-[32px] md:rounded-[48px] border-white/5 p-6 md:p-12 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 bg-white/5 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
            ))}
          </div>
        </div>
        <div className="glass rounded-[24px] border-white/5 p-4 md:p-5 h-fit space-y-6">
          <div className="h-3 w-20 bg-white/5 rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-16 bg-white/5 rounded" />
              <div className="h-12 bg-white/5 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
