'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, CornerDownLeft } from 'lucide-react';

export type PaletteItem = {
  title: string;
  subtitle?: string;
  href: string;
  group?: string;
};

function useHotkey(handler: () => void) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handler();
      }
      if (e.key === 'Escape') {
        // allow handler to close if open
        handler();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handler]);
}

export function CommandPalette({ items }: { items: PaletteItem[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const toggle = () => {
    setOpen((v) => {
      const next = !v;
      if (!next) setQ('');
      return next;
    });
  };

  // Ctrl/Cmd+K toggles. Esc closes.
  useHotkey(toggle);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items.slice(0, 20);
    return items
      .filter((it) => {
        const hay = `${it.title} ${it.subtitle ?? ''} ${it.group ?? ''} ${it.href}`.toLowerCase();
        return hay.includes(query);
      })
      .slice(0, 30);
  }, [items, q]);

  if (!open) {
    return (
      <button
        onClick={toggle}
        className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 transition-all"
        aria-label="Open command palette"
      >
        <Search size={16} className="text-brand" />
        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Search</span>
        <span className="ml-2 text-[10px] font-mono text-zinc-600">Ctrl/⌘ K</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={toggle} />
      <div className="absolute left-1/2 top-24 w-[min(920px,calc(100vw-24px))] -translate-x-1/2">
        <div className="glass border border-white/10 rounded-[24px] overflow-hidden shadow-2xl">
          <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
            <Search size={18} className="text-brand" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Jump to briefs, renders, ideas, journals…"
              className="w-full bg-transparent outline-none text-zinc-100 placeholder:text-zinc-600 font-medium"
            />
            <span className="text-[10px] font-mono text-zinc-600 flex items-center gap-1">
              <CornerDownLeft size={12} /> Enter
            </span>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-6 text-sm text-zinc-500">No matches.</div>
            ) : (
              <ul className="p-2">
                {filtered.map((it) => (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-2xl px-4 py-3 hover:bg-white/5 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-black tracking-tight text-zinc-100">{it.title}</div>
                          {(it.subtitle || it.group) && (
                            <div className="text-[11px] font-mono text-zinc-600 mt-1">
                              {it.group ? `${it.group} • ` : ''}
                              {it.subtitle}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-zinc-700">{it.href}</span>
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
