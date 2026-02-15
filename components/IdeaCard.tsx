'use client';

import { Doc } from '@/lib/brain';
import { approveIdea, rejectIdea, needsWorkIdea, deleteIdea } from '@/app/actions/ideas';
import { Check, X, Trash2, ExternalLink, MessageSquareWarning } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

type ActionResult = { success: boolean; error?: string };

export function IdeaCard({ doc }: { doc: Doc }) {
  const [loading, setLoading] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [needsWorkOpen, setNeedsWorkOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [needsWorkFeedback, setNeedsWorkFeedback] = useState('');

  if (removed) return null;

  const handleAction = async (action: () => Promise<ActionResult>, removeOnSuccess = true) => {
    setLoading(true);
    setError(null);
    try {
      const res = await action();
      if (res.success) {
        if (removeOnSuccess) {
          setRemoved(true);
        }
        return;
      }
      setError(res.error ?? 'Action failed.');
    } catch {
      setError('Action failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`group glass p-6 md:p-8 rounded-2xl border-white/5 hover:bg-white/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            {doc.score && (
              <span className="text-[10px] font-black bg-brand-muted text-brand px-2 py-0.5 rounded-full border border-brand/20">
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
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {doc.url && (
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-surface-med border border-white/5 text-zinc-400 hover:text-white hover:border-white/20 transition-all"
              title="Open Source"
            >
              <ExternalLink size={20} />
            </a>
          )}
          <button
            onClick={() => setNeedsWorkOpen(true)}
            className="p-3 rounded-2xl bg-surface-med border border-white/5 text-zinc-500 hover:text-yellow-300 hover:border-yellow-300/50 transition-all"
            title="Needs Work"
          >
            <MessageSquareWarning size={20} />
          </button>
          <button
            onClick={() => setRejectOpen(true)}
            className="p-3 rounded-2xl bg-surface-med border border-white/5 text-zinc-500 hover:text-red-400 hover:border-red-400/50 transition-all"
            title="Reject Idea"
          >
            <X size={20} />
          </button>
          <button
            onClick={() => handleAction(() => deleteIdea(doc.slug))}
            className="p-3 rounded-2xl bg-surface-med border border-white/5 text-zinc-500 hover:text-zinc-200 hover:border-zinc-500 transition-all"
            title="Hard Delete"
          >
            <Trash2 size={20} />
          </button>
          <button
            onClick={() => handleAction(() => approveIdea(doc.slug))}
            className="p-4 rounded-2xl bg-brand-muted/50 border border-brand/20 text-brand hover:bg-brand hover:text-black transition-all shadow-lg shadow-brand/10"
            title="Approve Idea"
          >
            <Check size={24} />
          </button>
        </div>
      </div>

      {rejectOpen && (
        <div className="fixed inset-0 z-[120]">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setRejectOpen(false)} />
          <div className="absolute left-1/2 top-24 w-[min(640px,calc(100vw-24px))] -translate-x-1/2 rounded-2xl border border-white/10 bg-zinc-950 p-5 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-200">Reject Idea</h3>
            <textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              className="w-full min-h-32 rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-zinc-100 text-sm"
              placeholder="Reason for rejection..."
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectOpen(false)}
                className="px-3 py-2 rounded-xl border border-white/10 text-sm text-zinc-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  void handleAction(async () => {
                    const res = await rejectIdea(doc.slug, rejectReason);
                    if (res.success) setRejectOpen(false);
                    return res;
                  })
                }
                className="px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-sm font-bold text-red-200"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {needsWorkOpen && (
        <div className="fixed inset-0 z-[120]">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setNeedsWorkOpen(false)} />
          <div className="absolute left-1/2 top-24 w-[min(640px,calc(100vw-24px))] -translate-x-1/2 rounded-2xl border border-white/10 bg-zinc-950 p-5 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-200">Needs Work</h3>
            <textarea
              value={needsWorkFeedback}
              onChange={(event) => setNeedsWorkFeedback(event.target.value)}
              className="w-full min-h-32 rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-zinc-100 text-sm"
              placeholder="Feedback for revision..."
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setNeedsWorkOpen(false)}
                className="px-3 py-2 rounded-xl border border-white/10 text-sm text-zinc-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  void handleAction(async () => {
                    const res = await needsWorkIdea(doc.slug, needsWorkFeedback);
                    if (res.success) setNeedsWorkOpen(false);
                    return res;
                  }, false)
                }
                className="px-4 py-2 rounded-xl bg-yellow-500/15 border border-yellow-500/30 text-sm font-bold text-yellow-200"
              >
                Save Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
