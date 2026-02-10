import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { z } from "zod";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700"],
});

export const dailyAIUpdateSchema = z.object({
  title: z.string(),
  source: z.string(),
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

export const DailyAIUpdate: React.FC<z.infer<typeof dailyAIUpdateSchema>> = ({
  title,
  source,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: {
      damping: 12,
    },
  });

  const textOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="bg-[#0a0a0a] items-center justify-center text-white" style={{ fontFamily }}>
      <GrainOverlay />
      <div
        style={{
          transform: `scale(${entrance})`,
          opacity: textOpacity,
        }}
        className="max-w-4xl p-12 text-center"
      >
        <div className="mb-4 inline-block rounded-full bg-blue-600 px-4 py-1 text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]">
          AI Trend Alert
        </div>
        <h1 className="text-7xl font-black leading-tight tracking-tighter">
          {title}
        </h1>
        <div className="mt-8 flex items-center justify-center space-x-4 opacity-50">
          <div className="h-px w-12 bg-zinc-700" />
          <p className="text-xl font-medium text-zinc-400">
            Source: <span className="text-zinc-200">{source}</span>
          </p>
          <div className="h-px w-12 bg-zinc-700" />
        </div>
      </div>
      
      <div className="absolute bottom-12 right-12 flex items-center space-x-3 opacity-60">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-xl shadow-xl">
          🚀
        </div>
        <p className="text-lg font-bold tracking-tight text-white italic">
          OZZY INTELLIGENCE
        </p>
      </div>
    </AbsoluteFill>
  );
};
