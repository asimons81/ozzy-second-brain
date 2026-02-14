import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { GlobalActions } from '@/components/GlobalActions';
import { TopNav } from '@/components/TopNav';
import { getPaletteItems } from '@/lib/palette';
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
            <div className="space-y-3 min-w-0">
              <div className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">OZZY BRAIN</div>
              <div className="hidden md:block text-sm font-bold text-zinc-300">Capture + Command Palette + Unified Dashboard</div>
              <TopNav />
            </div>
            <GlobalActions
              items={getPaletteItems()}
              captureCategories={captureCategories}
              storageWarning={storage.warningBanner}
              writesAllowed={storage.writesAllowed}
              readOnlyMessage="read-only deployment"
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
