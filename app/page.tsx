import Link from 'next/link';
import { Activity, Rocket, Zap, TrendingUp, BookOpen, Calendar, ExternalLink } from 'lucide-react';

const tiles = [
  {
    title: 'Morning Briefs',
    desc: 'Daily intel + action items',
    href: '/docs/briefs',
    icon: Rocket,
    accent: 'from-brand/30 to-emerald-500/10',
  },
  {
    title: 'Video Renders',
    desc: 'All generated clips, ready to post',
    href: '/docs/renders',
    icon: TrendingUp,
    accent: 'from-purple-500/25 to-brand/10',
  },
  {
    title: 'Ideas Funnel',
    desc: 'HN-scouted ideas + drafts pipeline',
    href: '/docs/ideas',
    icon: Zap,
    accent: 'from-yellow-500/20 to-brand/10',
  },
  {
    title: 'Journal',
    desc: 'Daily log of what shipped',
    href: '/docs/journal',
    icon: Calendar,
    accent: 'from-blue-500/20 to-brand/10',
  },
  {
    title: 'Newsletter Drafts',
    desc: 'Long-form compilation staging',
    href: '/docs/newsletter-drafts',
    icon: BookOpen,
    accent: 'from-zinc-500/20 to-brand/10',
  },
  {
    title: 'System Concepts',
    desc: 'Strategy + architecture docs',
    href: '/docs/concepts',
    icon: Activity,
    accent: 'from-zinc-800/40 to-brand/10',
  },
];

const external = [
  {
    title: 'Ozzy Captions',
    desc: 'Caption pipeline UI',
    href: 'https://captions.tonyreviewsthings.com',
  },
  {
    title: 'Status',
    desc: 'Uptime + quotas',
    href: 'https://status.tonyreviewsthings.com',
  },
  {
    title: 'Analytics',
    desc: 'Post performance',
    href: 'https://post.tonyreviewsthings.com',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col h-full md:p-12 space-y-12">
      <section className="space-y-4">
        <div className="inline-flex items-center space-x-2 bg-brand/10 border border-brand/20 px-4 py-1 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand/40 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-brand">System Live</span>
        </div>
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none italic uppercase">
          Brain <br /> <span className="text-zinc-500">Dashboard</span>
        </h2>
        <p className="text-zinc-400 max-w-2xl font-medium">
          One place to see everything Ozzy creates: briefs, drafts, renders, journals, and the tools that ship it.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiles.map((t) => (
          <Link
            key={t.title}
            href={t.href}
            className="group glass p-6 rounded-[32px] border-white/5 hover:bg-white/10 transition-all relative overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${t.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <t.icon size={20} className="text-brand" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Open</span>
              </div>
              <div>
                <h3 className="text-2xl font-black italic tracking-tight group-hover:text-brand transition-colors">
                  {t.title}
                </h3>
                <p className="text-sm text-zinc-500 font-medium mt-1">{t.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {external.map((x) => (
          <a
            key={x.title}
            href={x.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group glass p-6 rounded-[32px] border-white/5 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-500">External</p>
                <h4 className="text-xl font-black tracking-tight group-hover:text-brand transition-colors">
                  {x.title}
                </h4>
                <p className="text-sm text-zinc-500 font-medium mt-1">{x.desc}</p>
              </div>
              <ExternalLink size={18} className="text-zinc-600 group-hover:text-brand transition-colors" />
            </div>
          </a>
        ))}
      </section>
    </div>
  );
}
