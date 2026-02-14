import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, FileJson } from 'lucide-react';
import { getSidTicketByKey, readSidTickets } from '@/lib/pipeline';
import { CopyButton } from '@/components/CopyButton';

export function generateStaticParams() {
  return readSidTickets().map((ticket) => ({ ticketId: ticket.key }));
}

function pretty(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export default async function QueueTicketPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  const decoded = decodeURIComponent(ticketId);
  const ticket = getSidTicketByKey(decoded);

  if (!ticket) {
    notFound();
  }

  const promptPayload = ticket.raw.data ?? ticket.raw.instructions ?? ticket.raw;

  return (
    <div className="max-w-5xl mx-auto py-8 md:py-16 px-4 md:px-10 space-y-6">
      <Link href="/queue" className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-brand">
        <ArrowLeft size={14} />
        Back to queue
      </Link>

      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 px-4 py-1 rounded-full">
          <FileJson size={13} className="text-brand" />
          <span className="text-[10px] font-black uppercase tracking-widest text-brand">Ticket Detail</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none italic uppercase">{ticket.id}</h1>
      </header>

      <div className="glass rounded-2xl border-white/5 p-5 space-y-3">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Derived Links</div>
        <div className="flex flex-wrap gap-2">
          {ticket.sourceIdeaSlug && (
            <Link
              href={`/docs/ideas/${encodeURIComponent(ticket.sourceIdeaSlug)}`}
              className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-widest text-zinc-200"
            >
              Open idea
            </Link>
          )}
          {ticket.outputExists && ticket.outputHref && (
            <Link
              href={ticket.outputHref}
              className="px-3 py-2 rounded-lg border border-brand/30 bg-brand/10 hover:bg-brand/20 text-xs font-black uppercase tracking-widest text-brand"
            >
              Open output
            </Link>
          )}
          <CopyButton value={pretty(promptPayload)} />
        </div>
      </div>

      <div className="glass rounded-2xl border-white/5 p-5 space-y-3">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Ticket JSON</div>
        <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/50 p-4 text-xs text-zinc-200 font-mono leading-relaxed">
{pretty(ticket.raw)}
        </pre>
      </div>
    </div>
  );
}

