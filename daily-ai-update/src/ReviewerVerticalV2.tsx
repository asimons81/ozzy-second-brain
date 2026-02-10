import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Sequence } from "remotion";
import { z } from "zod";

export const reviewerVerticalV2Schema = z.object({
  title: z.string(),
  verdict: z.string(),
  rating: z.string(),
});

const WordReveal: React.FC<{ text: string; index: number }> = ({ text, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const pop = spring({
    frame: frame - (index * 2) - 10,
    fps,
    config: { damping: 12, stiffness: 150 }
  });

  return (
    <span 
      className="inline-block mr-2"
      style={{ 
        transform: `scale(${pop}) translateY(${interpolate(pop, [0, 1], [20, 0])}px)`,
        opacity: pop,
      }}
    >
      {text}
    </span>
  );
};

export const ReviewerVerticalV2: React.FC<z.infer<typeof reviewerVerticalV2Schema>> = ({
  title,
  verdict,
  rating,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 10], [0, 1]);
  
  const verdictEntrance = spring({
    frame: frame - 40,
    fps,
    config: { mass: 0.5, damping: 10 }
  });

  const ratingReveal = spring({
    frame: frame - 60,
    fps,
  });

  return (
    <AbsoluteFill className="bg-[#050505] font-sans text-white flex flex-col p-12 overflow-hidden">
      {/* Background: Very subtle deep blue glow at the top */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-blue-600/10 to-transparent" />
      
      {/* Top Badge */}
      <div className="z-10 mt-12 mb-8 self-start">
        <div className="bg-white text-black px-4 py-1 text-xs font-black uppercase tracking-tighter rounded-sm">
          The Reviewer
        </div>
      </div>

      {/* Title Area */}
      <div className="z-10 flex-grow flex flex-col justify-center">
        <h1 className="text-[110px] font-black leading-[0.82] tracking-tighter uppercase mb-12">
          {title.split(' ').map((word, i) => (
            <WordReveal key={i} text={word} index={i} />
          ))}
        </h1>

        {/* Verdict Line */}
        <Sequence from={40}>
          <div 
            style={{ 
              opacity: verdictEntrance,
              transform: `translateX(${interpolate(verdictEntrance, [0, 1], [-30, 0])}px)`
            }}
            className="flex items-center space-x-4 mb-6"
          >
            <div className="h-1.5 w-12 bg-blue-600 rounded-full" />
            <p className="text-4xl font-bold text-zinc-400 italic leading-none uppercase tracking-tighter">
              Verdict: <span className="text-white not-italic">{verdict}</span>
            </p>
          </div>
        </Sequence>

        {/* Rating Area */}
        <Sequence from={60}>
           <div 
             style={{ opacity: ratingReveal, transform: `scale(${interpolate(ratingReveal, [0, 1], [0.8, 1])})` }}
             className="flex items-baseline space-x-3"
           >
              <span className="text-7xl font-black text-blue-500 italic leading-none">{rating}</span>
              <span className="text-2xl font-bold text-zinc-600 uppercase tracking-widest">/ 10</span>
           </div>
        </Sequence>
      </div>

      {/* Bottom Branding & Version */}
      <div className="z-10 flex items-center justify-between mt-auto mb-12 border-t border-white/5 pt-8">
        <div>
          <p className="text-zinc-700 font-mono text-xs uppercase tracking-[0.3em]">Module_v2.0_Direct</p>
        </div>
        <div className="flex items-center space-x-2 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Powered by</p>
          <span className="text-white font-black italic text-lg tracking-tighter">OZZY</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
