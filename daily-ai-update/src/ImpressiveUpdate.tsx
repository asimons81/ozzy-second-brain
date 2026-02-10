import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Sequence } from "remotion";
import { z } from "zod";

export const impressiveUpdateSchema = z.object({
  title: z.string(),
  source: z.string(),
  score: z.number(),
});

const TitleWord: React.FC<{ word: string; index: number }> = ({ word, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const opacity = spring({
    frame: frame - (index * 3),
    fps,
    config: { damping: 20 }
  });

  const translate = interpolate(opacity, [0, 1], [20, 0]);

  return (
    <span 
      className="inline-block" 
      style={{ 
        opacity, 
        transform: `translateY(${translate}px)`,
        marginRight: '0.25em'
      }}
    >
      {word}
    </span>
  );
};

export const ImpressiveUpdate: React.FC<z.infer<typeof impressiveUpdateSchema>> = ({
  title,
  source,
  score,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Background animation: slow shifting gradient
  const bgPos = interpolate(frame, [0, 150], [0, 100]);

  const cardEntrance = spring({
    frame,
    fps,
    config: { mass: 0.5, tension: 120, damping: 14 }
  });

  const badgeEntrance = spring({
    frame: frame - 45,
    fps,
  });

  return (
    <AbsoluteFill className="bg-black font-sans text-white items-center justify-center">
      {/* Animated Mesh Gradient Background */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(circle at ${bgPos}% 50%, #2563eb 0%, transparent 50%), 
                      radial-gradient(circle at ${100 - bgPos}% 20%, #7c3aed 0%, transparent 50%)`,
          filter: 'blur(80px)'
        }}
      />

      {/* Main Content Card */}
      <div 
        style={{
          transform: `scale(${cardEntrance}) translateZ(0)`,
          opacity: interpolate(frame, [0, 10], [0, 1]),
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
        className="relative w-[1200px] bg-zinc-900/60 backdrop-blur-2xl border border-white/10 rounded-[48px] p-24 overflow-hidden"
      >
        {/* Top Section: Metadata */}
        <div className="flex items-center justify-between mb-12">
          <div 
            style={{ transform: `translateX(${interpolate(badgeEntrance, [0, 1], [-20, 0])}px)`, opacity: badgeEntrance }}
            className="flex items-center space-x-3 bg-blue-500/20 border border-blue-500/30 px-6 py-2 rounded-full"
          >
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-blue-400 font-bold uppercase tracking-widest text-sm">Trending Now</span>
          </div>
          
          <div className="text-zinc-500 font-mono text-xl">
             HN Score: <span className="text-zinc-300 font-bold">{score}</span>
          </div>
        </div>

        {/* Title Section */}
        <h1 className="text-8xl font-black tracking-tight leading-[0.95] mb-12">
          {title.split(' ').map((word, i) => (
            <TitleWord key={i} word={word} index={i} />
          ))}
        </h1>

        {/* Source Footer */}
        <div 
          style={{ opacity: interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: 'clamp' }) }}
          className="flex items-center space-x-4 pt-12 border-t border-white/5"
        >
          <p className="text-2xl text-zinc-400">
            via <span className="text-zinc-100 font-semibold underline decoration-blue-500/50 underline-offset-8">{source}</span>
          </p>
        </div>
      </div>

      {/* Persistent Ozzy Branding */}
      <div className="absolute bottom-16 right-16 flex items-center space-x-6">
         <div className="h-px w-24 bg-zinc-800" />
         <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-2xl">
              🚀
            </div>
            <div className="leading-none">
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-tighter mb-1">Intelligence by</p>
              <p className="text-white text-2xl font-black tracking-tighter italic">OZZY</p>
            </div>
         </div>
      </div>
    </AbsoluteFill>
  );
};
