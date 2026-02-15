'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { KeyRound, Plus } from 'lucide-react';
import { CommandPalette, PaletteActionId, PaletteItem } from '@/components/CommandPalette';
import { QuickCaptureModal } from '@/components/QuickCaptureModal';
import { readAdminToken, writeAdminToken } from '@/lib/client/admin-token';

type CaptureCategory = {
  key: string;
  title: string;
  defaultTemplate: string;
};

type GlobalActionsProps = {
  items: PaletteItem[];
  captureCategories: CaptureCategory[];
  storageWarning?: string | null;
  writesAllowed: boolean;
  readOnlyMessage: string;
};

export function GlobalActions({
  items,
  captureCategories,
  storageWarning,
  writesAllowed,
  readOnlyMessage,
}: GlobalActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [captureOpen, setCaptureOpen] = useState(false);
  const [capturePresetCategory, setCapturePresetCategory] = useState<string | undefined>(undefined);
  const [capturePresetTitle, setCapturePresetTitle] = useState<string | undefined>(undefined);
  const [captureSession, setCaptureSession] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [adminToken, setAdminToken] = useState(() => readAdminToken());
  const [draftAdminToken, setDraftAdminToken] = useState(() => readAdminToken());

  const showToast = (value: string) => {
    setToast(value);
    window.setTimeout(() => setToast(null), 2400);
  };

  const effectiveReadOnlyMessage = writesAllowed
    ? adminToken.trim()
      ? readOnlyMessage
      : 'Editing is locked. Add your Admin token to enable create/edit/delete.'
    : readOnlyMessage;

  const canWrite = writesAllowed && adminToken.trim().length > 0;

  const openCapture = (presetCategory?: string, presetTitle?: string) => {
    if (!canWrite) {
      showToast(effectiveReadOnlyMessage);
      return;
    }

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

  const saveToken = () => {
    writeAdminToken(draftAdminToken);
    const normalized = draftAdminToken.trim();
    setAdminToken(normalized);
    showToast(normalized ? 'Admin token saved' : 'Admin token cleared');
    setSettingsOpen(false);
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !canWrite) return;
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
  }, [canWrite, pathname, router]);

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSettingsOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-200 transition-all"
          title="Admin token settings"
        >
          <KeyRound size={16} className={adminToken ? 'text-brand' : 'text-zinc-400'} />
          <span className="text-xs font-black uppercase tracking-widest">
            {adminToken ? 'Admin On' : 'Admin'}
          </span>
        </button>

        <button
          onClick={() => openCapture()}
          disabled={!canWrite}
          title={!canWrite ? effectiveReadOnlyMessage : undefined}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-brand/40 bg-brand/10 hover:bg-brand/20 text-brand transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
        writesAllowed={writesAllowed}
        readOnlyMessage={effectiveReadOnlyMessage}
        adminToken={adminToken}
      />

      {settingsOpen && (
        <div className="fixed inset-0 z-[115]">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSettingsOpen(false)} />
          <div className="absolute left-1/2 top-24 w-[min(560px,calc(100vw-24px))] -translate-x-1/2 rounded-2xl border border-white/10 bg-black p-5 space-y-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-100">Admin Token</h3>
              <p className="mt-1 text-xs text-zinc-400">Stored in localStorage and sent as Bearer token for PUT/DELETE.</p>
            </div>
            <input
              type="password"
              value={draftAdminToken}
              onChange={(event) => setDraftAdminToken(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-zinc-100"
              placeholder="Paste SECOND_BRAIN_ADMIN_TOKEN"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="px-3 py-2 rounded-xl border border-white/10 text-sm text-zinc-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveToken}
                className="px-4 py-2 rounded-xl bg-brand/20 border border-brand/40 text-sm font-bold text-brand"
              >
                Save token
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed right-4 top-4 z-[120] rounded-xl border border-brand/30 bg-black/90 px-3 py-2 text-xs font-bold text-brand">
          {toast}
        </div>
      )}
    </>
  );
}
