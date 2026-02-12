'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { CommandPalette, PaletteItem } from '@/components/CommandPalette';
import { QuickCaptureModal } from '@/components/QuickCaptureModal';

type CaptureCategory = {
  key: string;
  title: string;
  defaultTemplate: string;
};

type GlobalActionsProps = {
  items: PaletteItem[];
  captureCategories: CaptureCategory[];
};

export function GlobalActions({ items, captureCategories }: GlobalActionsProps) {
  const [captureOpen, setCaptureOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (value: string) => {
    setToast(value);
    window.setTimeout(() => setToast(null), 2400);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCaptureOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-brand/40 bg-brand/10 hover:bg-brand/20 text-brand transition-all"
        >
          <Plus size={16} />
          <span className="text-xs font-black uppercase tracking-widest">+ Capture</span>
        </button>
        <CommandPalette items={items} onNewNote={() => setCaptureOpen(true)} />
      </div>

      <QuickCaptureModal
        open={captureOpen}
        onClose={() => setCaptureOpen(false)}
        categories={captureCategories}
        onCreated={(title) => showToast(`Saved: ${title}`)}
      />

      {toast && (
        <div className="fixed right-4 top-4 z-[120] rounded-xl border border-brand/30 bg-black/90 px-3 py-2 text-xs font-bold text-brand">
          {toast}
        </div>
      )}
    </>
  );
}
