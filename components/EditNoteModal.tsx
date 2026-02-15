'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PencilLine, Trash2 } from 'lucide-react';
import { readAdminToken } from '@/lib/client/admin-token';

type EditNoteModalProps = {
  category: string;
  slug: string;
  title: string;
  tags?: string[];
  content: string;
  storageWarning?: string | null;
  writesAllowed: boolean;
  readOnlyMessage: string;
  adminToken?: string;
};

export function EditNoteModal({
  category,
  slug,
  title,
  tags,
  content,
  storageWarning,
  writesAllowed,
  readOnlyMessage,
  adminToken = '',
}: EditNoteModalProps) {
  const router = useRouter();

  const initialTags = useMemo(() => (tags ?? []).join(', '), [tags]);
  const [open, setOpen] = useState(false);
  const [nextTitle, setNextTitle] = useState(title);
  const [nextTags, setNextTags] = useState(initialTags);
  const [nextBody, setNextBody] = useState(content);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resolvedToken, setResolvedToken] = useState(adminToken);

  const canWrite = writesAllowed && resolvedToken.trim().length > 0;

  useEffect(() => {
    if (!adminToken && typeof window !== 'undefined') {
      setResolvedToken(readAdminToken());
    } else {
      setResolvedToken(adminToken);
    }
  }, [adminToken]);

  const openModal = () => {
    if (!canWrite) {
      setError(readOnlyMessage);
      return;
    }

    setNextTitle(title);
    setNextTags(initialTags);
    setNextBody(content);
    setError(null);
    setSaving(false);
    setDeleting(false);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setError(null);
    setSaving(false);
    setDeleting(false);
  };

  const save = async () => {
    if (saving || !canWrite) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/notes/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${resolvedToken.trim()}`,
        },
        body: JSON.stringify({
          title: nextTitle,
          tags: nextTags,
          content: nextBody,
        }),
      });

      const payload = (await res.json().catch(() => null)) as { error?: string } | null;

      if (!res.ok) {
        throw new Error(payload?.error ?? 'Unable to save note.');
      }

      closeModal();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save note.');
      setSaving(false);
    }
  };

  const remove = async () => {
    if (deleting || !canWrite) return;
    if (!window.confirm('Delete this note? This cannot be undone.')) return;

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/notes/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`, {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${resolvedToken.trim()}`,
        },
      });

      const payload = (await res.json().catch(() => null)) as { error?: string; href?: string } | null;

      if (!res.ok) {
        throw new Error(payload?.error ?? 'Unable to delete note.');
      }

      closeModal();
      router.push(payload?.href ?? `/docs/${encodeURIComponent(category)}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete note.');
      setDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        disabled={!canWrite}
        title={!canWrite ? readOnlyMessage : undefined}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <PencilLine size={16} className="text-brand" />
        <span className="text-xs font-black uppercase tracking-widest">Edit</span>
      </button>

      {!canWrite && error && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-100">
          {error}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[110]">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="absolute left-1/2 top-20 w-[min(980px,calc(100vw-24px))] -translate-x-1/2">
            <form
              className="glass rounded-[24px] border border-white/10 shadow-2xl overflow-hidden"
              onSubmit={(event) => {
                event.preventDefault();
                void save();
              }}
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <PencilLine size={16} className="text-brand" />
                  <p className="text-sm font-black uppercase tracking-widest text-zinc-200">Edit Note</p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Esc
                </button>
              </div>

              <div className="p-4 md:p-6 space-y-4">
                {storageWarning && (
                  <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-100">
                    {storageWarning}
                  </div>
                )}
                {error && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-1">
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Title</span>
                    <input
                      required
                      value={nextTitle}
                      onChange={(event) => setNextTitle(event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-zinc-100"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Tags</span>
                    <input
                      value={nextTags}
                      onChange={(event) => setNextTags(event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-zinc-100"
                      placeholder="alpha, pipeline, notes"
                    />
                  </label>
                </div>

                <label className="space-y-1 block">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Body</span>
                  <textarea
                    value={nextBody}
                    onChange={(event) => setNextBody(event.target.value)}
                    className="w-full min-h-[360px] rounded-2xl border border-white/10 bg-black/40 px-3 py-3 text-zinc-100 font-mono text-sm"
                  />
                </label>
              </div>

              <div className="px-4 md:px-6 py-4 border-t border-white/10 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => void remove()}
                  disabled={saving || deleting}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-xs font-bold text-red-200 disabled:opacity-60"
                >
                  <Trash2 size={14} />
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-3 py-2 rounded-xl border border-white/10 text-sm text-zinc-300 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || deleting || !canWrite}
                    className="px-4 py-2 rounded-xl bg-brand/20 border border-brand/40 text-sm font-bold text-brand disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
