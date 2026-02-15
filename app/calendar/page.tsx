'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X, Twitter } from 'lucide-react';

function getWeekDays(offset = 0) {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + offset * 7);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(day);
  }
  return days;
}

function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

function isToday(date: Date) {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

const mockContent = [
  { date: '2026-02-13', type: 'x', title: 'World Models thread', status: 'published' },
  { date: '2026-02-14', type: 'x', title: 'Super Agent tip', status: 'scheduled' },
  { date: '2026-02-15', type: 'newsletter', title: 'Issue #4 drop', status: 'draft' },
  { date: '2026-02-16', type: 'x', title: 'Minimax vs Claude breakdown', status: 'idea' },
  { date: '2026-02-17', type: 'x', title: 'OpenClaw tips thread', status: 'idea' },
  { date: '2026-02-18', type: 'x', title: 'Tool takedown', status: 'idea' },
  { date: '2026-02-19', type: 'x', title: 'Week recap', status: 'idea' },
];

export default function CalendarPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDays = getWeekDays(weekOffset);
  const today = new Date();

  const getContentForDay = (date: Date) => {
    const dateStr = formatDate(date);
    return mockContent.filter(c => c.date === dateStr);
  };

  const weekDaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="max-w-6xl mx-auto py-12 md:py-16 px-4 md:px-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 px-4 py-1 rounded-full">
            <CalendarIcon size={14} className="text-brand" />
            <span className="text-[10px] font-black uppercase tracking-widest text-brand">X Content Pipeline</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none italic uppercase">
            Content <br /> <span className="text-zinc-500">Calendar</span>
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            className="p-3 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:border-white/20 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center min-w-[140px]">
            <div className="text-lg font-black tracking-tight">
              {weekDays[0].toLocaleDateString('en-US', { month: 'short' })} {weekDays[0].getDate()} - {weekDays[6].toLocaleDateString('en-US', { month: 'short' })} {weekDays[6].getDate()}
            </div>
            <div className="text-xs text-zinc-500 font-medium uppercase tracking-widest">{today.getFullYear()}</div>
          </div>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            className="p-3 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:border-white/20 transition-all"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="px-4 py-2 rounded-xl bg-brand/10 border border-brand/20 text-brand hover:bg-brand hover:text-black transition-all text-sm font-black uppercase tracking-widest"
          >
            Today
          </button>
        </div>
      </header>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-3">
        {weekDays.map((day, idx) => {
          const content = getContentForDay(day);
          const isTodayDay = isToday(day);

          return (
            <div
              key={idx}
              className={`min-h-[180px] rounded-2xl border p-4 transition-all ${isTodayDay
                ? 'bg-brand/5 border-brand/30'
                : 'bg-zinc-900/50 border-white/5 hover:border-white/10'
                }`}
            >
              <div className={`text-center mb-3 ${isTodayDay ? 'text-brand' : 'text-zinc-500'}`}>
                <div className="text-[10px] font-black uppercase tracking-widest">{weekDaysShort[idx]}</div>
                <div className={`text-2xl font-black ${isTodayDay ? 'text-brand' : 'text-zinc-300'}`}>
                  {day.getDate()}
                </div>
              </div>

              <div className="space-y-2">
                {content.map((item, i) => (
                  <div
                    key={i}
                    className={`text-xs p-2 rounded-lg border ${item.status === 'published'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : item.status === 'scheduled'
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        : item.status === 'draft'
                          ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                          : 'bg-zinc-800/50 border-white/5 text-zinc-400'
                      }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      {item.type === 'x' && <Twitter size={10} />}
                      <span className="font-black uppercase tracking-wider text-[9px]">{item.type}</span>
                    </div>
                    <div className="font-medium truncate">{item.title}</div>
                  </div>
                ))}

                <button
                  className="w-full p-2 rounded-lg border border-dashed border-white/10 text-zinc-600 hover:text-zinc-400 hover:border-white/20 transition-all text-xs flex items-center justify-center gap-1"
                >
                  <Plus size={12} /> Add
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-xs text-zinc-500 font-medium">Published</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-xs text-zinc-500 font-medium">Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-xs text-zinc-500 font-medium">Draft</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-zinc-600"></div>
          <span className="text-xs text-zinc-500 font-medium">Planned</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4">
        <div className="glass rounded-2xl border-white/5 p-6 text-center">
          <div className="text-3xl font-black text-brand">{mockContent.filter(c => c.status === 'published').length}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Published</div>
        </div>
        <div className="glass rounded-2xl border-white/5 p-6 text-center">
          <div className="text-3xl font-black text-blue-400">{mockContent.filter(c => c.status === 'scheduled').length}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Scheduled</div>
        </div>
        <div className="glass rounded-2xl border-white/5 p-6 text-center">
          <div className="text-3xl font-black text-zinc-400">{mockContent.filter(c => c.status === 'idea').length}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Planned</div>
        </div>
      </div>
    </div>
  );
}
