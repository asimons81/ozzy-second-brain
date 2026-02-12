import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { GlobalActions } from '@/components/GlobalActions';
import { getAllPaletteItems } from '@/lib/brain';
import { categories } from '@/lib/categories';
import { getStorageRuntimeInfo } from '@/lib/storage';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OZZY COMMAND CENTER',
  description: 'Externalized knowledge base and content engine.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const storage = getStorageRuntimeInfo();
  const captureCategories = categories.map((category) => ({
    key: category.key,
    title: category.title,
    defaultTemplate: category.defaultTemplate,
  }));

  return (
    <html lang="en">
      <body className={`${spaceGrotesk.className} bg-black text-zinc-100 flex flex-col md:flex-row h-screen overflow-hidden noise`}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto relative z-10 p-4 md:p-0">
          <div className="sticky top-0 z-20 px-4 md:px-12 py-4 md:py-6 bg-black/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between gap-4">
            <div className="hidden md:block space-y-3">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">OZZY BRAIN</div>
              <div className="text-sm font-bold text-zinc-300">Capture + Command Palette + Unified Dashboard</div>
              <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <Link href="/" className="px-2 py-1 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300">Now</Link>
                <Link href="/activity" className="px-2 py-1 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300">Activity</Link>
                <Link href="/queue" className="px-2 py-1 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300">Queue</Link>
                <Link href="/docs/ideas" className="px-2 py-1 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300">Docs</Link>
                <Link href="/docs/ideas" className="px-2 py-1 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300">Ideas</Link>
                <Link href="/renders" className="px-2 py-1 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300">Renders</Link>
              </nav>
            </div>
            <GlobalActions
              items={getAllPaletteItems()}
              captureCategories={captureCategories}
              storageWarning={storage.warningBanner}
            />
          </div>
          {storage.warningBanner && (
            <div className="px-4 md:px-12 py-3 border-b border-yellow-500/20 bg-yellow-500/10 text-yellow-100 text-sm font-medium">
              {storage.warningBanner}
            </div>
          )}
          {children}
        </main>
      </body>
    </html>
  );
}
