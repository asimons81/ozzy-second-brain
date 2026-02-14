import Link from 'next/link';
import {
  AlertTriangle,
  Clock3,
  ExternalLink,
  Flame,
  Layers,
  ListTodo,
  MessageSquare,
  Server,
  Sparkles,
  Star,
  Ticket,
} from 'lucide-react';
import { getActivitySnapshot } from '@/lib/activity';
import { getActivityHeatmapData } from '@/lib/activity';
import { readRecents, getStorageRuntimeInfo } from '@/lib/storage';
import { readApprovedIdeas, readSidTickets } from '@/lib/pipeline';
import { getSystemLinks } from '@/lib/systems';
import { readPins } from '@/lib/pins';
import {
  getStaleNotes,
  getWritingStreak,
  getPipelineBottlenecks,
  getCategoryDistribution,
  getNeedsReviewNotes,
} from '@/lib/dashboard';
import { ActivityHeatmap } from '@/components/ActivityHeatmap';

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
  const pins = readPins();
  const streak = getWritingStreak();
  const staleNotes = getStaleNotes(30, 5);
  const bottlenecks = getPipelineBottlenecks(5);
  const distribution = getCategoryDistribution();
  const needsReview = getNeedsReviewNotes(5);
  const heatmapData = getActivityHeatmapData(182);
  const maxCategoryCount = Math.max(1, ...distribution.map((c) => c.count));

  return (
    <div className="max-w-6xl mx-auto py-8 md:py-16 px-4 md:px-10 space-y-8">
      {/* Daily Briefing Card */}
      <section className="glass rounded-2xl border-white/5 p-5 md:p-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-brand/10 border border-brand/25 flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-brand" />
          </div>
          <div className="min-w-0 space-y-2 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand">Daily Briefing</span>
              {storage.isEphemeral && (
                <span className="text-[10px] font-mono text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-md">
                  Ephemeral mode
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {streak.current > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <Flame size={14} className="text-orange-400" />
                  <span className="font-bold text-orange-300">{streak.current}-day writing streak</span>
                  {!streak.todayComplete && <span className="text-zinc-500"> — write today to keep it alive</span>}
                  <span className="text-zinc-600 mx-1">|</span>
                </span>
              ) : (
                <span className="text-zinc-500">Start a writing streak today | </span>
              )}
              {staleNotes.length > 0 && (
                <span>{staleNotes.length} notes going stale | </span>
              )}
              {bottlenecks.length > 0 && (
                <span>{bottlenecks.length} pipeline bottleneck{bottlenecks.length > 1 ? 's' : ''} | </span>
              )}
              {needsReview.length > 0 && (
                <span className="text-brand">{needsReview.length} awaiting review</span>
              )}
              {staleNotes.length === 0 && bottlenecks.length === 0 && needsReview.length === 0 && (
                <span className="text-emerald-400">All clear.</span>
              )}
            </p>
            {lastActivity && (
              <div className="text-[11px] font-mono text-zinc-600">
                Last activity: {fmt(lastActivity)}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pinned Notes */}
      {pins.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Star size={14} className="text-brand" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Pinned</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pins.map((pin) => (
              <Link
                key={`${pin.category}/${pin.slug}`}
                href={pin.href}
                className="glass rounded-xl border-white/5 p-3 hover:bg-white/10 transition-all"
              >
                <div className="text-sm font-bold text-zinc-100 truncate">{pin.title}</div>
                <div className="text-[10px] font-mono text-zinc-600 mt-1">{pin.category}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Needs Review */}
      {needsReview.length > 0 && (
        <section className="glass rounded-2xl border-brand/20 bg-brand/5 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare size={14} className="text-brand" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand">Needs Agent Review</h2>
          </div>
          <div className="space-y-2">
            {needsReview.map((note) => (
              <Link
                key={`${note.category}/${note.slug}`}
                href={note.href}
                className="block rounded-xl border border-brand/10 bg-black/20 px-3 py-3 hover:bg-white/5 transition-all"
              >
                <div className="text-sm font-bold text-zinc-100 truncate">{note.title}</div>
                <div className="text-[11px] font-mono text-zinc-600 mt-1">{note.category} - pending review</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Active + Recent */}
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

      {/* Stale Notes + Category Distribution */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6">
        {staleNotes.length > 0 && (
          <div className="glass rounded-2xl border-white/5 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-yellow-400" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400/80">Going Stale</h2>
            </div>
            <div className="space-y-2">
              {staleNotes.map((note) => (
                <Link
                  key={`${note.category}/${note.slug}`}
                  href={note.href}
                  className="block rounded-xl border border-white/10 bg-white/5 px-3 py-3 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-zinc-100 truncate">{note.title}</div>
                      <div className="text-[10px] font-mono text-zinc-600 mt-1">{note.category}</div>
                    </div>
                    <span className="text-[10px] font-mono text-yellow-400/60 shrink-0">
                      {note.daysSinceModified}d ago
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="glass rounded-2xl border-white/5 p-5 space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Knowledge Distribution</h2>
          <div className="space-y-2">
            {distribution.slice(0, 8).map((cat) => (
              <Link
                key={cat.category}
                href={`/docs/${encodeURIComponent(cat.category)}`}
                className="flex items-center gap-3 group"
              >
                <span className="text-xs font-bold text-zinc-400 group-hover:text-brand transition-colors w-28 truncate">
                  {cat.title}
                </span>
                <div className="flex-1 h-4 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand/30 group-hover:bg-brand/50 transition-all"
                    style={{ width: `${(cat.count / maxCategoryCount) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-zinc-600 w-6 text-right">{cat.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Queue + Systems */}
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

      {/* Activity Heatmap */}
      <section className="glass rounded-2xl border-white/5 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Activity (6 months)</h2>
          <Link href="/activity" className="text-[11px] font-mono text-zinc-500 hover:text-brand">
            Full timeline
          </Link>
        </div>
        <ActivityHeatmap data={heatmapData} />
      </section>
    </div>
  );
}
