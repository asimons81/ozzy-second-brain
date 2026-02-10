import "./index.css";
import { Composition } from "remotion";
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";
import { DailyAIUpdate, dailyAIUpdateSchema } from "./DailyAIUpdate";
import { ImpressiveUpdate, impressiveUpdateSchema } from "./ImpressiveUpdate";
import { VerticalClicky, verticalClickySchema } from "./VerticalClicky";
import { HorizontalPunchy, horizontalPunchySchema } from "./HorizontalPunchy";
import { ReviewerVerticalV2, reviewerVerticalV2Schema } from "./ReviewerVerticalV2";
import { ReviewerUltra, reviewerUltraSchema } from "./ReviewerUltra";
import { Milestone450, milestone450Schema } from "./Milestone450";
import { FacebookReelWrapper, facebookReelWrapperSchema } from "./FacebookReelWrapper";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="FacebookReelWrapper"
        component={FacebookReelWrapper}
        durationInFrames={300} // Default 10s, can override
        fps={30}
        width={1080}
        height={1920}
        schema={facebookReelWrapperSchema}
        defaultProps={{
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          topText: "TONY REVIEWS",
          bottomText: "FOLLOW FOR MORE"
        }}
      />

      <Composition
        id="ReviewerUltraV2"
        component={ReviewerUltra}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        schema={reviewerUltraSchema}
        defaultProps={{
          title: "SPACEX + XAI MERGER",
          verdict: "The $1TN Innovation Engine",
          rating: "10.0",
          tag: "Industry Shaker",
          accentColor: "#3b82f6"
        }}
      />

      <Composition
        id="Milestone450"
        component={Milestone450}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        schema={milestone450Schema}
        defaultProps={{
          followers: "450",
          message: "Revealing the full AI automated tech stack. No fluff, just raw utility."
        }}
      />

      <Composition
        id="ReviewerUltra"
        component={ReviewerVerticalV2}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        schema={reviewerVerticalV2Schema}
        defaultProps={{
          title: "THE CODEX APP",
          verdict: "Absolute Game Changer",
          rating: "9.8"
        }}
      />

      <Composition
        id="HorizontalPunchy"
        component={HorizontalPunchy}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={horizontalPunchySchema}
        defaultProps={{
          tag: "The Meatspace Layer",
          title: "RENTAHUMAN",
          subtitle: "Because sometimes AI just needs a pair of human hands. 😂",
        }}
      />

      <Composition
        id="VerticalClicky"
        component={VerticalClicky}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        schema={verticalClickySchema}
        defaultProps={{
          tag: "Tech Satire",
          title: "RENTAHUMAN IS THE FUTURE",
          subtitle: "The meatspace layer for AI has arrived. 😂",
        }}
      />

      <Composition
        id="ImpressiveUpdate"
        component={ImpressiveUpdate}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={impressiveUpdateSchema}
        defaultProps={{
          title: "Firefox Adding New Controls to Kill AI Features",
          source: "Hacker News",
          score: 127
        }}
      />

      <Composition
        id="DailyAIUpdate"
        component={DailyAIUpdate}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={dailyAIUpdateSchema}
        defaultProps={{
          title: "Banning lead in gas worked. The proof is in our hair.",
          source: "Hacker News",
        }}
      />

      <Composition
        // You can take the "id" to render a video:
        // npx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        schema={myCompSchema}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />

      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}
      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myCompSchema2}
        defaultProps={{
          logoColor1: "#91dAE2" as const,
          logoColor2: "#86A8E7" as const,
        }}
      />
    </>
  );
};
