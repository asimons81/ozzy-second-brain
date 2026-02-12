'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PencilLine } from 'lucide-react';
import { updateNote } from '@/app/actions/notes';

type EditNoteModalProps = {
  category: string;
  slug: string;
  title: string;
  tags?: string[];
  content: string;
};

export function EditNoteModal({ category, slug, title, tags, content }: EditNoteModalProps) {
  const router = useRouter();

  const initialTags = useMemo(() => (tags ?? []).join(', '), [tags]);
  const [open, setOpen] = useState(false);
  const [nextTitle, setNextTitle] = useState(title);
  const [nextTags, setNextTags] = useState(initialTags);
  const [nextBody, setNextBody] = useState(content);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const openModal = () => {
    setNextTitle(title);
    setNextTags(initialTags);
    setNextBody(content);
    setError(null);
    setSaving(false);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setError(null);
    setSaving(false);
  };

  const save = async () => {
    if (saving) return;

    setSaving(true);
    setError(null);

    const result = await updateNote({
      category,
      slug,
      title: nextTitle,
      tags: nextTags,
      body: nextBody,
    });

    if (!result.success) {
      setError(result.error);
      setSaving(false);
      return;
    }

    closeModal();
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-200 transition-all"
      >
        <PencilLine size={16} className="text-brand" />
        <span className="text-xs font-black uppercase tracking-widest">Edit</span>
      </button>

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
              onKeyDown={(event) => {
                const isModifier = event.metaKey || event.ctrlKey;
                if (event.key === 'Escape') {
                  event.preventDefault();
                  closeModal();
                }
                if (isModifier && event.key === 'Enter') {
                  event.preventDefault();
                  void save();
                }
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
                <span className="text-[11px] font-mono text-zinc-600">Ctrl/Cmd+Enter to save</span>
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
                    disabled={saving}
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
