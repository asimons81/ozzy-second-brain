import { getDocsByCategory, getCategories } from '@/lib/brain';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export async function generateStaticParams() {
  const categories = getCategories();
  return categories.map((category) => ({
    category,
  }));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const docs = getDocsByCategory(category);

  return (
    <div className="max-w-4xl mx-auto py-12 md:py-24 px-4 md:px-8 space-y-12">
      <header className="space-y-4 text-center md:text-left">
        <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1 rounded-full">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 capitalize">{category}</span>
        </div>
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none italic uppercase">
            Archive <br/> <span className="text-zinc-500">Explorer</span>
        </h2>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {docs.map((doc) => (
          <Link 
            key={doc.slug} 
            href={`/docs/${category}/${doc.slug}`}
            className="group glass p-6 md:p-8 rounded-[32px] border-white/5 hover:bg-white/10 transition-all flex items-center justify-between"
          >
            <div className="space-y-1">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight group-hover:text-blue-400 transition-colors capitalize">
                {doc.title}
              </h3>
              <p className="text-zinc-500 font-medium line-clamp-1 max-w-xl">
                {doc.excerpt}
              </p>
            </div>
            <div className="hidden md:flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-white/5 group-hover:border-blue-500/50 group-hover:text-blue-400 transition-all">
                <ChevronRight size={24} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
