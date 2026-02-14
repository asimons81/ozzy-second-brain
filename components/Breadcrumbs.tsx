import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1 text-xs" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={12} className="text-zinc-600" />}
          {item.href ? (
            <Link
              href={item.href}
              className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 font-bold text-zinc-400 hover:text-brand hover:border-brand/30 transition-colors truncate max-w-[180px]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-bold text-zinc-200 truncate max-w-[240px]">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
