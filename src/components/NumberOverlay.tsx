import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { loadFont as loadNewsreader } from "@remotion/google-fonts/Newsreader";
import { CONFIG } from "../config";
import type { NumberOverlay as NumberOverlayData } from "../types";

const { fontFamily: sansFont } = loadDMSans("normal", {
  weights: ["500", "700", "800"],
  subsets: ["latin"],
});

const { fontFamily: serifFont } = loadNewsreader("normal", {
  weights: ["700"],
  subsets: ["latin"],
});

function parseNumberValue(value: string): {
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

  const [, prefix, numberText, suffix] = match;
  const cleanNumber = numberText.replace(/,/g, "");
  const number = Number.parseFloat(cleanNumber);
  if (!Number.isFinite(number)) {
    return { prefix: "", number: 0, decimals: 0, suffix: value, hasNumber: false };
  }

  return {
    prefix,
    number,
    decimals: cleanNumber.includes(".") ? Math.min(2, cleanNumber.split(".")[1].length) : 0,
    suffix,
    hasNumber: true,
  };
}

function formatNumber(value: number, decimals: number): string {
  if (decimals > 0) return value.toFixed(decimals);
  return Math.round(value).toLocaleString("en-US");
}

function valueFontSize(value: string): number {
  if (value.length <= 5) return 108;
  if (value.length <= 9) return 98;
  if (value.length <= 13) return 84;
  if (value.length <= 18) return 64;
  if (value.length <= 24) return 54;
  return 46;
}

function cleanLabel(label: string): string {
  return label
    .replace(/\uFFFD/g, "")
    .replace(/\s*[–—-]\s*$/, "")
    .trim();
}

const DATE_RE =
  /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,\s*(\d{4}))?$/i;

function parseDateValue(value: string):
  | {
      month: string;
      day: string;
      year?: string;
    }
  | null {
  const match = value.match(DATE_RE);
  if (!match) return null;
  return {
    month: match[1].slice(0, 3).toUpperCase(),
    day: match[2],
    year: match[3],
  };
}

