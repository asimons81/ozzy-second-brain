import { getDocBySlug } from '@/lib/brain';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  // Will be populated at build time
  return [];
}

export default async function ApprovedIdeaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDocBySlug('approved-ideas', slug);

  if (!doc) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-12 md:py-24 px-4 md:px-8 space-y-8">
      <Link 
        href="/docs/approved-ideas" 
        className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to Approved Ideas
      </Link>

      <header className="space-y-4">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1 rounded-full">
            <CheckCircle size={14} className="text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Approved</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none italic uppercase">
          {doc.title}
        </h1>

        <div className="flex items-center gap-4 text-zinc-500 text-sm">
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>{doc.modified ? new Date(doc.modified).toLocaleDateString() : 'Recently'}</span>
          </div>
          {doc.url && (
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-brand transition-colors"
            >
              <ExternalLink size={14} /> Source
            </a>
          )}
        </div>
      </header>

      <article className="prose prose-invert prose-zinc max-w-none">
        <div dangerouslySetInnerHTML={{ __html: doc.html || '' }} />
      </article>
    </div>
  );
}
