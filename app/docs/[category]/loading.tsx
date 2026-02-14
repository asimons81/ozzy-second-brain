export default function CategoryLoading() {
  return (
    <div className="max-w-4xl mx-auto py-12 md:py-24 px-4 md:px-8 space-y-12 animate-pulse">
      <div className="space-y-4">
        <div className="h-4 w-20 bg-white/5 rounded-full" />
        <div className="h-16 w-64 bg-white/5 rounded" />
      </div>
      <div className="grid grid-cols-1 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass rounded-[32px] border-white/5 p-6 md:p-8 h-24" />
        ))}
      </div>
    </div>
  );
}
