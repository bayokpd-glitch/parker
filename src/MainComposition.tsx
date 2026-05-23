import React from "react";
import { AbsoluteFill, Video, Sequence, staticFile, useVideoConfig } from "remotion";
import { ImageOverlay } from "./components/ImageOverlay";
import { QuoteOverlay } from "./components/QuoteOverlay";
import { HeadlineOverlay } from "./components/HeadlineOverlay";
import { StatOverlay } from "./components/StatOverlay";
import { NumberOverlay } from "./components/NumberOverlay";
import { Subtitles } from "./components/Subtitles";
import {
  TransitionWrapper,
  TRANSITION_FRAMES,
} from "./components/TransitionWrapper";
import type {
  Scene,
  ImageScene,
  QuoteScene,
  HeadlineScene,
  StatScene,
  WhisperWord,
  NumberOverlay as NumberOverlayData,
} from "./types";

export interface MainCompositionProps {
  scenes: Scene[];
  words?: WhisperWord[];
}

/**
 * Layer order (bottom → top):
 *   1. Avatar MP4 (continuous, never cut)
 *   2. Overlays (image / quote / headline / stat) with cross-fade transitions
 *      ↳ Image scenes contain their own background-video layer + centered
 *         image card + channel masthead banner. Banner only shows during
 *         image scenes because it lives inside ImageOverlay.
 *   3. Subtitles (word-synced, always visible above overlays)
 *
 * Channel branding lives in src/components/ChannelBanner.tsx — edit
 * CHANNEL_NAME and CHANNEL_TAGLINE there.
 */
export const MainComposition: React.FC<MainCompositionProps> = ({ scenes, words }) => {
  const { fps } = useVideoConfig();
  const numberOverlays = scenes.flatMap((scene, sceneIndex) =>
    (scene.number_overlays ?? []).map((overlay, overlayIndex) => ({
      overlay,
      key: `${sceneIndex}-${overlayIndex}`,
    })),
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Bottom layer: avatar video (never cut, never sliced) */}
      <AbsoluteFill>
        <Video
          src={staticFile("avatar.mp4")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>

      {/* Middle layer: overlays, one Sequence per non-avatar scene */}
      {scenes.map((scene, i) => {
        if (scene.type === "avatar") return null;

        const rawStart = Math.round(scene.start * fps) - TRANSITION_FRAMES;
        const startFrame = Math.max(0, rawStart);

        const nextScene = scenes[i + 1];
        const overlayEndTime = nextScene ? nextScene.start : scene.end;
        const endFrame = Math.round(overlayEndTime * fps);
        const duration = Math.max(1, endFrame - startFrame);

        const fadeOutAtEnd = !nextScene || nextScene.type === "avatar";

        let overlay: React.ReactNode = null;
        if (scene.type === "image") {
          overlay = <ImageOverlay scene={scene as ImageScene} />;
        } else if (scene.type === "quote") {
          overlay = <QuoteOverlay scene={scene as QuoteScene} />;
        } else if (scene.type === "headline") {
          overlay = <HeadlineOverlay scene={scene as HeadlineScene} />;
        } else if (scene.type === "stat") {
          overlay = <StatOverlay scene={scene as StatScene} />;
        }

        return (
          <Sequence key={i} from={startFrame} durationInFrames={duration}>
            <TransitionWrapper fadeOutAtEnd={fadeOutAtEnd}>
              {overlay}
            </TransitionWrapper>
          </Sequence>
        );
      })}

      {/* Upper layer: timed number callouts generated from scene.number_overlays */}
      {numberOverlays.map(({ overlay, key }) => {
        const startFrame = Math.max(0, Math.round(overlay.start * fps));
        const endFrame = Math.round(overlay.end * fps);
        const duration = Math.max(1, endFrame - startFrame);

        return (
          <Sequence key={`number-${key}`} from={startFrame} durationInFrames={duration}>
            <NumberOverlay
              overlay={overlay as NumberOverlayData}
              durationInFrames={duration}
            />
          </Sequence>
        );
      })}

      {/* Top layer: word-synced subtitles */}
      {words && words.length > 0 && <Subtitles words={words} />}
    </AbsoluteFill>
  );
};
