export type AvatarScene = {
  type: "avatar";
  text: string;
  start: number;
  end: number;
  aligned?: boolean;
  number_overlays?: NumberOverlay[];
};

export type QuoteScene = {
  type: "quote";
  text: string;
  speaker: string;
  start: number;
  end: number;
  aligned?: boolean;
  number_overlays?: NumberOverlay[];
};

export type ImageScene = {
  type: "image";
  text: string;
  search_query: string;
  image: string;
  start: number;
  end: number;
  aligned?: boolean;
  number_overlays?: NumberOverlay[];
};

export type HeadlineScene = {
  type: "headline";
  text: string;
  publication: string;
  headline_text: string;
  start: number;
  end: number;
  aligned?: boolean;
  number_overlays?: NumberOverlay[];
};

export type StatScene = {
  type: "stat";
  text: string;
  stat_value: string;
  stat_label: string;
  start: number;
  end: number;
  aligned?: boolean;
  number_overlays?: NumberOverlay[];
};

export type NumberOverlay = {
  type: "number";
  value: string;
  label: string;
  start: number;
  end: number;
  style?: string;
  animation?: {
    in?: string;
    hold?: string;
    out?: string;
    duration?: number;
  };
  position?: "left_center" | "right_center" | "center";
  accent?: string;
};

export type Scene =
  | AvatarScene
  | QuoteScene
  | ImageScene
  | HeadlineScene
  | StatScene;

export type WhisperWord = {
  word: string;
  start: number;
  end: number;
};

export type ScenesJSON = {
  video: string;
  duration: number;
  scene_count: number;
  number_layer?: {
    enabled: boolean;
    style?: string;
    description?: string;
  };
  scenes: Scene[];
  // Whisper word-level timestamps. Optional for backward compat with older
  // scenes.json files generated before subtitle support landed.
  words?: WhisperWord[];
};
