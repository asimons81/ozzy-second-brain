'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

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
  writesAllowed: boolean;
  authenticated: boolean;
  readOnlyMessage: string;
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

function slugify(value: string) {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/["'`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'untitled';
}

function makeUniqueSlug(title: string, existing: Set<string>) {
  const base = slugify(title);
  let slug = base;
  let counter = 2;

  while (existing.has(slug)) {
    slug = `${base}-${counter}`;
    counter += 1;
  }

  return slug;
}

export function QuickCaptureModal({
  open,
  onClose,
  categories,
  onCreated,
  storageWarning,
  presetCategory,
  presetTitle,
  writesAllowed,
  authenticated,
  readOnlyMessage,
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
  const [requestReview, setRequestReview] = useState(firstCategory === 'ideas');
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

    if (!writesAllowed || !authenticated) {
      setError(readOnlyMessage);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const listRes = await fetch(`/api/notes?category=${encodeURIComponent(category)}`, {
        cache: 'no-store',
      });

      if (!listRes.ok) {
        const payload = (await listRes.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? 'Unable to list existing notes.');
      }

      const listing = (await listRes.json()) as {
        notes?: Array<{ slug: string }>;
      };

      const existing = new Set((listing.notes ?? []).map((item) => item.slug));
      const nextSlug = makeUniqueSlug(title, existing);

      const putRes = await fetch(`/api/notes/${encodeURIComponent(category)}/${encodeURIComponent(nextSlug)}`, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          title,
          tags,
          content: body,
          requestReview,
          author: 'user',
        }),
      });

      const payload = (await putRes.json().catch(() => null)) as { error?: string; href?: string } | null;

      if (!putRes.ok) {
        throw new Error(payload?.error ?? 'Unable to create note.');
      }

      onCreated?.(title.trim());
      closeAndReset();
      router.push(payload?.href ?? `/docs/${encodeURIComponent(category)}/${encodeURIComponent(nextSlug)}`);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create note.';
      setError(message);
      setSaving(false);
    }
  };

  if (!open) return null;

  const onCategoryChange = (next: string) => {
    setCategory(next);
    setRequestReview(next === 'ideas');

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
            {(!writesAllowed || !authenticated) && (
              <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-100">
                {readOnlyMessage}
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
                  disabled={!writesAllowed || !authenticated}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-zinc-100 disabled:opacity-60"
                  placeholder="Name this note"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Category</span>
                <select
                  disabled={!writesAllowed || !authenticated}
                  value={category}
                  onChange={(event) => onCategoryChange(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-zinc-100 disabled:opacity-60"
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
                disabled={!writesAllowed || !authenticated}
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-zinc-100 disabled:opacity-60"
                placeholder="alpha, pipeline, notes"
              />
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                disabled={!writesAllowed || !authenticated}
                checked={requestReview}
                onChange={(event) => setRequestReview(event.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-black/40 text-brand accent-brand disabled:opacity-60"
              />
              <span className="text-xs font-bold text-zinc-400">Request agent review</span>
            </label>

            <label className="space-y-1 block">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Body</span>
              <textarea
                disabled={!writesAllowed || !authenticated}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                className="w-full min-h-[320px] rounded-2xl border border-white/10 bg-black/40 px-3 py-3 text-zinc-100 font-mono text-sm disabled:opacity-60"
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
                disabled={saving || !writesAllowed || !authenticated}
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
