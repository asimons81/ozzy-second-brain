import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Sequence } from "remotion";
import { z } from "zod";

export const horizontalPunchySchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  tag: z.string(),
});

const FloatingParticle: React.FC<{ x: string; y: string; delay: number; color: string }> = ({ x, y, delay, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const move = interpolate(frame - delay, [0, 100], [0, -100], { extrapolateLeft: 'clamp' });
  const opacity = interpolate(frame - delay, [0, 20, 80, 100], [0, 0.6, 0.6, 0], { extrapolateLeft: 'clamp' });

  return (
    <div 
      className="absolute w-4 h-4 rounded-full blur-md"
      style={{ 
        left: x, 
        top: y, 
        backgroundColor: color,
        transform: `translateY(${move}px)`,
        opacity
      }}
    />
  );
};

export const HorizontalPunchy: React.FC<z.infer<typeof horizontalPunchySchema>> = ({
  title,
  subtitle,
  tag,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 }
  });

  const contentOpacity = interpolate(frame, [0, 15], [0, 1]);

  return (
    <AbsoluteFill className="bg-zinc-950 font-sans text-white items-center justify-center p-20">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px]" />
      
      {/* Particles */}
      <FloatingParticle x="10%" y="20%" delay={0} color="#3b82f6" />
      <FloatingParticle x="85%" y="15%" delay={20} color="#8b5cf6" />
      <FloatingParticle x="20%" y="80%" delay={40} color="#ec4899" />
      <FloatingParticle x="75%" y="70%" delay={10} color="#f59e0b" />

      {/* Main Container */}
      <div 
        style={{ opacity: contentOpacity, transform: `translateY(${interpolate(entrance, [0, 1], [50, 0])}px)` }}
        className="relative z-10 w-full max-w-6xl text-left"
      >
        {/* Tag Line */}
        <div 
          style={{ transform: `scale(${spring({ frame: frame - 10, fps })})` }}
          className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 px-6 py-2 rounded-2xl mb-12 backdrop-blur-sm"
        >
          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
          <span className="text-blue-400 font-black uppercase tracking-[0.2em] text-lg">{tag}</span>
        </div>

        {/* Title: Big, Bold, Clean */}
        <h1 className="text-[120px] font-black leading-[0.85] tracking-tighter mb-12 drop-shadow-2xl">
          {title}
        </h1>

        {/* Subtitle: High contrast */}
        <div className="flex items-center space-x-8">
           <div className="h-2 w-32 bg-blue-600 rounded-full" />
           <p className="text-4xl font-bold text-zinc-400 max-w-3xl leading-snug">
             {subtitle}
           </p>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-20 left-20 right-20 flex justify-between items-end">
         <div className="flex items-center space-x-4 opacity-50">
            <div className="w-12 h-px bg-zinc-700" />
            <span className="text-zinc-500 font-mono text-xl tracking-widest uppercase">Content Pipeline v2.1</span>
         </div>

         <div className="flex items-center space-x-4 bg-zinc-900/80 border border-white/5 px-8 py-4 rounded-[32px] backdrop-blur-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-xl">
              🚀
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-tighter mb-0.5">Automated by</p>
              <p className="text-xl font-black text-white italic tracking-widest leading-none">OZZY</p>
            </div>
         </div>
      </div>
    </AbsoluteFill>
  );
};
