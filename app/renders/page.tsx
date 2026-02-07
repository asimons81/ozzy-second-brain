import Link from 'next/link';
import { getDocsByCategory } from '@/lib/brain';

export const dynamic = 'force-static';

function badge(type?: string) {
  const t = (type ?? 'trend').toLowerCase();
  if (t === 'captions') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  if (t === 'experiment') return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
  return 'bg-brand/10 text-brand border-brand/20';
}

export default function RendersPage() {
  const renders = getDocsByCategory('renders');

  return (
    <div className="max-w-6xl mx-auto py-10 md:py-20 px-4 md:px-12 space-y-10">
      <header className="space-y-4">
        <div className="inline-flex items-center space-x-2 bg-brand/10 border border-brand/20 px-4 py-1 rounded-full">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand">Renders</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none italic uppercase">
          Video <br /> <span className="text-zinc-500">Output</span>
        </h1>
        <p className="text-zinc-400 max-w-2xl font-medium">
          Every generated clip lives here. Preview fast, open details, and trace each render back to the brief/journal that created it.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renders.map((r) => (
          <Link
            key={r.slug}
            href={`/renders/${encodeURIComponent(r.slug)}`}
            className="group glass p-4 rounded-[28px] border-white/5 hover:bg-white/10 transition-all"
          >
            <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black">
              {r.video ? (
                <video
                  className="w-full h-full object-cover"
                  src={r.video}
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-zinc-700 text-xs font-mono">NO VIDEO</div>
              )}
            </div>

            <div className="mt-4 flex items-start justify-between gap-3">
              <div>
                <div className={`inline-flex items-center px-2 py-1 rounded-lg border text-[10px] font-black uppercase tracking-[0.2em] ${badge(r.type)}`}>
                  {r.type ?? 'trend'}
                </div>
                <div className="mt-2 text-lg font-black tracking-tight group-hover:text-brand transition-colors line-clamp-1">
                  {r.title}
                </div>
                <div className="text-[11px] font-mono text-zinc-600 mt-1 line-clamp-1">{r.date ?? r.slug}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="opacity-50 text-xs font-mono text-zinc-600">
        Tip: Use Ctrl/⌘ K to jump to any render, brief, journal, or idea.
      </div>
    </div>
  );
}
