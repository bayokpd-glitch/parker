import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { loadFont as loadNewsreader } from "@remotion/google-fonts/Newsreader";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { CONFIG } from "../config";

const { fontFamily: serifFont } = loadNewsreader("normal", {
  weights: ["500"],
  subsets: ["latin"],
});
loadNewsreader("italic", { weights: ["400"], subsets: ["latin"] });

const { fontFamily: sansFont } = loadDMSans("normal", {
  weights: ["500", "600"],
  subsets: ["latin"],
});

// Slide-in duration: ~0.47s at 30fps. Long enough to feel deliberate,
// short enough that it lands well before the scene's content lock-in.
const SLIDE_FRAMES = 14;
// Subtle pre-roll fade so the card doesn't appear as a hard edge at frame 0.
const FADE_FRAMES = 5;
// How far off-screen the card starts. 800px is comfortably more than any
// reasonable channel-name width, so the card is fully hidden at frame 0
// regardless of how long the name string is.
const OFF_SCREEN_PX = 800;

/**
 * Sliding-card channel banner. Lives inside ImageOverlay (top-layer above
 * the image card), so it's only visible during image scenes and inherits
 * the scene's cross-fade transition via TransitionWrapper.
 *
 * Design:
 *   - Solid dark card (CONFIG.colors.dark)
 *   - 4px gold left edge (CONFIG.colors.accent) for brand structure
 *   - Channel name in serif, cream-colored
 *   - Short gold hairline rule
 *   - Tracked uppercase tagline in gold (optional — empty string hides it)
 *
 * Animation:
 *   - Slides from -OFF_SCREEN_PX → 0 over SLIDE_FRAMES
 *   - Strong ease-out cubic so it decelerates into resting position
 *   - Pre-roll opacity 0 → 1 over FADE_FRAMES so the edge doesn't pop in
 *
 * Branding (name, tagline) and colors come from src/config.ts.
 * Edit via config_gui.py or directly.
 */
export const ChannelBanner: React.FC = () => {
  const frame = useCurrentFrame();

  const slideProgress = interpolate(frame, [0, SLIDE_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const translateX = (1 - slideProgress) * -OFF_SCREEN_PX;

  const opacity = interpolate(frame, [0, FADE_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 64,
        left: 80,
        background: CONFIG.colors.dark,
        borderLeft: `4px solid ${CONFIG.colors.accent}`,
        padding: "26px 36px 24px 36px",
        boxShadow:
          "0 10px 28px rgba(0, 0, 0, 0.5), 0 2px 6px rgba(0, 0, 0, 0.35)",
        transform: `translateX(${translateX}px)`,
        opacity,
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      {/* Channel name */}
      <div
        style={{
          fontFamily: serifFont,
          fontSize: 36,
          fontWeight: 500,
          color: CONFIG.colors.cream,
          letterSpacing: "-0.005em",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        {CONFIG.channelName}
      </div>

      {/* Hairline rule */}
      <div
        style={{
          height: 1.5,
          width: 36,
          background: CONFIG.colors.accent,
          opacity: 0.55,
          marginTop: 14,
          marginBottom: 12,
        }}
      />

      {/* Tagline (optional — empty string hides) */}
      {CONFIG.channelTagline && (
        <div
          style={{
            fontFamily: sansFont,
            fontSize: 14,
            fontWeight: 600,
            color: CONFIG.colors.accent,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {CONFIG.channelTagline}
        </div>
      )}
    </div>
  );
};
