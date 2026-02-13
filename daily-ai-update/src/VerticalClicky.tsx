import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Sequence } from "remotion";
import { z } from "zod";

export const verticalClickySchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  tag: z.string(),
});

const PopText: React.FC<{ text: string; delay: number; className?: string }> = ({ text, delay, className }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const pop = spring({
    frame: frame - delay,
    fps,
    config: { mass: 0.8, tension: 200, damping: 10 }
  });

  return (
    <div 
      className={className}
      style={{ 
        transform: `scale(${pop})`,
        opacity: pop,
      }}
    >
      {text}
    </div>
  );
};

export const VerticalClicky: React.FC<z.infer<typeof verticalClickySchema>> = ({
  title,
  subtitle,
  tag,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Background: rapid color cycle or vibrant gradient
  const bgHue = interpolate(frame, [0, 150], [200, 400]);
  const bgColor = `hsl(${bgHue}, 80%, 10%)`;

  const barWidth = spring({
    frame: frame - 10,
    fps,
    config: { tension: 150 }
  });

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor }} className="font-sans text-white overflow-hidden p-12 flex flex-col items-center justify-center">
      {/* Animated geometric shapes */}
      <div 
        className="absolute top-[-10%] right-[-20%] w-[500px] h-[500px] rounded-full blur-3xl opacity-30"
        style={{ backgroundColor: '#ff007f' }}
      />
      <div 
        className="absolute bottom-[-10%] left-[-20%] w-[500px] h-[500px] rounded-full blur-3xl opacity-30"
        style={{ backgroundColor: '#00d4ff' }}
      />

      <div className="relative z-10 w-full flex flex-col items-center text-center">
        {/* Tag Pop */}
        <Sequence from={5}>
          <div 
            className="mb-8 bg-yellow-400 text-black font-black px-6 py-2 rounded-lg text-3xl uppercase tracking-tighter"
            style={{ transform: `rotate(${interpolate(frame, [5, 15], [10, -5], { extrapolateRight: 'clamp' })}deg)` }}
          >
            {tag}
          </div>
        </Sequence>

        {/* Main Title - Split into words for extra "clickiness" */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-12 px-4">
           {title.split(' ').map((word, i) => (
             <PopText 
               key={i} 
               text={word} 
               delay={20 + i * 4} 
               className="text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400"
             />
           ))}
        </div>

        {/* Subtitle / Punchline */}
        <Sequence from={60}>
           <div 
             className="text-4xl font-bold text-zinc-300 max-w-sm leading-tight"
             style={{ 
               transform: `translateY(${interpolate(frame, [60, 75], [50, 0], { extrapolateRight: 'clamp' })}px)`,
               opacity: interpolate(frame, [60, 75], [0, 1])
             }}
           >
             {subtitle}
           </div>
        </Sequence>

        {/* Dynamic Bar */}
        <div 
          className="mt-12 h-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full"
          style={{ width: `${barWidth * 80}%` }}
        />
      </div>

      {/* Floating Elements (Clicky feedback) */}
      {[...Array(5)].map((_, i) => {
        const startFrame = 30 + i * 15;
        return (
          <Sequence from={startFrame} durationInFrames={30} key={i}>
             <div 
               className="absolute text-6xl"
               style={{ 
                 top: `${20 + (i * 15)}%`, 
                 left: i % 2 === 0 ? '10%' : '80%',
                 transform: `scale(${interpolate(frame - startFrame, [0, 10, 30], [0, 1.5, 0])}) rotate(${i * 45}deg)`,
                 opacity: interpolate(frame - startFrame, [0, 10, 30], [0, 1, 0])
               }}
             >
               {['⚡️', '🔥', '🚀', '👀', '✨'][i % 5]}
             </div>
          </Sequence>
        );
      })}

      {/* Bottom Branding */}
      <div className="absolute bottom-20 w-full flex justify-center">
         <div className="bg-white/10 backdrop-blur-xl px-8 py-4 rounded-full border border-white/20 flex items-center space-x-3">
            <span className="text-zinc-400 text-xl">Powered by</span>
            <span className="text-2xl font-black tracking-widest italic text-white">OZZY</span>
         </div>
      </div>
    </AbsoluteFill>
  );
};
