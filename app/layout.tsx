import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

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
            {children}
        </main>
      </body>
    </html>
  );
}
