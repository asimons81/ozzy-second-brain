'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Now', href: '/' },
  { label: 'Activity', href: '/activity' },
  { label: 'Queue', href: '/queue' },
  { label: 'Docs', href: '/docs' },
  { label: 'Ideas', href: '/ideas' },
  { label: 'Renders', href: '/renders' },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ label, href }: { label: string; href: string }) {
  const pathname = usePathname();
  const active = isActive(pathname, href);

  return (
    <Link
      href={href}
      className={`px-2.5 py-1.5 rounded-md border text-[10px] font-black uppercase tracking-widest transition-all ${
        active
          ? 'border-brand/40 bg-brand/15 text-brand'
          : 'border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300'
      }`}
    >
      {label}
    </Link>
  );
}

export function TopNav() {
  return (
    <>
      <nav className="hidden md:flex items-center gap-2">
        {navItems.map((item) => (
          <NavLink key={item.href} label={item.label} href={item.href} />
        ))}
      </nav>

      <nav className="md:hidden flex items-center gap-2 overflow-x-auto pb-1">
        {navItems.slice(0, 3).map((item) => (
          <NavLink key={item.href} label={item.label} href={item.href} />
        ))}
      </nav>
    </>
  );
}

