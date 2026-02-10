'use client';

import { Doc } from '@/lib/brain';
import { approveIdea, rejectIdea, deleteIdea } from '@/app/actions/ideas';
import { Check, X, Trash2, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export function IdeaCard({ doc }: { doc: Doc }) {
  const [loading, setLoading] = useState(false);
  const [removed, setRemoved] = useState(false);

  if (removed) return null;

  const handleAction = async (action: (slug: string) => Promise<{ success: boolean }>) => {
    setLoading(true);
    const res = await action(doc.slug);
    if (res.success) {
      setRemoved(true);
    }
    setLoading(false);
  };

  return (
    <div className={`group glass p-6 md:p-8 rounded-[32px] border-white/5 hover:bg-white/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="space-y-3 flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          {doc.score && (
            <span className="text-[10px] font-black bg-brand/20 text-brand px-2 py-0.5 rounded-full border border-brand/20">
              {doc.score} PTS
            </span>
          )}
          <span className="text-[10px] font-black bg-white/5 text-zinc-500 px-2 py-0.5 rounded-full border border-white/5 uppercase">
            {doc.source || 'Idea'}
          </span>
        </div>
        <div>
          <Link href={`/docs/ideas/${doc.slug}`} className="text-2xl font-black italic tracking-tight group-hover:text-brand transition-colors block truncate capitalize">
            {doc.title}
          </Link>
          <p className="text-zinc-500 font-medium line-clamp-1 mt-1 text-sm">
            {doc.excerpt}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        {doc.url && (
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:border-white/20 transition-all"
            title="Open Source"
          >
            <ExternalLink size={20} />
          </a>
        )}
        <button
          onClick={() => handleAction(rejectIdea)}
          className="p-3 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-500 hover:text-red-400 hover:border-red-400/50 transition-all"
          title="Reject Idea"
        >
          <X size={20} />
        </button>
        <button
          onClick={() => handleAction(deleteIdea)}
          className="p-3 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-500 hover:text-zinc-200 hover:border-zinc-500 transition-all"
          title="Hard Delete"
        >
          <Trash2 size={20} />
        </button>
        <button
          onClick={() => handleAction(approveIdea)}
          className="p-4 rounded-2xl bg-brand/10 border border-brand/20 text-brand hover:bg-brand hover:text-black transition-all shadow-lg shadow-brand/5"
          title="Approve & Send to Pipeline"
        >
          <Check size={24} />
        </button>
      </div>
    </div>
  );
}
