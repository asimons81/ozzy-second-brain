import { getDoc, getCategories, getDocsByCategory } from '@/lib/brain';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

export async function generateStaticParams() {
  const categories = getCategories();
  const params: { category: string; slug: string }[] = [];

  for (const category of categories) {
    const docs = getDocsByCategory(category);
    for (const doc of docs) {
      params.push({ category, slug: doc.slug });
    }
  }

  return params;
}

export default async function DocPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
    const { category, slug } = await params;
    // URL decode the slug just in case
    const decodedSlug = decodeURIComponent(slug);
    const doc = getDoc(category, decodedSlug);

    if (!doc) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto py-8 md:py-24 px-4 md:px-8">
            <header className="mb-12 space-y-4">
                <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 capitalize">{category}</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.9] uppercase italic">{doc.title}</h1>
                {doc.date && (
                    <time className="text-brand font-mono text-sm block tracking-widest uppercase">{doc.date}</time>
                )}
            </header>

            <article className="prose prose-invert prose-zinc max-w-none glass p-6 md:p-12 rounded-[32px] md:rounded-[48px] border-white/5">
                <Markdown
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  components={{
                    video: ({ ...props }) => (
                      <video
                        {...props}
                        className="w-full rounded-2xl border border-white/10 shadow-xl"
                        controls
                      />
                    ),
                    a: ({ ...props }) => (
                      <a
                        {...props}
                        className="text-brand underline underline-offset-4 hover:opacity-80 transition-opacity"
                        target={props.href?.startsWith('http') ? '_blank' : undefined}
                        rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                      />
                    ),
                  }}
                >
                  {doc.content}
                </Markdown>
            </article>

            <footer className="mt-12 pt-12 border-t border-white/5 flex items-center justify-between opacity-30">
                <p className="text-xs font-mono tracking-widest uppercase truncate">
                  {category} <span aria-hidden>{' // '}</span> {doc.slug}
                </p>
                <span className="font-black italic text-lg tracking-tighter">OZZY</span>
            </footer>
        </div>
    );
}
