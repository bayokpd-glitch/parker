import React from "react";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  staticFile,
  delayRender,
  continueRender,
} from "remotion";
import { ChannelBanner } from "./ChannelBanner";
import { CONFIG } from "../config";
import type { ImageScene } from "../types";

// Slight rounded corners + soft shadow on the news image card.
// Set RADIUS to 0 for hard corners. (Cosmetic — not in the GUI.)
const IMAGE_RADIUS = 10;

/**
 * Image scenes: background video fills the frame, news image floats
 * centered at CONFIG.imageScale on top. Channel masthead banner overlays
 * the top-left. Avatar layer is hidden while this overlay is active.
 *
 * All branding / sizing knobs come from src/config.ts. Edit via
 * config_gui.py.
 *
 * If the news-image file has been deleted from public/images/, the whole
 * overlay returns null → the avatar shows through.
 */
export const ImageOverlay: React.FC<{ scene: ImageScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const [exists, setExists] = React.useState<boolean | null>(null);
  const [handle] = React.useState(() => delayRender(`image-check:${scene.image}`));

  React.useEffect(() => {
    const probe = new window.Image();
    probe.onload = () => {
      setExists(true);
      continueRender(handle);
    };
    probe.onerror = () => {
      setExists(false);
      continueRender(handle);
    };
    probe.src = staticFile(`images/${scene.image}`);
  }, [scene.image, handle]);

  if (exists !== true) return null;

  const kenBurnsScale = interpolate(
    frame,
    [0, durationInFrames],
    [1.0, 1.06],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const imageEl = (
    <Img
      src={staticFile(`images/${scene.image}`)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: `scale(${kenBurnsScale})`,
        transformOrigin: "center center",
      }}
    />
  );

  // No background video → image fills the frame (old layout, no banner).
  if (!CONFIG.useBackgroundVideo) {
    return (
      <AbsoluteFill style={{ backgroundColor: "#000" }}>{imageEl}</AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Background video — full frame, looping, muted */}
      <AbsoluteFill>
        <OffthreadVideo
          src={staticFile(CONFIG.backgroundVideo)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          muted
          loop
        />
      </AbsoluteFill>

      {/* News image — centered at CONFIG.imageScale of frame size */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: `${CONFIG.imageScale * 100}%`,
            height: `${CONFIG.imageScale * 100}%`,
            overflow: "hidden",
            borderRadius: IMAGE_RADIUS,
            boxShadow: `0 40px 100px rgba(0, 0, 0, 0.55), 0 0 0 1px ${CONFIG.colors.accent}30`,
          }}
        >
          {imageEl}
        </div>
      </AbsoluteFill>

      {/* Channel masthead — top-left, only during image scenes */}
      <ChannelBanner />
    </AbsoluteFill>
  );
};
