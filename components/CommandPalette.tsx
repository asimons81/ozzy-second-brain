'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, CornerDownLeft, PlusCircle } from 'lucide-react';

export type PaletteItem = {
  title: string;
  subtitle?: string;
  href: string;
  group?: string;
};

type CommandPaletteProps = {
  items: PaletteItem[];
  onNewNote?: () => void;
};

export function CommandPalette({ items, onNewNote }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const modifier = isMac ? event.metaKey : event.ctrlKey;

      if (modifier && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((prev) => {
          const next = !prev;
          if (!next) setQ('');
          return next;
        });
      }

      if (event.key === 'Escape' && open) {
        event.preventDefault();
        setOpen(false);
        setQ('');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const closePalette = () => {
    setOpen(false);
    setQ('');
  };

  const query = q.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!query) return items.slice(0, 20);

    return items
      .filter((item) => {
        const haystack = `${item.title} ${item.subtitle ?? ''} ${item.group ?? ''} ${item.href}`.toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 30);
  }, [items, query]);

  const showNewNoteAction =
    typeof onNewNote === 'function' &&
    (!query || ['new', 'note', 'capture'].some((term) => term.includes(query) || query.includes(term)));

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 transition-all"
        aria-label="Open command palette"
      >
        <Search size={16} className="text-brand" />
        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Search</span>
        <span className="ml-2 text-[10px] font-mono text-zinc-600">Ctrl/Cmd K</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closePalette} />
      <div className="absolute left-1/2 top-24 w-[min(920px,calc(100vw-24px))] -translate-x-1/2">
        <div className="glass border border-white/10 rounded-[24px] overflow-hidden shadow-2xl">
          <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
            <Search size={18} className="text-brand" />
            <input
              autoFocus
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Jump to notes, categories, or run New note"
              className="w-full bg-transparent outline-none text-zinc-100 placeholder:text-zinc-600 font-medium"
            />
            <span className="text-[10px] font-mono text-zinc-600 flex items-center gap-1">
              <CornerDownLeft size={12} /> Enter
            </span>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {showNewNoteAction && (
              <button
                type="button"
                onClick={() => {
                  closePalette();
                  onNewNote?.();
                }}
                className="w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <PlusCircle size={18} className="text-brand" />
                    <div>
                      <div className="text-sm font-black tracking-tight text-zinc-100">New note</div>
                      <div className="text-[11px] font-mono text-zinc-600">Open Quick Capture modal</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-700">Action</span>
                </div>
              </button>
            )}

            {filtered.length === 0 ? (
              <div className="p-6 text-sm text-zinc-500">No matches.</div>
            ) : (
              <ul className="p-2">
                {filtered.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closePalette}
                      className="block rounded-2xl px-4 py-3 hover:bg-white/5 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-black tracking-tight text-zinc-100">{item.title}</div>
                          {(item.subtitle || item.group) && (
                            <div className="text-[11px] font-mono text-zinc-600 mt-1">
                              {item.group ? `${item.group} - ` : ''}
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-zinc-700">{item.href}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
