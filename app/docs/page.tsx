import Link from 'next/link';
import { getCategories, getDocsByCategory } from '@/lib/brain';
import { getCategoryByKey } from '@/lib/categories';

export const dynamic = 'force-dynamic';

export default function DocsLandingPage() {
  const categories = getCategories();

  const model = categories.map((key) => {
    const docs = getDocsByCategory(key);
    const recent = docs.slice(0, 3);
    return {
      key,
      title: getCategoryByKey(key)?.title ?? key,
      count: docs.length,
      recent,
      href: `/docs/${key}`,
    };
  });

  return (
    <div className="max-w-6xl mx-auto py-8 md:py-16 px-4 md:px-10 space-y-8">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 px-4 py-1 rounded-full">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand">Docs</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none italic uppercase">
          Knowledge <br /> <span className="text-zinc-500">Categories</span>
        </h1>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {model.map((category) => (
          <Link
            key={category.key}
            href={category.href}
            className="glass rounded-2xl border-white/5 p-5 hover:bg-white/10 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-zinc-100">{category.title}</h2>
                <p className="text-xs font-mono text-zinc-500 mt-1">{category.count} notes</p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Open</span>
            </div>

            <div className="mt-4 space-y-2">
              {category.recent.length === 0 && (
                <div className="text-sm text-zinc-500">No docs yet</div>
              )}
              {category.recent.map((doc) => (
                <div key={doc.slug} className="text-sm text-zinc-300 truncate">
                  {doc.title}
                </div>
              ))}
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}

