'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CornerDownLeft, Search } from 'lucide-react';
import type { PaletteActionId, PaletteItem } from '@/lib/palette-types';

type CommandPaletteProps = {
  items: PaletteItem[];
  onAction?: (actionId: PaletteActionId) => void;
};

const groupOrder = ['Navigate', 'Create', 'Systems'];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function itemSearchText(item: PaletteItem) {
  return `${item.title} ${item.subtitle ?? ''} ${item.group} ${item.href ?? ''} ${item.keywords ?? ''}`.toLowerCase();
}

function sortByGroup(a: PaletteItem, b: PaletteItem) {
  const aIdx = groupOrder.indexOf(a.group);
  const bIdx = groupOrder.indexOf(b.group);

  const ai = aIdx === -1 ? 999 : aIdx;
  const bi = bIdx === -1 ? 999 : bIdx;
  if (ai !== bi) return ai - bi;
  if (a.group !== b.group) return a.group.localeCompare(b.group);
  return a.title.localeCompare(b.title);
}

export function CommandPalette({ items, onAction }: CommandPaletteProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(() => {
    const query = normalize(q);
    const source = [...items].sort(sortByGroup);
    if (!query) return source.slice(0, 80);
    return source.filter((item) => itemSearchText(item).includes(query)).slice(0, 80);
  }, [items, q]);

  const grouped = useMemo(() => {
    const sections = new Map<string, PaletteItem[]>();
    for (const item of filtered) {
      const list = sections.get(item.group) ?? [];
      list.push(item);
      sections.set(item.group, list);
    }
    return [...sections.entries()];
  }, [filtered]);

  const executeItem = useCallback((item: PaletteItem | undefined) => {
    if (!item) return;

    if (item.kind === 'action' && item.actionId) {
      onAction?.(item.actionId);
      setOpen(false);
      setQ('');
      return;
    }

    if (!item.href) return;

    if (item.kind === 'external') {
      window.open(item.href, '_blank', 'noopener,noreferrer');
    } else {
      router.push(item.href);
    }

    setOpen(false);
    setQ('');
  }, [onAction, router]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const modifier = isMac ? event.metaKey : event.ctrlKey;

      if (modifier && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((prev) => {
          const next = !prev;
          if (next) {
            setQ('');
            setActiveIndex(0);
          } else {
            setQ('');
          }
          return next;
        });
      }

      if (!open) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        setQ('');
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, Math.max(filtered.length - 1, 0)));
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        executeItem(filtered[activeIndex]);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, filtered, activeIndex, router, onAction, executeItem]);

  if (!open) {
    return (
      <button
        onClick={() => {
          setQ('');
          setActiveIndex(0);
          setOpen(true);
        }}
        className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 transition-all"
        aria-label="Open command palette"
      >
        <Search size={16} className="text-brand" />
        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Search</span>
        <span className="ml-2 text-[10px] font-mono text-zinc-600">Ctrl/Cmd K</span>
      </button>
    );
  }

  let rowIndex = 0;

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => {
          setOpen(false);
          setQ('');
        }}
      />
      <div className="absolute left-1/2 top-24 w-[min(980px,calc(100vw-24px))] -translate-x-1/2">
        <div className="glass border border-white/10 rounded-[24px] overflow-hidden shadow-2xl">
          <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
            <Search size={18} className="text-brand" />
            <input
              autoFocus
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Navigate, create, or open systems"
              className="w-full bg-transparent outline-none text-zinc-100 placeholder:text-zinc-600 font-medium"
            />
            <span className="text-[10px] font-mono text-zinc-600 flex items-center gap-1">
              <CornerDownLeft size={12} /> Enter
            </span>
          </div>

          <div className="max-h-[62vh] overflow-y-auto p-2">
            {filtered.length === 0 && <div className="p-6 text-sm text-zinc-500">No matches.</div>}

            {grouped.map(([group, groupItems]) => (
              <div key={group} className="mb-2">
                <div className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">{group}</div>
                <ul className="space-y-1">
                  {groupItems.map((item) => {
                    const currentIndex = rowIndex;
                    rowIndex += 1;
                    const active = currentIndex === activeIndex;

                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onMouseEnter={() => setActiveIndex(currentIndex)}
                          onClick={() => executeItem(item)}
                          className={`w-full text-left rounded-2xl px-4 py-3 transition-all ${
                            active ? 'bg-white/12 border border-brand/30' : 'hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-black tracking-tight text-zinc-100 truncate">{item.title}</div>
                              {item.subtitle && (
                                <div className="text-[11px] font-mono text-zinc-600 mt-1 truncate">{item.subtitle}</div>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-zinc-700 truncate">
                              {item.kind === 'action' ? 'Action' : item.href}
                            </span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export type { PaletteActionId, PaletteItem };
