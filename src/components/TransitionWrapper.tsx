import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";

// ~0.33s at 30fps. Tasteful editorial pace for a news channel.
// Faster than 8 frames feels snappy/jarring; slower than 14 feels sluggish.
export const TRANSITION_FRAMES = 10;

interface Props {
  fadeOutAtEnd: boolean;
  children: React.ReactNode;
}

/**
 * Universal cross-fade wrapper applied to every non-avatar overlay.
 *
 * Behavior:
 *   - Fade IN: always, frame 0 → TRANSITION_FRAMES, opacity 0 → 1.
 *     · If previous scene was avatar → fades in over the host (avatar reveal)
 *     · If previous scene was another overlay → fades in OVER that overlay
 *       (the outgoing one stays at opacity 1 — no avatar peek-through)
 *
 *   - Fade OUT: only when fadeOutAtEnd is true (i.e. the next scene is an
 *     avatar scene, or this is the final overlay). In that case the host
 *     should be visible after, so a clean fade-out makes sense.
 *
 *   - When the next scene is another overlay, this one stays at opacity 1
 *     until the cut. The next overlay's fade-in (which starts
 *     TRANSITION_FRAMES early via MainComposition) covers it gradually.
 *
 * Easing is a material-style cubic bezier — smooth in/out, no linear ramps.
 */
export const TransitionWrapper: React.FC<Props> = ({ fadeOutAtEnd, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, TRANSITION_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  const fadeOut = fadeOutAtEnd
    ? interpolate(
        frame,
        [durationInFrames - TRANSITION_FRAMES, durationInFrames],
        [1, 0],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }
      )
    : 1;

  const opacity = Math.min(fadeIn, fadeOut);

  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};
