import Link from 'next/link';
import { getTagCounts } from '@/lib/brain';

export const dynamic = 'force-dynamic';

export default function TagsPage() {
  const tags = getTagCounts();

  return (
    <div className="max-w-6xl mx-auto py-8 md:py-16 px-4 md:px-10 space-y-8">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 px-4 py-1 rounded-full">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand">Tags</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none italic uppercase">
          Tag <span className="text-zinc-500">Browser</span>
        </h1>
      </header>

      {tags.length === 0 ? (
        <div className="glass rounded-2xl border border-dashed border-white/10 p-6 text-zinc-500">
          No tags yet.
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map((item) => (
            <Link
              key={item.tag}
              href={`/tags/${encodeURIComponent(item.tag)}`}
              className="glass rounded-2xl border-white/5 p-5 hover:bg-white/10 transition-all"
            >
              <div className="text-2xl font-black tracking-tight text-zinc-100">#{item.tag}</div>
              <div className="mt-1 text-xs font-mono text-zinc-500">{item.count} notes</div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
