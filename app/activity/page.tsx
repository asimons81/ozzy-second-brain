import { Activity } from 'lucide-react';
import { ActivityFeed } from '@/components/ActivityFeed';
import { getActivityEvents } from '@/lib/activity';

export const dynamic = 'force-dynamic';

export default function ActivityPage() {
  const events = getActivityEvents(400);

  return (
    <div className="max-w-6xl mx-auto py-8 md:py-16 px-4 md:px-10 space-y-6">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 px-4 py-1 rounded-full">
          <Activity size={13} className="text-brand" />
          <span className="text-[10px] font-black uppercase tracking-widest text-brand">Activity</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none italic uppercase">
          Unified <br /> <span className="text-zinc-500">Timeline</span>
        </h1>
        <p className="text-zinc-400 max-w-2xl font-medium">
          Merged events across note edits, Sid tickets, renders, and approvals.
        </p>
      </header>

      <ActivityFeed events={events} />
    </div>
  );
}

