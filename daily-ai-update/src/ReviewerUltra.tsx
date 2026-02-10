import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Sequence } from "remotion";
import { z } from "zod";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";
import { LucideIcon, Zap, Target, TrendingUp, ShieldAlert } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700"],
});

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const reviewerUltraSchema = z.object({
  title: z.string(),
  verdict: z.string(),
  rating: z.string(),
  tag: z.string(),
  accentColor: z.string().optional(),
});

const GrainOverlay: React.FC = () => (
  <AbsoluteFill className="pointer-events-none opacity-[0.03] grayscale contrast-150 mix-blend-overlay">
    <svg width="100%" height="100%">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  </AbsoluteFill>
);

export const ReviewerUltra: React.FC<z.infer<typeof reviewerUltraSchema>> = ({
  title,
  verdict,
  rating,
  tag,
  accentColor = "#3b82f6",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isVertical = height > width;

  const entrance = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 120 }
  });

  const bgReveal = interpolate(frame, [0, 20], [0, 0.4]);

  return (
    <AbsoluteFill className="bg-[#020202] text-white" style={{ fontFamily }}>
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 transition-opacity"
        style={{ 
          opacity: bgReveal,
          background: `radial-gradient(circle at 20% 30%, ${accentColor}22 0%, transparent 40%),
                      radial-gradient(circle at 80% 70%, #8b5cf622 0%, transparent 40%)`
        }}
      />
      <GrainOverlay />

      <AbsoluteFill className={cn(
        "p-12 md:p-24 flex flex-col justify-center",
        isVertical ? "items-start text-left" : "items-center text-center"
      )}>
        {/* Animated Accent Bar */}
        <div 
          className="h-1 bg-blue-500 rounded-full mb-8 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
          style={{ width: `${interpolate(entrance, [0, 1], [0, isVertical ? 200 : 400])}px` }}
        />

        {/* Tag Badge */}
        <Sequence from={10}>
          <div 
            style={{ 
              opacity: interpolate(frame - 10, [0, 10], [0, 1]),
              transform: `translateY(${interpolate(frame - 10, [0, 10], [10, 0])}px)`
            }}
            className="flex items-center space-x-2 mb-6"
          >
            <TrendingUp size={20} className="text-blue-400" />
            <span className="text-blue-400 font-bold uppercase tracking-[0.3em] text-sm md:text-base">
              {tag}
            </span>
          </div>
        </Sequence>

        {/* Dynamic Title with Auto-Scaling Vibe */}
        <h1 
          className={cn(
            "font-black tracking-tighter uppercase leading-[0.85] mb-12",
            isVertical ? "text-8xl" : "text-[12rem] max-w-6xl"
          )}
          style={{
            transform: `scale(${interpolate(entrance, [0, 1], [0.95, 1])})`,
            opacity: entrance,
            filter: `blur(${interpolate(entrance, [0.8, 1], [10, 0])}px)`
          }}
        >
          {title}
        </h1>

        {/* Verdict and Rating Section */}
        <Sequence from={40}>
          <div className={cn(
            "flex gap-8",
            isVertical ? "flex-col items-start" : "items-center"
          )}>
            {/* Verdict Card */}
            <div 
              style={{ transform: `translateX(${interpolate(frame - 40, [0, 15], [-20, 0])}px)`, opacity: interpolate(frame - 40, [0, 15], [0, 1]) }}
              className="bg-white/5 border border-white/10 backdrop-blur-xl px-8 py-4 rounded-2xl"
            >
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-1">Final Verdict</p>
              <p className="text-2xl md:text-3xl font-bold italic">{verdict}</p>
            </div>

            {/* Rating Ring/Box */}
            <div 
              style={{ transform: `scale(${spring({ frame: frame - 55, fps })})`, opacity: interpolate(frame - 55, [0, 10], [0, 1]) }}
              className="flex items-center space-x-4"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-blue-500 flex items-center justify-center rounded-2xl rotate-3">
                 <span className="text-3xl md:text-4xl font-black italic">{rating}</span>
              </div>
              <p className="text-zinc-600 font-bold uppercase tracking-tighter leading-none">Ozzy<br/>Rating</p>
            </div>
          </div>
        </Sequence>
      </AbsoluteFill>

      {/* Futuristic Bottom Bar */}
      <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center z-20">
        <div className="flex items-center space-x-4 opacity-30">
          <div className="w-8 h-8 rounded-lg bg-zinc-800" />
          <div className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">System Status: Optimized</div>
        </div>
        
        <div className="flex items-center space-x-4">
           <div className="text-right">
             <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Reviewer Engine</p>
             <p className="text-lg font-black text-white italic tracking-tighter leading-none">v4.0_ULTRA</p>
           </div>
           <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-xl">🚀</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