export const NumberOverlay: React.FC<{
  overlay: NumberOverlayData;
  durationInFrames: number;
}> = ({
  overlay,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const parsed = React.useMemo(() => parseNumberValue(overlay.value), [overlay.value]);
  const enter = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 145, mass: 0.72 },
  });

  const exitStart = Math.max(8, durationInFrames - Math.round(fps * 0.38));
  const exit = interpolate(frame, [exitStart, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const countProgress = interpolate(frame, [0, Math.min(32, durationInFrames)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (x) => 1 - Math.pow(1 - x, 3),
  });

  const opacity = interpolate(enter, [0, 0.2, 1], [0, 1, 1]) * (1 - exit);
  const translateX = interpolate(enter, [0, 1], [-120, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(enter, [0, 0.72, 1], [0.84, 1.08, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitY = interpolate(exit, [0, 1], [0, 34]);
  const blur = interpolate(exit, [0, 1], [0, 8]);
  const pulse = interpolate(frame % 54, [0, 18, 54], [0.84, 1, 0.84], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const currentNumber = parsed.number * countProgress;
  const displayValue = parsed.hasNumber
    ? `${parsed.prefix}${formatNumber(currentNumber, parsed.decimals)}${parsed.suffix}`
    : overlay.value;
  const displayLabel = cleanLabel(overlay.label);
  const fontSize = valueFontSize(displayValue);
  const isLongValue = displayValue.length > 13;
  const dateValue = parseDateValue(overlay.value);

  const isRight = overlay.position === "right_center";
  const isCenter = overlay.position === "center";

  if (dateValue) {
    return (
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            left: isCenter ? "50%" : isRight ? "auto" : 104,
            right: isRight ? 104 : "auto",
            top: "45%",
            transform: `translate(${isCenter ? "-50%" : "0"}, -50%) translate(${translateX}px, ${exitY}px) scale(${scale})`,
            opacity,
            filter: `blur(${blur}px)`,
            width: 620,
            maxWidth: "calc(100% - 208px)",
          }}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              overflow: "hidden",
              borderRadius: 6,
              background:
                "linear-gradient(135deg, rgba(7, 12, 22, 0.94), rgba(19, 26, 38, 0.86))",
              boxShadow:
                "0 24px 74px rgba(0, 0, 0, 0.46), 0 0 0 1px rgba(255, 255, 255, 0.16)",
            }}
          >
            <div
              style={{
                width: 156,
                flexShrink: 0,
                background: `linear-gradient(180deg, ${CONFIG.colors.accent}, #9d1019)`,
                color: CONFIG.colors.cream,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "22px 12px",
              }}
            >
              <div
                style={{
                  fontFamily: sansFont,
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: "0.18em",
                  lineHeight: 1,
                }}
              >
                {dateValue.month}
              </div>
              <div
                style={{
                  fontFamily: serifFont,
                  fontSize: 78,
                  fontWeight: 700,
                  lineHeight: 0.96,
                  marginTop: 8,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {dateValue.day}
              </div>
              {dateValue.year && (
                <div
                  style={{
                    fontFamily: sansFont,
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    marginTop: 5,
                  }}
                >
                  {dateValue.year}
                </div>
              )}
            </div>

            <div
              style={{
                flex: 1,
                minWidth: 0,
                padding: "25px 30px 27px",
                borderTop: "1px solid rgba(255, 255, 255, 0.12)",
              }}
            >
              <div
                style={{
                  fontFamily: sansFont,
                  color: "#43ddff",
                  fontSize: 20,
                  fontWeight: 800,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Dateline
              </div>
              <div
                style={{
                  fontFamily: sansFont,
                  color: CONFIG.colors.cream,
                  fontSize: displayLabel.length > 58 ? 24 : 28,
                  fontWeight: 700,
                  lineHeight: 1.14,
                  maxWidth: 380,
                }}
              >
                {displayLabel || "Key date in the story"}
              </div>
              <div
                style={{
                  width: 82,
                  height: 3,
                  background: "#43ddff",
                  marginTop: 18,
                  opacity: 0.85,
                }}
              />
            </div>
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: isCenter ? "50%" : isRight ? "auto" : 104,
          right: isRight ? 104 : "auto",
          top: "47%",
          transform: `translate(${isCenter ? "-50%" : "0"}, -50%) translate(${translateX}px, ${exitY}px) scale(${scale})`,
          opacity,
          filter: `blur(${blur}px)`,
          width: 680,
          maxWidth: "calc(100% - 208px)",
        }}
      >
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderLeft: `8px solid ${CONFIG.colors.accent}`,
            borderRadius: 8,
            padding: "26px 36px 30px",
            background:
              "linear-gradient(135deg, rgba(5, 8, 14, 0.92), rgba(14, 18, 28, 0.76))",
            boxShadow:
              "0 26px 80px rgba(0, 0, 0, 0.48), 0 0 0 1px rgba(255, 255, 255, 0.14)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(100deg, transparent 0%, rgba(67, 221, 255, 0.18) 42%, transparent 64%)",
              transform: `translateX(${interpolate(frame, [0, 34], [-620, 620], {
                extrapolateRight: "clamp",
              })}px)`,
            }}
          />

          <div
            style={{
              position: "relative",
              fontFamily: sansFont,
              color: "#43ddff",
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Key figure
          </div>

          <div
            style={{
              position: "relative",
              fontFamily: serifFont,
              color: CONFIG.colors.cream,
              fontSize,
              lineHeight: isLongValue ? 0.96 : 0.86,
              letterSpacing: 0,
              fontVariantNumeric: "tabular-nums",
              textShadow: `0 0 ${18 + pulse * 10}px rgba(67, 221, 255, 0.42)`,
              whiteSpace: isLongValue ? "normal" : "nowrap",
              overflowWrap: "break-word",
              maxWidth: "100%",
            }}
          >
            {displayValue}
          </div>

          <div
            style={{
              position: "relative",
              marginTop: 18,
              fontFamily: sansFont,
              color: "rgba(244, 241, 232, 0.86)",
              fontSize: 25,
              fontWeight: 600,
              lineHeight: 1.15,
              maxWidth: 590,
            }}
          >
            {displayLabel}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
