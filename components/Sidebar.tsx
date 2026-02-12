'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  Rocket,
  Activity,
  Calendar,
  Book,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Zap,
  TrendingUp,
  Lightbulb,
  Copy,
  Wrench,
  Hammer,
} from 'lucide-react';
import { categories } from '@/lib/categories';

const iconMap = {
  Rocket,
  Calendar,
  Book,
  Zap,
  TrendingUp,
  Lightbulb,
  Copy,
  Wrench,
  Hammer,
} as const;

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/', icon: Activity },
    ...categories.map((category) => {
      const Icon = iconMap[category.icon as keyof typeof iconMap] ?? Book;
      return {
        label: category.title,
        href: category.key === 'renders' ? '/renders' : `/docs/${category.key}`,
        icon: Icon,
      };
    }),
  ];

  const externalLinks = [
    { label: 'Captions App', href: 'https://captions.tonyreviewsthings.com', icon: Rocket },
    { label: 'Analytics', href: 'https://post.tonyreviewsthings.com', icon: BarChart3 },
    { label: 'Amplify', href: 'https://amplify.tonyreviewsthings.com', icon: Zap },
    { label: 'Status', href: 'https://status.tonyreviewsthings.com', icon: Activity },
  ];

  return (
    <>
      <div className="md:hidden flex items-center justify-between p-4 bg-zinc-900/50 backdrop-blur-md border-b border-white/5 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-brand p-1.5 rounded-lg">
            <Rocket size={18} className="text-white" />
          </div>
          <span className="font-black tracking-tighter text-xl">OZZY</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-400 hover:text-white transition-colors">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <div
        className={`
        fixed inset-0 z-40 transform transition-all duration-300 ease-in-out md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'md:w-24' : 'md:w-80'}
        w-full h-full bg-[#080808] border-r border-white/5 flex flex-col overflow-y-auto
      `}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-24 w-6 h-6 bg-zinc-800 border border-white/10 rounded-full items-center justify-center text-zinc-400 hover:text-white hover:bg-brand transition-all z-50"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={`p-8 hidden md:block transition-all ${isCollapsed ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3 mb-12">
              <div className="bg-brand p-2 rounded-xl shadow-[0_0_20px_rgba(79,183,160,0.4)]">
                <Rocket size={24} className="text-white" />
              </div>
              <div>
                <h1 className="font-black text-2xl tracking-tighter leading-none">OZZY</h1>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Command Center</p>
              </div>
            </div>
          )}
        </div>

        {isCollapsed && (
          <div className="hidden md:flex flex-col items-center py-8 mb-4">
            <div className="bg-brand p-2 rounded-xl shadow-[0_0_20px_rgba(79,183,160,0.4)]">
              <Rocket size={24} className="text-white" />
            </div>
          </div>
        )}

        <nav className="flex-1 px-4 md:px-6 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`group flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all`}
              title={isCollapsed ? item.label : ''}
            >
              <item.icon size={20} className="group-hover:text-brand transition-colors flex-shrink-0" />
              {!isCollapsed && <span className="font-bold tracking-tight text-lg md:text-base">{item.label}</span>}
            </Link>
          ))}

          <div className="pt-8 pb-4">
            {!isCollapsed && <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2">Network Control</p>}
            <div className="h-px bg-white/5 mx-4 mb-4" />
          </div>

          {externalLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 text-zinc-500 hover:text-brand hover:bg-brand/5 rounded-xl transition-all`}
              title={isCollapsed ? item.label : ''}
            >
              <item.icon size={20} className="group-hover:text-brand transition-colors flex-shrink-0" />
              {!isCollapsed && <span className="font-bold tracking-tight text-lg md:text-base">{item.label}</span>}
            </a>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-white/5">
          <div className={`glass p-4 rounded-2xl flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} transition-all`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-emerald-600 flex-shrink-0 flex items-center justify-center font-black italic">
              T
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="font-bold text-sm truncate">Tony Simons</p>
                <p className="text-[10px] text-zinc-500 uppercase font-black truncate">Digital Twin Active</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}
