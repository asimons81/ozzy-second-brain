import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { z } from "zod";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700", "900"],
});

export const dailyAINewsVerticalSchema = z.object({
  headline: z.string(),
  category: z.string(),
  date: z.string(),
});

const GrainOverlay: React.FC = () => (
  <AbsoluteFill className="pointer-events-none opacity-[0.05] grayscale contrast-150 mix-blend-overlay">
    <svg width="100%" height="100%">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  </AbsoluteFill>
);

export const DailyAINewsVertical: React.FC<z.infer<typeof dailyAINewsVerticalSchema>> = ({
  headline,
  category,
  date,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: {
      damping: 12,
      stiffness: 100,
    },
  });

  const headlineOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateRight: "clamp",
  });

  const footerY = interpolate(frame, [20, 40], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="bg-[#050505] text-white overflow-hidden" style={{ fontFamily }}>
      <GrainOverlay />
      
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[60%] bg-blue-600/20 blur-[120px] rounded-full" />
      
      <div className="flex flex-col h-full p-12 justify-between relative z-10">
        {/* Top Header */}
        <div style={{ opacity: entrance }}>
          <div className="inline-block px-4 py-1.5 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-sm mb-4">
            {category}
          </div>
          <div className="text-zinc-500 font-bold tracking-tighter text-sm uppercase">
            {date}
          </div>
        </div>

        {/* Main Content */}
        <div 
          className="flex flex-col"
          style={{ 
            opacity: headlineOpacity,
            transform: `translateY(${interpolate(frame, [10, 30], [20, 0], { extrapolateRight: "clamp" })}px)`
          }}
        >
          <h1 className="text-[120px] font-black leading-[0.85] tracking-[-0.05em] uppercase break-words">
            {headline}
          </h1>
          <div className="h-2 w-24 bg-blue-600 mt-8" />
        </div>

        {/* Footer */}
        <div 
          className="flex items-center justify-between"
          style={{ transform: `translateY(${footerY}px)`, opacity: interpolate(frame, [20, 40], [0, 1]) }}
        >
          <div className="flex flex-col">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Powered by</span>
            <span className="text-xl font-black italic tracking-tighter">OZZY INTELLIGENCE</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
            🤖
          </div>
        </div>
      </div>

      {/* Side Decorative Bar */}
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 via-transparent to-zinc-800 opacity-30" />
    </AbsoluteFill>
  );
};
