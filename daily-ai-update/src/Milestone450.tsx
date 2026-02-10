import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Sequence, Easing } from "remotion";
import { z } from "zod";
import { loadFont } from "@remotion/google-fonts/Outfit";
import { Rocket, Trophy, Lock, Unlock, Zap, Target } from "lucide-react";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700", "900"],
});

export const milestone450Schema = z.object({
  followers: z.string(),
  message: z.string(),
});

const GridBackground: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div 
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        transform: `perspective(1000px) rotateX(60deg) translateY(${frame * 2}px)`,
        maskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 80%)'
      }}
    />
  );
};

const GlowCircle: React.FC<{ delay: number; color: string; x: string; y: string }> = ({ delay, color, x, y }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(Math.sin((frame - delay) / 20), [-1, 1], [0.1, 0.4]);
  return (
    <div 
      className="absolute rounded-full blur-[120px]"
      style={{
        left: x,
        top: y,
        width: '400px',
        height: '400px',
        background: color,
        opacity,
        transform: 'translate(-50%, -50%)'
      }}
    />
  );
};

const Confetti: React.FC<{ count: number }> = ({ count }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(count)].map((_, i) => {
        const seed = i * 1.5;
        const x = (seed * 137.5) % 100;
        const delay = (seed * 5) % 30;
        const duration = 60 + (seed % 20);
        
        const drop = interpolate(frame - delay - 70, [0, duration], [-10, height + 100], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        
        const drift = Math.sin((frame + seed) / 10) * 50;
        const rotate = (frame * 5 + seed * 100) % 360;
        const colors = ['#3b82f6', '#06b6d4', '#8b5cf6', '#ffffff', '#fbbf24'];
        const color = colors[i % colors.length];

        if (frame < delay + 70) return null;

        return (
          <div
            key={i}
            className="absolute w-4 h-4 rounded-sm"
            style={{
              left: `${x}%`,
              top: 0,
              backgroundColor: color,
              transform: `translateY(${drop}px) translateX(${drift}px) rotate(${rotate}deg)`,
              opacity: interpolate(frame - delay - 70, [duration - 10, duration], [1, 0], { extrapolateLeft: 'clamp' }),
            }}
          />
        );
      })}
    </div>
  );
};

export const Milestone450: React.FC<z.infer<typeof milestone450Schema>> = ({
  followers,
  message,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { mass: 0.5, damping: 12 }
  });

  const numberSpring = spring({
    frame: frame - 15,
    fps,
    config: { stiffness: 120, damping: 12 }
  });

  const messageReveal = spring({
    frame: frame - 60,
    fps,
    config: { damping: 15 }
  });

  // Split the followers string into individual characters for animation
  const followerChars = followers.split("");

  return (
    <AbsoluteFill className="bg-[#050505] text-white flex flex-col items-center justify-center p-12 overflow-hidden" style={{ fontFamily }}>
      {/* Dynamic Background */}
      <GridBackground />
      <GlowCircle delay={0} color="#3b82f6" x="20%" y="30%" />
      <GlowCircle delay={30} color="#8b5cf6" x="80%" y="70%" />
      <GlowCircle delay={60} color="#06b6d4" x="50%" y="50%" />

      <Confetti count={100} />

      <div className="z-10 text-center flex flex-col items-center max-w-4xl">
        {/* Top Badge: Scanning Line Effect */}
        <div 
          style={{ 
            transform: `translateY(${interpolate(entrance, [0, 1], [-40, 0])}px)`, 
            opacity: entrance 
          }}
          className="relative group mb-8"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex items-center gap-3 bg-black border border-white/10 px-8 py-3 rounded-full overflow-hidden">
            <Target size={20} className="text-blue-400" />
            <span className="text-blue-100 font-bold uppercase tracking-[0.3em] text-sm">
              Level_0450_Reached
            </span>
            {/* Scanning line animation */}
            <div 
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                background: 'linear-gradient(to right, transparent, rgba(59, 130, 246, 0.4), transparent)',
                transform: `translateX(${(frame % 45) * 200 / 45 - 100}%)`
              }}
            />
          </div>
        </div>

        {/* The BIG Number: High Contrast & Glow */}
        <div 
          className="relative flex justify-center items-baseline mb-4"
          style={{
            transform: `scale(${interpolate(numberSpring, [0, 1], [0.8, 1])})`,
            opacity: numberSpring
          }}
        >
          {followerChars.map((char, i) => {
            return (
              <span 
                key={i}
                className="text-[280px] font-[900] leading-none tracking-[-0.05em] bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-600 px-1"
              >
                {char}
              </span>
            );
          })}
        </div>

        {/* Label with Animated Underline */}
        <div 
          style={{ opacity: numberSpring, transform: `translateY(${interpolate(numberSpring, [0, 1], [20, 0])}px)` }}
          className="flex flex-col items-center mb-16"
        >
          <p className="text-5xl font-black uppercase tracking-[0.5em] text-white/40">Followers</p>
          <div 
            className="h-1 bg-blue-500 mt-4 rounded-full"
            style={{ width: `${interpolate(numberSpring, [0, 1], [0, 100])}%` }}
          />
        </div>

      </div>

      {/* Footer System Info */}
      <div className="absolute bottom-12 flex flex-col items-center space-y-3 opacity-30 font-mono">
         <div className="flex gap-8 text-[10px] tracking-[0.3em] text-zinc-400 uppercase">
           <span>Sys: OS_OZZY_V2</span>
           <span>Loc: AMES_IOWA_SERVER</span>
           <span>Auth: ADMIN_TONY</span>
         </div>
         <div className="h-[2px] w-64 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
      </div>

      {/* Edge Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]" />
    </AbsoluteFill>
  );
};
