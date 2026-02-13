'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { CommandPalette, PaletteActionId, PaletteItem } from '@/components/CommandPalette';
import { QuickCaptureModal } from '@/components/QuickCaptureModal';

type CaptureCategory = {
  key: string;
  title: string;
  defaultTemplate: string;
};

type GlobalActionsProps = {
  items: PaletteItem[];
  captureCategories: CaptureCategory[];
  storageWarning?: string | null;
};

export function GlobalActions({ items, captureCategories, storageWarning }: GlobalActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [captureOpen, setCaptureOpen] = useState(false);
  const [capturePresetCategory, setCapturePresetCategory] = useState<string | undefined>(undefined);
  const [capturePresetTitle, setCapturePresetTitle] = useState<string | undefined>(undefined);
  const [captureSession, setCaptureSession] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (value: string) => {
    setToast(value);
    window.setTimeout(() => setToast(null), 2400);
  };

  const openCapture = (presetCategory?: string, presetTitle?: string) => {
    setCapturePresetCategory(presetCategory);
    setCapturePresetTitle(presetTitle);
    setCaptureSession((v) => v + 1);
    setCaptureOpen(true);
  };

  const handlePaletteAction = (actionId: PaletteActionId) => {
    if (actionId === 'new-idea') {
      openCapture('ideas');
      return;
    }
    if (actionId === 'new-journal') {
      openCapture('journal');
      return;
    }
    openCapture();
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const searchParams = new URLSearchParams(window.location.search);
    const shouldOpen = searchParams.get('capture');
    if (shouldOpen !== '1' && shouldOpen !== 'true') return;

    const requestedCategory = searchParams.get('category') ?? undefined;
    const requestedTitle = searchParams.get('title') ?? undefined;
    const timer = window.setTimeout(() => {
      setCapturePresetCategory(requestedCategory);
      setCapturePresetTitle(requestedTitle);
      setCaptureSession((v) => v + 1);
      setCaptureOpen(true);
    }, 0);

    const next = new URLSearchParams(searchParams.toString());
    next.delete('capture');
    next.delete('category');
    next.delete('title');
    const nextQuery = next.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);

    return () => window.clearTimeout(timer);
  }, [pathname, router]);

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => openCapture()}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-brand/40 bg-brand/10 hover:bg-brand/20 text-brand transition-all"
        >
          <Plus size={16} />
          <span className="text-xs font-black uppercase tracking-widest">+ Capture</span>
        </button>
        <CommandPalette items={items} onAction={handlePaletteAction} />
      </div>

      <QuickCaptureModal
        key={`capture-${captureSession}`}
        open={captureOpen}
        onClose={() => setCaptureOpen(false)}
        categories={captureCategories}
        onCreated={(title) => showToast(`Saved: ${title}`)}
        storageWarning={storageWarning}
        presetCategory={capturePresetCategory}
        presetTitle={capturePresetTitle}
      />

      {toast && (
        <div className="fixed right-4 top-4 z-[120] rounded-xl border border-brand/30 bg-black/90 px-3 py-2 text-xs font-bold text-brand">
          {toast}
        </div>
      )}
    </>
  );
}

