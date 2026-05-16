# news-remotion

Remotion project that composites your news B-roll over a continuous host-avatar track.

- **Audio**: the avatar MP4's audio plays end-to-end (your voice, full script).
- **Visual base layer**: the avatar video plays the whole time, never sliced.
- **Visual overlays** (scheduled at scene timings from `scenes.json`):
  - **image scenes** → news photo with Ken Burns slow zoom + crossfade
  - **quote scenes** → editorial card with the quoted text and speaker name
  - **avatar scenes** → no overlay, the host shows through naturally

## One-time setup

```bash
npm install
```

## Drop in your assets

```text
public/
├── avatar.mp4              ← the host reading the full script
├── scenes.json             ← already here (from align_transcript.py)
└── images/
    ├── scene_001.jpg       ← copy from your news_images.py downloaded_images/ folder
    ├── scene_002.webp
    └── ...
```

If you generated a fresh `scenes.json` or `downloaded_images/` folder for a new
video, just overwrite the files in this project's `public/` directory.

## Preview in the browser (fast, interactive)

```bash
npm start
```

Opens Remotion Studio at <http://localhost:3000>. You can:

- Scrub the timeline to jump anywhere in the 15-minute video
- See live changes as you edit any component
- Inspect each Sequence on the timeline
- Adjust scene timings, swap images, restyle the quote card — no render needed

## Render the final MP4 (slow)

```bash
npm run build
```

Writes to `out/video.mp4`. Takes a while — that's why preview-first matters.

## Project layout

```
src/
├── index.ts                       ← Remotion entry
├── Root.tsx                       ← Registers the composition (1920×1080 @ 30fps)
├── MainComposition.tsx            ← Avatar layer + scheduled overlays
├── components/
│   ├── ImageOverlay.tsx           ← News photo, Ken Burns, fade in/out
│   └── QuoteOverlay.tsx           ← Quote card design
└── types.ts                       ← Scene type definitions
```

## Common tweaks

- **Change resolution / framerate**: `src/Root.tsx` — `FPS`, `WIDTH`, `HEIGHT` constants.
- **Adjust crossfade length**: `FADE_FRAMES` in `ImageOverlay.tsx` and `QuoteOverlay.tsx` (9 frames = 0.3s at 30fps).
- **Soften / strengthen Ken Burns**: `interpolate(frame, [0, durationInFrames], [1.0, 1.06], ...)` in `ImageOverlay.tsx`. Increase 1.06 for more zoom, decrease for less.
- **Restyle the quote card**: everything visual is in `QuoteOverlay.tsx`. Fonts come from `@remotion/google-fonts`.

## Notes

- `scenes.json` is imported at compile time (TypeScript-typed via `src/types.ts`). When you swap it for a new video, Remotion Studio hot-reloads automatically.
- Images supported: jpg, jpeg, png, webp, avif (Remotion uses Chromium).
- The avatar video must match the `video` field referenced in `scenes.json` (default: `avatar.mp4` at the public root).
