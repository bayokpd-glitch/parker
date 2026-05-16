import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { loadFont as loadNewsreader } from "@remotion/google-fonts/Newsreader";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { CONFIG } from "../config";
import type { StatScene } from "../types";

const { fontFamily: serifFont } = loadNewsreader("normal", {
  weights: ["500"],
  subsets: ["latin"],
});
loadNewsreader("italic", { weights: ["400"], subsets: ["latin"] });

const { fontFamily: sansFont } = loadDMSans("normal", {
  weights: ["500", "600"],
  subsets: ["latin"],
});

const COUNT_UP_FRAMES = 36; // ~1.2s at 30fps

/**
 * Parse a stat_value string like "$237 billion" / "75%" / "1.5 million" / "$11.3B"
 * into a prefix, a numeric part (that will animate from 0 → target), and a suffix.
 * Falls back to a static label if no number is detected.
 */
function parseStatValue(value: string): {
  prefix: string;
  number: number;
  decimals: number;
  suffix: string;
  hasNumber: boolean;
} {
  const match = value.match(/^([^\d-]*)(-?[\d,]+(?:\.\d+)?)(.*)$/);
  if (!match) {
    return { prefix: "", number: 0, decimals: 0, suffix: value, hasNumber: false };
  }
  const [, prefix, numStr, suffix] = match;
  const cleanNum = numStr.replace(/,/g, "");
  const number = parseFloat(cleanNum);
  const decimals = cleanNum.includes(".")
    ? Math.min(2, cleanNum.split(".")[1].length)
    : 0;
  if (Number.isNaN(number)) {
    return { prefix: "", number: 0, decimals: 0, suffix: value, hasNumber: false };
  }
  return { prefix, number, decimals, suffix, hasNumber: true };
}

function formatNumber(n: number, decimals: number): string {
  if (decimals > 0) return n.toFixed(decimals);
  return Math.round(n).toLocaleString("en-US");
}

export const StatOverlay: React.FC<{ scene: StatScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { prefix, number: targetNumber, decimals, suffix, hasNumber } =
    parseStatValue(scene.stat_value);

  // Count up over COUNT_UP_FRAMES with cubic ease-out so the last digits land slow.
  const countProgress = interpolate(frame, [0, COUNT_UP_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (x) => 1 - Math.pow(1 - x, 3),
  });
  const currentNumber = targetNumber * countProgress;

  // Text entrance spring
  const textProgress = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 90, mass: 0.7 },
  });
  const translateY = (1 - textProgress) * 24;

  const displayValue = hasNumber
    ? `${prefix}${formatNumber(currentNumber, decimals)}${suffix}`
    : scene.stat_value;

  // Highlight any trailing letters (e.g. "B" in "$237B" or " billion") in accent gold.
  // Split at the first non-numeric, non-space character that follows the number.
  const accentMatch = suffix.match(/^(\s*)(.*)$/);
  const suffixLeading = accentMatch ? accentMatch[1] : "";
  const suffixTail = accentMatch ? accentMatch[2] : "";

  return (
    <AbsoluteFill
      style={{
        backgroundColor: CONFIG.colors.dark,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 100px",
      }}
    >
      {/* Eyebrow: the metric label */}
      <div
        style={{
          fontFamily: sansFont,
          fontSize: 24,
          letterSpacing: "0.32em",
          color: CONFIG.colors.accent,
          fontWeight: 500,
          textTransform: "uppercase",
          marginBottom: 44,
          textAlign: "center",
          opacity: textProgress,
          transform: `translateY(${translateY}px)`,
          maxWidth: 1200,
          lineHeight: 1.3,
        }}
      >
        {scene.stat_label}
      </div>

      {/* The big number itself */}
      <div
        style={{
          fontFamily: serifFont,
          fontSize: 280,
          color: CONFIG.colors.cream,
          fontWeight: 500,
          letterSpacing: "-0.04em",
          lineHeight: 0.95,
          textAlign: "center",
          opacity: textProgress,
          // Tabular figures keep digits the same width as the number changes
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {hasNumber ? (
          <>
            {prefix}
            {formatNumber(currentNumber, decimals)}
            {suffixLeading}
            <span style={{ color: CONFIG.colors.accent }}>{suffixTail}</span>
          </>
        ) : (
          displayValue
        )}
      </div>

      {/* Decorative hairline beneath the number */}
      <div
        style={{
          width: 80,
          height: 2,
          background: CONFIG.colors.accent,
          marginTop: 48,
          opacity: 0.9 * textProgress,
        }}
      />
    </AbsoluteFill>
  );
};
