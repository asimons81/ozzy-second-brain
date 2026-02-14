'use client';

import { useMemo, useState } from 'react';

type HeatmapDay = { date: string; count: number };

function intensity(count: number, max: number): number {
  if (count === 0) return 0;
  if (max <= 0) return 1;
  const ratio = count / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

const INTENSITY_CLASSES = [
  'bg-white/5',
  'bg-brand/20',
  'bg-brand/40',
  'bg-brand/60',
  'bg-brand/80',
];

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

export function ActivityHeatmap({ data }: { data: HeatmapDay[] }) {
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  const { weeks, max } = useMemo(() => {
    const maxCount = Math.max(1, ...data.map((d) => d.count));

    // Group into weeks (columns)
    const weeks: HeatmapDay[][] = [];
    let currentWeek: HeatmapDay[] = [];

    // Pad the beginning so first day aligns to correct day-of-week
    if (data.length > 0) {
      const firstDay = new Date(data[0].date).getDay();
      for (let i = 0; i < firstDay; i++) {
        currentWeek.push({ date: '', count: -1 });
      }
    }

    for (const day of data) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return { weeks, max: maxCount };
  }, [data]);

  const totalEvents = data.reduce((sum, d) => sum + d.count, 0);
  const activeDays = data.filter((d) => d.count > 0).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
          {totalEvents} events across {activeDays} active days
        </div>
        <div className="flex items-center gap-1 text-[10px] text-zinc-600">
          <span>Less</span>
          {INTENSITY_CLASSES.map((cls, i) => (
            <div key={i} className={`w-[10px] h-[10px] rounded-sm ${cls}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <div className="flex gap-0.5">
          <div className="flex flex-col gap-0.5 pr-1 pt-0">
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="h-[10px] text-[8px] text-zinc-600 leading-[10px] w-5">
                {label}
              </div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((day, di) => {
                if (day.count < 0) {
                  return <div key={di} className="w-[10px] h-[10px]" />;
                }
                const level = intensity(day.count, max);
                return (
                  <div
                    key={di}
                    className={`w-[10px] h-[10px] rounded-sm ${INTENSITY_CLASSES[level]} cursor-pointer transition-all hover:ring-1 hover:ring-brand/50`}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({ date: day.date, count: day.count, x: rect.left, y: rect.top });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {tooltip && (
          <div
            className="fixed z-50 px-2 py-1 rounded-lg bg-zinc-900 border border-white/10 text-[10px] text-zinc-200 shadow-xl pointer-events-none"
            style={{ left: tooltip.x - 30, top: tooltip.y - 32 }}
          >
            <span className="font-bold">{tooltip.count} events</span>
            <span className="text-zinc-500 ml-1">{tooltip.date}</span>
          </div>
        )}
      </div>
    </div>
  );
}
