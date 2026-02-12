import Link from 'next/link';
import { redirect } from 'next/navigation';
import { categories } from '@/lib/categories';
import { resolveWikiSlugToDoc } from '@/lib/graph';

export const dynamic = 'force-dynamic';

function toTitleFromSlug(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')
    .trim();
}

function defaultCaptureCategory() {
  if (categories.some((category) => category.key === 'notes')) return 'notes';
  if (categories.some((category) => category.key === 'ideas')) return 'ideas';
  return categories[0]?.key ?? 'ideas';
}

export default async function WikiResolverPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const resolved = resolveWikiSlugToDoc(decodedSlug);

  if (resolved) {
    redirect(`/docs/${encodeURIComponent(resolved.category)}/${encodeURIComponent(resolved.slug)}`);
  }

  const title = toTitleFromSlug(decodedSlug) || decodedSlug;
  const category = defaultCaptureCategory();
  const ctaHref = `/docs?capture=1&title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}`;

  return (
    <div className="max-w-3xl mx-auto py-16 md:py-24 px-4 md:px-8">
      <div className="glass rounded-[32px] border-white/10 p-6 md:p-10 space-y-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 px-4 py-1 rounded-full">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand">Wiki</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none italic uppercase">
            Note Not Found
          </h1>
          <p className="text-zinc-400">
            No note matched <span className="font-mono text-zinc-200">[{title}]</span>.
          </p>
        </div>

        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-brand/40 bg-brand/10 hover:bg-brand/20 text-brand transition-colors text-sm font-bold"
        >
          Create this note
        </Link>
      </div>
    </div>
  );
}
