import { getDoc, getCategories, getDocsByCategory } from '@/lib/brain';
import { getCategoryByKey } from '@/lib/categories';
import { getDocPanelData } from '@/lib/graph';
import { getStorageRuntimeInfo } from '@/lib/storage';
import { rewriteWikiLinksToMarkdownLinks } from '@/lib/wiki-links';
import { EditNoteModal } from '@/components/EditNoteModal';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

export const dynamic = 'force-dynamic';

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

function noteHref(category: string, slug: string) {
  return `/docs/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`;
}

function displayModified(modified?: string, date?: string) {
  return modified ?? date ?? 'Unknown';
}

function NoteList({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: Array<{
    id: string;
    category: string;
    slug: string;
    title: string;
    modified?: string;
    date?: string;
  }>;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">{title}</h3>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-3 py-4 text-sm text-zinc-500">
          {empty}
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={noteHref(item.category, item.slug)}
                className="block rounded-2xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors"
              >
                <div className="text-sm font-bold tracking-tight text-zinc-100">{item.title}</div>
                <div className="mt-2 flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  <span className="rounded-md border border-brand/30 px-1.5 py-0.5 text-brand">{item.category}</span>
                  <span>{displayModified(item.modified, item.date)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function DocPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const knownCategory = getCategoryByKey(category);

  if (!knownCategory) {
    notFound();
  }

  const doc = getDoc(category, decodedSlug);
  const storage = getStorageRuntimeInfo();

  if (!doc) {
    notFound();
  }

  const panel = getDocPanelData(category, decodedSlug);
  const renderedMarkdown = rewriteWikiLinksToMarkdownLinks(doc.content);

  return (
    <div className="max-w-7xl mx-auto py-8 md:py-24 px-4 md:px-8">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 md:gap-8">
        <div>
          <header className="mb-12 space-y-4">
            <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{knownCategory.title}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-3">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.9] uppercase italic">
                  {doc.title}
                </h1>
                {doc.date && (
                  <time className="text-brand font-mono text-sm block tracking-widest uppercase">Created {doc.date}</time>
                )}
                {doc.modified && (
                  <time className="text-zinc-500 font-mono text-xs block tracking-widest uppercase">Modified {doc.modified}</time>
                )}
                <div className="flex flex-wrap gap-2">
                  {(doc.tags ?? []).length === 0 ? (
                    <span className="text-xs font-mono text-zinc-600">No tags</span>
                  ) : (
                    doc.tags?.map((tag) => (
                      <Link
                        key={tag}
                        href={`/tags/${encodeURIComponent(tag)}`}
                        className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:border-brand/40 hover:text-brand transition-colors"
                      >
                        {tag}
                      </Link>
                    ))
                  )}
                </div>
              </div>
              <EditNoteModal
                category={category}
                slug={doc.slug}
                title={doc.title}
                tags={doc.tags}
                content={doc.content}
                storageWarning={storage.warningBanner}
              />
            </div>
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
              {renderedMarkdown}
            </Markdown>
          </article>

          <footer className="mt-12 pt-12 border-t border-white/5 flex items-center justify-between opacity-30">
            <p className="text-xs font-mono tracking-widest uppercase truncate">
              {category} <span aria-hidden>{' // '}</span> {doc.slug}
            </p>
            <span className="font-black italic text-lg tracking-tighter">OZZY</span>
          </footer>
        </div>

        <aside className="glass rounded-[24px] border-white/10 p-4 md:p-5 h-fit space-y-6 xl:sticky xl:top-24">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand">Brain Panel</div>
          <NoteList
            title="Backlinks"
            empty="No backlinks yet."
            items={panel.inbound}
          />
          <NoteList
            title="Outbound"
            empty="No outbound links yet."
            items={panel.outbound}
          />
          <NoteList
            title="Related"
            empty="No related notes by tag yet."
            items={panel.relatedByTag}
          />
        </aside>
      </div>
    </div>
  );
}
