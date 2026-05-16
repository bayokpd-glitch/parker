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

  if (len <= 45) return 56;
  if (len <= 80) return 48;
  if (len <= 130) return 40;
  if (len <= 190) return 34;
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

  const inSpring = spring({
    frame,
    fps,
    config: {
      damping: 18,
      stiffness: 105,
      mass: 0.8,
    },
    durationInFrames: IN_FRAMES,
  });

  const enterY = interpolate(inSpring, [0, 1], [70, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const enterScale = interpolate(inSpring, [0, 1], [0.94, 1], {
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

  const exitY = interpolate(outProgress, [0, 1], [0, -45], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacityIn = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacityOut = interpolate(
    frame,
    [outStart, outStart + OUT_FRAMES * 0.72, outStart + OUT_FRAMES],
    [1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const opacity = opacityIn * opacityOut;

  const motionBlur = interpolate(
    frame,
    [0, 6, 16, outStart, outStart + 8, outStart + OUT_FRAMES],
    [8, 4, 0, 0, 5, 8],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const lineSweep = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glowPulse = interpolate(
    frame % 90,
    [0, 22, 45, 90],
    [0.78, 1, 0.84, 0.78],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const shineX = interpolate(frame, [10, 46], [-260, 980], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const CARD_WIDTH = Math.min(1180, width - 160);
  const CARD_MIN_HEIGHT = 330;

  const x = (width - CARD_WIDTH) / 2;
  const y = height * 0.55 - CARD_MIN_HEIGHT / 2;

  return (
    <AbsoluteFill
      style={{
        background: "transparent",
      }}
    >
      {/* Light blur over the existing avatar/background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          background: "rgba(0, 0, 0, 0.14)",
        }}
      />

      {/* Soft vignette, still transparent enough to see background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(10,14,20,0.08) 0%, rgba(4,6,10,0.16) 58%, rgba(0,0,0,0.24) 100%)",
        }}
      />

      {/* Subtle news/dot texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.045,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      />

      {/* Red background glow */}
      <div
        style={{
          position: "absolute",
          left: -120,
          top: height * 0.35,
          width: 520,
          height: 220,
          background:
            "radial-gradient(ellipse, rgba(255,0,35,0.16), rgba(255,0,35,0) 70%)",
          filter: "blur(18px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: CARD_WIDTH,
          minHeight: CARD_MIN_HEIGHT,
          transform: `translateY(${enterY + exitY}px) scale(${enterScale})`,
          opacity,
          pointerEvents: "none",
          userSelect: "none",
          filter: `blur(${motionBlur}px)`,
        }}
      >
        {/* Top motion streak */}
        <div
          style={{
            position: "absolute",
            left: -160,
            top: 74,
            width: CARD_WIDTH + 280,
            height: 3,
            background:
              "linear-gradient(90deg, rgba(255,0,35,0), rgba(255,0,35,0.68), rgba(255,255,255,0.95), rgba(255,0,35,0.68), rgba(255,0,35,0))",
            filter: "blur(1.2px)",
            opacity: 0.75 * lineSweep,
            transform: "skewX(-18deg)",
          }}
        />

        {/* Lower motion streak */}
        <div
          style={{
            position: "absolute",
            left: -90,
            bottom: 52,
            width: CARD_WIDTH * 0.7,
            height: 1.5,
            background:
              "linear-gradient(90deg, rgba(255,0,35,0), rgba(255,0,35,0.5), rgba(255,0,35,0))",
            opacity: 0.55 * lineSweep,
            filter: "blur(0.8px)",
            transform: "skewX(-18deg)",
          }}
        />

        {/* Main glass card */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 28,
            overflow: "hidden",
            background:
              "linear-gradient(135deg, rgba(7,12,18,0.88), rgba(22,28,36,0.78) 45%, rgba(8,10,15,0.9))",
            border: "1px solid rgba(255,255,255,0.22)",
            boxShadow:
              "0 22px 60px rgba(0,0,0,0.48), 0 0 30px rgba(255,0,35,0.14)",
          }}
        >
          {/* Left red accent */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 145,
              height: "100%",
              background:
                "linear-gradient(135deg, rgba(220,0,32,0.96), rgba(105,0,16,0.84))",
              clipPath: "polygon(0 0, 100% 0, 72% 100%, 0 100%)",
            }}
          />

          {/* Glass top reflection */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 110,
              right: 30,
              height: 58,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0))",
              transform: "skewX(-14deg)",
            }}
          />

          {/* Inner texture */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.08,
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "10px 10px",
              maskImage:
                "linear-gradient(90deg, transparent, black 20%, black 82%, transparent)",
            }}
          />

          {/* Animated shine */}
          <div
            style={{
              position: "absolute",
              top: -30,
              left: shineX,
              width: 120,
              height: 430,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.14), rgba(255,255,255,0))",
              transform: "skewX(-18deg)",
              opacity: 0.72,
            }}
          />

          {/* Big quote mark */}
          <div
            style={{
              position: "absolute",
              left: 48,
              top: 20,
              fontFamily: labelFont,
              fontSize: 180,
              lineHeight: 1,
              color: "rgba(255,255,255,0.15)",
            }}
          >
            “
          </div>

          {/* Quote label */}
          <div
            style={{
              position: "absolute",
              left: 175,
              top: 34,
              fontFamily: labelFont,
              fontSize: 28,
              lineHeight: 1,
              color: "rgba(255,0,35,0.95)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Quote
          </div>

          {/* Quote text */}
          <div
            style={{
              position: "absolute",
              left: 175,
              right: 72,
              top: 72,
              fontFamily: bodyFont,
              fontWeight: 800,
              fontSize,
              lineHeight: 1.18,
              color: "rgba(248,250,252,0.98)",
              textShadow: "0 2px 8px rgba(0,0,0,0.55)",
            }}
          >
            {quote}
          </div>

          {/* Red underline */}
          <div
            style={{
              position: "absolute",
              left: 176,
              bottom: 88,
              width: 260,
              height: 3,
              background:
                "linear-gradient(90deg, rgba(255,0,35,1), rgba(255,0,35,0.12))",
              boxShadow: "0 0 16px rgba(255,0,35,0.75)",
            }}
          />

          {/* Flare glow */}
          <div
            style={{
              position: "absolute",
              left: 158,
              bottom: 79,
              width: 60,
              height: 22,
              background:
                "radial-gradient(ellipse, rgba(255,255,255,1) 0%, rgba(255,80,90,0.95) 22%, rgba(255,0,35,0.6) 45%, rgba(255,0,35,0) 76%)",
              filter: "blur(2px)",
              opacity: 0.95 * glowPulse,
              transform: "skewX(-18deg)",
            }}
          />

          {/* Long horizontal flare */}
          <div
            style={{
              position: "absolute",
              left: 108,
              bottom: 87,
              width: 430,
              height: 2,
              background:
                "linear-gradient(90deg, rgba(255,0,35,0), rgba(255,0,35,0.35), rgba(255,255,255,0.95), rgba(255,0,35,0.35), rgba(255,0,35,0))",
              filter: "blur(1px)",
              opacity: 0.78 * glowPulse,
            }}
          />

          {/* Hot white core */}
          <div
            style={{
              position: "absolute",
              left: 181,
              bottom: 86,
              width: 10,
              height: 3,
              background: "rgba(255,255,255,1)",
              boxShadow:
                "0 0 8px rgba(255,255,255,0.95), 0 0 18px rgba(255,0,35,0.95), 0 0 36px rgba(255,0,35,0.72)",
            }}
          />

          {/* Speaker row */}
          <div
            style={{
              position: "absolute",
              left: 175,
              bottom: 34,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                fontFamily: labelFont,
                fontSize: 32,
                letterSpacing: "0.04em",
                color: "rgba(255,255,255,0.96)",
                whiteSpace: "nowrap",
              }}
            >
              {scene.speaker || "Source"}
            </div>

            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                background: "rgba(255,0,35,0.95)",
                boxShadow: "0 0 12px rgba(255,0,35,0.8)",
              }}
            />

            <div
              style={{
                fontFamily: bodyFont,
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: "rgba(255,255,255,0.72)",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              Statement
            </div>
          </div>

          {/* Top-right red slashes */}
          <div
            style={{
              position: "absolute",
              right: 36,
              top: 28,
              display: "flex",
              gap: 6,
              opacity: 0.9,
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: 5,
                  height: 20,
                  background: "rgba(255,0,35,0.88)",
                  transform: "skewX(-18deg)",
                }}
              />
            ))}
          </div>

          {/* Bottom red glow line */}
          <div
            style={{
              position: "absolute",
              left: 10,
              right: 28,
              bottom: 0,
              height: 3,
              background:
                "linear-gradient(90deg, rgba(255,0,35,0), rgba(255,0,35,0.95), rgba(255,0,35,0))",
              boxShadow: "0 0 18px rgba(255,0,35,0.78)",
            }}
          />

          {/* Bottom-right ticks */}
          <div
            style={{
              position: "absolute",
              right: 42,
              bottom: 18,
              display: "flex",
              gap: 5,
              opacity: 0.76,
            }}
          >
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  width: 4,
                  height: 10,
                  background: "rgba(255,255,255,0.75)",
                  transform: "skewX(-18deg)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};