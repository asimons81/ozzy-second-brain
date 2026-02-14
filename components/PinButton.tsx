'use client';

import { useState, useTransition } from 'react';
import { Star } from 'lucide-react';
import { togglePin } from '@/app/actions/pins';

type PinButtonProps = {
  category: string;
  slug: string;
  title: string;
  initialPinned: boolean;
};

export function PinButton({ category, slug, title, initialPinned }: PinButtonProps) {
  const [pinned, setPinned] = useState(initialPinned);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await togglePin(category, slug, title);
      setPinned(result.pinned);
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${
        pinned
          ? 'bg-brand/15 border-brand/40 text-brand'
          : 'bg-white/5 border-white/10 text-zinc-400 hover:text-brand hover:border-brand/30'
      } ${isPending ? 'opacity-50' : ''}`}
      title={pinned ? 'Unpin note' : 'Pin note'}
    >
      <Star size={14} fill={pinned ? 'currentColor' : 'none'} />
      {pinned ? 'Pinned' : 'Pin'}
    </button>
  );
}
