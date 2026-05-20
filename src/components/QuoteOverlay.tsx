import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadBebasNeue } from "@remotion/google-fonts/BebasNeue";
import type { QuoteScene } from "../types";

const { fontFamily: bodyFont } = loadInter("normal", {
  weights: ["400", "500", "700", "800"],
  subsets: ["latin"],
});

const { fontFamily: labelFont } = loadBebasNeue("normal", {
  subsets: ["latin"],
});

function extractQuote(text: string): string {
  const matches = text.match(
    /[\u201C\u201D]([^\u201C\u201D]+)[\u201C\u201D]|"([^"]+)"/g
  );

  if (matches && matches.length > 0) {
    return matches
      .map((m) =>
        m.replace(/^[\u201C\u201D]|[\u201C\u201D]$|^"|"$/g, "").trim()
      )
      .filter(Boolean)
      .join("  ·  ");
  }

  return text;
}

function quoteFontSize(text: string): number {
  const len = text.length;

  if (len <= 46) return 56;
  if (len <= 80) return 48;
  if (len <= 128) return 41;
  if (len <= 185) return 35;
  return 30;
}

const IN_FRAMES = 24;
const OUT_FRAMES = 24;

export const QuoteOverlay: React.FC<{ scene: QuoteScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const {
    fps,
    width,
    height,
    durationInFrames: compositionDuration,
  } = useVideoConfig();

  const quote = extractQuote(scene.text);
  const fontSize = quoteFontSize(quote);
  const outStart = Math.max(compositionDuration - OUT_FRAMES, IN_FRAMES + 24);

  const enter = spring({
    frame,
    fps,
    config: {
      damping: 17,
      stiffness: 110,
      mass: 0.82,
    },
    durationInFrames: IN_FRAMES,
  });

  const enterY = interpolate(enter, [0, 1], [58, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const enterScale = interpolate(enter, [0, 1], [0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const outProgress = interpolate(
    frame,
    [outStart, outStart + OUT_FRAMES],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }
  );

  const exitY = interpolate(outProgress, [0, 1], [0, -34], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacityIn = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacityOut = interpolate(
    frame,
    [outStart, outStart + OUT_FRAMES * 0.7, outStart + OUT_FRAMES],
    [1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const opacity = opacityIn * opacityOut;

  const blur = interpolate(
    frame,
    [0, 5, 14, outStart, outStart + 8, outStart + OUT_FRAMES],
    [8, 4, 0, 0, 4, 8],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const lineReveal = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glowPulse = interpolate(frame % 84, [0, 18, 42, 84], [0.7, 1, 0.82, 0.7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const shineX = interpolate(frame, [8, 48], [-220, 1180], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const CARD_WIDTH = Math.min(1120, width - 180);
  const CARD_HEIGHT = 320;
  const x = (width - CARD_WIDTH) / 2;
  const y = height * 0.56 - CARD_HEIGHT / 2;

  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      {/* Subtle blur over existing background/avatar */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backdropFilter: "blur(7px)",
          WebkitBackdropFilter: "blur(7px)",
          background: "rgba(5,10,18,0.14)",
        }}
      />

      {/* Cool vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 72% 62% at 50% 45%, rgba(22,30,40,0.03) 0%, rgba(6,10,16,0.18) 64%, rgba(0,0,0,0.3) 100%)",
        }}
      />

      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          left: -100,
          bottom: 120,
          width: 440,
          height: 240,
          background:
            "radial-gradient(ellipse, rgba(23,186,255,0.18), rgba(23,186,255,0) 72%)",
          filter: "blur(24px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: CARD_WIDTH,
          minHeight: CARD_HEIGHT,
          transform: `translateY(${enterY + exitY}px) scale(${enterScale})`,
          opacity,
          pointerEvents: "none",
          userSelect: "none",
          filter: `blur(${blur}px)`,
        }}
      >
        {/* Top reveal line */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: -10,
            width: CARD_WIDTH * lineReveal,
            height: 4,
            background:
              "linear-gradient(90deg, rgba(120,244,255,1), rgba(23,186,255,0.95), rgba(23,186,255,0))",
            boxShadow: "0 0 16px rgba(23,186,255,0.5)",
          }}
        />

        {/* Main card */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            borderRadius: 30,
            background:
              "linear-gradient(135deg, rgba(4,10,18,0.93), rgba(14,24,36,0.88) 46%, rgba(4,9,16,0.96))",
            border: "1px solid rgba(255,255,255,0.16)",
            boxShadow:
              "0 24px 70px rgba(0,0,0,0.48), inset 0 0 0 1px rgba(255,255,255,0.03)",
          }}
        >
          {/* Corner gradient accents */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 220,
              height: 120,
              background:
                "linear-gradient(135deg, rgba(16,132,223,0.9), rgba(16,132,223,0.18), rgba(16,132,223,0))",
              clipPath: "polygon(0 0, 100% 0, 0 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: 260,
              height: 140,
              background:
                "linear-gradient(315deg, rgba(120,244,255,0.34), rgba(120,244,255,0.05), rgba(120,244,255,0))",
              clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
            }}
          />

          {/* Grid texture */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.06,
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Shine pass */}
          <div
            style={{
              position: "absolute",
              top: -40,
              left: shineX,
              width: 120,
              height: 420,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.12), rgba(255,255,255,0))",
              transform: "skewX(-22deg)",
              opacity: 0.72,
            }}
          />

          {/* Header */}
          <div
            style={{
              position: "absolute",
              left: 48,
              right: 48,
              top: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: "rgba(120,244,255,1)",
                  boxShadow: "0 0 14px rgba(120,244,255,0.9)",
                  opacity: glowPulse,
                }}
              />
              <div
                style={{
                  fontFamily: labelFont,
                  fontSize: 28,
                  lineHeight: 1,
                  color: "rgba(248,251,255,0.96)",
                  letterSpacing: "0.08em",
                }}
              >
                NEWSWIRE QUOTE
              </div>
            </div>

            <div
              style={{
                fontFamily: bodyFont,
                fontWeight: 800,
                fontSize: 12,
                color: "rgba(209,223,238,0.8)",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              On Record
            </div>
          </div>

          {/* Quote mark */}
          <div
            style={{
              position: "absolute",
              left: 42,
              top: 74,
              fontFamily: labelFont,
              fontSize: 160,
              lineHeight: 1,
              color: "rgba(255,255,255,0.12)",
            }}
          >
            “
          </div>

          {/* Quote text */}
          <div
            style={{
              position: "absolute",
              left: 130,
              right: 64,
              top: 88,
              fontFamily: bodyFont,
              fontWeight: 800,
              fontSize,
              lineHeight: 1.17,
              color: "rgba(249,252,255,0.98)",
              textShadow: "0 3px 10px rgba(0,0,0,0.55)",
            }}
          >
            {quote}
          </div>

          {/* Bottom info row */}
          <div
            style={{
              position: "absolute",
              left: 48,
              right: 48,
              bottom: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  fontFamily: labelFont,
                  fontSize: 34,
                  lineHeight: 1,
                  color: "rgba(255,255,255,0.98)",
                  letterSpacing: "0.04em",
                }}
              >
                {scene.speaker || "Source"}
              </div>

              <div
                style={{
                  width: 44,
                  height: 2,
                  background:
                    "linear-gradient(90deg, rgba(120,244,255,1), rgba(23,186,255,0))",
                  boxShadow: "0 0 10px rgba(23,186,255,0.4)",
                }}
              />

              <div
                style={{
                  fontFamily: bodyFont,
                  fontWeight: 700,
                  fontSize: 15,
                  color: "rgba(214,228,241,0.8)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Confirmed statement
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 6,
                opacity: 0.86,
              }}
            >
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 5,
                    height: 20 + i * 4,
                    background:
                      i % 2 === 0
                        ? "rgba(23,186,255,0.92)"
                        : "rgba(255,255,255,0.82)",
                    borderRadius: 999,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Bottom line */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 5,
              background:
                "linear-gradient(90deg, rgba(23,186,255,0), rgba(23,186,255,0.98), rgba(120,244,255,1), rgba(23,186,255,0.98), rgba(23,186,255,0))",
              boxShadow: "0 0 20px rgba(23,186,255,0.55)",
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
