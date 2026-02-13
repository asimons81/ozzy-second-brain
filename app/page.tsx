import Link from 'next/link';
import { Clock3, ExternalLink, Layers, ListTodo, Server, Sparkles, Ticket } from 'lucide-react';
import { getActivitySnapshot } from '@/lib/activity';
import { readRecents, getStorageRuntimeInfo } from '@/lib/storage';
import { readApprovedIdeas, readSidTickets } from '@/lib/pipeline';
import { getSystemLinks } from '@/lib/systems';

export const dynamic = 'force-dynamic';

function ts(value: string) {
  return new Date(value).getTime();
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString();
}

export default function NowPage() {
  const storage = getStorageRuntimeInfo();
  const recents = readRecents(10);
  const tickets = readSidTickets();
  const queueTop = tickets.slice(0, 10);
  const openTickets = tickets.filter((ticket) => ticket.derivedStatus === 'pending');
  const approvedPending = readApprovedIdeas().filter((idea) => !idea.outputExists);
  const activity = getActivitySnapshot(200);

  const lastCandidates = [
    ...(activity.lastActivityIso ? [activity.lastActivityIso] : []),
    ...recents.map((item) => item.modifiedAt),
    ...tickets.map((item) => item.createdAt),
    ...approvedPending.map((item) => item.modifiedAt),
  ];
  const lastActivity = lastCandidates.sort((a, b) => ts(b) - ts(a))[0] ?? null;

  const systems = getSystemLinks();

  return (
    <div className="max-w-6xl mx-auto py-8 md:py-16 px-4 md:px-10 space-y-8">
      <section className="space-y-4">
        <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 px-4 py-1 rounded-full">
          <Sparkles size={13} className="text-brand" />
          <span className="text-[10px] font-black uppercase tracking-widest text-brand">Now Dashboard</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass rounded-2xl border-white/5 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Storage Mode</div>
            <div className="text-lg font-black tracking-tight mt-2">{storage.isEphemeral ? 'Ephemeral' : 'Local'}</div>
            <div className="text-xs text-zinc-500 mt-1">{storage.dataDir}</div>
          </div>
          <div className="glass rounded-2xl border-white/5 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Last Activity</div>
            <div className="text-lg font-black tracking-tight mt-2">{lastActivity ? fmt(lastActivity) : 'No activity yet'}</div>
            <div className="text-xs text-zinc-500 mt-1">Merged from notes, tickets, renders, and approvals</div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6">
        <div className="glass rounded-2xl border-white/5 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-brand" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-300">Active</h2>
            </div>
            <Link href="/queue" className="text-[11px] font-mono text-zinc-500 hover:text-brand">
              See all
            </Link>
          </div>

          <div className="space-y-2">
            {approvedPending.length === 0 && openTickets.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-zinc-500">
                No active approvals or open Sid tickets.
              </div>
            )}

            {approvedPending.slice(0, 5).map((idea) => (
              <div key={`approved-${idea.slug}`} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-zinc-100 truncate">{idea.title}</div>
                  <div className="text-[11px] font-mono text-zinc-600 mt-1">Approved idea awaiting output</div>
                </div>
                <Link href={idea.href} className="text-xs font-black uppercase tracking-widest text-brand hover:opacity-80">
                  Open
                </Link>
              </div>
            ))}

            {openTickets.slice(0, 5).map((ticket) => (
              <div key={`ticket-${ticket.key}`} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-zinc-100 truncate">{ticket.sourceIdeaSlug ?? ticket.id}</div>
                  <div className="text-[11px] font-mono text-zinc-600 mt-1">
                    {ticket.isStale ? 'Stale pending ticket' : 'Open Sid ticket'}
                  </div>
                </div>
                <Link href={ticket.href} className="text-xs font-black uppercase tracking-widest text-brand hover:opacity-80">
                  Queue
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl border-white/5 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock3 size={16} className="text-brand" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-300">Recent</h2>
            </div>
            <Link href="/activity" className="text-[11px] font-mono text-zinc-500 hover:text-brand">
              See all
            </Link>
          </div>
          <div className="space-y-2">
            {recents.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-zinc-500">
                No recent note activity yet.
              </div>
            )}
            {recents.map((item) => (
              <Link
                key={item.key}
                href={item.path}
                className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition-all"
              >
                <div className="text-sm font-bold text-zinc-100 truncate">{item.title}</div>
                <div className="text-[11px] font-mono text-zinc-600 mt-1">{item.category} - {fmt(item.modifiedAt)}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6">
        <div className="glass rounded-2xl border-white/5 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListTodo size={16} className="text-brand" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-300">Queue</h2>
            </div>
            <Link href="/queue" className="text-[11px] font-mono text-zinc-500 hover:text-brand">
              See all
            </Link>
          </div>
          <div className="space-y-2">
            {queueTop.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-zinc-500">
                Sid queue is empty.
              </div>
            )}
            {queueTop.map((ticket) => (
              <Link
                key={ticket.key}
                href={ticket.href}
                className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-zinc-100 truncate">{ticket.sourceIdeaSlug ?? ticket.id}</div>
                    <div className="text-[11px] font-mono text-zinc-600 mt-1">{fmt(ticket.createdAt)}</div>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${
                      ticket.derivedStatus === 'produced'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                        : ticket.isStale
                          ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-200'
                          : 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300'
                    }`}
                  >
                    {ticket.derivedStatus === 'produced' ? 'Produced' : ticket.isStale ? 'Stale' : 'Pending'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl border-white/5 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Server size={16} className="text-brand" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-300">Systems</h2>
          </div>
          <div className="space-y-2">
            {systems.map((system) => (
              <a
                key={system.label}
                href={system.href}
                target={system.href.startsWith('http') ? '_blank' : undefined}
                rel={system.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-bold text-zinc-100">{system.label}</div>
                {system.href.startsWith('http') ? (
                  <ExternalLink size={14} className="text-zinc-500" />
                ) : (
                  <Ticket size={14} className="text-zinc-500" />
                )}
              </div>
            </a>
          ))}
          </div>
        </div>
      </section>
    </div>
  );
}
