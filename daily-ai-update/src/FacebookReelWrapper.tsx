import { AbsoluteFill, OffthreadVideo, useVideoConfig } from "remotion";
import { z } from "zod";
import { loadFont } from "@remotion/google-fonts/Outfit";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700", "900"],
});

export const facebookReelWrapperSchema = z.object({
  videoUrl: z.string(),
  topText: z.string(),
  bottomText: z.string(),
});

export const FacebookReelWrapper: React.FC<z.infer<typeof facebookReelWrapperSchema>> = ({
  videoUrl,
  topText,
  bottomText,
}) => {
  const { width, height } = useVideoConfig();

  // Calculate safe zones and scaling
  // We want to scale the video down slightly to ensure the watermark (usually at edges)
  // is either cut off (if we crop) or covered (if we letterbox).
  // Strategy: Letterbox with Brand Bars.
  
  const scale = 0.85; // Scale video to 85%
  
  return (
    <AbsoluteFill className="bg-black flex flex-col items-center justify-center" style={{ fontFamily }}>
      
      {/* Background Gradient/Texture */}
      <div className="absolute inset-0 bg-zinc-900 opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-black to-black opacity-80" />

      {/* The Video Container */}
      <div 
        className="relative shadow-2xl overflow-hidden rounded-lg border border-zinc-800"
        style={{
          width: width * scale,
          height: height * scale,
        }}
      >
        <OffthreadVideo 
          src={videoUrl}
          className="object-cover w-full h-full"
        />
        
        {/* Optional: Add a subtle vignette over the video edges to further obscure corners */}
        <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] pointer-events-none" />
      </div>

      {/* Top Brand Bar */}
      <div className="absolute top-12 w-full text-center">
        <h1 className="text-4xl font-black text-white uppercase tracking-widest drop-shadow-lg">
          {topText}
        </h1>
        <div className="w-24 h-1 bg-blue-500 mx-auto mt-2 rounded-full" />
      </div>

      {/* Bottom CTA Bar */}
      <div className="absolute bottom-16 w-full text-center">
        <p className="text-2xl font-bold text-zinc-400 uppercase tracking-widest mb-2">
          {bottomText}
        </p>
        <div className="flex justify-center gap-2 items-center text-zinc-500 text-sm font-mono">
           <span>•</span>
           <span>TONY REVIEWS THINGS</span>
           <span>•</span>
        </div>
      </div>

    </AbsoluteFill>
  );
};
