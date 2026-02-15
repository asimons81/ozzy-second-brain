import Link from 'next/link';
import { getDoc } from '@/lib/brain';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

export const dynamic = 'force-dynamic';

export default async function RenderDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const doc = await getDoc('renders', decoded);
  if (!doc) notFound();

  return (
    <div className="max-w-6xl mx-auto py-10 md:py-20 px-4 md:px-12 space-y-8">
      <header className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex items-center space-x-2 bg-brand/10 border border-brand/20 px-4 py-1 rounded-full">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand">Render</span>
          </div>
          <Link href="/docs/renders" className="text-[11px] font-mono text-zinc-600 hover:text-brand transition-colors">
            Back to list
          </Link>
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none italic uppercase">
          {doc.title}
        </h1>
        {doc.date && <div className="text-[11px] font-mono text-zinc-600">{doc.date}</div>}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <section className="glass rounded-[32px] border-white/5 p-4 md:p-6">
          {doc.video ? (
            <video
              className="w-full rounded-2xl border border-white/5 shadow-xl"
              controls
              src={doc.video}
            />
          ) : (
            <div className="aspect-video grid place-items-center text-zinc-700 text-xs font-mono">NO VIDEO LINK</div>
          )}

          <div className="mt-6 prose prose-invert prose-zinc max-w-none">
            <Markdown rehypePlugins={[rehypeRaw, rehypeSanitize]}>{doc.content}</Markdown>
          </div>
        </section>

        <aside className="glass rounded-[32px] border-white/5 p-6 space-y-6">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Metadata</div>
            <div className="mt-3 space-y-2 text-sm">
              {doc.type && (
                <div className="flex justify-between gap-3"><span className="text-zinc-500">Type</span><span className="font-mono text-zinc-200">{doc.type}</span></div>
              )}
              {doc.model && (
                <div className="flex justify-between gap-3"><span className="text-zinc-500">Model</span><span className="font-mono text-zinc-200">{doc.model}</span></div>
              )}
              {doc.seed !== undefined && (
                <div className="flex justify-between gap-3"><span className="text-zinc-500">Seed</span><span className="font-mono text-zinc-200">{String(doc.seed)}</span></div>
              )}
            </div>
          </div>

          {doc.prompt && (
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Prompt</div>
              <div className="mt-2 text-xs font-mono text-zinc-300 bg-white/5 border border-white/5 rounded-2xl p-3 leading-relaxed">
                {doc.prompt}
              </div>
            </div>
          )}

          {(doc.brief || doc.journal) && (
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Connected Intelligence</div>
              <div className="mt-3 space-y-2">
                {doc.brief && (
                  <Link className="block text-sm font-bold text-brand hover:opacity-80" href={`/docs/briefs/${encodeURIComponent(doc.brief)}`}>
                    → Brief: {doc.brief}
                  </Link>
                )}
                {doc.journal && (
                  <Link className="block text-sm font-bold text-brand hover:opacity-80" href={`/docs/journal/${encodeURIComponent(doc.journal)}`}>
                    → Journal: {doc.journal}
                  </Link>
                )}
              </div>
            </div>
          )}

          {doc.tags?.length ? (
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Tags</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {doc.tags.map((t) => (
                  <Link
                    key={t}
                    href={`/tags/${encodeURIComponent(t)}`}
                    className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:border-brand/40 hover:text-brand transition-colors"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
