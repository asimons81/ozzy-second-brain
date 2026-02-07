import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { CommandPalette } from "@/components/CommandPalette";
import { getAllPaletteItems } from "@/lib/brain";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OZZY COMMAND CENTER",
  description: "Externalized knowledge base and content engine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.className} bg-black text-zinc-100 flex flex-col md:flex-row h-screen overflow-hidden noise`}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto relative z-10 p-4 md:p-0">
          <div className="sticky top-0 z-20 px-4 md:px-12 py-4 md:py-6 bg-black/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
            <div className="hidden md:block">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">OZZY BRAIN</div>
              <div className="text-sm font-bold text-zinc-300">Command Palette + Unified Dashboard</div>
            </div>
            <CommandPalette items={getAllPaletteItems()} />
          </div>
          {children}
        </main>
      </body>
    </html>
  );
}
