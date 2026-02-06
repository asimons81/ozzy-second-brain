import { Rocket, Zap, TrendingUp, DollarSign } from 'lucide-react';

export default function Home() {
  const stats = [
    { label: "X Followers", value: "445", target: "450", color: "bg-brand" },
    { label: "Daily Renders", value: "15", target: "20", color: "bg-purple-600" },
    { label: "Income Goal", value: "$0", target: "$3k", color: "bg-emerald-600" },
  ];

  return (
    <div className="flex flex-col h-full md:p-12 space-y-12">
      {/* Header */}
      <section className="space-y-4">
        <div className="inline-flex items-center space-x-2 bg-brand/10 border border-brand/20 px-4 py-1 rounded-full">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand/40 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand">System Live</span>
        </div>
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none italic uppercase">
            Intelligence <br/> <span className="text-zinc-500">Command</span>
        </h2>
      </section>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
            <div key={stat.label} className="glass p-6 rounded-[32px] space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-500">{stat.label}</p>
                <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-black italic tracking-tighter">{stat.value}</span>
                    <span className="text-sm font-bold text-zinc-600">/ {stat.target}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${stat.color}`} style={{ width: '85%' }} />
                </div>
            </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <Zap size={14} className="text-yellow-500" />
                Active Directives
            </h3>
            <div className="space-y-2">
                {[
                    "Auto-render trending HN clips",
                    "Optimize X thread engagement",
                    "Daily income replacement tracking",
                    "Second Brain UI optimization"
                ].map((task) => (
                    <div key={task} className="flex items-center space-x-3 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-default">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                        <span className="text-sm font-bold text-zinc-300">{task}</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="glass p-8 rounded-[40px] flex flex-col justify-between">
            <div>
                <p className="text-2xl font-bold tracking-tight mb-2">Operation Exit Strategy</p>
                <p className="text-zinc-500 text-sm leading-relaxed font-medium">
                    The mission is income replacement ($17/hr). 
                    Automating the content machine is the current priority.
                </p>
            </div>
            <div className="mt-8 flex items-center space-x-3">
                <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-xl">🚀</div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-tighter text-zinc-500">Directive from</p>
                    <p className="text-xl font-black italic tracking-tighter leading-none">OZZY</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
