import React from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadBebasNeue } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { CONFIG } from "../config";

const { fontFamily: titleFont } = loadBebasNeue("normal", {
  subsets: ["latin"],
});

const { fontFamily: subtitleFont } = loadInter("normal", {
  weights: ["500", "700"],
  subsets: ["latin"],
});

const IN_FRAMES = 24;
const OUT_FRAMES = 24;

const BANNER_WIDTH = 460;
const BANNER_HEIGHT = 112;

const START_OFFSCREEN_LEFT = -620;

type ChannelBannerProps = {
  durationInFrames?: number;
};

export const ChannelBanner: React.FC<ChannelBannerProps> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps, width: videoWidth, durationInFrames: compositionDuration } =
    useVideoConfig();

  const bannerDuration = durationInFrames ?? compositionDuration;
  const outStart = Math.max(bannerDuration - OUT_FRAMES, IN_FRAMES + 20);

  const enterSpring = spring({
    frame,
    fps,
    config: {
      damping: 20,
      stiffness: 110,
      mass: 0.75,
    },
    durationInFrames: IN_FRAMES,
  });

  const enterX = interpolate(
    enterSpring,
    [0, 1],
    [START_OFFSCREEN_LEFT, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

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

  const exitX = interpolate(
    outProgress,
    [0, 1],
    [0, videoWidth + BANNER_WIDTH + 180],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const translateX = frame < outStart ? enterX : exitX;

  const opacityIn = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacityOut = interpolate(
    frame,
    [outStart, outStart + OUT_FRAMES * 0.75, outStart + OUT_FRAMES],
    [1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const opacity = opacityIn * opacityOut;

  const scaleIn = interpolate(enterSpring, [0, 1], [0.96, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const motionBlur = interpolate(
    frame,
    [0, 6, 14, outStart, outStart + 8, outStart + OUT_FRAMES],
    [8, 5, 0, 0, 6, 10],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const inStreak = interpolate(frame, [0, 8, 22], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const outStreak = interpolate(
    frame,
    [outStart, outStart + 7, outStart + OUT_FRAMES],
    [0, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const streakOpacity = Math.min(inStreak + outStreak, 1);

  const shineX = interpolate(frame, [8, 38], [-180, 520], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const flarePulse = interpolate(
    frame % 60,
    [0, 10, 28, 60],
    [0.75, 1, 0.82, 0.75],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 28,
        left: 32,
        width: BANNER_WIDTH,
        height: BANNER_HEIGHT,
        transform: `translateX(${translateX}px) scale(${scaleIn})`,
        opacity,
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 100,
        filter: `blur(${motionBlur}px)`,
      }}
    >
      {/* Long red cinematic motion line */}
      <div
        style={{
          position: "absolute",
          left: -180,
          top: 51,
          width: 760,
          height: 3,
          background:
            "linear-gradient(90deg, rgba(255,0,35,0), rgba(255,0,35,0.75), rgba(255,255,255,0.95), rgba(255,0,35,0.75), rgba(255,0,35,0))",
          filter: "blur(1.2px)",
          opacity: streakOpacity,
          transform: "skewX(-18deg)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: -120,
          top: 72,
          width: 520,
          height: 1.5,
          background:
            "linear-gradient(90deg, rgba(255,0,35,0), rgba(255,0,35,0.65), rgba(255,0,35,0))",
          opacity: streakOpacity * 0.75,
          transform: "skewX(-18deg)",
        }}
      />

      {/* Main card */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(105deg, rgba(9,13,18,0.94), rgba(24,29,35,0.86) 46%, rgba(5,8,12,0.96))",
          clipPath: "polygon(7% 0%, 100% 0%, 94% 100%, 0% 100%)",
          border: "1px solid rgba(255,255,255,0.34)",
          boxShadow:
            "0 18px 48px rgba(0,0,0,0.6), 0 0 32px rgba(255,0,35,0.24)",
          overflow: "hidden",
        }}
      >
        {/* Red angled side */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 112,
            height: "100%",
            background:
              "linear-gradient(135deg, rgba(220,0,32,0.98), rgba(120,0,18,0.9))",
            clipPath: "polygon(0 0, 100% 0, 72% 100%, 0 100%)",
          }}
        />

        {/* Dark overlay for depth */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.08), rgba(255,255,255,0.05), rgba(0,0,0,0.22))",
          }}
        />

        {/* Dot map texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.11,
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px)",
            backgroundSize: "9px 9px",
            maskImage:
              "linear-gradient(90deg, transparent, black 20%, black 80%, transparent)",
          }}
        />

        {/* Top glass reflection */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 76,
            right: 28,
            height: 38,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.2), rgba(255,255,255,0))",
            transform: "skewX(-14deg)",
          }}
        />

        {/* Animated white shine pass */}
        <div
          style={{
            position: "absolute",
            top: -20,
            left: shineX,
            width: 90,
            height: 170,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.14), rgba(255,255,255,0))",
            transform: "skewX(-18deg)",
            opacity: 0.75,
          }}
        />

        {/* Red underline */}
        <div
          style={{
            position: "absolute",
            left: 126,
            top: 68,
            width: 250,
            height: 3,
            background:
              "linear-gradient(90deg, rgba(255,0,35,1), rgba(255,0,35,0.12))",
            boxShadow: "0 0 16px rgba(255,0,35,0.75)",
          }}
        />

        {/* Bright cinematic flare on underline */}
        <div
          style={{
            position: "absolute",
            left: 116,
            top: 61,
            width: 54,
            height: 20,
            background:
              "radial-gradient(ellipse, rgba(255,255,255,1) 0%, rgba(255,80,90,0.95) 22%, rgba(255,0,35,0.6) 45%, rgba(255,0,35,0) 76%)",
            filter: "blur(2px)",
            opacity: 0.95 * flarePulse,
            transform: "skewX(-18deg)",
          }}
        />

        {/* Long horizontal flare streak */}
        <div
          style={{
            position: "absolute",
            left: 70,
            top: 69,
            width: 410,
            height: 2,
            background:
              "linear-gradient(90deg, rgba(255,0,35,0), rgba(255,0,35,0.35), rgba(255,255,255,0.95), rgba(255,0,35,0.35), rgba(255,0,35,0))",
            filter: "blur(1px)",
            opacity: 0.78 * flarePulse,
          }}
        />

        {/* Small white hot core */}
        <div
          style={{
            position: "absolute",
            left: 132,
            top: 68,
            width: 10,
            height: 3,
            background: "rgba(255,255,255,1)",
            boxShadow:
              "0 0 8px rgba(255,255,255,0.95), 0 0 18px rgba(255,0,35,0.95), 0 0 36px rgba(255,0,35,0.72)",
            opacity: 1,
          }}
        />

        {/* Bottom-left extra flare point */}
        <div
          style={{
            position: "absolute",
            left: 22,
            bottom: -3,
            width: 80,
            height: 10,
            background:
              "radial-gradient(ellipse, rgba(255,255,255,0.95) 0%, rgba(255,0,35,0.62) 34%, rgba(255,0,35,0) 76%)",
            filter: "blur(2px)",
            opacity: 0.75 * flarePulse,
          }}
        />

        {/* Title */}
        <div
          style={{
            position: "absolute",
            left: 126,
            top: 22,
            fontFamily: titleFont,
            fontSize: 48,
            lineHeight: 1,
            color: "rgba(245,248,250,0.98)",
            letterSpacing: "0.035em",
            textShadow:
              "0 2px 9px rgba(0,0,0,0.85), 0 0 14px rgba(255,255,255,0.16)",
            whiteSpace: "nowrap",
          }}
        >
          {CONFIG.channelName || "Uncover Truth"}
        </div>

        {/* Subtitle */}
        <div
          style={{
            position: "absolute",
            left: 128,
            top: 82,
            fontFamily: subtitleFont,
            fontSize: 12,
            fontWeight: 700,
            color: "rgba(245,245,245,0.9)",
            letterSpacing: "0.07em",
            whiteSpace: "nowrap",
          }}
        >
          {CONFIG.channelTagline || "Breaking News • Analysis • Reports"}
        </div>

        {/* Top-right red slashes */}
        <div
          style={{
            position: "absolute",
            right: 34,
            top: 18,
            display: "flex",
            gap: 6,
            opacity: 0.92,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 5,
                height: 18,
                background: "rgba(255,0,35,0.9)",
                transform: "skewX(-18deg)",
              }}
            />
          ))}
        </div>

        {/* Bottom red glow */}
        <div
          style={{
            position: "absolute",
            left: 8,
            right: 24,
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
            right: 48,
            bottom: 15,
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
  );
};