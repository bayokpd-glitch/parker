import React from "react";
import { Composition } from "remotion";
import { MainComposition } from "./MainComposition";
import scenesData from "../public/scenes.json";
import type { ScenesJSON } from "./types";

const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;

// To change the channel name / tagline, edit
// src/components/ChannelBanner.tsx (CHANNEL_NAME and CHANNEL_TAGLINE constants).

const data = scenesData as ScenesJSON;

export const Root: React.FC = () => {
  return (
    <Composition
      id="NewsVideo"
      component={MainComposition}
      durationInFrames={Math.ceil(data.duration * FPS)}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{
        scenes: data.scenes,
        words: data.words ?? [],
      }}
    />
  );
};
