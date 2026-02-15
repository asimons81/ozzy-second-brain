import { getDocsByCategory } from '@/lib/brain';
import { getCategoryByKey } from '@/lib/categories';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const knownCategory = getCategoryByKey(category);

  if (!knownCategory) {
    notFound();
  }

  const docs = await getDocsByCategory(category);

  return (
    <div className="max-w-4xl mx-auto py-12 md:py-24 px-4 md:px-8 space-y-12">
      <header className="space-y-4 text-center md:text-left">
        <div className="inline-flex items-center space-x-2 bg-brand/10 border border-brand/20 px-4 py-1 rounded-full">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand">{knownCategory.title}</span>
        </div>
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none italic uppercase">
          Archive <br /> <span className="text-zinc-500">Explorer</span>
        </h2>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {docs.length === 0 && (
          <div className="glass rounded-[32px] border-white/5 p-8 md:p-12 text-center space-y-4">
            <div className="text-5xl opacity-20">&#128221;</div>
            <h3 className="text-xl font-bold text-zinc-300">No notes in {knownCategory.title} yet</h3>
            <p className="text-sm text-zinc-500 max-w-md mx-auto">
              Start building your knowledge base. Use Quick Capture (+) or press Cmd+K to create your first note.
            </p>
          </div>
        )}
        {docs.map((doc) => (
          <Link
            key={doc.slug}
            href={`/docs/${category}/${doc.slug}`}
            className="group glass p-6 md:p-8 rounded-[32px] border-white/5 hover:bg-white/10 transition-all flex items-center justify-between"
          >
            <div className="space-y-1">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight group-hover:text-brand transition-colors capitalize">
                {doc.title}
              </h3>
              <p className="text-zinc-500 font-medium line-clamp-1 max-w-xl">{doc.excerpt}</p>
            </div>
            <div className="hidden md:flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-white/5 group-hover:border-brand/50 group-hover:text-brand transition-all">
              <ChevronRight size={24} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
