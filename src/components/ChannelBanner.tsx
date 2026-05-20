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
  weights: ["500", "700", "800"],
  subsets: ["latin"],
});

const IN_FRAMES = 22;
const OUT_FRAMES = 22;
const WIDTH = 520;
const HEIGHT = 104;

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
  const outStart = Math.max(bannerDuration - OUT_FRAMES, IN_FRAMES + 18);

  const enter = spring({
    frame,
    fps,
    config: {
      damping: 16,
      stiffness: 128,
      mass: 0.78,
    },
    durationInFrames: IN_FRAMES,
  });

  const enterX = interpolate(enter, [0, 1], [videoWidth + 220, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const enterRotate = interpolate(enter, [0, 1], [3.5, 0], {
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

  const exitX = interpolate(outProgress, [0, 1], [0, -videoWidth - WIDTH], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateX = frame < outStart ? enterX : exitX;

  const opacityIn = interpolate(frame, [0, 7], [0, 1], {
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

  const blur = interpolate(
    frame,
    [0, 5, 12, outStart, outStart + 7, outStart + OUT_FRAMES],
    [9, 4, 0, 0, 4, 8],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const shineX = interpolate(frame, [7, 44], [-100, 620], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const pulse = interpolate(frame % 90, [0, 20, 50, 90], [0.72, 1, 0.82, 0.72], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 28,
        right: 34,
        width: WIDTH,
        height: HEIGHT,
        transform: `translateX(${translateX}px) rotate(${frame < outStart ? enterRotate : 0}deg)`,
        opacity,
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 100,
        filter: `blur(${blur}px)`,
      }}
    >
      {/* Outer glow */}
      <div
        style={{
          position: "absolute",
          inset: -6,
          borderRadius: 26,
          background:
            "radial-gradient(circle at 80% 20%, rgba(75,240,255,0.20), rgba(75,240,255,0) 52%), radial-gradient(circle at 20% 100%, rgba(17,130,255,0.18), rgba(17,130,255,0) 54%)",
          filter: "blur(16px)",
        }}
      />

      {/* Main panel */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 24,
          overflow: "hidden",
          background:
            "linear-gradient(135deg, rgba(4,10,18,0.95), rgba(12,22,34,0.93) 45%, rgba(3,8,15,0.98))",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow:
            "0 18px 42px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        {/* Top cyan strip */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 10,
            background:
              "linear-gradient(90deg, rgba(23,186,255,0), rgba(23,186,255,0.95), rgba(120,244,255,1), rgba(23,186,255,0.95), rgba(23,186,255,0))",
            boxShadow: "0 0 16px rgba(23,186,255,0.48)",
          }}
        />

        {/* Left identity block */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 116,
            background:
              "linear-gradient(180deg, rgba(11,142,227,0.98), rgba(12,84,170,0.98))",
            clipPath: "polygon(0 0, 100% 0, 78% 100%, 0 100%)",
          }}
        />

        {/* Technical texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.08,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.32) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.32) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage:
              "linear-gradient(90deg, transparent 0%, black 10%, black 100%)",
          }}
        />

        {/* Glass shine */}
        <div
          style={{
            position: "absolute",
            top: -24,
            left: shineX,
            width: 92,
            height: 160,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.16), rgba(255,255,255,0))",
            transform: "skewX(-22deg)",
            opacity: 0.8,
          }}
        />

        {/* Mini label */}
        <div
          style={{
            position: "absolute",
            left: 20,
            top: 40,
            fontFamily: subtitleFont,
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: "0.16em",
            color: "rgba(235,247,255,0.96)",
            textTransform: "uppercase",
          }}
        >
          NEWS
        </div>

        {/* Vertical divider */}
        <div
          style={{
            position: "absolute",
            left: 131,
            top: 18,
            width: 2,
            height: 66,
            background:
              "linear-gradient(180deg, rgba(120,244,255,0), rgba(120,244,255,0.95), rgba(120,244,255,0))",
            boxShadow: "0 0 12px rgba(120,244,255,0.38)",
            opacity: pulse,
          }}
        />

        {/* Channel name */}
        <div
          style={{
            position: "absolute",
            left: 156,
            top: 18,
            right: 24,
            fontFamily: titleFont,
            fontSize: 42,
            lineHeight: 1,
            color: "rgba(248,251,255,0.98)",
            letterSpacing: "0.05em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textShadow:
              "0 2px 8px rgba(0,0,0,0.8), 0 0 18px rgba(120,244,255,0.08)",
          }}
        >
          {CONFIG.channelName || "World Signal"}
        </div>

        {/* Underline */}
        <div
          style={{
            position: "absolute",
            left: 156,
            top: 57,
            width: 238,
            height: 3,
            background:
              "linear-gradient(90deg, rgba(120,244,255,1), rgba(23,186,255,0.9), rgba(23,186,255,0))",
            boxShadow: "0 0 14px rgba(23,186,255,0.6)",
          }}
        />

        {/* Tagline */}
        <div
          style={{
            position: "absolute",
            left: 156,
            right: 24,
            top: 68,
            fontFamily: subtitleFont,
            fontSize: 11,
            fontWeight: 700,
            color: "rgba(217,230,241,0.88)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {CONFIG.channelTagline || "Headlines • Reports • Briefings"}
        </div>

        {/* Right accent corners */}
        <div
          style={{
            position: "absolute",
            top: 15,
            right: 18,
            width: 48,
            height: 48,
            borderTop: "2px solid rgba(120,244,255,0.8)",
            borderRight: "2px solid rgba(120,244,255,0.8)",
            opacity: 0.7,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 13,
            right: 18,
            width: 58,
            height: 12,
            background:
              "linear-gradient(90deg, rgba(23,186,255,0), rgba(23,186,255,0.95), rgba(255,255,255,0.9))",
            boxShadow: "0 0 12px rgba(23,186,255,0.48)",
          }}
        />
      </div>
    </div>
  );
};
