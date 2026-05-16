import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";
import { loadFont as loadNewsreader } from "@remotion/google-fonts/Newsreader";
import { CONFIG } from "../config";
import type { QuoteScene } from "../types";

const { fontFamily: serifFont } = loadNewsreader("normal", {
  weights: ["500"],
  subsets: ["latin"],
});
loadNewsreader("italic", { weights: ["400"], subsets: ["latin"] });

/**
 * Pull the quoted strings out of script_text. If the script reads
 *   He said the tax "makes no sense" and is "really damaging"
 * we show just the quotation content, not the surrounding narration.
 */
function extractQuote(text: string): string {
  const matches = text.match(/[\u201C\u201D]([^\u201C\u201D]+)[\u201C\u201D]|"([^"]+)"/g);
  if (matches && matches.length > 0) {
    return matches
      .map((m) => m.replace(/^[\u201C\u201D]|[\u201C\u201D]$|^"|"$/g, "").trim())
      .filter(Boolean)
      .join("  \u00b7  ");
  }
  return text;
}

// Dynamic font size based on quote length so short pithy quotes get the big
// treatment and longer ones still fit cleanly.
function quoteFontSize(text: string): number {
  const len = text.length;
  if (len <= 35) return 108;
  if (len <= 70) return 92;
  if (len <= 110) return 76;
  if (len <= 160) return 64;
  return 56;
}

const WORD_STAGGER = 2;       // frames between each word's reveal
const WORD_FADE_FRAMES = 8;   // each word fades in over this many frames
const ATTR_DELAY = 14;        // attribution hairlines start after this many frames

export const QuoteOverlay: React.FC<{ scene: QuoteScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const quote = extractQuote(scene.text);
  const words = React.useMemo(() => quote.split(/\s+/).filter(Boolean), [quote]);
  const fontSize = quoteFontSize(quote);

  // Slow drift on the decorative quote marks for life. Different periods so
  // they don't oscillate in lockstep.
  const driftA = Math.sin(frame * 0.018) * 9;
  const driftB = Math.sin(frame * 0.014 + 1.2) * 7;

  // Animated hairline width — grows from 0 to its final size when attribution
  // appears.
  const hairlineProgress = interpolate(
    frame,
    [ATTR_DELAY + words.length * WORD_STAGGER, ATTR_DELAY + words.length * WORD_STAGGER + 14],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    }
  );
  const hairlineWidth = 90 * hairlineProgress;
  const speakerOpacity = hairlineProgress;

  return (
    <AbsoluteFill
      style={{
        background:
          `radial-gradient(ellipse 70% 60% at 50% 45%, ${CONFIG.colors.dark}f0 0%, ${CONFIG.colors.dark} 55%, #050507 100%)`,
      }}
    >
      {/* Big drifting opening quote mark, upper-left */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 130,
          fontSize: 460,
          color: CONFIG.colors.accent,
          opacity: 0.18,
          fontFamily: serifFont,
          fontWeight: 500,
          lineHeight: 0.78,
          letterSpacing: "-0.05em",
          transform: `translateY(${driftA}px)`,
          userSelect: "none",
        }}
      >
        “
      </div>

      {/* Smaller drifting closing quote mark, lower-right */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 110,
          fontSize: 340,
          color: CONFIG.colors.accent,
          opacity: 0.13,
          fontFamily: serifFont,
          fontWeight: 500,
          lineHeight: 0.78,
          letterSpacing: "-0.05em",
          transform: `translateY(${driftB}px)`,
          userSelect: "none",
        }}
      >
        ”
      </div>

      {/* Vertical gold accent — anchors composition */}
      <div
        style={{
          position: "absolute",
          left: 88,
          top: "20%",
          bottom: "20%",
          width: 2,
          background: CONFIG.colors.accent,
          opacity: 0.45,
        }}
      />

      {/* Main content block */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 220px 0 240px",
          zIndex: 1,
        }}
      >
        {/* Word-by-word revealed quote */}
        <div
          style={{
            fontFamily: serifFont,
            fontSize,
            lineHeight: 1.2,
            color: CONFIG.colors.cream,
            fontWeight: 500,
            letterSpacing: "-0.015em",
            textAlign: "center",
            maxWidth: 1500,
          }}
        >
          {words.map((word, i) => {
            const wordStart = i * WORD_STAGGER;
            const wordOpacity = interpolate(
              frame,
              [wordStart, wordStart + WORD_FADE_FRAMES],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.4, 0, 0.2, 1),
              }
            );
            const wordY = interpolate(
              frame,
              [wordStart, wordStart + WORD_FADE_FRAMES],
              [14, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.4, 0, 0.2, 1),
              }
            );
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  margin: "0 0.18em",
                  opacity: wordOpacity,
                  transform: `translateY(${wordY}px)`,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        {/* Attribution: hairline — italic name — hairline */}
        <div
          style={{
            marginTop: 56,
            display: "flex",
            alignItems: "center",
            gap: 24,
            opacity: speakerOpacity,
          }}
        >
          <div
            style={{
              width: hairlineWidth,
              height: 1.5,
              background: CONFIG.colors.accent,
              opacity: 0.9,
            }}
          />
          <div
            style={{
              fontFamily: serifFont,
              fontSize: 40,
              color: CONFIG.colors.accent,
              fontStyle: "italic",
              fontWeight: 400,
              letterSpacing: "0.01em",
              whiteSpace: "nowrap",
            }}
          >
            {scene.speaker}
          </div>
          <div
            style={{
              width: hairlineWidth,
              height: 1.5,
              background: CONFIG.colors.accent,
              opacity: 0.9,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
