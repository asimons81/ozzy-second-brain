'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Clock3, FileText, Film, Ticket, CheckCircle2 } from 'lucide-react';
import type { ActivityEvent } from '@/lib/activity';

type FeedFilter = 'all' | 'notes' | 'tickets' | 'renders';

function eventIcon(type: ActivityEvent['type']) {
  if (type === 'ticket_created') return Ticket;
  if (type === 'render_updated') return Film;
  if (type === 'idea_approved') return CheckCircle2;
  return FileText;
}

function matchesFilter(filter: FeedFilter, event: ActivityEvent) {
  if (filter === 'all') return true;
  if (filter === 'tickets') return event.type === 'ticket_created';
  if (filter === 'renders') return event.type === 'render_updated';
  return event.type === 'note_created' || event.type === 'note_updated' || event.type === 'idea_approved';
}

function localTime(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString();
}

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  const [filter, setFilter] = useState<FeedFilter>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return events.filter((event) => {
      if (!matchesFilter(filter, event)) return false;
      if (!q) return true;

      const haystack = `${event.title} ${event.href} ${event.meta ? JSON.stringify(event.meta) : ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [events, filter, query]);

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl border-white/5 p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {(['all', 'notes', 'tickets', 'renders'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border transition-all ${
                filter === option
                  ? 'bg-brand/15 border-brand/40 text-brand'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:text-zinc-100'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title or slug"
          className="w-full md:w-72 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100"
        />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="glass rounded-2xl border-white/5 p-6 text-sm text-zinc-500">No activity events matched this filter.</div>
        )}
        {filtered.map((event) => {
          const Icon = eventIcon(event.type);
          const utc = new Date(event.timestampIso).toUTCString();

          return (
            <Link
              key={event.id}
              href={event.href}
              className="block glass rounded-2xl border-white/5 p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand/10 border border-brand/25">
                    <Icon size={14} className="text-brand" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-zinc-100 truncate">{event.title}</div>
                    <div className="text-[11px] font-mono text-zinc-600 mt-1 truncate">{event.href}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] font-mono text-zinc-400" title={utc}>
                    {localTime(event.timestampIso)}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mt-1 inline-flex items-center gap-1">
                    <Clock3 size={11} />
                    {event.type.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

