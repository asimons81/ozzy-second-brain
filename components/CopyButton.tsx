'use client';

import { useState } from 'react';

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-widest text-zinc-200"
    >
      {copied ? 'Copied' : 'Copy Payload'}
    </button>
  );
}

