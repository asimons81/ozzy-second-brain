import Link from 'next/link';
import { Clock3, ListTodo } from 'lucide-react';
import { readSidTickets } from '@/lib/pipeline';

export const dynamic = 'force-dynamic';

function fmt(iso: string) {
  return new Date(iso).toLocaleString();
}

export default function QueuePage() {
  const tickets = readSidTickets();

  return (
    <div className="max-w-6xl mx-auto py-8 md:py-16 px-4 md:px-10 space-y-6">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 px-4 py-1 rounded-full">
          <ListTodo size={13} className="text-brand" />
          <span className="text-[10px] font-black uppercase tracking-widest text-brand">Queue</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none italic uppercase">
          Sid <br /> <span className="text-zinc-500">Pipeline View</span>
        </h1>
      </header>

      <div className="space-y-3">
        {tickets.length === 0 && (
          <div className="glass rounded-2xl border-white/5 p-6 text-sm text-zinc-500">
            No tickets found in `notes/sid-queue`.
          </div>
        )}

        {tickets.map((ticket) => (
          <div key={ticket.key} className="glass rounded-2xl border-white/5 p-4 md:p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <div className="text-lg font-black tracking-tight text-zinc-100 truncate">
                  {ticket.sourceIdeaSlug ?? ticket.id}
                </div>
                <div className="text-[11px] font-mono text-zinc-600 flex items-center gap-2">
                  <Clock3 size={12} />
                  {fmt(ticket.createdAt)}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${
                    ticket.derivedStatus === 'produced'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : ticket.isStale
                        ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-200'
                        : 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300'
                  }`}
                >
                  {ticket.derivedStatus === 'produced' ? 'Produced' : ticket.isStale ? 'Stale' : 'Pending'}
                </span>
                <Link
                  href={ticket.href}
                  className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-widest text-zinc-200"
                >
                  View ticket
                </Link>
                {ticket.outputExists && ticket.outputHref && (
                  <Link
                    href={ticket.outputHref}
                    className="px-3 py-2 rounded-lg border border-brand/30 bg-brand/10 hover:bg-brand/20 text-xs font-black uppercase tracking-widest text-brand"
                  >
                    Open output
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

