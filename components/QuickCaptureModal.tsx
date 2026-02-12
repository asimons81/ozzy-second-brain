'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { createNote } from '@/app/actions/notes';

type CaptureCategory = {
  key: string;
  title: string;
  defaultTemplate: string;
};

type QuickCaptureModalProps = {
  open: boolean;
  onClose: () => void;
  categories: CaptureCategory[];
  onCreated?: (title: string) => void;
  storageWarning?: string | null;
  presetCategory?: string;
  presetTitle?: string;
};

function resolveInitialCategory(
  categories: CaptureCategory[],
  presetCategory?: string,
) {
  const first = categories[0]?.key ?? '';
  if (presetCategory && categories.some((item) => item.key === presetCategory)) {
    return presetCategory;
  }
  return first;
}

export function QuickCaptureModal({
  open,
  onClose,
  categories,
  onCreated,
  storageWarning,
  presetCategory,
  presetTitle,
}: QuickCaptureModalProps) {
  const router = useRouter();
  const firstCategory = resolveInitialCategory(categories, presetCategory);
  const initialTitle = presetTitle?.trim() ?? '';

  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState(firstCategory);
  const [tags, setTags] = useState('');
  const [body, setBody] = useState(
    categories.find((item) => item.key === firstCategory)?.defaultTemplate ?? '',
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const templateByCategory = useMemo(
    () => new Map(categories.map((item) => [item.key, item.defaultTemplate])),
    [categories],
  );

  const closeAndReset = () => {
    setTitle(initialTitle);
    setCategory(firstCategory);
    setTags('');
    setBody(templateByCategory.get(firstCategory) ?? '');
    setError(null);
    setSaving(false);
    onClose();
  };

  const runSubmit = async () => {
    if (saving) return;

    setSaving(true);
    setError(null);

    const result = await createNote({ title, category, tags, body });

    if (!result.ok) {
      setError(result.error);
      setSaving(false);
      return;
    }

    onCreated?.(title.trim());
    closeAndReset();
    router.push(result.href);
    router.refresh();
  };

  if (!open) return null;

  const onCategoryChange = (next: string) => {
    setCategory(next);

    if (!body.trim()) {
      setBody(templateByCategory.get(next) ?? '');
    }
  };

  return (
    <div className="fixed inset-0 z-[110]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeAndReset} />
      <div className="absolute left-1/2 top-20 w-[min(920px,calc(100vw-24px))] -translate-x-1/2">
        <form
          className="glass rounded-[24px] border border-white/10 shadow-2xl overflow-hidden"
          onSubmit={(event) => {
            event.preventDefault();
            void runSubmit();
          }}
          onKeyDown={(event) => {
            const isModifier = event.metaKey || event.ctrlKey;
            if (event.key === 'Escape') {
              event.preventDefault();
              closeAndReset();
            }
            if (isModifier && event.key === 'Enter') {
              event.preventDefault();
              void runSubmit();
            }
          }}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Plus size={16} className="text-brand" />
              <p className="text-sm font-black uppercase tracking-widest text-zinc-200">Quick Capture</p>
            </div>
            <button
              type="button"
              onClick={closeAndReset}
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
                  autoFocus
                  required
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-zinc-100"
                  placeholder="Name this note"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Category</span>
                <select
                  value={category}
                  onChange={(event) => onCategoryChange(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-zinc-100"
                >
                  {categories.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="space-y-1 block">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Tags</span>
              <input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-zinc-100"
                placeholder="alpha, pipeline, notes"
              />
            </label>

            <label className="space-y-1 block">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Body</span>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                className="w-full min-h-[320px] rounded-2xl border border-white/10 bg-black/40 px-3 py-3 text-zinc-100 font-mono text-sm"
                placeholder="Capture the raw idea in markdown..."
              />
            </label>
          </div>

          <div className="px-4 md:px-6 py-4 border-t border-white/10 flex items-center justify-between gap-4">
            <span className="text-[11px] font-mono text-zinc-600">Ctrl/Cmd+Enter to save</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeAndReset}
                className="px-3 py-2 rounded-xl border border-white/10 text-sm text-zinc-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-brand/20 border border-brand/40 text-sm font-bold text-brand disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Create note'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

