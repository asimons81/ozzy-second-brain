import Link from 'next/link';
import { getDocsByTag, normalizeTag } from '@/lib/brain';

export const dynamic = 'force-dynamic';

function noteHref(category: string, slug: string) {
  return `/docs/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`;
}

export default async function TagDetailPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const decodedTag = normalizeTag(decodeURIComponent(tag));
  const docs = getDocsByTag(decodedTag);

  return (
    <div className="max-w-6xl mx-auto py-8 md:py-16 px-4 md:px-10 space-y-8">
      <header className="space-y-3">
        <Link href="/tags" className="text-xs font-mono text-zinc-500 hover:text-brand transition-colors">
          Back to tags
        </Link>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none italic uppercase">
          #{decodedTag || 'untagged'}
        </h1>
        <p className="text-sm font-mono text-zinc-500">{docs.length} note(s), sorted by modified date</p>
      </header>

      {docs.length === 0 ? (
        <div className="glass rounded-2xl border border-dashed border-white/10 p-6 text-zinc-500">
          No notes found for this tag.
        </div>
      ) : (
        <section className="space-y-3">
          {docs.map((doc) => (
            <Link
              key={`${doc.category}:${doc.slug}`}
              href={noteHref(doc.category, doc.slug)}
              className="glass rounded-2xl border-white/5 p-5 hover:bg-white/10 transition-all block"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xl md:text-2xl font-black tracking-tight text-zinc-100">{doc.title}</div>
                  <div className="mt-2 text-xs font-mono text-zinc-500">{doc.modified ?? doc.date ?? 'Unknown'}</div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand border border-brand/30 rounded-md px-2 py-1">
                  {doc.category}
                </span>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
