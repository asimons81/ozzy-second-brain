'use client';

import { revertApprovedIdea, rejectApprovedIdea } from '@/app/actions/ideas';
import { RotateCcw, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type ActionResult = { success: boolean; error?: string };

export function ApprovedIdeaActions({ slug }: { slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleAction = async (action: () => Promise<ActionResult>) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await action();
      if (!result.success) {
        setError(result.error ?? 'Action failed.');
        return;
      }
      setError(null);
    } catch {
      setError('Action failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="glass rounded-2xl border-white/5 p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</h2>
          {loading && <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Working...</span>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              void handleAction(async () => {
                const result = await revertApprovedIdea(slug);
                if (result.success) {
                  router.push(`/docs/ideas/${encodeURIComponent(slug)}`);
                }
                return result;
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-brand/30 bg-brand/10 text-sm font-bold text-brand hover:bg-brand hover:text-black transition-colors disabled:opacity-50"
          >
            <RotateCcw size={16} />
            Move back to Ideas
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => setRejectOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-sm font-bold text-red-200 hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            <X size={16} />
            Reject
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {error}
          </div>
        )}
      </section>

      {rejectOpen && (
        <div className="fixed inset-0 z-[120]">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => (!loading ? setRejectOpen(false) : null)} />
          <div className="absolute left-1/2 top-24 w-[min(640px,calc(100vw-24px))] -translate-x-1/2 rounded-2xl border border-white/10 bg-zinc-950 p-5 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-200">Reject Approved Idea</h3>
            <textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              disabled={loading}
              className="w-full min-h-32 rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-zinc-100 text-sm disabled:opacity-50"
              placeholder="Reason for rejection..."
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setRejectOpen(false)}
                className="px-3 py-2 rounded-xl border border-white/10 text-sm text-zinc-300 hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  void handleAction(async () => {
                    const result = await rejectApprovedIdea(slug, rejectReason);
                    if (result.success) {
                      setRejectOpen(false);
                      router.push('/docs/approved-ideas');
                    }
                    return result;
                  })
                }
                className="px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-sm font-bold text-red-200 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
