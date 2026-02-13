import { getDocsByCategory } from '@/lib/brain';
import { IdeaCard } from '@/components/IdeaCard';
import { Sparkles, Trash2, Filter, Clock } from 'lucide-react';

export default async function IdeasPage() {
  const allIdeas = getDocsByCategory('ideas');
  
  // Sort by score if available, otherwise date
  const sortedIdeas = [...allIdeas].sort((a, b) => {
    const scoreA = Number(a.score) || 0;
    const scoreB = Number(b.score) || 0;
    return scoreB - scoreA;
  });

  const highSignal = sortedIdeas.filter(i => (Number(i.score) || 0) >= 200);
  const backBurner = sortedIdeas.filter(i => (Number(i.score) || 0) < 200);

  return (
    <div className="max-w-5xl mx-auto py-12 md:py-24 px-4 md:px-8 space-y-16">
      <header className="space-y-4">
        <div className="inline-flex items-center space-x-2 bg-brand/10 border border-brand/20 px-4 py-1 rounded-full">
            <Sparkles size={14} className="text-brand" />
            <span className="text-[10px] font-black uppercase tracking-widest text-brand">Ideas Mission Control</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none italic uppercase">
              Filter <br/> <span className="text-zinc-500">The Noise</span>
          </h2>
          <div className="flex items-center space-x-4 pb-2">
             <div className="text-right hidden md:block">
               <div className="text-2xl font-black italic tracking-tight leading-none">{allIdeas.length}</div>
               <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Backlog</div>
             </div>
          </div>
        </div>
      </header>

      {/* High Signal Section */}
      <section className="space-y-8">
        <div className="flex items-center space-x-4 border-b border-white/5 pb-4">
           <Filter size={18} className="text-brand" />
           <h3 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400">High Signal Alpha (+200 Score)</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {highSignal.map((doc) => (
            <IdeaCard key={doc.slug} doc={doc} />
          ))}
          {highSignal.length === 0 && (
            <div className="p-12 text-center glass rounded-[32px] border-dashed border-white/10">
              <p className="text-zinc-500 font-medium">No high-signal ideas currently identified.</p>
            </div>
          )}
        </div>
      </section>

      {/* Backburner Section */}
      <section className="space-y-8 opacity-60 hover:opacity-100 transition-opacity">
        <div className="flex items-center space-x-4 border-b border-white/5 pb-4">
           <Clock size={18} className="text-zinc-500" />
           <h3 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">Low Frequency / Backburner</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {backBurner.slice(0, 20).map((doc) => (
            <IdeaCard key={doc.slug} doc={doc} />
          ))}
        </div>
        {backBurner.length > 20 && (
          <div className="p-6 text-center">
             <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">+ {backBurner.length - 20} more items hidden in backlog</p>
          </div>
        )}
      </section>
      
      <footer className="pt-12 flex justify-center">
        <div className="inline-flex items-center space-x-2 text-zinc-700">
           <Trash2 size={12} />
           <span className="text-[10px] font-black uppercase tracking-widest italic">Ozzy Cleanup Protocol Active</span>
        </div>
      </footer>
    </div>
  );
}
