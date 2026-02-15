'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { KeyRound, LogOut, Plus } from 'lucide-react';
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
  writesAllowed: boolean;
  readOnlyMessage: string;
};

type AuthState = {
  authenticated: boolean;
  email?: string;
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
  const [auth, setAuth] = useState<AuthState>({ authenticated: false });

  const showToast = (value: string) => {
    setToast(value);
    window.setTimeout(() => setToast(null), 2400);
  };

  const refreshAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        cache: 'no-store',
        credentials: 'include',
      });

      if (!response.ok) {
        setAuth({ authenticated: false });
        return;
      }

      const payload = (await response.json()) as AuthState;
      setAuth({
        authenticated: payload.authenticated === true,
        email: payload.email,
      });
    } catch {
      setAuth({ authenticated: false });
    }
  };

  useEffect(() => {
    void refreshAuth();
  }, []);

  const effectiveReadOnlyMessage = writesAllowed
    ? auth.authenticated
      ? readOnlyMessage
      : 'Editing is locked. Sign in with Google to enable create/edit/delete.'
    : readOnlyMessage;

  const canWrite = writesAllowed && auth.authenticated;

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

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setAuth({ authenticated: false });
      showToast('Logged out');
      router.refresh();
    } catch {
      showToast('Logout failed');
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {auth.authenticated ? (
          <>
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-brand/40 bg-brand/10 text-brand transition-all">
              <KeyRound size={16} className="text-brand" />
              <span className="text-xs font-black uppercase tracking-widest">
                Admin On {auth.email ? `(${auth.email})` : ''}
              </span>
            </span>
            <button
              onClick={() => void logout()}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-200 transition-all"
              title="Logout"
            >
              <LogOut size={16} />
              <span className="text-xs font-black uppercase tracking-widest">Logout</span>
            </button>
          </>
        ) : (
          <a
            href="/api/auth/login"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-200 transition-all"
            title="Sign in with Google"
          >
            <KeyRound size={14} className="text-zinc-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Sign in</span>
          </a>
        )}

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
        authenticated={auth.authenticated}
        readOnlyMessage={effectiveReadOnlyMessage}
      />

      {toast && (
        <div className="fixed right-4 top-4 z-[120] rounded-xl border border-brand/30 bg-black/90 px-3 py-2 text-xs font-bold text-brand">
          {toast}
        </div>
      )}
    </>
  );
}
