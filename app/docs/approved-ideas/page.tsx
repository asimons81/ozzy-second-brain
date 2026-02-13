'use server';

import { getDocsByCategory } from '@/lib/brain';
import { CheckCircle, ArrowRight, Clock, Play } from 'lucide-react';
import Link from 'next/link';
import { readApprovedIdeas } from '@/lib/pipeline';

export const dynamic = 'force-dynamic';

export default async function ApprovedIdeasPage() {
  const approvedIdeas = readApprovedIdeas();

  return (
    <div className="max-w-5xl mx-auto py-12 md:py-24 px-4 md:px-8 space-y-16">
      <header className="space-y-4">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1 rounded-full">
            <CheckCircle size={14} className="text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Production Pipeline</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none italic uppercase">
              Approved <br/> <span className="text-zinc-500">Ideas</span>
          </h2>
          <div className="flex items-center space-x-4 pb-2">
             <div className="text-right hidden md:block">
               <div className="text-2xl font-black italic tracking-tight leading-none">{approvedIdeas.length}</div>
               <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">In Pipeline</div>
             </div>
          </div>
        </div>
      </header>

      {approvedIdeas.length === 0 ? (
        <div className="p-12 text-center glass rounded-[32px] border-dashed border-white/10">
          <CheckCircle size={48} className="mx-auto text-zinc-600 mb-4" />
          <p className="text-zinc-400 font-medium text-lg">No approved ideas yet.</p>
          <p className="text-zinc-600 text-sm mt-2">Go to Ideas Mission Control to approve ideas and start production.</p>
          <Link 
            href="/docs/ideas" 
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-brand text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-brand/80 transition-colors"
          >
            Browse Ideas <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {approvedIdeas.map((idea) => (
            <div key={idea.slug} className="glass p-6 md:p-8 rounded-[32px] border-white/5 hover:bg-white/5 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      APPROVED
                    </span>
                    {idea.outputExists && (
                      <span className="text-[10px] font-black bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                        RENDERED
                      </span>
                    )}
                  </div>
                  <div>
                    <Link href={`/docs/approved-ideas/${idea.slug}`} className="text-2xl font-black italic tracking-tight hover:text-emerald-400 transition-colors block truncate">
                      {idea.title}
                    </Link>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="flex items-center gap-2 text-zinc-500 text-sm">
                    <Clock size={14} />
                    <span>{new Date(idea.modifiedAt).toLocaleDateString()}</span>
                  </div>
                  
                  <Link
                    href={`/docs/approved-ideas/${idea.slug}`}
                    className="p-3 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:border-white/20 transition-all"
                    title="View Idea"
                  >
                    <ArrowRight size={20} />
                  </Link>
                  
                  {idea.outputExists && idea.outputHref && (
                    <Link
                      href={idea.outputHref}
                      className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                      title="View Render"
                    >
                      <Play size={20} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
