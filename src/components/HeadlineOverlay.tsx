import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";
import { loadFont as loadNewsreader } from "@remotion/google-fonts/Newsreader";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { CONFIG } from "../config";
import type { HeadlineScene } from "../types";

const { fontFamily: serifFont } = loadNewsreader("normal", {
  weights: ["500"],
  subsets: ["latin"],
});
loadNewsreader("italic", { weights: ["400"], subsets: ["latin"] });

const { fontFamily: sansFont } = loadDMSans("normal", {
  weights: ["500", "600"],
  subsets: ["latin"],
});

/**
 * Headline scene: paper-cream editorial card with publication masthead,
 * eyebrow ("Opinion · 2026"), and a big serif headline. Background hard-cuts,
 * text springs upward into place.
 */
export const HeadlineOverlay: React.FC<{ scene: HeadlineScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring entrance — text rises subtly as the card lands.
  const textProgress = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 90, mass: 0.7 },
  });
  const translateY = (1 - textProgress) * 28;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: CONFIG.colors.paper,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "110px 180px",
      }}
    >
      {/* Eyebrow: short rule + section/date label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 28,
          marginBottom: 32,
          opacity: textProgress,
        }}
      >
        <div style={{ height: 2, width: 64, background: "#6b5e3a" }} />
        <div
          style={{
            fontFamily: sansFont,
            fontSize: 26,
            letterSpacing: "0.32em",
            color: "#6b5e3a",
            fontWeight: 500,
            textTransform: "uppercase",
          }}
        >
          Opinion
        </div>
      </div>

      {/* Publication masthead */}
      <div
        style={{
          fontFamily: serifFont,
          fontSize: 56,
          color: "#1f1c14",
          letterSpacing: "-0.01em",
          fontWeight: 500,
          marginBottom: 36,
          lineHeight: 1,
          transform: `translateY(${translateY}px)`,
          opacity: textProgress,
        }}
      >
        {scene.publication}
      </div>

      {/* The headline itself */}
      <div
        style={{
          fontFamily: serifFont,
          fontSize: 108,
          lineHeight: 1.08,
          color: "#14110a",
          fontWeight: 500,
          letterSpacing: "-0.02em",
          transform: `translateY(${translateY * 1.4}px)`,
          opacity: textProgress,
        }}
      >
        {scene.headline_text}
      </div>
    </AbsoluteFill>
  );
};
